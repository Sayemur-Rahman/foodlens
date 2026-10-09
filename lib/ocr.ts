import { extractIngredientsWithGemini } from './gemini';

export interface OcrResult {
  text: string;
  error?: string;
  provider?: string;
  attempts?: { provider: string; error: string }[];
}

export async function extractTextFromImage(
  base64Data: string,
  mimeType: string
): Promise<OcrResult> {
  const attempts: { provider: string; error: string }[] = [];

  // Try Gemini first (most capable for bilingual text)
  try {
    const result = await extractIngredientsWithGemini(base64Data, mimeType);
    if (result.text && result.text.trim().length > 0) {
      return { text: result.text.trim(), provider: 'gemini', attempts };
    }
    attempts.push({ provider: 'gemini', error: result.error || 'empty response' });
  } catch (err) {
    attempts.push({ provider: 'gemini', error: err instanceof Error ? err.message : String(err) });
  }

  // Try Grok (xAI) as fallback
  try {
    const grokResult = await extractWithGrok(base64Data, mimeType);
    if (grokResult.text && grokResult.text.trim().length > 0) {
      return { text: grokResult.text.trim(), provider: 'grok', attempts };
    }
    attempts.push({ provider: 'grok', error: grokResult.error || 'empty response' });
  } catch (err) {
    attempts.push({ provider: 'grok', error: err instanceof Error ? err.message : String(err) });
  }

  // Try OpenAI as fallback
  try {
    const openaiResult = await extractWithOpenAI(base64Data, mimeType);
    if (openaiResult.text && openaiResult.text.trim().length > 0) {
      return { text: openaiResult.text.trim(), provider: 'openai', attempts };
    }
    attempts.push({ provider: 'openai', error: openaiResult.error || 'empty response' });
  } catch (err) {
    attempts.push({ provider: 'openai', error: err instanceof Error ? err.message : String(err) });
  }

  console.error('OCR all providers failed:', attempts);

  return {
    text: '',
    error: 'All OCR providers failed. Please try with a clearer image or enter text manually.',
    provider: 'none',
    attempts,
  };
}

async function extractWithGrok(
  base64Data: string,
  mimeType: string
): Promise<OcrResult> {
  const apiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
  if (!apiKey) {
    return { text: '', error: 'Grok API key not configured' };
  }

  const model = process.env.GROK_MODEL || 'grok-2-vision-1212';

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all text from this food label image. Include English and Bangla text if present. Focus on "Ingredients"/"উপাদান", nutrition, allergens. Return only the raw extracted text, preserve original spacing and separators.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Data}`,
                },
              },
            ],
          },
        ],
        max_tokens: 3000,
        temperature: 0,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { text: '', error: `Grok API error: ${error}` };
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    return { text };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return { text: '', error: errorMessage };
  }
}

async function extractWithOpenAI(
  base64Data: string,
  mimeType: string
): Promise<OcrResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { text: '', error: 'OpenAI API key not configured' };
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all visible text from this food label. Include both English and Bangla text. Capture ingredients, additives (E-numbers/INS), nutrition facts, allergens. Return only the extracted text with minimal formatting.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Data}`,
                },
              },
            ],
          },
        ],
        max_tokens: 3000,
        temperature: 0,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { text: '', error: `OpenAI API error: ${error}` };
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    return { text };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return { text: '', error: errorMessage };
  }
}
