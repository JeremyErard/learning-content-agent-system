# Contributing to LCAS

## Development Guidelines

### Before You Start

1. **Read the spec** - Review `learning-content-agent-spec.md` for the current phase requirements
2. **Check the checklist** - Each phase has verification criteria that must pass
3. **Run verify script** - `npm run verify` before starting work

### Local Development Setup

```bash
# 1. Install dependencies (includes dev dependencies)
npm install

# 2. Copy and configure environment
cp .env.example .env
# Edit .env with real credentials

# 3. Verify environment loads correctly
npm run verify

# 4. Start development
npm run dev
```

### Environment Variables

The `.env` file is loaded automatically via `dotenv`. Key gotchas:

- **DATABASE_URL**: Must be a valid PostgreSQL connection string (not validated as URL)
- **ANTHROPIC_API_KEY**: Required for AI features, optional in Phase 1
- **API_KEY_SECRET**: Used for X-API-Key authentication

### Testing

```bash
# Unit tests
npm test

# Integration tests (requires running server)
npm run dev &
npm run test:integration

# Verify everything before deployment
npm run verify
```

---

## Lessons Learned

### Phase 1: Foundation

#### Issue: Environment variables not loading
**Problem:** App used `process.env.DATABASE_URL` but `.env` file wasn't being read.
**Solution:** Added `dotenv` package and `dotenvConfig()` call in `src/config/index.ts`.
**Prevention:** Always verify env vars load correctly with `npm run verify` before testing.

#### Issue: Zod URL validation too strict
**Problem:** `z.string().url()` only accepts `http://` or `https://` schemes, rejecting `postgresql://`.
**Solution:** Changed to `z.string()` for DATABASE_URL validation.
**Prevention:** Test config validation with actual production-like values.

#### Issue: TypeScript build fails on Render
**Problem:** `npm ci` in production mode skips devDependencies, but `@types/*` packages are needed for `tsc` to compile.
**Solution:** Changed build command to `npm ci --include=dev && npm run build`.
**Prevention:** Always test `npm run build` locally before deploying. The verify script now checks this.

#### Issue: Render can't access private GitHub repos
**Problem:** Render's default GitHub integration doesn't have access to private repos without explicit authorization.
**Solution:** Made repo public, or connect GitHub account in Render dashboard.
**Prevention:** Either keep repos public or configure GitHub integration in Render before deploying.

#### Issue: Environment variables require redeploy
**Problem:** Setting env vars via Render API after initial deploy doesn't apply them to running instance.
**Solution:** Trigger a redeploy after setting env vars.
**Prevention:** Set all env vars before first deploy, or always redeploy after changes.

#### Issue: Render CLI limitations
**Problem:** Render CLI only manages existing services; can't create new ones.
**Solution:** Used Render REST API directly to create service.
**Prevention:** For automation, use REST API. CLI is for day-to-day management only.

---

## Pre-Deployment Checklist

Before deploying any phase:

- [ ] All phase requirements verified against spec
- [ ] `npm run verify` passes locally
- [ ] `npm run build` completes without errors
- [ ] `npm test` passes
- [ ] Integration tests pass against local server
- [ ] Environment variables documented in `.env.example`
- [ ] README updated with new endpoints/features
- [ ] Code committed and pushed to GitHub

After deploying:

- [ ] Health check returns `status: ok`
- [ ] All expected services show as `true` in health check
- [ ] Integration tests pass against deployed URL
- [ ] New endpoints respond correctly

---

## Phase-Specific Notes

### Phase 2: Agent Core

Based on Phase 1 learnings:

1. **Test Claude integration locally first** - Don't assume API calls work until verified
2. **Add timeout handling** - Claude API calls can be slow; handle timeouts gracefully
3. **Log prompts and responses** - Essential for debugging AI behavior
4. **Validate JSON responses** - Claude may return malformed JSON; always parse defensively

### Phase 3+

- Document issues as they arise in this file
- Update verify script with new checks
- Add integration tests for each new endpoint

---

## Code Style

- TypeScript strict mode enabled
- ESLint for linting (`npm run lint`)
- Explicit types for function parameters and returns
- Use `Request`, `Response`, `NextFunction` types from express

## Git Workflow

1. Work on feature branch (optional for solo development)
2. Run full verification before committing
3. Write descriptive commit messages
4. Push triggers auto-deploy on Render

## Getting Help

- Check `learning-content-agent-spec.md` for detailed requirements
- Review this file for known issues and solutions
- Check Render logs: `render logs -r <service-id> -o text`
