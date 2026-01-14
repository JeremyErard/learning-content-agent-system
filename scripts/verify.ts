/**
 * Pre-deployment verification script
 *
 * Checks that the local environment is properly configured
 * and that the build will succeed before deploying.
 *
 * Run with: npm run verify
 */

import { config as dotenvConfig } from 'dotenv';
import { execSync } from 'child_process';
import pg from 'pg';

// Load environment variables
dotenvConfig();

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
}

const results: CheckResult[] = [];

function check(name: string, fn: () => boolean | Promise<boolean>, successMsg: string, failMsg: string) {
  return async () => {
    try {
      const passed = await fn();
      results.push({ name, passed, message: passed ? successMsg : failMsg });
    } catch (error) {
      results.push({ name, passed: false, message: `${failMsg}: ${error}` });
    }
  };
}

async function runChecks() {
  console.log('\n🔍 LCAS Pre-Deployment Verification\n');
  console.log('='.repeat(50));

  // 1. Check environment variables
  await check(
    'Environment: DATABASE_URL',
    () => !!process.env.DATABASE_URL,
    'DATABASE_URL is set',
    'DATABASE_URL is missing - check .env file'
  )();

  await check(
    'Environment: ANTHROPIC_API_KEY',
    () => !!process.env.ANTHROPIC_API_KEY,
    'ANTHROPIC_API_KEY is set',
    'ANTHROPIC_API_KEY is missing - AI features will not work'
  )();

  await check(
    'Environment: API_KEY_SECRET',
    () => !!process.env.API_KEY_SECRET,
    'API_KEY_SECRET is set',
    'API_KEY_SECRET is missing - using default (insecure for production)'
  )();

  // 2. Check database connection
  await check(
    'Database: Connection',
    async () => {
      if (!process.env.DATABASE_URL) return false;
      const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
      try {
        const result = await pool.query('SELECT 1 as test');
        await pool.end();
        return result.rows[0]?.test === 1;
      } catch {
        await pool.end();
        return false;
      }
    },
    'Database connection successful',
    'Cannot connect to database - check DATABASE_URL'
  )();

  // 3. Check database schema
  await check(
    'Database: Schema',
    async () => {
      if (!process.env.DATABASE_URL) return false;
      const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
      try {
        const result = await pool.query(`
          SELECT table_name FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'example_courses'
        `);
        await pool.end();
        return result.rows.length > 0;
      } catch {
        await pool.end();
        return false;
      }
    },
    'Database schema exists',
    'Database schema missing - run npm run db:migrate'
  )();

  // 4. Check TypeScript build
  await check(
    'Build: TypeScript',
    () => {
      try {
        execSync('npm run build', { stdio: 'pipe' });
        return true;
      } catch {
        return false;
      }
    },
    'TypeScript build successful',
    'TypeScript build failed - check for type errors'
  )();

  // 5. Check ESLint
  await check(
    'Lint: ESLint',
    () => {
      try {
        execSync('npm run lint', { stdio: 'pipe' });
        return true;
      } catch {
        return false;
      }
    },
    'ESLint passed',
    'ESLint found issues - run npm run lint to see details'
  )();

  // Print results
  console.log('\n📋 Results:\n');

  let allPassed = true;
  for (const result of results) {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
    console.log(`   ${result.message}\n`);
    if (!result.passed) allPassed = false;
  }

  console.log('='.repeat(50));

  if (allPassed) {
    console.log('\n✅ All checks passed! Ready to deploy.\n');
    process.exit(0);
  } else {
    console.log('\n❌ Some checks failed. Please fix issues before deploying.\n');
    process.exit(1);
  }
}

runChecks().catch((error) => {
  console.error('Verification script failed:', error);
  process.exit(1);
});
