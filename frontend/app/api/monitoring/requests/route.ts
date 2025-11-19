import { NextResponse } from 'next/server';
import { SettingsStorage } from '@/lib/storage';

export async function GET() {
  try {
    const settings = await SettingsStorage.get();
    const response = await fetch(`${settings.crawl4ai_base_url}/monitor/requests`);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch request data' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
