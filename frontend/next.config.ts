import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      // Proxy LiteLLM Admin UI
      {
        source: '/litellm/:path*',
        destination: (process.env.LITELLM_BASE_URL || 'http://litellm:4000') + '/:path*',
      },
    ];
  },
};

export default nextConfig;
