/**
 * Photo → Text (client-side OCR) system.
 *
 * Fully self-contained: the Tesseract.js runtime, wasm core and the
 * English (`eng`) + Bangla (`ben`) language data are all vendored under
 * `/public/tesseract`, so it works entirely offline — no CDN, no API keys
 * and no AI services required.
 *
 * Nothing is uploaded — the image never leaves the device.
 */

export interface OcrProgress {
  /** Raw Tesseract status, e.g. "loading language traineddata". */
  status: string;
  /** Stage progress, 0..1. */
  progress: number;
}

export interface ClientOcrResult {
  text: string;
  confidence: number;
}

interface TesseractRecognizeResult {
  data: {
    text: string;
    confidence: number;
  };
}

interface TesseractWorker {
  recognize: (image: File | Blob | string) => Promise<TesseractRecognizeResult>;
  setParameters?: (params: Record<string, string>) => Promise<unknown>;
  terminate: () => Promise<unknown>;
}

interface TesseractLoggerMessage {
  status: string;
  progress: number;
}

interface TesseractGlobal {
  createWorker: (
    langs: string | string[],
    oem?: number,
    options?: Record<string, unknown>
  ) => Promise<TesseractWorker>;
}

declare global {
  interface Window {
    Tesseract?: TesseractGlobal;
  }
}

/** Vendored, same-origin assets (see public/tesseract). */
const TESSERACT_SCRIPT = '/tesseract/tesseract.min.js';
const WORKER_PATH = '/tesseract/worker.min.js';
const CORE_PATH = '/tesseract/core';
const LANG_PATH = '/tesseract/lang';

/** Order matters: Latin first, then Bengali. */
const OCR_LANGUAGES = ['eng', 'ben'];

let scriptPromise: Promise<TesseractGlobal> | null = null;
let workerPromise: Promise<TesseractWorker> | null = null;
let progressHandler: ((progress: OcrProgress) => void) | null = null;

function loadTesseract(): Promise<TesseractGlobal> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('On-device OCR is only available in the browser'));
  }
  if (window.Tesseract) return Promise.resolve(window.Tesseract);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<TesseractGlobal>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = TESSERACT_SCRIPT;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      if (window.Tesseract) {
        resolve(window.Tesseract);
      } else {
        reject(new Error('OCR engine loaded but is unavailable'));
      }
    };
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error('Could not load the on-device OCR engine'));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

async function getWorker(
  onProgress?: (progress: OcrProgress) => void
): Promise<TesseractWorker> {
  progressHandler = onProgress ?? null;
  const Tesseract = await loadTesseract();

  if (!workerPromise) {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const toUrl = (p: string) => (origin ? `${origin}${p}` : p);

    workerPromise = Tesseract.createWorker(OCR_LANGUAGES, 1, {
      workerPath: toUrl(WORKER_PATH),
      corePath: toUrl(CORE_PATH),
      langPath: toUrl(LANG_PATH),
      gzip: false,
      logger: (message: TesseractLoggerMessage) => {
        progressHandler?.({
          status: message.status,
          progress: message.progress,
        });
      },
    }).catch((error: unknown) => {
      // Allow a later attempt to rebuild the worker after a failure.
      workerPromise = null;
      throw error;
    });
  }

  return workerPromise;
}

function cleanText(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not read the image'));
    img.src = src;
  });
}

/**
 * Upscale small photos and convert to grayscale with a mild contrast boost.
 * This is the single biggest accuracy lever for labels — and especially for
 * Bangla, whose conjunct glyphs need more pixels.
 */
async function preprocessImage(image: File | Blob): Promise<File | Blob> {
  if (
    typeof document === 'undefined' ||
    typeof URL === 'undefined' ||
    typeof URL.createObjectURL !== 'function'
  ) {
    return image;
  }

  const objectUrl = URL.createObjectURL(image);
  try {
    const img = await loadImageElement(objectUrl);
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (!w || !h) return image;

    const maxDim = Math.max(w, h);
    // Upscale anything smaller than ~1600px on its longest side (capped 2.5x).
    const scale = maxDim < 1600 ? Math.min(2.5, 1600 / maxDim) : 1;
    const targetW = Math.round(w * scale);
    const targetH = Math.round(h * scale);

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return image;

    ctx.drawImage(img, 0, 0, targetW, targetH);

    try {
      const imageData = ctx.getImageData(0, 0, targetW, targetH);
      const px = imageData.data;
      for (let i = 0; i < px.length; i += 4) {
        const gray = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
        const boosted = Math.max(0, Math.min(255, (gray - 128) * 1.25 + 128));
        px[i] = boosted;
        px[i + 1] = boosted;
        px[i + 2] = boosted;
      }
      ctx.putImageData(imageData, 0, 0);
    } catch {
      // Tainted canvas — fall back to the scaled colour image.
    }

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/png')
    );
    return blob ?? image;
  } catch {
    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Extract English + Bangla text from an image entirely on the device.
 *
 * @param image   File / Blob captured by the camera or chosen by the user.
 * @param onProgress Optional progress callback (loading + recognition).
 */
export async function photoToText(
  image: File | Blob,
  onProgress?: (progress: OcrProgress) => void
): Promise<ClientOcrResult> {
  const worker = await getWorker(onProgress);

  try {
    await worker.setParameters?.({
      preserve_interword_spaces: '1',
      user_defined_dpi: '300',
    });
  } catch {
    // Parameters are best-effort; recognition still proceeds.
  }

  const prepared = await preprocessImage(image);
  const result = await worker.recognize(prepared);
  return {
    text: cleanText(result.data.text || ''),
    confidence: result.data.confidence ?? 0,
  };
}
