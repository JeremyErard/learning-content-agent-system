import { z } from 'zod';
import { config as dotenvConfig } from 'dotenv';

// Load .env file
dotenvConfig();

const configSchema = z.object({
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  port: z.coerce.number().default(10000),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  databaseUrl: z.string().optional(),
  anthropicApiKey: z.string().min(1).optional(),
  apiKeySecret: z.string().default('dev-secret-change-in-production'),
  aws: z.object({
    accessKeyId: z.string().optional(),
    secretAccessKey: z.string().optional(),
    region: z.string().default('us-east-1'),
    s3Bucket: z.string().optional(),
    cloudfrontDistributionId: z.string().optional(),
  }),
  thriveApiUrl: z.string().url().optional(),
});

export type Config = z.infer<typeof configSchema>;

function loadConfig(): Config {
  const result = configSchema.safeParse({
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    logLevel: process.env.LOG_LEVEL,
    databaseUrl: process.env.DATABASE_URL,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    apiKeySecret: process.env.API_KEY_SECRET,
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
      s3Bucket: process.env.S3_BUCKET,
      cloudfrontDistributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
    },
    thriveApiUrl: process.env.THRIVE_API_URL,
  });

  if (!result.success) {
    console.error('Configuration validation failed:', result.error.format());
    throw new Error('Invalid configuration');
  }

  return result.data;
}

export const config = loadConfig();

export function getConfigStatus(): {
  database: boolean;
  ai: boolean;
  aws: boolean;
  missing: string[];
} {
  const missing: string[] = [];

  if (!config.databaseUrl) missing.push('DATABASE_URL');
  if (!config.anthropicApiKey) missing.push('ANTHROPIC_API_KEY');

  return {
    database: !!config.databaseUrl,
    ai: !!config.anthropicApiKey,
    aws: !!(config.aws.accessKeyId && config.aws.s3Bucket),
    missing,
  };
}
