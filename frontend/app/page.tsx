'use client';

import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { APIClient } from '@/lib/api-client';

export default function HomePage() {
  const [urls, setUrls] = useState('');
  const [headless, setHeadless] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const urlList = urls.split('\n').filter((u) => u.trim());
      const crawlResult = await APIClient.submitCrawl({
        urls: urlList,
        browser_config: {
          type: 'BrowserConfig',
          params: { headless },
        },
        crawler_config: {
          type: 'CrawlerRunConfig',
          params: { cache_mode: 'bypass' },
        },
      });
      setResult(crawlResult);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Crawl</h1>
          <p className="mt-2 text-sm text-gray-700">
            Submit URLs to crawl using Crawl4AI v0.7.x
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="urls" className="block text-sm font-medium text-gray-700">
              URLs (one per line)
            </label>
            <textarea
              id="urls"
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              placeholder="https://example.com"
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center">
            <input
              id="headless"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              checked={headless}
              onChange={(e) => setHeadless(e.target.checked)}
            />
            <label htmlFor="headless" className="ml-2 block text-sm text-gray-900">
              Headless mode
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Crawling...' : 'Start Crawl'}
            </button>
          </div>
        </form>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="rounded-md bg-green-50 p-4">
            <h3 className="text-sm font-medium text-green-800 mb-2">Crawl Completed</h3>
            <pre className="text-xs text-green-700 overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
