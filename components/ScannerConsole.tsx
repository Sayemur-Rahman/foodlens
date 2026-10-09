'use client';

import React, { useRef, useState } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import OcrVerificationModal from './OcrVerificationModal';
import CameraCapture from './CameraCapture';
import { photoToText } from '@/lib/photoToTextClient';

interface ScannerConsoleProps {
  onAnalyzeConfirmed: (verifiedText: string) => void;
}

export default function ScannerConsole({ onAnalyzeConfirmed }: ScannerConsoleProps) {
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedText, setDetectedText] = useState('');
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [ocrMode, setOcrMode] = useState<'device' | 'cloud'>('device');
  const [ocrStatus, setOcrStatus] = useState('');
  const [ocrProgress, setOcrProgress] = useState(0);

  const isBangla = language === 'bn';

  const handleProcess = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError(isBangla ? 'অনুগ্রহ করে একটি বৈধ ছবি নির্বাচন করুন' : 'Please select a valid image file');
      return;
    }

    setError(null);
    setIsLoading(true);
    setDetectedText('');
    setOcrMode('device');
    setOcrStatus('');
    setOcrProgress(0);

    let text = '';

    // 1) On-device OCR first — English + Bangla, fully offline, no AI.
    try {
      const deviceResult = await photoToText(file, (p) => {
        setOcrStatus(p.status);
        setOcrProgress(p.progress);
      });
      text = deviceResult.text;
    } catch {
      // Ignore and try the optional cloud path below.
    }

    // 2) Optional cloud OCR as a last resort (only if a key is configured).
    if (!text) {
      try {
        setOcrMode('cloud');
        const formData = new FormData();
        formData.append('image', file);

        const res = await fetch('/api/ocr', { method: 'POST', body: formData });
        const data = await res.json();

        if (res.ok && !data?.error && typeof data.text === 'string' && data.text.trim()) {
          text = data.text.trim();
        }
      } catch {
        // No cloud provider available — on-device result stands.
      }
    }

    if (text) {
      setDetectedText(text);
      setIsVerificationOpen(true);
    } else {
      setError(
        isBangla
          ? 'ছবিতে পড়ার মতো লেখা পাওয়া যায়নি। পরিষ্কার ছবি তুলুন বা ম্যানুয়ালি লিখুন।'
          : 'No readable text found. Try a clearer, closer photo of the label or enter it manually.'
      );
    }

    setIsLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleProcess(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleProcess(file);
  };

  return (
    <section className="max-w-4xl w-full mx-auto" data-purpose="scanner-console" id="scanner">
      <div className="relative rounded-3xl bg-white/90 border border-slate-200 shadow-[0_22px_50px_-26px_rgba(15,23,42,0.35)] p-4 sm:p-7 backdrop-blur-xl">
        <div className="absolute -inset-[1px] bg-gradient-to-b from-brand-500/15 via-transparent to-transparent rounded-3xl -z-10 pointer-events-none opacity-70" />

        {/* Mode Switcher Tabs */}
        <div className="flex items-center bg-emerald-50/80 p-1.5 rounded-2xl border border-emerald-100 mb-6 max-w-md mx-auto">
          <button
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all bg-white text-emerald-700 border border-emerald-200 shadow-sm"
            type="button"
          >
            <Camera className="w-4 h-4 text-brand-500" />
            <span>{isBangla ? 'ছবি তুলুন / আপলোড' : 'Photo Scan'}</span>
          </button>
          <a
            href="/manual"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-white/70 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            <span>{isBangla ? 'ম্যানুয়ালি লিখুন' : 'Manual Entry'}</span>
          </a>
        </div>

        {/* Scanner Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative rounded-2xl border-2 border-dashed overflow-hidden p-8 sm:p-12 text-center transition-colors ${
            isDragging
              ? 'border-brand-400 bg-emerald-50/90'
              : 'border-emerald-300 bg-emerald-50/50'
          } scanner-grid`}
        >
          {/* Laser beam */}
          {!isLoading && (
            <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-brand-500 to-transparent laser-beam animate-scan-laser pointer-events-none" />
          )}
          <span className="absolute top-3 left-3 text-brand-500/70 font-mono text-sm leading-none font-bold">+</span>
          <span className="absolute top-3 right-3 text-brand-500/70 font-mono text-sm leading-none font-bold">+</span>
          <span className="absolute bottom-3 left-3 text-brand-500/70 font-mono text-sm leading-none font-bold">+</span>
          <span className="absolute bottom-3 right-3 text-brand-500/70 font-mono text-sm leading-none font-bold">+</span>

          <div className="relative z-10 flex flex-col items-center justify-center">
            {isLoading ? (
              <div className="flex flex-col items-center gap-4 py-8 w-full max-w-md">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                <div className="space-y-2 text-center">
                  <p className="text-lg font-semibold text-slate-900">
                    {ocrMode === 'device'
                      ? isBangla
                        ? 'ডিভাইসে লেবেল পড়া হচ্ছে...'
                        : 'Reading label on your device...'
                      : isBangla
                        ? 'লেবেল পড়া হচ্ছে...'
                        : 'Scanning label...'}
                  </p>
                  <p className="text-sm text-slate-500">
                    {isBangla
                      ? 'ছবি থেকে ইংরেজি ও বাংলা টেক্সট এক্সট্রাক্ট করা হচ্ছে'
                      : 'Extracting English & Bangla text from your image'}
                  </p>
                </div>
                {ocrMode === 'device' && (
                  <div className="w-full">
                    <div className="h-1.5 w-full rounded-full bg-emerald-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-brand-600 transition-all duration-300"
                        style={{ width: `${Math.round((ocrProgress || 0) * 100)}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-400 text-center capitalize">
                      {ocrStatus || (isBangla ? 'প্রস্তুত হচ্ছে' : 'initializing')}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mb-2">
                  <button
                    className="w-full sm:w-auto flex-1 flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-brand-600 hover:from-emerald-400 hover:to-brand-500 text-white font-bold text-base shadow-[0_12px_28px_-12px_rgba(16,185,129,0.8)] transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                  >
                    <Camera className="w-5 h-5 stroke-[2.5]" />
                    <span>{isBangla ? 'ছবি তুলুন' : 'Scan with Camera'}</span>
                  </button>
                  <button
                    className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium text-base border border-slate-200 shadow-sm transition-all duration-200 hover:border-emerald-300"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-5 h-5 text-slate-400" />
                    <span>{isBangla ? 'ছবি আপলোড করুন' : 'Upload Photo'}</span>
                  </button>
                </div>

                {error && (
                  <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs max-w-md">
                    {error}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      <CameraCapture
        isOpen={isCameraOpen}
        language={language}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(file) => {
          setIsCameraOpen(false);
          void handleProcess(file);
        }}
      />

      <OcrVerificationModal
        initialText={detectedText}
        isOpen={isVerificationOpen}
        onConfirm={(text) => {
          setIsVerificationOpen(false);
          onAnalyzeConfirmed(text);
        }}
        onClose={() => setIsVerificationOpen(false)}
      />
    </section>
  );
}
