import { NextRequest, NextResponse } from 'next/server';
import { SettingsStorage } from '@/lib/storage';

export async function GET() {
  try {
    const settings = await SettingsStorage.get();
    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updates = await request.json();
    const current = await SettingsStorage.get();
    const updated = { ...current, ...updates };
    await SettingsStorage.save(updated);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
