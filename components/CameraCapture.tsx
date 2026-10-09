'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle } from 'lucide-react';

interface CameraCaptureProps {
  isOpen: boolean;
  onCapture: (file: File) => void;
  onClose: () => void;
  language?: 'en' | 'bn';
}

export default function CameraCapture({
  isOpen,
  onCapture,
  onClose,
  language = 'en',
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const isBangla = language === 'bn';

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setReady(false);
  }, []);

  const startStream = useCallback(async () => {
    setError(null);
    setReady(false);
    stopStream();

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError(
        isBangla
          ? 'এই ব্রাউজারে ক্যামেরা সমর্থিত নয়। ছবি আপলোড করুন।'
          : 'Camera is not supported in this browser. Please upload a photo instead.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setReady(true);
    } catch (err) {
      const name = err instanceof Error ? err.name : '';
      if (name === 'NotAllowedError') {
        setError(
          isBangla
            ? 'ক্যামেরার অনুমতি দেওয়া হয়নি। ব্রাউজার সেটিংসে অনুমতি দিন অথবা ছবি আপলোড করুন।'
            : 'Camera permission denied. Allow camera access or upload a photo instead.'
        );
      } else if (name === 'NotFoundError') {
        setError(
          isBangla
            ? 'কোনো ক্যামেরা পাওয়া যায়নি। ছবি আপলোড করুন।'
            : 'No camera found. Please upload a photo instead.'
        );
      } else {
        setError(
          isBangla
            ? 'ক্যামেরা চালু করা যায়নি। ছবি আপলোড করে চেষ্টা করুন।'
            : 'Could not start the camera. Please try uploading a photo.'
        );
      }
    }
  }, [facingMode, isBangla, stopStream]);

  useEffect(() => {
    if (isOpen) {
      void startStream();
    } else {
      stopStream();
    }
    return () => stopStream();
  }, [isOpen, startStream, stopStream]);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !ready) return;

    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mirror selfie preview so the captured image matches what the user sees
    if (facingMode === 'user') {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, w, h);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
        stopStream();
        onCapture(file);
      },
      'image/jpeg',
      0.92
    );
  };

  const handleSwitch = () => {
    setFacingMode((m) => (m === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Camera className="w-4 h-4 text-brand-500" />
            {isBangla ? 'লেবেলের ছবি তুলুন' : 'Capture the label'}
          </div>
          <button
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
            aria-label="Close camera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="p-6 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <p className="text-sm text-slate-600 max-w-sm">{error}</p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className={`h-full w-full object-cover ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />
              {/* Reticle corners */}
              <span className="absolute top-4 left-4 text-brand-300 font-mono text-lg leading-none">+</span>
              <span className="absolute top-4 right-4 text-brand-300 font-mono text-lg leading-none">+</span>
              <span className="absolute bottom-4 left-4 text-brand-300 font-mono text-lg leading-none">+</span>
              <span className="absolute bottom-4 right-4 text-brand-300 font-mono text-lg leading-none">+</span>
              {!ready && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-brand-400 animate-spin" />
                </div>
              )}
            </>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={handleSwitch}
            disabled={Boolean(error)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition disabled:opacity-40"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">{isBangla ? 'ক্যামেরা বদলান' : 'Flip'}</span>
          </button>

          <button
            onClick={handleCapture}
            disabled={!ready || Boolean(error)}
            className="flex items-center gap-2.5 px-7 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-brand-600 text-white font-bold shadow-[0_14px_30px_-14px_rgba(16,185,129,0.9)] transition-transform hover:scale-[1.03] active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            {isBangla ? 'ছবি তুলুন' : 'Capture'}
          </button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
