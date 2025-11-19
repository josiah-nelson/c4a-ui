import type {
  CrawlConfig,
  CrawlResult,
  Job,
  MonitoringHealth,
  MonitoringBrowser,
  MonitoringRequest,
  AppSettings,
  AuthProfile,
  LLMProvider,
} from '@/types/crawl4ai';

const API_BASE = '/api';

export class APIClient {
  // Crawl operations
  static async submitCrawl(config: CrawlConfig): Promise<CrawlResult[]> {
    const response = await fetch(`${API_BASE}/crawl`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Crawl failed');
    }
    return response.json();
  }

  static async submitJob(config: CrawlConfig): Promise<{ job_id: string }> {
    const response = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Job submission failed');
    }
    return response.json();
  }

  // Job operations
  static async getJobs(): Promise<Job[]> {
    const response = await fetch(`${API_BASE}/jobs`);
    if (!response.ok) throw new Error('Failed to fetch jobs');
    return response.json();
  }

  static async getJob(id: string): Promise<Job> {
    const response = await fetch(`${API_BASE}/jobs/${id}`);
    if (!response.ok) throw new Error('Failed to fetch job');
    return response.json();
  }

  static async deleteJob(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/jobs/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete job');
  }

  // Monitoring operations
  static async getHealth(): Promise<MonitoringHealth> {
    const response = await fetch(`${API_BASE}/monitoring/health`);
    if (!response.ok) throw new Error('Failed to fetch health');
    return response.json();
  }

  static async getBrowsers(): Promise<{
    permanent: MonitoringBrowser[];
    hot: MonitoringBrowser[];
    cold: MonitoringBrowser[];
    summary: any;
  }> {
    const response = await fetch(`${API_BASE}/monitoring/browsers`);
    if (!response.ok) throw new Error('Failed to fetch browsers');
    return response.json();
  }

  static async getRequests(): Promise<{
    active: MonitoringRequest[];
    completed: MonitoringRequest[];
  }> {
    const response = await fetch(`${API_BASE}/monitoring/requests`);
    if (!response.ok) throw new Error('Failed to fetch requests');
    return response.json();
  }

  static async forceCleanup(): Promise<any> {
    const response = await fetch(`${API_BASE}/monitoring/cleanup`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to trigger cleanup');
    return response.json();
  }

  // Settings operations
  static async getSettings(): Promise<AppSettings> {
    const response = await fetch(`${API_BASE}/settings`);
    if (!response.ok) throw new Error('Failed to fetch settings');
    return response.json();
  }

  static async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const response = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!response.ok) throw new Error('Failed to update settings');
    return response.json();
  }

  // Auth profiles
  static async getAuthProfiles(): Promise<AuthProfile[]> {
    const response = await fetch(`${API_BASE}/auth-profiles`);
    if (!response.ok) throw new Error('Failed to fetch auth profiles');
    return response.json();
  }

  static async createAuthProfile(profile: Omit<AuthProfile, 'id'>): Promise<AuthProfile> {
    const response = await fetch(`${API_BASE}/auth-profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    if (!response.ok) throw new Error('Failed to create auth profile');
    return response.json();
  }

  static async updateAuthProfile(id: string, profile: Partial<AuthProfile>): Promise<AuthProfile> {
    const response = await fetch(`${API_BASE}/auth-profiles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    if (!response.ok) throw new Error('Failed to update auth profile');
    return response.json();
  }

  static async deleteAuthProfile(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/auth-profiles/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete auth profile');
  }

  // LLM providers
  static async getLLMProviders(): Promise<LLMProvider[]> {
    const response = await fetch(`${API_BASE}/llm-providers`);
    if (!response.ok) throw new Error('Failed to fetch LLM providers');
    return response.json();
  }

  static async updateLLMProvider(id: string, provider: Partial<LLMProvider>): Promise<LLMProvider> {
    const response = await fetch(`${API_BASE}/llm-providers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(provider),
    });
    if (!response.ok) throw new Error('Failed to update LLM provider');
    return response.json();
  }
}
