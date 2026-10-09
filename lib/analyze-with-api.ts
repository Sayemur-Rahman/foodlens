import { AnalysisResult } from '@/lib/types';

export interface ExplanationResult {
  text_en: string;
  text_bn: string;
  error?: string;
  provider?: string;
}

export async function generateExplanationWithAPI(
  ingredientName: string,
  category: string,
  context: string,
  language: 'en' | 'bn'
): Promise<string> {
  // Try Gemini first (if has key)
  if (process.env.GEMINI_API_KEY) {
    try {
      const { generateBilingualExplanation } = await import('./gemini');
      const result = await generateBilingualExplanation(ingredientName, category, context, language);
      if (result) return result;
    } catch (err) {
      console.warn('Gemini explanation failed:', err);
    }
  }

  // Try Grok as fallback
  try {
    const grokKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
    if (grokKey) {
      const langPrompt = language === 'bn' ? 'বাংলা ভাষায়' : 'in English';
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${grokKey}`,
        },
        body: JSON.stringify({
          model: process.env.GROK_MODEL || 'grok-2-vision-1212',
          messages: [
            {
              role: 'user',
              content: `Explain ${ingredientName} (${category}). Context: ${context}. Give a balanced, evidence-based explanation ${langPrompt} under 80 words. Avoid medical panic; use clear phrasing.`,
            },
          ],
          max_tokens: 200,
          temperature: 0.3,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) return text;
      }
    }
  } catch (err) {
    console.warn('Grok explanation failed:', err);
  }

  // Try OpenAI as fallback
  try {
    if (process.env.OPENAI_API_KEY) {
      const langPrompt = language === 'bn' ? 'বাংলা ভাষায়' : 'in English';
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: `Explain ${ingredientName} (${category}) clearly ${langPrompt}. Context: ${context}. Balanced, factual, under 80 words. Don't say it "causes disease" unless consensus; use "linked to" cautiously.`,
            },
          ],
          max_tokens: 200,
          temperature: 0.3,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) return text;
      }
    }
  } catch (err) {
    console.warn('OpenAI explanation failed:', err);
  }

  // Fallback to local DB style
  return language === 'bn'
    ? `${ingredientName} সম্পর্কে সুস্থভাবে ব্যবহার করতে পরিমিত পরিমাণে গ্রহণ করা হলে সাধারণত নিরাপদ হিসেবে বিবেচিত হয়।`
    : `${ingredientName} is generally considered safe when consumed within permitted limits in food products.`;
}