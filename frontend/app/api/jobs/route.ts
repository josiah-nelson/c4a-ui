import { NextRequest, NextResponse } from 'next/server';
import { JobStorage, SettingsStorage } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import type { Job } from '@/types/crawl4ai';

// Track server start time for job recovery
const SERVER_START_TIME = new Date().toISOString();
let recoveryPerformed = false;

// Recover jobs that were interrupted by server restart
async function recoverStaleJobs() {
  if (recoveryPerformed) return;
  recoveryPerformed = true;

  try {
    const jobs = await JobStorage.getAll();
    const staleJobs = jobs.filter((job) =>
      job.status === 'running' || job.status === 'queued'
    );

    for (const job of staleJobs) {
      // Mark running jobs as failed (they were interrupted)
      if (job.status === 'running') {
        job.status = 'failed';
        job.error = 'Job interrupted by server restart';
        job.updated_at = SERVER_START_TIME;
        await JobStorage.save(job);
      }
      // Restart queued jobs that were never processed
      else if (job.status === 'queued') {
        processJobAsync(job.id).catch((error) => {
          console.error(`Recovery: job ${job.id} failed:`, error);
        });
      }
    }

    if (staleJobs.length > 0) {
      console.log(`Recovered ${staleJobs.length} stale job(s) on server restart`);
    }
  } catch (error) {
    console.error('Job recovery failed:', error);
  }
}

export async function GET() {
  try {
    // Perform job recovery on first GET request after server start
    await recoverStaleJobs();

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
