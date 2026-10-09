import { ingredients, searchIngredients } from '@/data/ingredients';
import { ConcernLevel, DetectedIngredient, Ingredient, NutritionData } from './types';

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // strip zero-width characters
    .replace(/[()[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseIngredientList(text: string): string[] {
  // Strip header keywords in English & Bengali
  const cleanText = text
    .replace(/^(ingredients|contain[s]?|made with|উপাদান|উপাদানসমূহ|উপকরণ|উপকরণসমূহ)\s*[:：\-–]?\s*/gi, '')
    .trim();

  // Split on common delimiters: comma, semicolon, newline, bangla dari (।), bullets, bullet points, arabic comma
  const rawTokens = cleanText
    .split(/[,،、;।\n•·|/]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 1 && item.length < 120);

  return rawTokens;
}

export function matchIngredient(rawName: string): DetectedIngredient {
  const normalized = normalizeText(rawName);

  if (!normalized || normalized.length < 2) {
    return { raw: rawName, matched: null, confidence: 0 };
  }

  // 1. Direct exact alias match
  for (const ingredient of ingredients) {
    const allNames = [
      ingredient.name_en.toLowerCase(),
      ingredient.name_bn.toLowerCase(),
      ...(ingredient.e_number ? [ingredient.e_number.toLowerCase()] : []),
      ...(ingredient.ins_number ? [ingredient.ins_number.toLowerCase()] : []),
      ...ingredient.aliases.map((a) => a.toLowerCase()),
    ];

    if (allNames.includes(normalized)) {
      return { raw: rawName, matched: ingredient, confidence: 1.0 };
    }
  }

  // 2. Regex match for E-numbers (e.g. E621, E-621, e 211)
  const eMatch = normalized.match(/\be\s*[-]?\s*(\d{3,4}[a-z]?)\b/i);
  if (eMatch) {
    const eCode = `E${eMatch[1].toUpperCase()}`;
    const found = ingredients.find((i) => i.e_number === eCode);
    if (found) return { raw: rawName, matched: found, confidence: 0.95 };
  }

  // 3. Regex match for INS numbers (e.g. INS 211, ins-621, ins621)
  const insMatch = normalized.match(/\bins\s*[-]?\s*(\d{3,4}[a-z]?)\b/i);
  if (insMatch) {
    const insCode = `INS ${insMatch[1].toUpperCase()}`;
    const found = ingredients.find((i) => i.ins_number === insCode);
    if (found) return { raw: rawName, matched: found, confidence: 0.95 };
  }

  // 4. Standalone 3-digit food additive number (e.g. "621", "211")
  const numMatch = normalized.match(/^\b(\d{3,4}[a-z]?)\b$/);
  if (numMatch) {
    const code = numMatch[1].toUpperCase();
    const found = ingredients.find(
      (i) => i.e_number === `E${code}` || i.ins_number === `INS ${code}`
    );
    if (found) return { raw: rawName, matched: found, confidence: 0.9 };
  }

  // 5. Check if query contains any known ingredient name/alias
  for (const ingredient of ingredients) {
    for (const alias of ingredient.aliases) {
      const lowerAlias = alias.toLowerCase();
      if (lowerAlias.length > 3 && normalized.includes(lowerAlias)) {
        return { raw: rawName, matched: ingredient, confidence: 0.85 };
      }
    }
    if (normalized.includes(ingredient.name_en.toLowerCase())) {
      return { raw: rawName, matched: ingredient, confidence: 0.9 };
    }
    if (normalized.includes(ingredient.name_bn.toLowerCase())) {
      return { raw: rawName, matched: ingredient, confidence: 0.9 };
    }
  }

  // 6. Substring search fallback
  const searchResults = searchIngredients(normalized);
  if (searchResults.length > 0) {
    return { raw: rawName, matched: searchResults[0], confidence: 0.65 };
  }

  return { raw: rawName, matched: null, confidence: 0 };
}

export function extractNutritionFromText(text: string): NutritionData | undefined {
  const lower = text.toLowerCase();
  const data: NutritionData = {};
  let foundAny = false;

  // Calories / Energy
  const calMatch = lower.match(/(?:energy|calories|ক্যালোরি)\s*[:：]?\s*(\d+(?:\.\d+)?)\s*(?:kcal|cal)?/i);
  if (calMatch) {
    data.calories = parseFloat(calMatch[1]);
    foundAny = true;
  }

  // Total Fat
  const fatMatch = lower.match(/(?:total\s+fat|fat|ফ্যাট|চর্বি)\s*[:：]?\s*(\d+(?:\.\d+)?)\s*g/i);
  if (fatMatch) {
    data.totalFat = parseFloat(fatMatch[1]);
    foundAny = true;
  }

  // Saturated Fat
  const satMatch = lower.match(/(?:saturated\s+fat|স্যাচুরেটেড)\s*[:：]?\s*(\d+(?:\.\d+)?)\s*g/i);
  if (satMatch) {
    data.saturatedFat = parseFloat(satMatch[1]);
    foundAny = true;
  }

  // Carbohydrates
  const carbMatch = lower.match(/(?:carbohydrate[s]?|carbs|কার্বোহাইড্রেট)\s*[:：]?\s*(\d+(?:\.\d+)?)\s*g/i);
  if (carbMatch) {
    data.carbohydrates = parseFloat(carbMatch[1]);
    foundAny = true;
  }

  // Sugars
  const sugarMatch = lower.match(/(?:total\s+sugars|sugars|sugar|চিনি)\s*[:：]?\s*(\d+(?:\.\d+)?)\s*g/i);
  if (sugarMatch) {
    data.sugars = parseFloat(sugarMatch[1]);
    foundAny = true;
  }

  // Protein
  const proteinMatch = lower.match(/(?:protein|প্রোটিন)\s*[:：]?\s*(\d+(?:\.\d+)?)\s*g/i);
  if (proteinMatch) {
    data.protein = parseFloat(proteinMatch[1]);
    foundAny = true;
  }

  // Sodium
  const sodiumMatch = lower.match(/(?:sodium|সোডিয়াম)\s*[:：]?\s*(\d+(?:\.\d+)?)\s*(?:mg|g)/i);
  if (sodiumMatch) {
    data.sodium = parseFloat(sodiumMatch[1]);
    foundAny = true;
  }

  // Serving size
  const servingMatch = text.match(/(?:serving\s+size|সার্ভিং\s+সাইজ)\s*[:：]?\s*([^\n,]+)/i);
  if (servingMatch) {
    data.servingSize = servingMatch[1].trim();
    foundAny = true;
  }

  return foundAny ? data : undefined;
}

export function analyzeIngredients(rawIngredientList: string[]) {
  const detected = rawIngredientList.map((name) => matchIngredient(name));

  const allergensSet = new Set<string>();
  const categoryMap: Record<
    string,
    { count: number; items: string[]; concernLevel: ConcernLevel }
  > = {};

  let totalScoreWeight = 0;
  let totalIngredientsEvaluated = 0;

  for (const item of detected) {
    if (item.matched) {
      totalIngredientsEvaluated++;
      const ing = item.matched;

      // Allergens
      if (ing.allergen && ing.allergen_type) {
        allergensSet.add(ing.allergen_type);
      }

      // Categories
      const catKey = ing.category || 'other';
      if (!categoryMap[catKey]) {
        categoryMap[catKey] = {
          count: 0,
          items: [],
          concernLevel: ing.concern_level,
        };
      }
      categoryMap[catKey].count++;
      categoryMap[catKey].items.push(ing.name_en);

      // Upgrade category concern level if a higher item exists
      const priority: Record<ConcernLevel, number> = {
        low: 1,
        moderate: 2,
        higher: 3,
        high: 4,
      };
      if (priority[ing.concern_level] > priority[categoryMap[catKey].concernLevel]) {
        categoryMap[catKey].concernLevel = ing.concern_level;
      }

      // Score weight (Informative Concern Score: 0 is completely baseline safe, 100 is high concern)
      const weights: Record<ConcernLevel, number> = {
        low: 15,
        moderate: 45,
        higher: 75,
        high: 95,
      };
      totalScoreWeight += weights[ing.concern_level] ?? 20;
    }
  }

  const concernScore =
    totalIngredientsEvaluated > 0
      ? Math.min(Math.round(totalScoreWeight / totalIngredientsEvaluated), 100)
      : 25;

  const categories = Object.entries(categoryMap).map(([key, val]) => ({
    name: key,
    name_bn: key,
    count: val.count,
    concernLevel: val.concernLevel,
    items: val.items,
  }));

  return {
    detected,
    allergens: Array.from(allergensSet),
    concernScore,
    categories,
  };
}
