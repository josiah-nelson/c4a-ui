'use client';

import { useEffect, useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { APIClient } from '@/lib/api-client';
import { formatBytes, formatDuration } from '@/lib/utils';
import type { MonitoringHealth } from '@/types/crawl4ai';

export default function MonitoringPage() {
  const [health, setHealth] = useState<MonitoringHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHealth();
    const interval = setInterval(loadHealth, 2000); // Update every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const loadHealth = async () => {
    try {
      const data = await APIClient.getHealth();
      setHealth(data);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = async () => {
    try {
      await APIClient.forceCleanup();
      await loadHealth();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="text-center py-12">Loading monitoring data...</div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">Error: {error}</div>
          <p className="mt-2 text-xs text-red-600">
            Make sure Crawl4AI v0.7.7+ is running and monitoring is enabled.
          </p>
        </div>
      </PageLayout>
    );
  }

  if (!health) return null;

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Monitoring</h1>
            <p className="mt-2 text-sm text-gray-700">
              Real-time Crawl4AI system metrics and browser pool status
            </p>
          </div>
          <button
            onClick={handleCleanup}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
          >
            Force Cleanup
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">CPU Usage</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {health.container.cpu_percent.toFixed(1)}%
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Memory Usage</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {health.container.memory_percent.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {formatBytes(health.container.memory_mb * 1024 * 1024)}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Uptime</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {formatDuration(health.container.uptime_seconds * 1000)}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Browser Pool</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Permanent Browsers</p>
              <p className="text-2xl font-bold text-gray-900">
                {health.pool.permanent.active}
              </p>
              <p className="text-xs text-gray-500">Always active</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Hot Pool</p>
              <p className="text-2xl font-bold text-gray-900">
                {health.pool.hot.count}
              </p>
              <p className="text-xs text-gray-500">Frequently used</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cold Pool</p>
              <p className="text-2xl font-bold text-gray-900">
                {health.pool.cold.count}
              </p>
              <p className="text-xs text-gray-500">On-demand</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Request Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">
                {health.stats.total_requests}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Success Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {health.stats.success_rate_percent.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Latency</p>
              <p className="text-2xl font-bold text-gray-900">
                {health.stats.avg_latency_ms.toFixed(0)}ms
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> For the full monitoring dashboard with charts and logs,
            visit{' '}
            <a
              href="http://localhost:11235/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              http://localhost:11235/dashboard
            </a>
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
