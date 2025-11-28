# Crawl4AI Web UI

A **fully-featured, UI/UX-first web frontend** for **Crawl4AI v0.7.x** with integrated **LiteLLM proxy** and multi-provider LLM support.

![Architecture](https://img.shields.io/badge/Stack-Next.js%20%7C%20React%20%7C%20TypeScript%20%7C%20Tailwind-blue)
![Docker](https://img.shields.io/badge/Deploy-Docker%20Compose-2496ED?logo=docker)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

### Crawl4AI Integration
- **v0.7.7 Feature Support**: Monitoring, browser pool management, hooks, adaptive crawling
- **Synchronous & Async Crawls**: Direct crawls or job queue with webhooks
- **Advanced Configuration**: Browser settings, viewport, proxies, headless/stealth mode
- **File Downloads**: PDF generation, file downloads with configurable filters
- **LLM Extraction**: General and table-specific LLM extraction strategies
- **Hooks Editor**: Configure Docker hooks for authentication and custom behavior

### LiteLLM Integration
- **Embedded Admin UI**: Full LiteLLM control panel at `/models`
- **Multi-Provider Support**:
  - OpenAI (GPT-4o, GPT-4-turbo, GPT-4o-mini)
  - Anthropic Claude (3.5 Sonnet, 3 Opus)
  - z.AI GLM4.6 (Coder Pro)
  - Google Gemini (2.0 Flash, 1.5 Pro)
  - LM Studio (local models)
  - GitHub Copilot (via OAuth)
- **Provider Switching**: Change active provider without restarting
- **Cost Tracking**: Built-in spend monitoring via LiteLLM UI

### Monitoring & Observability
- **Real-Time Metrics**: CPU, memory, uptime, request stats
- **Browser Pool Insights**: Permanent/hot/cold browser status
- **Request Tracking**: Active and completed requests with latency
- **Manual Controls**: Force cleanup, browser management

### Data & Persistence
- **File-Based Storage**: Job history, settings, auth profiles
- **No Database Required**: Simple JSON file persistence
- **Webhook Support**: Async job completion notifications

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Frontend (Next.js)             │
│  ┌───────────┐ ┌──────────┐ ┌────────────────┐ │
│  │  Crawl UI │ │ Jobs UI  │ │ Monitoring UI  │ │
│  │  Wizard   │ │ History  │ │ Dashboard      │ │
│  └───────────┘ └──────────┘ └────────────────┘ │
│  ┌───────────────────────────────────────────┐  │
│  │    Backend-for-Frontend (BFF) Layer      │  │
│  │  - API Routes                              │  │
│  │  - File Storage                            │  │
│  │  - Webhook Handler                         │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
         │                            │
         ▼                            ▼
┌──────────────────┐         ┌─────────────────────┐
│   Crawl4AI       │         │   LiteLLM Proxy     │
│   v0.7.7         │         │   + Admin UI        │
│                  │         │                     │
│  - REST API      │         │  - Model Gateway    │
│  - Monitoring    │         │  - Provider Mgmt    │
│  - Browser Pool  │         │  - Cost Tracking    │
└──────────────────┘         └─────────────────────┘
```

## Quick Start

### Prerequisites

- Docker & Docker Compose
- At least one LLM provider API key (OpenAI, Anthropic, etc.)

### Installation

1. **Clone & Configure**

```bash
git clone <your-repo-url>
cd c4a-ui

# Copy environment template
cp .env.example .env

# Edit .env and add your API keys
nano .env
```

2. **Set Required Environment Variables**

At minimum, configure these in `.env`:

```bash
# LiteLLM Admin credentials
LITELLM_MASTER_KEY=sk-your-secure-random-string
UI_USERNAME=admin
UI_PASSWORD=your-secure-password

# At least one LLM provider
OPENAI_API_KEY=sk-your-openai-key
# OR
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
```

3. **Start Services**

```bash
docker compose up -d
```

4. **Access Applications**

- **Web UI**: http://localhost:3000
- **LiteLLM Admin**: http://localhost:4000/ui
- **Crawl4AI Dashboard**: http://localhost:11235/dashboard

### First Crawl

1. Navigate to http://localhost:3000
2. Enter one or more URLs (one per line)
3. Configure browser and crawl settings
4. Click "Start Crawl"
5. View results in real-time or check the **Jobs** page for history

## Configuration

### Environment Variables

See [`.env.example`](./.env.example) for complete documentation. Key variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `LITELLM_MASTER_KEY` | LiteLLM proxy master key | Yes |
| `UI_USERNAME` | LiteLLM admin username | Yes |
| `UI_PASSWORD` | LiteLLM admin password | Yes |
| `OPENAI_API_KEY` | OpenAI API key | If using OpenAI |
| `ANTHROPIC_API_KEY` | Anthropic API key | If using Claude |
| `ZAI_API_KEY` | z.AI API key | If using z.AI |
| `GEMINI_API_KEY` | Google Gemini API key | If using Gemini |

### LLM Provider Setup

The application supports multiple providers simultaneously. Configure them in `.env` and switch between them via the **Models & LiteLLM** page.

#### Example: Multiple Providers

```bash
# .env
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
ZAI_API_KEY=your-zai-key
```

The active provider can be changed in **Settings** without restarting services.

### Advanced Configuration

#### Custom Crawl4AI Settings

Mount a custom config if needed:

```yaml
# docker-compose.yml
services:
  crawl4ai:
    volumes:
      - ./custom-config.yml:/app/config.yml
```

#### LM Studio Integration

For local LLM inference:

```bash
# .env
LMSTUDIO_BASE_URL=http://host.docker.internal:1234/v1
```

Start LM Studio on your host machine, then select the `lmstudio-local` model in the UI.

## Usage Guide

### 1. Running a Crawl

**Simple Crawl**:
1. Go to **Crawl** page
2. Enter URL(s)
3. Enable/disable headless mode
4. Click "Start Crawl"

**Advanced Crawl**:
- Configure browser settings (viewport, stealth mode, proxies)
- Set up authentication hooks for login-protected sites
- Enable LLM extraction with schema
- Configure virtual scrolling for infinite scroll pages
- Enable file downloads (PDFs, other files)

### 2. Managing Jobs

**Jobs Page** shows:
- All submitted crawl jobs
- Job status (queued, running, completed, failed)
- Detailed results and error messages
- Delete completed jobs

### 3. Monitoring

**Monitoring Page** displays:
- System health (CPU, memory, uptime)
- Browser pool status (permanent/hot/cold)
- Request statistics (total, success rate, latency)
- Manual cleanup control

For detailed monitoring, use the built-in Crawl4AI dashboard at http://localhost:11235/dashboard

### 4. LLM Provider Management

**Models & LiteLLM Page**:
- View all configured providers
- Enable/disable providers
- Set the active provider
- Access LiteLLM Admin UI for advanced settings

### 5. Settings

**Settings Page**:
- Update Crawl4AI and LiteLLM connection URLs
- Configure output and storage paths
- Set default crawl parameters
- Manage authentication profiles

## Development

### Local Development

```bash
cd frontend
npm install
npm run dev
```

The dev server runs at http://localhost:3000 and proxies API calls to dockerized backends.

### Project Structure

```
c4a-ui/
├── frontend/                 # Next.js application
│   ├── app/                  # App router pages
│   │   ├── api/              # API routes (BFF layer)
│   │   ├── crawl/            # Crawl wizard
│   │   ├── jobs/             # Job history
│   │   ├── monitoring/       # Monitoring dashboard
│   │   ├── models/           # LiteLLM integration
│   │   └── settings/         # Settings page
│   ├── components/           # React components
│   │   ├── layout/           # Layout components
│   │   ├── ui/               # UI components
│   │   └── forms/            # Form components
│   ├── lib/                  # Utilities
│   │   ├── api-client.ts     # API client
│   │   ├── storage.ts        # File-based persistence
│   │   └── utils.ts          # Helper functions
│   └── types/                # TypeScript definitions
├── docker-compose.yml        # Multi-service orchestration
├── proxy_config.yaml         # LiteLLM configuration
└── .env.example              # Environment template
```

## Troubleshooting

### Services Not Starting

```bash
# Check service status
docker compose ps

# View logs
docker compose logs frontend
docker compose logs crawl4ai
docker compose logs litellm

# Restart services
docker compose restart
```

### Connection Errors

Ensure all services are healthy:

```bash
curl http://localhost:11235/health  # Crawl4AI
curl http://localhost:4000/health    # LiteLLM
curl http://localhost:3000           # Frontend
```

### LiteLLM Provider Issues

1. Verify API keys in `.env`
2. Check provider status in LiteLLM Admin UI
3. Review `proxy_config.yaml` for correct provider configuration

### Crawl4AI Monitoring Not Working

Crawl4AI v0.7.7+ is required for monitoring features. Update to the latest image:

```bash
docker compose pull crawl4ai
docker compose up -d crawl4ai
```

## Security Considerations

This setup assumes a **trusted, single-user environment** with **no app-level authentication**. For production/multi-user deployments:

1. Add authentication (e.g., NextAuth.js)
2. Use HTTPS with valid certificates
3. Restrict network access (firewall rules, VPN)
4. Rotate API keys regularly
5. Enable LiteLLM database for audit logs
6. Use strong `LITELLM_MASTER_KEY` and `UI_PASSWORD`

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support & Resources

- **Crawl4AI Docs**: https://docs.crawl4ai.com
- **LiteLLM Docs**: https://docs.litellm.ai
- **Issues**: https://github.com/your-repo/issues

## Acknowledgments

Built with:
- [Crawl4AI](https://github.com/unclecode/crawl4ai) - Web crawling library
- [LiteLLM](https://github.com/BerriAI/litellm) - LLM proxy and gateway
- [Next.js](https://nextjs.org) - React framework
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS

---

**Happy Crawling! 🕷️**