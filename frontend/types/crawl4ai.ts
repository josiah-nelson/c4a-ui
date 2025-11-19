// Crawl4AI type definitions based on v0.7.x documentation

export interface CrawlConfig {
  urls: string[];
  browser_config?: BrowserConfig;
  crawler_config?: CrawlerRunConfig;
  hooks?: HooksConfig;
}

export interface BrowserConfig {
  type?: 'BrowserConfig';
  params?: {
    headless?: boolean;
    browser_type?: 'chromium' | 'firefox' | 'webkit' | 'undetected';
    viewport?: { width: number; height: number };
    proxy_config?: {
      server: string;
      username?: string;
      password?: string;
    };
    user_agent?: string;
    extra_args?: string[];
  };
}

export interface CrawlerRunConfig {
  type?: 'CrawlerRunConfig';
  params?: {
    cache_mode?: 'enabled' | 'disabled' | 'bypass' | 'write' | 'read';
    screenshot?: boolean;
    pdf?: boolean;
    extraction_strategy?: ExtractionStrategy;
    markdown_generator?: MarkdownGenerator;
    js_code?: string | string[];
    wait_for?: string;
    page_timeout?: number;
    delay_before_return_html?: number;
    scan_full_page?: boolean;
    remove_overlay_elements?: boolean;
    simulate_user?: boolean;
    override_navigator?: boolean;
    magic?: boolean;
    virtual_scroll_config?: VirtualScrollConfig;
    deep_crawl_strategy?: DeepCrawlStrategy;
    exclude_external_links?: boolean;
    preserve_https_for_internal_links?: boolean;
  };
}

export interface VirtualScrollConfig {
  container_selector?: string;
  scroll_count?: number;
  scroll_by?: 'container_height' | 'page_height' | number;
  wait_after_scroll?: number;
}

export interface DeepCrawlStrategy {
  type?: 'BFSDeepCrawlStrategy' | 'DFSDeepCrawlStrategy';
  params?: {
    max_depth?: number;
    max_pages?: number;
    filter_chain?: any;
  };
}

export interface ExtractionStrategy {
  type: 'LLMExtractionStrategy' | 'JsonCssExtractionStrategy' | 'LLMTableExtraction';
  params?: any;
}

export interface MarkdownGenerator {
  type?: 'DefaultMarkdownGenerator';
  params?: {
    content_filter?: any;
  };
}

export interface HooksConfig {
  code?: Record<string, string>;
  timeout?: number;
}

export interface CrawlResult {
  success: boolean;
  url: string;
  html?: string;
  markdown?: string;
  extracted_content?: any;
  metadata?: Record<string, any>;
  screenshot?: string;
  pdf?: string;
  links?: {
    internal?: Link[];
    external?: Link[];
  };
  media?: Record<string, any>;
  tables?: Table[];
  error_message?: string;
  status_code?: number;
  downloaded_files?: string[];
}

export interface Link {
  href: string;
  text?: string;
  intrinsic_score?: number;
  contextual_score?: number;
  total_score?: number;
}

export interface Table {
  data: any[][];
  headers?: string[];
  source_xpath?: string;
}

export interface JobConfig extends CrawlConfig {
  webhook_url?: string;
  webhook_headers?: Record<string, string>;
}

export interface Job {
  id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  config: JobConfig;
  result?: CrawlResult[];
  error?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface MonitoringHealth {
  container: {
    cpu_percent: number;
    memory_percent: number;
    memory_mb: number;
    uptime_seconds: number;
  };
  pool: {
    permanent: {
      active: number;
    };
    hot: {
      count: number;
    };
    cold: {
      count: number;
    };
  };
  stats: {
    total_requests: number;
    success_rate_percent: number;
    avg_latency_ms: number;
  };
}

export interface MonitoringBrowser {
  browser_id: string;
  pool_type: 'permanent' | 'hot' | 'cold';
  request_count: number;
  memory_mb: number;
  created_at: string;
  last_used_at: string;
}

export interface MonitoringRequest {
  endpoint: string;
  method: string;
  success: boolean;
  latency_ms: number;
  timestamp: string;
  error?: string;
}

export interface AuthProfile {
  id: string;
  name: string;
  description?: string;
  type: 'form' | 'headers' | 'cookies';
  config: {
    username?: string;
    password?: string;
    headers?: Record<string, string>;
    cookies?: string;
    login_url?: string;
    hooks?: Record<string, string>;
  };
}

export interface LLMProvider {
  id: string;
  name: string;
  provider: string; // e.g., "openai/gpt-4", "anthropic/claude-3-sonnet"
  api_key_env: string;
  api_base?: string;
  enabled: boolean;
  models?: string[];
}

export interface AppSettings {
  crawl4ai_base_url: string;
  litellm_base_url: string;
  output_base_path: string;
  file_storage_path: string;
  active_llm_provider?: string;
  default_crawl_depth?: number;
  default_concurrency?: number;
  default_pdf_downloads?: boolean;
  default_other_downloads?: boolean;
}
