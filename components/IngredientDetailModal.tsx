'use client';

import React from 'react';
import { Ingredient } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';
import { getConcernBadge } from '@/lib/i18n';
import { X, ShieldCheck, AlertCircle, Info, BookOpen, Layers } from 'lucide-react';

interface IngredientDetailModalProps {
  ingredient: Ingredient | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function IngredientDetailModal({
  ingredient,
  isOpen,
  onClose,
}: IngredientDetailModalProps) {
  const { language, t } = useLanguage();

  if (!isOpen || !ingredient) return null;

  const concernBadge = getConcernBadge(ingredient.concern_level, language);
  const isBangla = language === 'bn';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${concernBadge.colorClass}`}
              >
                <span>{concernBadge.icon}</span>
                <span>{concernBadge.label}</span>
              </span>
              {ingredient.e_number && (
                <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                  {ingredient.e_number}
                </span>
              )}
              {ingredient.ins_number && (
                <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                  {ingredient.ins_number}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
              {ingredient.name_en}
            </h2>
            <p className="text-base text-emerald-700 dark:text-emerald-400 font-medium">
              {ingredient.name_bn}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* What is it & Purpose */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1.5">
                <Info className="w-4 h-4 text-emerald-600" />
                <span>{isBangla ? 'এটি কী?' : 'What is it?'}</span>
              </div>
              <p className="text-sm text-stone-800 dark:text-stone-200 leading-relaxed">
                {isBangla ? ingredient.description_bn : ingredient.description_en}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>{isBangla ? 'কেন ব্যবহার করা হয়?' : 'Why is it used?'}</span>
              </div>
              <p className="text-sm text-stone-800 dark:text-stone-200 leading-relaxed">
                {isBangla ? ingredient.purpose_bn : ingredient.purpose}
              </p>
            </div>
          </div>

          {/* Health Considerations (Scientific, non-fear) */}
          <div className="p-5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-300 mb-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{t.results.whatCanItCause}</span>
            </div>
            <p className="text-sm text-amber-950 dark:text-amber-100 leading-relaxed">
              {isBangla ? ingredient.concerns_bn : ingredient.concerns_en}
            </p>
          </div>

          {/* Who should pay attention */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              {isBangla ? 'কাদের বিশেষ নজর রাখা উচিত?' : 'Who may want to pay attention?'}
            </h4>
            <p className="text-sm text-stone-800 dark:text-stone-200 font-medium">
              {isBangla ? ingredient.who_should_note_bn : ingredient.who_should_note_en}
            </p>
          </div>

          {/* Commonly Found In */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              {isBangla ? 'সাধারণত যেসব খাবারে পাওয়া যায়' : 'Commonly found in'}
            </h4>
            <p className="text-sm text-stone-700 dark:text-stone-300">
              {isBangla ? ingredient.common_uses_bn : ingredient.common_uses_en}
            </p>
          </div>

          {/* Evidence Level & Regulatory Status */}
          <div className="p-4 rounded-xl bg-stone-100/80 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                {t.results.evidenceLevel}:
              </span>
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                {t.evidence[ingredient.evidence_level]}
              </span>
            </div>
            <div className="flex items-start justify-between gap-3 pt-2 border-t border-stone-200 dark:border-stone-700/60">
              <span className="text-stone-500 dark:text-stone-400 shrink-0">
                {t.results.regulatorySources}:
              </span>
              <span className="text-stone-700 dark:text-stone-300 text-right">
                {ingredient.regulatory_info}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Reviewed: {ingredient.last_reviewed}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 hover:opacity-90 transition cursor-pointer"
          >
            {t.results.closeModal}
          </button>
        </div>
      </div>
    </div>
  );
}
