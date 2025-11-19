import { NextRequest, NextResponse } from 'next/server';
import { AuthProfileStorage } from '@/lib/storage';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();
    const existing = await AuthProfileStorage.get(id);
    if (!existing) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    const updated = { ...existing, ...updates };
    await AuthProfileStorage.save(updated);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await AuthProfileStorage.delete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
