'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ShieldCheck, Mail } from 'lucide-react';

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
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <span className="text-slate-600">{t.footer.createdBy}</span>
          <a
            href="mailto:prappo1109@gmail.com"
            className="inline-flex items-center gap-1.5 font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            <Mail className="w-3.5 h-3.5" />
            prappo1109@gmail.com
          </a>
          <a
            href="https://instagram.com/sayemur.gg"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-pink-600 hover:text-pink-700 hover:underline"
          >
            <InstagramGlyph />
            @sayemur.gg
          </a>
          <span>© 2026 FoodLens. {t.footer.rights}</span>
        </div>
      </div>
    </footer>
  );
}

function InstagramGlyph() {
  return (
    <svg
      className="w-3.5 h-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
