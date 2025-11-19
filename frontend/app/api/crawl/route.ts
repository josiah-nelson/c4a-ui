import { NextRequest, NextResponse } from 'next/server';
import { SettingsStorage } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const config = await request.json();
    const settings = await SettingsStorage.get();

    // Forward to Crawl4AI
    const response = await fetch(`${settings.crawl4ai_base_url}/crawl`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || 'Crawl failed' },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Crawl error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
