import { NextResponse } from 'next/server';
import { LLMProviderStorage } from '@/lib/storage';

export async function GET() {
  try {
    const providers = await LLMProviderStorage.getAll();
    return NextResponse.json(providers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
