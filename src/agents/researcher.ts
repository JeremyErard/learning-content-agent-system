/**
 * Researcher Agent
 *
 * Researches topics for eLearning course development using Claude.
 * Produces structured research with topics, key terms, and sources.
 */

import { generateStructuredResponse, CompletionOptions } from '../services/anthropic.js';
import { ResearchResult, GenerationRequest } from './types.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load system prompt
const SYSTEM_PROMPT = readFileSync(
  join(__dirname, '../../prompts/researcher.md'),
  'utf-8'
);

const RESEARCH_OPTIONS: CompletionOptions = {
  maxTokens: 8192,
  temperature: 0.3, // Lower temperature for factual research
};

/**
 * Research a topic for course development
 */
export async function research(request: GenerationRequest): Promise<ResearchResult> {
  const startTime = Date.now();

  const prompt = buildResearchPrompt(request);

  console.log('[Researcher] Starting research for:', request.topic);
  console.log('[Researcher] Prompt length:', prompt.length);

  try {
    const result = await generateStructuredResponse<ResearchResult>(prompt, {
      ...RESEARCH_OPTIONS,
      system: SYSTEM_PROMPT,
    });

    const duration = Date.now() - startTime;
    console.log('[Researcher] Research completed in', duration, 'ms');
    console.log('[Researcher] Topics found:', result.mainTopics?.length || 0);

    // Validate result structure
    validateResearchResult(result);

    return result;
  } catch (error) {
    console.error('[Researcher] Research failed:', error);
    throw new Error(`Research failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Build the research prompt based on the generation request
 */
function buildResearchPrompt(request: GenerationRequest): string {
  let prompt = `Research the following topic for an eLearning course:

## Topic
${request.topic}

## Course Parameters
- Format: ${request.format}
- Target Audience: ${request.audience}
- Duration: ${request.durationMinutes} minutes
`;

  if (request.curriculum) {
    prompt += `- Curriculum: ${request.curriculum}\n`;
  }

  if (request.prerequisite) {
    prompt += `- Prerequisite: ${request.prerequisite}\n`;
  }

  if (request.additionalContext) {
    prompt += `\n## Additional Context\n${request.additionalContext}\n`;
  }

  if (request.sourceUrls && request.sourceUrls.length > 0) {
    prompt += `\n## Preferred Sources\nThe following URLs should be prioritized:\n`;
    request.sourceUrls.forEach((url) => {
      prompt += `- ${url}\n`;
    });
  }

  prompt += `
## Research Requirements

Based on the ${request.durationMinutes}-minute duration, identify:
- 2-4 main topics that can be covered effectively
- Key concepts and definitions for each topic
- Common misconceptions to address
- Any regulatory requirements (especially for workplace safety topics)
- Statistics or facts that support the learning content

Focus on information that is:
1. Authoritative (government, industry standards, peer-reviewed)
2. Current (within last 5 years unless historical)
3. Practical for workplace training
4. Suitable for the target audience: ${request.audience}

Return your research as the specified JSON structure.`;

  return prompt;
}

/**
 * Validate the research result has required fields
 */
function validateResearchResult(result: ResearchResult): void {
  if (!result.topic) {
    throw new Error('Research result missing topic');
  }

  if (!result.mainTopics || result.mainTopics.length === 0) {
    throw new Error('Research result has no main topics');
  }

  // Validate each topic has required fields
  result.mainTopics.forEach((topic, index) => {
    if (!topic.title) {
      throw new Error(`Topic ${index} missing title`);
    }
    if (!topic.keyPoints || topic.keyPoints.length === 0) {
      throw new Error(`Topic "${topic.title}" has no key points`);
    }
  });
}

export const researcherAgent = {
  research,
};
