'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserPreferences } from '@/lib/types';

const defaultPreferences: UserPreferences = {
  allergens: ['milk', 'peanut', 'gluten'],
  avoidHighSugar: true,
  avoidHighSodium: true,
  avoidArtificialColors: true,
  avoidArtificialSweeteners: false,
  avoidPreservatives: false,
};

interface PreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (newPrefs: Partial<UserPreferences>) => void;
  toggleAllergen: (allergen: string) => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('foodlens_preferences');
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    } catch {
      // storage unavailable
    }
  }, []);

  const updatePreferences = (newPrefs: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...newPrefs };
      try {
        localStorage.setItem('foodlens_preferences', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const toggleAllergen = (allergen: string) => {
    setPreferences((prev) => {
      const exists = prev.allergens.includes(allergen);
      const nextAllergens = exists
        ? prev.allergens.filter((a) => a !== allergen)
        : [...prev.allergens, allergen];
      const updated = { ...prev, allergens: nextAllergens };
      try {
        localStorage.setItem('foodlens_preferences', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences, toggleAllergen }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
