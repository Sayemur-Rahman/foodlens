import { NextRequest, NextResponse } from 'next/server';
import { getIngredientById } from '@/data/ingredients';


export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const ingredient = getIngredientById(id);

  if (!ingredient) {
    return NextResponse.json({ error: 'Ingredient not found' }, { status: 404 });
  }

  return NextResponse.json({ ingredient });
}
