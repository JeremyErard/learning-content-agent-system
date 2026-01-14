import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/index.js';

let client: Anthropic | null = null;

/**
 * Get the Anthropic client instance (singleton)
 */
export function getAnthropicClient(): Anthropic {
  if (!client) {
    if (!config.anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }
    client = new Anthropic({
      apiKey: config.anthropicApiKey,
    });
  }
  return client;
}

/**
 * Check if Anthropic client is available
 */
export function isAnthropicConfigured(): boolean {
  return !!config.anthropicApiKey;
}

export interface CompletionOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  system?: string;
}

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';
const DEFAULT_MAX_TOKENS = 4096;

/**
 * Generate a completion using Claude
 */
export async function generateCompletion(
  prompt: string,
  options: CompletionOptions = {}
): Promise<string> {
  const anthropic = getAnthropicClient();

  const response = await anthropic.messages.create({
    model: options.model || DEFAULT_MODEL,
    max_tokens: options.maxTokens || DEFAULT_MAX_TOKENS,
    temperature: options.temperature ?? 0.7,
    system: options.system,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  return textBlock.text;
}

/**
 * Generate a structured JSON response using Claude
 */
export async function generateStructuredResponse<T>(
  prompt: string,
  options: CompletionOptions = {}
): Promise<T> {
  const systemPrompt = options.system
    ? `${options.system}\n\nIMPORTANT: Respond with valid JSON only. No markdown, no code blocks, just raw JSON.`
    : 'You are a helpful assistant. IMPORTANT: Respond with valid JSON only. No markdown, no code blocks, just raw JSON.';

  const response = await generateCompletion(prompt, {
    ...options,
    system: systemPrompt,
  });

  // Clean up response - remove any markdown code blocks if present
  let cleaned = response.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch (error) {
    throw new Error(`Failed to parse JSON response: ${cleaned.slice(0, 200)}...`);
  }
}
