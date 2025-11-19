import { NextRequest, NextResponse } from 'next/server';
import { JobStorage, SettingsStorage } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import type { Job } from '@/types/crawl4ai';

export async function GET() {
  try {
    const jobs = await JobStorage.getAll();
    return NextResponse.json(jobs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const config = await request.json();
    const settings = await SettingsStorage.get();

    // Create job record
    const job: Job = {
      id: generateId(),
      status: 'queued',
      config,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await JobStorage.save(job);

    // Submit to Crawl4AI job endpoint
    try {
      job.status = 'running';
      job.updated_at = new Date().toISOString();
      await JobStorage.save(job);

      const crawl4aiResponse = await fetch(`${settings.crawl4ai_base_url}/crawl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (crawl4aiResponse.ok) {
        const result = await crawl4aiResponse.json();
        job.status = 'completed';
        job.result = result.results || result;
        job.completed_at = new Date().toISOString();
      } else {
        const error = await crawl4aiResponse.json();
        job.status = 'failed';
        job.error = error.message || 'Crawl failed';
      }
    } catch (error: any) {
      job.status = 'failed';
      job.error = error.message;
    } finally {
      job.updated_at = new Date().toISOString();
      await JobStorage.save(job);
    }

    return NextResponse.json({ job_id: job.id });
  } catch (error: any) {
    console.error('Job submission error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
