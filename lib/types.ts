export type ConcernLevel = 'low' | 'moderate' | 'higher' | 'high';
export type EvidenceLevel = 'strong' | 'moderate' | 'limited' | 'uncertain';
export type Language = 'en' | 'bn';

export interface Ingredient {
  id: string;
  name_en: string;
  name_bn: string;
  aliases: string[];
  e_number: string | null;
  ins_number: string | null;
  category: string;
  purpose: string;
  purpose_bn: string;
  concern_level: ConcernLevel;
  description_en: string;
  description_bn: string;
  evidence_level: EvidenceLevel;
  common_uses_en: string;
  common_uses_bn: string;
  concerns_en: string;
  concerns_bn: string;
  allergen: boolean;
  allergen_type?: string;
  who_should_note_en: string;
  who_should_note_bn: string;
  found_in_en: string;
  found_in_bn: string;
  regulatory_info: string;
  last_reviewed: string;
}

export interface DetectedIngredient {
  raw: string;
  matched: Ingredient | null;
  confidence: number;
}

export interface CategorySummary {
  name: string;
  name_bn: string;
  count: number;
  concernLevel: ConcernLevel;
  items: string[];
}

export interface NutritionData {
  calories?: number;
  totalFat?: number;
  saturatedFat?: number;
  transFat?: number;
  carbohydrates?: number;
  sugars?: number;
  protein?: number;
  sodium?: number;
  fiber?: number;
  servingSize?: string;
  servingsPerContainer?: number;
}

export interface AnalysisResult {
  rawText: string;
  detectedIngredients: DetectedIngredient[];
  allergens: string[];
  summary_en: string;
  summary_bn: string;
  concernScore: number;
  categories: CategorySummary[];
  nutritionData?: NutritionData;
}

export interface UserPreferences {
  allergens: string[];
  avoidHighSugar: boolean;
  avoidHighSodium: boolean;
  avoidArtificialColors: boolean;
  avoidArtificialSweeteners: boolean;
  avoidPreservatives: boolean;
}
