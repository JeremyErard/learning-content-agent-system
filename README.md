# Learning Content Agent System (LCAS)

An AI-powered instructional design agent system that transforms topic requests into production-ready learning content matching the quality and structure of professionally-designed training materials.

## Vision

A system where:
1. An instructional designer provides a topic and format
2. The agent researches, designs, and produces complete training assets
3. Human review occurs at strategic checkpoints (design doc, storyboard)
4. Final output is deployment-ready with full xAPI/SCORM tracking
5. Learner analytics flow back to improve both content and generation quality
6. Each course generated makes the next one better

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials (DATABASE_URL, ANTHROPIC_API_KEY)

# Set up database
npm run db:migrate
npm run db:seed

# Verify setup
npm run verify

# Start development server
npm run dev
```

## Live Deployment

- **Production URL:** https://lcas-api.onrender.com
- **Health Check:** https://lcas-api.onrender.com/health
- **GitHub:** https://github.com/JeremyErard/learning-content-agent-system

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LEARNING CONTENT AGENT SYSTEM                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐     │
│  │   WEB INTERFACE  │     │   AGENT SERVICE  │     │  KNOWLEDGE BASE  │     │
│  │   (Next.js)      │◄───►│   (Express.js)   │◄───►│  (PostgreSQL)    │     │
│  └──────────────────┘     └────────┬─────────┘     └──────────────────┘     │
│                                    │                                         │
│                                    ▼                                         │
│                          ┌──────────────────┐                                │
│                          │   ANTHROPIC API  │                                │
│                          │   (Claude)       │                                │
│                          └──────────────────┘                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

## API Endpoints

### Public Endpoints
- `GET /health` - Health check with service status
- `GET /api/status` - API version and service availability
- `GET /api/knowledge/examples` - List example courses
- `GET /api/knowledge/examples/:title` - Get example course details

### Protected Endpoints (require X-API-Key header)
- `POST /api/generation/start` - Start course generation
- `GET /api/generation/:courseId/status` - Check generation status
- `POST /api/review/:courseId/design` - Submit design review
- `POST /api/review/:courseId/storyboard` - Submit storyboard review
- `POST /api/publish/:courseId` - Publish course to CloudFront
- `GET /api/analytics/courses/:courseId` - Get course analytics
- `POST /api/xapi/statements` - Receive xAPI statements

## Development

```bash
# Run tests
npm test

# Run integration tests (requires running server)
npm run test:integration

# Run linting
npm run lint

# Build for production
npm run build

# Verify local setup before deployment
npm run verify
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection string |
| ANTHROPIC_API_KEY | Yes | Anthropic API key for Claude |
| API_KEY_SECRET | Yes | Secret for API authentication |
| NODE_ENV | No | Environment (development/production) |
| PORT | No | Server port (default: 10000) |
| AWS_ACCESS_KEY_ID | No | AWS credentials for S3/CloudFront |
| AWS_SECRET_ACCESS_KEY | No | AWS credentials |
| S3_BUCKET | No | S3 bucket for course packages |

## Project Structure

```
├── src/
│   ├── api/routes/       # API route handlers
│   ├── config/           # Configuration and database setup
│   ├── middleware/       # Express middleware (auth, etc.)
│   ├── services/         # Business logic and external services
│   ├── agents/           # AI agent implementations (Phase 2+)
│   └── index.ts          # Application entry point
├── scripts/              # Database migrations and seeds
├── tests/                # Test files
├── docs/                 # Documentation
└── prompts/              # AI prompt templates
```

## Implementation Phases

- [x] **Phase 1: Foundation** - Project setup, database, API structure, auth, deployment
- [ ] **Phase 2: Agent Core** - Research and Design agents with Claude
- [ ] **Phase 3: Review Workflow** - Human review and correction system
- [ ] **Phase 4: Analytics** - xAPI integration and reporting
- [ ] **Phase 5: Learning System** - Feedback loop and quality improvement
- [ ] **Phase 6: Polish & Deploy** - Production hardening

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines and lessons learned.

## License

Proprietary
