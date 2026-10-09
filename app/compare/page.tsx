'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { AnalysisResult } from '@/lib/types';
import { Scale, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

const PRESET_A = 'Wheat Flour, Sugar, Palm Oil, Milk Powder, Salt, INS 500, INS 322, INS 102, Vanillin';
const PRESET_B = 'Wheat Flour, Water, Yeast, Salt, Sunflower Oil';

export default function ComparePage() {
  const { language, t } = useLanguage();

  const [inputA, setInputA] = useState(PRESET_A);
  const [inputB, setInputB] = useState(PRESET_B);
  const [resultA, setResultA] = useState<AnalysisResult | null>(null);
  const [resultB, setResultB] = useState<AnalysisResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  const handleCompare = async () => {
    setIsComparing(true);
    try {
      const [resA, resB] = await Promise.all([
        fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: inputA, language }),
        }),
        fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: inputB, language }),
        }),
      ]);

      const dataA = await resA.json();
      const dataB = await resB.json();

      setResultA(dataA.analysis || null);
      setResultB(dataB.analysis || null);
    } catch (e) {
      console.error('Comparison error:', e);
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center justify-center gap-2">
          <Scale className="w-8 h-8 text-emerald-600" />
          {t.compare.title}
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-400 max-w-xl mx-auto">
          {t.compare.subtitle}
        </p>
      </div>

      {/* Input Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product A */}
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
          <label className="block text-sm font-bold text-stone-900 dark:text-stone-100">
            {t.compare.productA}
          </label>
          <textarea
            value={inputA}
            onChange={(e) => setInputA(e.target.value)}
            rows={4}
            className="w-full p-3.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
            placeholder="Enter ingredients for Product A..."
          />
        </div>

        {/* Product B */}
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
          <label className="block text-sm font-bold text-stone-900 dark:text-stone-100">
            {t.compare.productB}
          </label>
          <textarea
            value={inputB}
            onChange={(e) => setInputB(e.target.value)}
            rows={4}
            className="w-full p-3.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
            placeholder="Enter ingredients for Product B..."
          />
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleCompare}
          disabled={isComparing || !inputA.trim() || !inputB.trim()}
          className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md transition cursor-pointer disabled:opacity-50"
        >
          <Scale className="w-5 h-5" />
          <span>{isComparing ? 'Comparing...' : t.compare.runComparison}</span>
        </button>
      </div>

      {/* Comparison Results */}
      {resultA && resultB && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6 animate-in fade-in">
          {/* Comparison Verdict Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-sm text-emerald-900 dark:text-emerald-200 leading-relaxed">
              <strong className="font-semibold block mb-0.5">Comparative Label Summary:</strong>
              {resultA.concernScore < resultB.concernScore ? (
                <span>
                  <strong>Product A</strong> {t.compare.fewerConcernsVerdict}
                </span>
              ) : resultB.concernScore < resultA.concernScore ? (
                <span>
                  <strong>Product B</strong> {t.compare.fewerConcernsVerdict}
                </span>
              ) : (
                <span>{t.compare.cautionVerdict}</span>
              )}
            </div>
          </div>

          {/* Metrics Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Metric</th>
                  <th className="py-3 px-4">{t.compare.productA}</th>
                  <th className="py-3 px-4">{t.compare.productB}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                <tr>
                  <td className="py-4 px-4 font-medium text-stone-700 dark:text-stone-300">
                    {t.compare.metricScore}
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-lg text-stone-900 dark:text-stone-100">
                    {resultA.concernScore} / 100
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-lg text-stone-900 dark:text-stone-100">
                    {resultB.concernScore} / 100
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-stone-700 dark:text-stone-300">
                    {t.compare.metricAdditives}
                  </td>
                  <td className="py-4 px-4 text-stone-800 dark:text-stone-200">
                    {resultA.categories.reduce((acc, c) => acc + c.count, 0)} detected
                  </td>
                  <td className="py-4 px-4 text-stone-800 dark:text-stone-200">
                    {resultB.categories.reduce((acc, c) => acc + c.count, 0)} detected
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-stone-700 dark:text-stone-300">
                    {t.compare.metricAllergens}
                  </td>
                  <td className="py-4 px-4">
                    {resultA.allergens.length > 0 ? (
                      <span className="text-rose-600 font-semibold">
                        {resultA.allergens.join(', ')}
                      </span>
                    ) : (
                      <span className="text-emerald-600">None detected</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {resultB.allergens.length > 0 ? (
                      <span className="text-rose-600 font-semibold">
                        {resultB.allergens.join(', ')}
                      </span>
                    ) : (
                      <span className="text-emerald-600">None detected</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-stone-700 dark:text-stone-300">
                    {t.compare.metricHighConcern}
                  </td>
                  <td className="py-4 px-4">
                    {
                      resultA.detectedIngredients.filter(
                        (i) => i.matched?.concern_level === 'higher' || i.matched?.concern_level === 'high'
                      ).length
                    }{' '}
                    items
                  </td>
                  <td className="py-4 px-4">
                    {
                      resultB.detectedIngredients.filter(
                        (i) => i.matched?.concern_level === 'higher' || i.matched?.concern_level === 'high'
                      ).length
                    }{' '}
                    items
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
