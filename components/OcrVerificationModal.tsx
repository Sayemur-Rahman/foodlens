'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Check, Edit2, AlertTriangle, X } from 'lucide-react';

interface OcrVerificationModalProps {
  initialText: string;
  isOpen: boolean;
  onConfirm: (verifiedText: string) => void;
  onClose: () => void;
}

export default function OcrVerificationModal({
  initialText,
  isOpen,
  onConfirm,
  onClose,
}: OcrVerificationModalProps) {
  const { t } = useLanguage();
  const [text, setText] = useState(initialText);
  const [isEditing, setIsEditing] = useState(false);
  const [syncedText, setSyncedText] = useState(initialText);

  // The modal stays mounted while closed, so `useState(initialText)` only
  // captures the very first (empty) value. Re-sync during render whenever a
  // fresh OCR result arrives, otherwise the recognized text is never displayed.
  if (initialText !== syncedText) {
    setSyncedText(initialText);
    setText(initialText);
    setIsEditing(false);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                {t.ocr.detectedHeading}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {t.ocr.instructions}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span>{t.ocr.rawTextLabel}</span>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium hover:underline cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              {isEditing ? 'Preview' : t.ocr.editBtn}
            </button>
          </div>

          {isEditing ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              className="w-full p-3.5 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
              placeholder="Correct any misread words, numbers, or letters here..."
            />
          ) : (
            <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/60 text-sm text-stone-800 dark:text-stone-200 max-h-56 overflow-y-auto leading-relaxed">
              {text || (
                <span className="italic text-stone-400">
                  No text detected. Click &quot;Edit Text&quot; to type ingredients manually.
                </span>
              )}
            </div>
          )}

          <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-900/50">
            💡 <strong>Tip:</strong> OCR can misread characters like E62I instead of E621, or 2ll instead of 211. Fix any typos above for the most accurate analysis.
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 transition"
          >
            {t.results.closeModal}
          </button>
          <button
            type="button"
            onClick={() => onConfirm(text)}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition cursor-pointer"
          >
            <Check className="w-4 h-4" />
            {t.ocr.confirmBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
