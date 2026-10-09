'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { usePreferences } from '@/context/PreferencesContext';
import { User, ShieldAlert, Check, Sliders } from 'lucide-react';

export default function PreferencesPage() {
  const { t } = useLanguage();
  const { preferences, updatePreferences, toggleAllergen } = usePreferences();
  const [showSavedToast, setShowSavedToast] = useState(false);

  const allergensList = [
    { key: 'milk', label: t.preferences.milk },
    { key: 'gluten', label: t.preferences.gluten },
    { key: 'peanut', label: t.preferences.peanut },
    { key: 'soy', label: t.preferences.soy },
    { key: 'egg', label: t.preferences.egg },
    { key: 'fish', label: t.preferences.fish },
  ];

  const avoidanceList = [
    { key: 'avoidHighSugar', label: t.preferences.avoidHighSugar },
    { key: 'avoidHighSodium', label: t.preferences.avoidHighSodium },
    { key: 'avoidArtificialColors', label: t.preferences.avoidArtificialColors },
    { key: 'avoidArtificialSweeteners', label: t.preferences.avoidArtificialSweeteners },
    { key: 'avoidPreservatives', label: t.preferences.avoidPreservatives },
  ];

  const handleToggleAvoid = (key: string, currentValue: boolean) => {
    updatePreferences({ [key]: !currentValue });
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  const handleToggleAllg = (key: string) => {
    toggleAllergen(key);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center justify-center gap-2">
          <User className="w-8 h-8 text-emerald-600" />
          {t.preferences.title}
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-400 max-w-lg mx-auto">
          {t.preferences.subtitle}
        </p>
      </div>

      {showSavedToast && (
        <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold text-center animate-in fade-in">
          ✓ {t.preferences.savedAlert}
        </div>
      )}

      {/* Allergens Selection Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-base">
          <ShieldAlert className="w-5 h-5 text-rose-600" />
          <span>{t.preferences.allergensTitle}</span>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          {t.preferences.allergensSubtitle}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {allergensList.map((item) => {
            const isChecked = preferences.allergens.includes(item.key);
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleToggleAllg(item.key)}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                  isChecked
                    ? 'border-rose-300 dark:border-rose-900 bg-rose-50/70 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200'
                    : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/40 text-stone-700 dark:text-stone-300 hover:border-stone-300'
                }`}
              >
                <span className="text-sm font-semibold">{item.label}</span>
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center transition ${
                    isChecked
                      ? 'bg-rose-600 text-white'
                      : 'border border-stone-300 dark:border-stone-700'
                  }`}
                >
                  {isChecked && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dietary Avoidance Criteria Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-base">
          <Sliders className="w-5 h-5 text-amber-600" />
          <span>{t.preferences.avoidTitle}</span>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          {t.preferences.avoidSubtitle}
        </p>

        <div className="space-y-3 pt-2">
          {avoidanceList.map((item) => {
            const isChecked = Boolean(
              preferences[item.key as keyof typeof preferences]
            );
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleToggleAvoid(item.key, isChecked)}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                  isChecked
                    ? 'border-amber-300 dark:border-amber-900 bg-amber-50/70 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200'
                    : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/40 text-stone-700 dark:text-stone-300 hover:border-stone-300'
                }`}
              >
                <span className="text-sm font-semibold">{item.label}</span>
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center transition ${
                    isChecked
                      ? 'bg-amber-600 text-white'
                      : 'border border-stone-300 dark:border-stone-700'
                  }`}
                >
                  {isChecked && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
