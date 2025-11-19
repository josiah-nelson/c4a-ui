import { NextRequest, NextResponse } from 'next/server';
import { LLMProviderStorage } from '@/lib/storage';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();
    const providers = await LLMProviderStorage.getAll();
    const existing = providers.find((p) => p.id === id);

    if (!existing) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    const updated = { ...existing, ...updates };
    await LLMProviderStorage.save(updated);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
