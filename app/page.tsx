'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import ScannerConsole from '@/components/ScannerConsole';
import ManualInputSection from '@/components/ManualInputSection';
import AnalysisDashboard from '@/components/AnalysisDashboard';
import { AnalysisResult } from '@/lib/types';
import {
  History,
  Trash2,
  ShieldCheck,
  Database,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

interface SavedScanItem {
  id: string;
  timestamp: string;
  productName: string;
  analysis: AnalysisResult;
}

export default function HomePage() {
  const { language, t } = useLanguage();
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentScans, setRecentScans] = useState<SavedScanItem[]>([]);

  const isBangla = language === 'bn';

  useEffect(() => {
    try {
      const stored = localStorage.getItem('foodlens_scans');
      if (stored) {
        setRecentScans(JSON.parse(stored));
      }
    } catch {
      // storage unavailable
    }
  }, []);

  const handleAnalyzeText = async (text: string) => {
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
        window.scrollTo({ top: 420, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    try {
      localStorage.removeItem('foodlens_scans');
      setRecentScans([]);
    } catch {
      // ignore
    }
  };

  const handleLoadSavedScan = (scan: SavedScanItem) => {
    setAnalysisResult(scan.analysis);
    window.scrollTo({ top: 420, behavior: 'smooth' });
  };

  return (
    <div className="relative flex flex-col gap-12">
      {/* Decorative side food icons with water-dive hover effect */}
      <div className="pointer-events-none fixed inset-y-0 left-2 z-0 hidden 2xl:flex flex-col items-center justify-center gap-10">
        {[
          { src: '/food1.svg', label: 'Street food' },
          { src: '/food2.svg', label: 'Noodles' },
          { src: '/food3.svg', label: 'Meal' },
        ].map((item) => (
          <div
            key={item.src}
            className="dive-wrap pointer-events-auto opacity-80 hover:opacity-100 transition-opacity"
          >
            <img src={item.src} alt={item.label} className="dive-icon w-12 h-12 drop-shadow-md" />
          </div>
        ))}
      </div>
      <div className="pointer-events-none fixed inset-y-0 right-2 z-0 hidden 2xl:flex flex-col items-center justify-center gap-10">
        {[
          { src: '/food4.svg', label: 'Drink' },
          { src: '/food5.svg', label: 'Dish' },
          { src: '/food6.svg', label: 'Snack' },
        ].map((item) => (
          <div
            key={item.src}
            className="dive-wrap pointer-events-auto opacity-80 hover:opacity-100 transition-opacity"
          >
            <img src={item.src} alt={item.label} className="dive-icon w-12 h-12 drop-shadow-md" />
          </div>
        ))}
      </div>

      {/* Hero Headline Section */}
      <section className="text-center max-w-3xl mx-auto flex flex-col items-center pt-2 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-medium mb-6 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Bilingual English + বাংলা • Evidence-Based Food Safety</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-slate-900 tracking-tight leading-[1.25] hero-text-glow">
          {isBangla ? (
            <>
              আপনার খাদ্য লেবেল{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-brand-500 to-teal-500">
                স্ক্যান করুন
              </span>
            </>
          ) : (
            <>
              Scan Your Food Label{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-brand-500 to-teal-500">
                In Seconds
              </span>
            </>
          )}
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {t.hero.subtitle}
        </p>
      </section>

      {/* Scanner Console */}
      <div className="relative z-10">
        <ScannerConsole onAnalyzeConfirmed={handleAnalyzeText} />
      </div>

      {/* Manual entry (collapsible secondary path) */}
      <section className="max-w-4xl w-full mx-auto relative z-10">
        <details className="glass-card rounded-2xl p-4 sm:p-6 group">
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Database className="w-4 h-4 text-brand-500" />
              {t.manual.heading}
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-90" />
          </summary>
          <div className="pt-5">
            <ManualInputSection onAnalyze={handleAnalyzeText} isLoading={isLoading} />
          </div>
        </details>
      </section>

      {/* Analysis Results */}
      {analysisResult && (
        <section className="pt-2 relative z-10">
          <AnalysisDashboard analysis={analysisResult} />
        </section>
      )}

      {/* Recent Scans */}
      {recentScans.length > 0 && (
        <section className="max-w-4xl w-full mx-auto pt-4 space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-brand-500" />
              <span>
                {t.nav.history} ({recentScans.length})
              </span>
            </h3>
            <button
              onClick={handleClearHistory}
              className="text-xs text-slate-400 hover:text-rose-500 transition flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentScans.slice(0, 6).map((scan) => (
              <div
                key={scan.id}
                onClick={() => handleLoadSavedScan(scan)}
                className="glass-card glass-card-hover p-4 rounded-2xl cursor-pointer group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900 group-hover:text-emerald-600 transition truncate max-w-[170px]">
                    {scan.productName}
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {scan.analysis.concernScore}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-1">
                  {scan.analysis.detectedIngredients.length} ingredients analyzed
                </p>
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100">
                  <span>{new Date(scan.timestamp).toLocaleDateString()}</span>
                  <span className="text-brand-600 font-medium">Reopen →</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Feature Ecosystem */}
      <section className="w-full max-w-5xl mx-auto mt-2 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Additive Encyclopedia */}
          <Link href="/ingredients" className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-5 text-emerald-600 group-hover:scale-105 transition-transform">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors leading-snug">
                {t.search.title}
              </h3>
              <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                {t.search.subtitle}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-brand-600 font-medium">
              <span>{t.nav.search}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Comparison */}
          <Link href="/compare" className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-5 overflow-hidden p-1.5 group-hover:scale-105 transition-transform">
                <img src="/chart.png" alt="Comparison chart" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                {t.compare.title}
              </h3>
              <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                {t.compare.subtitle}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-medium">
              <span>{t.nav.compare}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Allergy Profile */}
          <Link href="/preferences" className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-5 overflow-hidden p-1.5 group-hover:scale-105 transition-transform">
                <img src="/allergy.png" alt="Allergy profile" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors leading-snug">
                {t.preferences.title}
              </h3>
              <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                {t.preferences.subtitle}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-amber-600 font-medium">
              <span>{t.nav.preferences}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* Medical Disclaimer */}
      <section className="w-full max-w-5xl mx-auto mt-2 relative z-10">
        <div className="relative rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-5 sm:p-6 shadow-md">
          <div className="flex items-start gap-4">
            <div className="shrink-0 mt-0.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-1.5">
              <h4 className="text-base font-bold text-amber-700 tracking-wide flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {t.disclaimer.title}
              </h4>
              <p className="text-xs sm:text-[13px] leading-relaxed text-amber-800/90 font-normal">
                {t.disclaimer.text}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
