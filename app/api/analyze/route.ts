import { NextRequest, NextResponse } from 'next/server';
import {
  parseIngredientList,
  analyzeIngredients,
  extractNutritionFromText,
} from '@/lib/ingredient-matcher';
import { AnalysisResult } from '@/lib/types';


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text = '' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing ingredients text' },
        { status: 400 }
      );
    }

    const rawTokens = parseIngredientList(text);
    const { detected, allergens, concernScore, categories } = analyzeIngredients(rawTokens);
    const nutritionData = extractNutritionFromText(text);

    // Build balanced summaries
    const matchedCount = detected.filter((d) => d.matched).length;
    const highConcernCount = detected.filter(
      (d) => d.matched && (d.matched.concern_level === 'higher' || d.matched.concern_level === 'high')
    ).length;

    const summaryEn = `Identified ${detected.length} ingredient items (${matchedCount} recognized against the FoodLens safety database). Detected ${allergens.length} allergen categories (${allergens.join(', ') || 'None'}) and ${highConcernCount} components with heightened regulatory or clinical considerations.`;

    const summaryBn = `${detected.length}টি উপাদানের মধ্যে ${matchedCount}টি উপাদান ফুডলেন্স ডাটাবেজে শনাক্ত করা হয়েছে। এতে ${allergens.length > 0 ? allergens.join(', ') : 'কোনো প্রধান'} অ্যালার্জেন শনাক্ত হয়েছে এবং ${highConcernCount}টি উপাদানে বিশেষ মনোযোগের নির্দেশিকা রয়েছে।`;

    const result: AnalysisResult = {
      rawText: text,
      detectedIngredients: detected,
      allergens,
      summary_en: summaryEn,
      summary_bn: summaryBn,
      concernScore,
      categories,
      nutritionData,
    };

    return NextResponse.json({ analysis: result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Analysis failed';
    console.error('Analyze route error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
