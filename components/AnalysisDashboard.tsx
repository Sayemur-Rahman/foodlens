'use client';

import React, { useState } from 'react';
import { AnalysisResult, Ingredient } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';
import { usePreferences } from '@/context/PreferencesContext';
import { getConcernBadge } from '@/lib/i18n';
import IngredientDetailModal from './IngredientDetailModal';
import {
  AlertTriangle,
  BookmarkCheck,
  CheckCircle2,
  ChevronRight,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';

interface AnalysisDashboardProps {
  analysis: AnalysisResult;
  productName?: string;
  onCompareRequest?: () => void;
}

export default function AnalysisDashboard({
  analysis,
  productName,
  onCompareRequest,
}: AnalysisDashboardProps) {
  const { language, t } = useLanguage();
  const { preferences } = usePreferences();
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const isBangla = language === 'bn';

  // Determine user allergy and avoidance matches
  const matchedAllergens = analysis.allergens.filter((allergen) =>
    preferences.allergens.includes(allergen)
  );

  const preferenceFlags: string[] = [];
  if (
    preferences.avoidHighSugar &&
    analysis.detectedIngredients.some((i) => i.matched?.category === 'sweetener')
  ) {
    preferenceFlags.push(t.preferences.avoidHighSugar);
  }
  if (
    preferences.avoidArtificialColors &&
    analysis.detectedIngredients.some((i) => i.matched?.category === 'artificial-color')
  ) {
    preferenceFlags.push(t.preferences.avoidArtificialColors);
  }
  if (
    preferences.avoidPreservatives &&
    analysis.detectedIngredients.some((i) => i.matched?.category === 'preservative')
  ) {
    preferenceFlags.push(t.preferences.avoidPreservatives);
  }
  if (
    preferences.avoidArtificialSweeteners &&
    analysis.detectedIngredients.some((i) => i.matched?.category === 'artificial-sweetener')
  ) {
    preferenceFlags.push(t.preferences.avoidArtificialSweeteners);
  }

  // Concern score styling
  const score = analysis.concernScore;
  let scoreBadgeColor = 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
  let scoreBarColor = 'bg-emerald-500';

  if (score >= 60) {
    scoreBadgeColor = 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800';
    scoreBarColor = 'bg-orange-500';
  } else if (score >= 40) {
    scoreBadgeColor = 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
    scoreBarColor = 'bg-amber-500';
  }

  const handleOpenDetail = (ing: Ingredient) => {
    setSelectedIngredient(ing);
    setIsModalOpen(true);
  };

  const handleSaveScan = () => {
    try {
      const scans = JSON.parse(localStorage.getItem('foodlens_scans') || '[]');
      const newScan = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        productName: productName || 'Scanned Food Product',
        analysis,
      };
      localStorage.setItem('foodlens_scans', JSON.stringify([newScan, ...scans.slice(0, 19)]));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Ingredient Detail Modal */}
      <IngredientDetailModal
        ingredient={selectedIngredient}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Top Banner: Score & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informative Concern Score Card */}
        <div className="lg:col-span-1 p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                {t.results.concernScoreLabel}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                Informational
              </span>
            </div>

            <div className="flex items-baseline gap-3 my-4">
              <span className="text-5xl font-extrabold text-stone-900 dark:text-stone-100 font-mono tracking-tight">
                {score}
              </span>
              <span className="text-stone-400 dark:text-stone-500 text-xl font-medium">
                / 100
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-3 mb-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-700 ${scoreBarColor}`}
                style={{ width: `${Math.max(score, 8)}%` }}
              />
            </div>

            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed mb-4">
              {t.results.concernScoreMeaning}
            </p>
          </div>

          <div className="pt-3 border-t border-stone-100 dark:border-stone-800/80 text-xs text-stone-400 dark:text-stone-500 italic flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{t.results.concernScoreDisclaimer}</span>
          </div>
        </div>

        {/* Product Summary & Context */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                {t.results.title}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveScan}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition cursor-pointer"
                >
                  <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {isSaved ? t.results.savedScan : t.results.saveScan}
                </button>
                {onCompareRequest && (
                  <button
                    onClick={onCompareRequest}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer"
                  >
                    {t.results.compareWithAnother}
                  </button>
                )}
              </div>
            </div>

            {/* Bilingual Balanced Summary */}
            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 text-sm leading-relaxed text-stone-800 dark:text-stone-200">
              <p className="font-medium mb-2">
                {isBangla ? analysis.summary_bn : analysis.summary_en}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 pt-2 border-t border-stone-200 dark:border-stone-700/60">
                {isBangla ? analysis.summary_en : analysis.summary_bn}
              </p>
            </div>

            {/* Category breakdown chips */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 block mb-2">
                {t.results.categoriesOverview}
              </span>
              <div className="flex flex-wrap gap-2">
                {analysis.categories.map((cat) => {
                  const badge = getConcernBadge(cat.concernLevel, language);
                  return (
                    <div
                      key={cat.name}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700"
                    >
                      <span>{badge.icon}</span>
                      <span>
                        {t.categories[cat.name as keyof typeof t.categories] || cat.name}
                      </span>
                      <span className="px-1.5 py-0.2 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 font-mono text-2xs">
                        {cat.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Allergen & User Profile Match Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Allergens Detected Card */}
        <div
          className={`p-5 rounded-2xl border transition ${
            analysis.allergens.length > 0
              ? 'bg-rose-50/80 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
              : 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
          }`}
        >
          <div className="flex items-start gap-3">
            {analysis.allergens.length > 0 ? (
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                {analysis.allergens.length > 0
                  ? t.results.allergensFound
                  : t.results.noAllergens}
              </h4>
              {analysis.allergens.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {analysis.allergens.map((allergen) => (
                    <span
                      key={allergen}
                      className="px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-600 text-white shadow-xs uppercase tracking-wide"
                    >
                      ⚠️ {allergen}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                  Common major allergens like milk, wheat, or peanuts were not flagged in the parsed list.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Personalized Dietary Preferences Flags */}
        <div
          className={`p-5 rounded-2xl border transition ${
            preferenceFlags.length > 0 || matchedAllergens.length > 0
              ? 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
              : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800'
          }`}
        >
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                {preferenceFlags.length > 0 || matchedAllergens.length > 0
                  ? t.results.userPrefMatchWarning
                  : 'Profile Alignment'}
              </h4>
              {preferenceFlags.length > 0 || matchedAllergens.length > 0 ? (
                <ul className="mt-2 space-y-1 text-xs text-amber-900 dark:text-amber-200 list-disc list-inside">
                  {matchedAllergens.map((allg) => (
                    <li key={allg} className="font-semibold text-rose-700 dark:text-rose-400">
                      Personal Allergy Alert: {allg}
                    </li>
                  ))}
                  {preferenceFlags.map((flag) => (
                    <li key={flag}>{flag}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                  This product does not trigger any of your saved personal dietary or additive alerts.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Ingredient List */}
      <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            {t.results.ingredientsBreakdown}
            <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-normal">
              {analysis.detectedIngredients.length} items
            </span>
          </h3>
        </div>

        <div className="divide-y divide-stone-100 dark:divide-stone-800">
          {analysis.detectedIngredients.map((item, index) => {
            const ing = item.matched;
            if (!ing) {
              return (
                <div
                  key={index}
                  className="py-3.5 flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-stone-400 text-xs font-mono">#{index + 1}</span>
                    <span className="font-medium text-stone-700 dark:text-stone-300">
                      {item.raw}
                    </span>
                    <span className="text-xs text-stone-400 italic">
                      (Unclassified raw text)
                    </span>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-500">
                    Unmatched
                  </span>
                </div>
              );
            }

            const badge = getConcernBadge(ing.concern_level, language);

            return (
              <div
                key={ing.id}
                onClick={() => handleOpenDetail(ing)}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/60 dark:hover:bg-stone-800/40 rounded-xl px-3 transition cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-stone-400 text-xs font-mono mt-1">
                    #{index + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                        {ing.name_en}
                      </span>
                      <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                        ({ing.name_bn})
                      </span>
                      {ing.e_number && (
                        <span className="px-1.5 py-0.5 rounded text-xs font-mono bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                          {ing.e_number}
                        </span>
                      )}
                      {ing.ins_number && (
                        <span className="px-1.5 py-0.5 rounded text-xs font-mono bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                          {ing.ins_number}
                        </span>
                      )}
                      {ing.allergen && (
                        <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          Allergen: {ing.allergen_type}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-1">
                      {isBangla ? ing.purpose_bn : ing.purpose}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${badge.colorClass}`}
                  >
                    <span>{badge.icon}</span>
                    <span>{badge.label}</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-200 transition" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* "What Can It Cause?" Section — Evidence-based without panic */}
      <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Info className="w-5 h-5 text-amber-600" />
          {t.results.whatCanItCause}
        </h3>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Educational facts and scientific perspectives regarding excessive consumption or specific sensitivities.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {analysis.detectedIngredients
            .filter((item) => item.matched)
            .map((item) => {
              const ing = item.matched!;
              const badge = getConcernBadge(ing.concern_level, language);
              return (
                <div
                  key={ing.id}
                  className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/30 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                      {ing.name_en} ({ing.name_bn})
                    </span>
                    <span className="text-xs">{badge.icon}</span>
                  </div>
                  <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                    {isBangla ? ing.concerns_bn : ing.concerns_en}
                  </p>
                  <div className="pt-2 border-t border-stone-200/70 dark:border-stone-700/60 flex items-center justify-between text-2xs text-stone-500">
                    <span>Evidence: {ing.evidence_level}</span>
                    <button
                      onClick={() => handleOpenDetail(ing)}
                      className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline cursor-pointer"
                    >
                      {t.results.viewDetails} →
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
