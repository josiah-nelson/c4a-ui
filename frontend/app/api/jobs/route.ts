import { NextRequest, NextResponse } from 'next/server';
import { JobStorage, SettingsStorage } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import type { Job } from '@/types/crawl4ai';

export async function GET() {
  try {
    const jobs = await JobStorage.getAll();
    return NextResponse.json(jobs);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const config = await request.json();

    // Create job record
    const job: Job = {
      id: generateId(),
      status: 'queued',
      config,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await JobStorage.save(job);

    // Process job asynchronously in background (don't await)
    processJobAsync(job.id).catch((error) => {
      console.error(`Background job ${job.id} failed:`, error);
    });

    return NextResponse.json({ job_id: job.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Job submission error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Background job processor (runs without blocking the response)
async function processJobAsync(jobId: string) {
  try {
    const job = await JobStorage.get(jobId);
    if (!job) {
      console.error(`Job ${jobId} not found`);
      return;
    }

    const settings = await SettingsStorage.get();

    // Update status to running
    job.status = 'running';
    job.updated_at = new Date().toISOString();
    await JobStorage.save(job);

    // Execute crawl
    const crawl4aiResponse = await fetch(`${settings.crawl4ai_base_url}/crawl`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job.config),
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
  } catch (error) {
    const job = await JobStorage.get(jobId);
    if (job) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.updated_at = new Date().toISOString();
      await JobStorage.save(job);
    }
  } finally {
    const job = await JobStorage.get(jobId);
    if (job) {
      job.updated_at = new Date().toISOString();
      await JobStorage.save(job);
    }
  }
}
