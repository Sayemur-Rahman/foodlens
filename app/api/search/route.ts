import { NextRequest, NextResponse } from 'next/server';
import { searchIngredients, getAllIngredients } from '@/data/ingredients';


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';

  if (!q.trim()) {
    return NextResponse.json({ results: getAllIngredients() });
  }

  const results = searchIngredients(q);
  return NextResponse.json({ results, query: q });
}
