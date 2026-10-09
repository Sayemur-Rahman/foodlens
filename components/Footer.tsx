'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="w-full border-t border-slate-200 bg-white/70 py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-emerald-100 text-emerald-600 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
          </span>
          <span className="text-slate-600">{t.footer.builtFor}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>© 2026 FoodLens. {t.footer.rights}</span>
        </div>
      </div>
    </footer>
  );
}
