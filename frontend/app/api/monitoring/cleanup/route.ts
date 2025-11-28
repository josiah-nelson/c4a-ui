import { NextResponse } from 'next/server';
import { SettingsStorage } from '@/lib/storage';

export async function POST() {
  try {
    const settings = await SettingsStorage.get();
    const response = await fetch(`${settings.crawl4ai_base_url}/monitor/actions/cleanup`, {
      method: 'POST',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to trigger cleanup' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
