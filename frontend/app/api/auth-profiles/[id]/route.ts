import { NextRequest, NextResponse } from 'next/server';
import { AuthProfileStorage } from '@/lib/storage';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const updates = await request.json();
    const existing = await AuthProfileStorage.get(id);
    if (!existing) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    const updated = { ...existing, ...updates };
    await AuthProfileStorage.save(updated);
    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await AuthProfileStorage.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
