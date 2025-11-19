import fs from 'fs/promises';
import path from 'path';
import type { Job, AppSettings, AuthProfile, LLMProvider } from '@/types/crawl4ai';

const DATA_DIR = process.env.FILE_STORAGE_PATH || path.join(process.cwd(), 'data');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Jobs storage
export class JobStorage {
  private static filePath = path.join(DATA_DIR, 'jobs.json');

  static async getAll(): Promise<Job[]> {
    await ensureDataDir();
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static async get(id: string): Promise<Job | null> {
    const jobs = await this.getAll();
    return jobs.find((j) => j.id === id) || null;
  }

  static async save(job: Job): Promise<Job> {
    const jobs = await this.getAll();
    const index = jobs.findIndex((j) => j.id === job.id);
    if (index >= 0) {
      jobs[index] = job;
    } else {
      jobs.push(job);
    }
    await fs.writeFile(this.filePath, JSON.stringify(jobs, null, 2));
    return job;
  }

  static async delete(id: string): Promise<void> {
    const jobs = await this.getAll();
    const filtered = jobs.filter((j) => j.id !== id);
    await fs.writeFile(this.filePath, JSON.stringify(filtered, null, 2));
  }
}

// Settings storage
export class SettingsStorage {
  private static filePath = path.join(DATA_DIR, 'settings.json');

  static async get(): Promise<AppSettings> {
    await ensureDataDir();
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      // Default settings
      return {
        crawl4ai_base_url: process.env.CRAWL4AI_BASE_URL || 'http://crawl4ai:11235',
        litellm_base_url: process.env.LITELLM_BASE_URL || 'http://litellm:4000',
        output_base_path: process.env.OUTPUT_BASE_PATH || '/app/data/output',
        file_storage_path: process.env.FILE_STORAGE_PATH || '/app/data',
        default_crawl_depth: 2,
        default_concurrency: 5,
        default_pdf_downloads: false,
        default_other_downloads: false,
      };
    }
  }

  static async save(settings: AppSettings): Promise<AppSettings> {
    await ensureDataDir();
    await fs.writeFile(this.filePath, JSON.stringify(settings, null, 2));
    return settings;
  }
}

// Auth profiles storage
export class AuthProfileStorage {
  private static filePath = path.join(DATA_DIR, 'auth-profiles.json');

  static async getAll(): Promise<AuthProfile[]> {
    await ensureDataDir();
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static async get(id: string): Promise<AuthProfile | null> {
    const profiles = await this.getAll();
    return profiles.find((p) => p.id === id) || null;
  }

  static async save(profile: AuthProfile): Promise<AuthProfile> {
    const profiles = await this.getAll();
    const index = profiles.findIndex((p) => p.id === profile.id);
    if (index >= 0) {
      profiles[index] = profile;
    } else {
      profiles.push(profile);
    }
    await fs.writeFile(this.filePath, JSON.stringify(profiles, null, 2));
    return profile;
  }

  static async delete(id: string): Promise<void> {
    const profiles = await this.getAll();
    const filtered = profiles.filter((p) => p.id !== id);
    await fs.writeFile(this.filePath, JSON.stringify(filtered, null, 2));
  }
}

// LLM providers storage
export class LLMProviderStorage {
  private static filePath = path.join(DATA_DIR, 'llm-providers.json');

  static async getAll(): Promise<LLMProvider[]> {
    await ensureDataDir();
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      // Default providers
      return [
        {
          id: 'openai',
          name: 'OpenAI',
          provider: 'openai/gpt-4o-mini',
          api_key_env: 'OPENAI_API_KEY',
          enabled: true,
          models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
        },
        {
          id: 'anthropic',
          name: 'Anthropic Claude',
          provider: 'anthropic/claude-3-5-sonnet-20241022',
          api_key_env: 'ANTHROPIC_API_KEY',
          enabled: false,
          models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229'],
        },
        {
          id: 'zai',
          name: 'z.AI GLM4.6',
          provider: 'openai/glm-4-air', // Via OpenAI-compatible endpoint
          api_key_env: 'ZAI_API_KEY',
          api_base: process.env.ZAI_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4',
          enabled: false,
          models: ['glm-4-air', 'glm-4-flash'],
        },
        {
          id: 'lmstudio',
          name: 'LM Studio',
          provider: 'openai/local-model',
          api_key_env: 'LMSTUDIO_API_KEY',
          api_base: process.env.LMSTUDIO_BASE_URL || 'http://localhost:1234/v1',
          enabled: false,
        },
        {
          id: 'gemini',
          name: 'Google Gemini',
          provider: 'gemini/gemini-2.0-flash-exp',
          api_key_env: 'GEMINI_API_KEY',
          enabled: false,
          models: ['gemini-2.0-flash-exp', 'gemini-1.5-pro'],
        },
      ];
    }
  }

  static async save(provider: LLMProvider): Promise<LLMProvider> {
    const providers = await this.getAll();
    const index = providers.findIndex((p) => p.id === provider.id);
    if (index >= 0) {
      providers[index] = provider;
    } else {
      providers.push(provider);
    }
    await fs.writeFile(this.filePath, JSON.stringify(providers, null, 2));
    return provider;
  }
}
