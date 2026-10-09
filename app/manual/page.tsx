'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import ManualInputSection from '@/components/ManualInputSection';
import AnalysisDashboard from '@/components/AnalysisDashboard';
import { AnalysisResult } from '@/lib/types';
import { Edit3 } from 'lucide-react';

export default function ManualPage() {
  const { t, language } = useLanguage();
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async (text: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAnalysisResult(data.analysis);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center justify-center gap-2">
          <Edit3 className="w-7 h-7 text-emerald-600" />
          {t.manual.heading}
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-400 max-w-lg mx-auto">
          {t.manual.subheading}
        </p>
      </div>

      <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs">
        <ManualInputSection onAnalyze={handleAnalyze} isLoading={isLoading} />
      </div>

      {analysisResult && (
        <div className="pt-4">
          <AnalysisDashboard analysis={analysisResult} />
        </div>
      )}
    </div>
  );
}
