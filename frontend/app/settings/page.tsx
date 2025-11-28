'use client';

import { useEffect, useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { APIClient } from '@/lib/api-client';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { AppSettings, AuthProfile } from '@/types/crawl4ai';

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [authProfiles, setAuthProfiles] = useState<AuthProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; profileId: string | null }>({
    isOpen: false,
    profileId: null,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [settingsData, profilesData] = await Promise.all([
        APIClient.getSettings(),
        APIClient.getAuthProfiles(),
      ]);
      setSettings(settingsData);
      setAuthProfiles(profilesData);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    setMessage('');
    try {
      await APIClient.updateSettings(settings);
      setMessage('Settings saved successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteProfile = (id: string) => {
    setDeleteDialog({ isOpen: true, profileId: id });
  };

  const handleDeleteProfile = async () => {
    if (!deleteDialog.profileId) return;
    try {
      await APIClient.deleteAuthProfile(deleteDialog.profileId);
      setAuthProfiles((current) => current.filter((p) => p.id !== deleteDialog.profileId));
    } catch (error) {
      console.error('Failed to delete profile:', error);
    }
  };

  if (loading || !settings) {
    return (
      <PageLayout>
        <div className="text-center py-12">Loading settings...</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-sm text-gray-700">
            Configure app settings, connections, and authentication profiles
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Connections</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Crawl4AI Base URL
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                value={settings.crawl4ai_base_url}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev!, crawl4ai_base_url: e.target.value }))
                }
              />
              <p className="mt-1 text-xs text-gray-500">
                Default: http://crawl4ai:11235
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                LiteLLM Base URL
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                value={settings.litellm_base_url}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev!, litellm_base_url: e.target.value }))
                }
              />
              <p className="mt-1 text-xs text-gray-500">Default: http://litellm:4000</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Paths & Storage</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Output Base Path
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                value={settings.output_base_path}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev!, output_base_path: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                File Storage Path
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                value={settings.file_storage_path}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev!, file_storage_path: e.target.value }))
                }
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Defaults</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Default Crawl Depth
              </label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                value={settings.default_crawl_depth || 2}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev!,
                    default_crawl_depth: parseInt(e.target.value),
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Default Concurrency
              </label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                value={settings.default_concurrency || 5}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev!,
                    default_concurrency: parseInt(e.target.value),
                  }))
                }
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                checked={settings.default_pdf_downloads || false}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev!,
                    default_pdf_downloads: e.target.checked,
                  }))
                }
              />
              <label className="ml-2 block text-sm text-gray-900">
                Download PDFs by default
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                checked={settings.default_other_downloads || false}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev!,
                    default_other_downloads: e.target.checked,
                  }))
                }
              />
              <label className="ml-2 block text-sm text-gray-900">
                Download other files by default
              </label>
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {message && (
            <span
              className={`ml-4 text-sm ${
                message.startsWith('Error') ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {message}
            </span>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Authentication Profiles</h3>
          {authProfiles.length === 0 ? (
            <p className="text-sm text-gray-500">No auth profiles configured</p>
          ) : (
            <div className="space-y-3">
              {authProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between p-3 border rounded"
                >
                  <div>
                    <p className="font-medium text-gray-900">{profile.name}</p>
                    <p className="text-sm text-gray-500">{profile.type}</p>
                  </div>
                  <button
                    onClick={() => confirmDeleteProfile(profile.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, profileId: null })}
        onConfirm={handleDeleteProfile}
        title="Delete Auth Profile"
        message="Are you sure you want to delete this authentication profile? This action cannot be undone."
        confirmText="Delete"
        isDangerous
      />
    </PageLayout>
  );
}
