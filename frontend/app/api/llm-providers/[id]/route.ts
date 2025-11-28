import { NextRequest, NextResponse } from 'next/server';
import { LLMProviderStorage } from '@/lib/storage';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const updates = await request.json();
    const providers = await LLMProviderStorage.getAll();
    const existing = providers.find((p) => p.id === id);

    if (!existing) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    const updated = { ...existing, ...updates };
    await LLMProviderStorage.save(updated);
    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
