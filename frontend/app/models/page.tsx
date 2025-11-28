'use client';

import { useEffect, useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { APIClient } from '@/lib/api-client';
import type { LLMProvider, AppSettings } from '@/types/crawl4ai';

export default function ModelsPage() {
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [providersData, settingsData] = await Promise.all([
        APIClient.getLLMProviders(),
        APIClient.getSettings(),
      ]);
      setProviders(providersData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProvider = async (provider: LLMProvider) => {
    try {
      await APIClient.updateLLMProvider(provider.id, {
        enabled: !provider.enabled,
      });
      setProviders(
        providers.map((p) =>
          p.id === provider.id ? { ...p, enabled: !p.enabled } : p
        )
      );
    } catch (error) {
      console.error('Failed to update provider:', error);
    }
  };

  const handleSetActive = async (providerId: string) => {
    if (!settings) return;
    try {
      const provider = providers.find((p) => p.id === providerId);
      if (!provider) return;

      await APIClient.updateSettings({
        active_llm_provider: provider.provider,
      });
      setSettings({
        ...settings,
        active_llm_provider: provider.provider,
      });
    } catch (error) {
      console.error('Failed to set active provider:', error);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="text-center py-12">Loading...</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Models & LiteLLM</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage LLM providers and access the LiteLLM Admin UI
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">LLM Providers</h3>
          <div className="space-y-4">
            {providers.map((provider) => {
              const isActive =
                settings?.active_llm_provider?.includes(provider.provider) ||
                false;

              return (
                <div
                  key={provider.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-gray-900">{provider.name}</h4>
                      {isActive && (
                        <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">
                          Active
                        </span>
                      )}
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          provider.enabled
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {provider.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{provider.provider}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Env: {provider.api_key_env}
                    </p>
                    {provider.api_base && (
                      <p className="text-xs text-gray-500">
                        Base URL: {provider.api_base}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleProvider(provider)}
                      className={`px-3 py-1 text-sm rounded ${
                        provider.enabled
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {provider.enabled ? 'Disable' : 'Enable'}
                    </button>
                    {provider.enabled && !isActive && (
                      <button
                        onClick={() => handleSetActive(provider.id)}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Set Active
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">LiteLLM Admin UI</h3>
          <p className="text-sm text-gray-700 mb-4">
            Access the LiteLLM Admin UI to manage API keys, track spending, and
            configure advanced settings.
          </p>
          <a
            href={settings ? `${settings.litellm_base_url}/ui` : 'http://localhost:4000/ui'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
          >
            Open LiteLLM Admin UI
          </a>
        </div>

        <div className="bg-yellow-50 p-4 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>Configuration:</strong> Provider API keys are configured via environment
            variables in the <code className="bg-yellow-100 px-1 rounded">.env</code> file.
            After changing provider settings, restart the services for changes to take effect.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
