import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromImage } from '@/lib/ocr';


export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file uploaded' }, { status: 400 });
    }

    // Validate size (up to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image file too large (max 10MB)' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = buffer.toString('base64');
    const mimeType = file.type || 'image/jpeg';

    const result = await extractTextFromImage(base64Data, mimeType);

    if (result.error && !result.text) {
      return NextResponse.json(
        {
          error: result.error,
          attempts: result.attempts,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      text: result.text || '',
      provider: result.provider,
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('OCR Route error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
