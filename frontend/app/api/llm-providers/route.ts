import { NextResponse } from 'next/server';
import { LLMProviderStorage } from '@/lib/storage';

export async function GET() {
  try {
    const providers = await LLMProviderStorage.getAll();
    return NextResponse.json(providers);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
