import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    gemini: Boolean(process.env.GEMINI_API_KEY),
    grok: Boolean(process.env.GROK_API_KEY || process.env.XAI_API_KEY),
    openai: Boolean(process.env.OPENAI_API_KEY),
  });
}