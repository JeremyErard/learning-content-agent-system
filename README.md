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
# Edit .env with your credentials

# Set up database
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

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

# Run linting
npm run lint

# Build for production
npm run build
```

## License

Proprietary
