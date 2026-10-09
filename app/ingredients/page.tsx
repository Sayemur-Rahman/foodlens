'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Ingredient } from '@/lib/types';
import { getConcernBadge } from '@/lib/i18n';
import IngredientDetailModal from '@/components/IngredientDetailModal';
import { Search, ChevronRight, BookOpen } from 'lucide-react';

export default function IngredientsPage() {
  const { language, t } = useLanguage();
  const [query, setQuery] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isBangla = language === 'bn';

  useEffect(() => {
    const fetchIngredients = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setIngredients(data.results || []);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchIngredients, 200);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleOpenDetail = (ing: Ingredient) => {
    setSelectedIngredient(ing);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Detail Modal */}
      <IngredientDetailModal
        ingredient={selectedIngredient}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center justify-center gap-2">
          <BookOpen className="w-8 h-8 text-emerald-600" />
          {t.search.title}
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-400 max-w-lg mx-auto">
          {t.search.subtitle}
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-stone-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.search.placeholder}
          className="w-full pl-12 pr-4 py-3.5 text-sm rounded-2xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-xs"
        />
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-stone-500 px-2">
        <span>
          {t.search.countResults} <strong className="text-stone-800 dark:text-stone-200">{ingredients.length}</strong>
        </span>
      </div>

      {/* Ingredient Cards / Table */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs divide-y divide-stone-100 dark:divide-stone-800 overflow-hidden">
        {ingredients.length === 0 && !isLoading && (
          <div className="p-12 text-center text-sm text-stone-400">
            {t.search.noResults}
          </div>
        )}

        {ingredients.map((ing) => {
          const badge = getConcernBadge(ing.concern_level, language);
          return (
            <div
              key={ing.id}
              onClick={() => handleOpenDetail(ing)}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition cursor-pointer group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 group-hover:text-emerald-600 transition">
                    {ing.name_en}
                  </h3>
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    ({ing.name_bn})
                  </span>
                  {ing.e_number && (
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                      {ing.e_number}
                    </span>
                  )}
                  {ing.ins_number && (
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                      {ing.ins_number}
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 max-w-xl">
                  {isBangla ? ing.description_bn : ing.description_en}
                </p>

                <div className="flex items-center gap-2 pt-1 text-2xs text-stone-400">
                  <span>Category: {ing.category}</span>
                  <span>•</span>
                  <span>Evidence: {ing.evidence_level}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.colorClass}`}
                >
                  <span>{badge.icon}</span>
                  <span>{badge.label}</span>
                </span>
                <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-600 transition" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
