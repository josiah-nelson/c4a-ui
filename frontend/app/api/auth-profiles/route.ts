import { NextRequest, NextResponse } from 'next/server';
import { AuthProfileStorage } from '@/lib/storage';
import { generateId } from '@/lib/utils';

export async function GET() {
  try {
    const profiles = await AuthProfileStorage.getAll();
    return NextResponse.json(profiles);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const profile = {
      id: generateId(),
      ...data,
    };
    await AuthProfileStorage.save(profile);
    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
