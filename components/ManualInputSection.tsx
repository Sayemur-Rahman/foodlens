'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Edit3, Sparkles, Send } from 'lucide-react';

interface ManualInputSectionProps {
  onAnalyze: (text: string) => void;
  isLoading?: boolean;
}

const SAMPLE_PRODUCTS = [
  {
    nameEn: '🍪 Sweet Glucose Biscuit',
    nameBn: '🍪 মিষ্টি গ্লুকোজ বিস্কুট',
    ingredients:
      'Wheat Flour, Sugar, Palm Oil, Milk Powder, Salt (Sodium Chloride), Leavening Agent (INS 500ii), Emulsifier (INS 322), Synthetic Food Colour (INS 102), Added Flavour (Vanillin)',
  },
  {
    nameEn: '🍜 Instant Masala Noodles',
    nameBn: '🍜 ইনস্ট্যান্ট মসলা নুডলস',
    ingredients:
      'Wheat Flour, Refined Palm Oil, Salt, Flavour Enhancer (INS 621), Synthetic Food Colour (INS 102, INS 110), Preservative (INS 202), Citric Acid (INS 330)',
  },
  {
    nameEn: '🥤 Orange Soda Drink',
    nameBn: '🥤 অরেঞ্জ কোমল পানীয়',
    ingredients:
      'Water, Sugar, Citric Acid (INS 330), Preservative (INS 211), Artificial Colour (INS 110), Artificial Sweetener (INS 951, INS 950)',
  },
  {
    nameEn: '🥔 Spicy Crispy Chips',
    nameBn: '🥔 মশলাদার ক্রিস্পি চিপস',
    ingredients:
      'Potato, Vegetable Oil (Palm), Salt, Monosodium Glutamate (E621), Spices, Caramel Colour (E150), Citric Acid (E330)',
  },
  {
    nameEn: '🇧🇩 মিশ্র বাংলা লেবেল (Mixed Label)',
    nameBn: '🇧🇩 মিশ্র বাংলা উপাদান লেবেল',
    ingredients:
      'গমের ময়দা, চিনি, পাম তেল, দুধের গুঁড়া, সোডিয়াম বেনজোয়েট (INS 211), টেস্টিং সল্ট (E621), লবণ',
  },
];

export default function ManualInputSection({
  onAnalyze,
  isLoading,
}: ManualInputSectionProps) {
  const { language, t } = useLanguage();
  const [inputText, setInputText] = useState('');

  const isBangla = language === 'bn';

  const handlePreset = (ingredients: string) => {
    setInputText(ingredients);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onAnalyze(inputText.trim());
    }
  };

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100 mb-1.5 flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-emerald-600" />
            {t.manual.heading}
          </label>
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-2">
            {t.manual.subheading}
          </p>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            className="w-full p-4 text-sm rounded-2xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-xs"
            placeholder={isBangla ? t.manual.placeholderBn : t.manual.placeholder}
          />
        </div>

        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold shadow-md transition cursor-pointer"
        >
          {isLoading ? (
            <Sparkles className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span>{isLoading ? t.scan.analyzing : t.manual.analyzeBtn}</span>
        </button>
      </form>

      {/* Quick Presets / Examples */}
      <div className="pt-4 border-t border-stone-200 dark:border-stone-800">
        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 block mb-2.5">
          {t.manual.quickExamplesTitle}
        </span>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_PRODUCTS.map((prod, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handlePreset(prod.ingredients)}
              className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer shadow-2xs"
            >
              {isBangla ? prod.nameBn : prod.nameEn}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
