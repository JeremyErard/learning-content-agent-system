/**
 * Designer Agent
 *
 * Transforms research into structured learning experiences.
 * Produces design specs and storyboards.
 */

import { generateStructuredResponse, CompletionOptions } from '../services/anthropic.js';
import {
  ResearchResult,
  DesignSpec,
  Storyboard,
  GenerationRequest,
} from './types.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load system prompt
const SYSTEM_PROMPT = readFileSync(
  join(__dirname, '../../prompts/designer.md'),
  'utf-8'
);

const DESIGN_OPTIONS: CompletionOptions = {
  maxTokens: 8192,
  temperature: 0.5,
};

const STORYBOARD_OPTIONS: CompletionOptions = {
  maxTokens: 16384, // Storyboards are larger
  temperature: 0.6,
};

/**
 * Generate a design spec from research
 */
export async function generateDesignSpec(
  research: ResearchResult,
  request: GenerationRequest
): Promise<DesignSpec> {
  const startTime = Date.now();

  const prompt = buildDesignSpecPrompt(research, request);

  console.log('[Designer] Generating design spec for:', research.topic);
  console.log('[Designer] Prompt length:', prompt.length);

  try {
    const result = await generateStructuredResponse<DesignSpec>(prompt, {
      ...DESIGN_OPTIONS,
      system: SYSTEM_PROMPT,
    });

    const duration = Date.now() - startTime;
    console.log('[Designer] Design spec generated in', duration, 'ms');
    console.log('[Designer] Topics:', result.topics?.length || 0);
    console.log('[Designer] Total objectives:', countObjectives(result));

    // Validate result
    validateDesignSpec(result);

    return result;
  } catch (error) {
    console.error('[Designer] Design spec generation failed:', error);
    throw new Error(`Design spec generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a storyboard from design spec
 */
export async function generateStoryboard(
  designSpec: DesignSpec,
  research: ResearchResult
): Promise<Storyboard> {
  const startTime = Date.now();

  const prompt = buildStoryboardPrompt(designSpec, research);

  console.log('[Designer] Generating storyboard for:', designSpec.metadata.title);
  console.log('[Designer] Prompt length:', prompt.length);

  try {
    const result = await generateStructuredResponse<Storyboard>(prompt, {
      ...STORYBOARD_OPTIONS,
      system: SYSTEM_PROMPT,
    });

    const duration = Date.now() - startTime;
    console.log('[Designer] Storyboard generated in', duration, 'ms');
    console.log('[Designer] Sections:', result.sections?.length || 0);
    console.log('[Designer] Quiz questions:', result.finalQuiz?.questions?.length || 0);

    // Validate result
    validateStoryboard(result, designSpec);

    return result;
  } catch (error) {
    console.error('[Designer] Storyboard generation failed:', error);
    throw new Error(`Storyboard generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Build the design spec prompt
 */
function buildDesignSpecPrompt(research: ResearchResult, request: GenerationRequest): string {
  return `Create a design specification for an eLearning course based on the following research.

## Research Summary
${research.summary}

## Main Topics
${JSON.stringify(research.mainTopics, null, 2)}

## Key Terms
${JSON.stringify(research.keyTerms, null, 2)}

## Common Misconceptions
${JSON.stringify(research.commonMisconceptions, null, 2)}

## Course Parameters
- Topic: ${request.topic}
- Format: ${request.format}
- Duration: ${request.durationMinutes} minutes
- Audience: ${request.audience}
${request.curriculum ? `- Curriculum: ${request.curriculum}` : ''}
${request.prerequisite ? `- Prerequisite: ${request.prerequisite}` : ''}

## Requirements

Create a design spec with:
1. Course metadata (title, duration, audience, etc.)
2. Learning objectives grouped by topic using Bloom's taxonomy verbs
3. Key terms to define
4. Misconceptions to address

Each objective should:
- Start with a measurable verb (Define, Recall, Recognize, Identify, Explain, Apply, Demonstrate)
- Be achievable within the time allocated
- Map to content from the research

Return the design spec as the specified JSON structure.`;
}

/**
 * Build the storyboard prompt
 */
function buildStoryboardPrompt(designSpec: DesignSpec, research: ResearchResult): string {
  return `Create a detailed storyboard for the following course design.

## Design Specification
${JSON.stringify(designSpec, null, 2)}

## Research Reference
${JSON.stringify({
  keyTerms: research.keyTerms,
  commonMisconceptions: research.commonMisconceptions,
  statistics: research.statistics,
}, null, 2)}

## Interaction Component Reference

Use these components based on content type:
- ImgSingle2col: Section headers, intro screens (single concept with visual)
- H1ALeft: Section introductions, explanations (single definition/explanation)
- CR3A: Click-reveal interactions (3-4 related concepts)
- ClickRevealGrid: Grid of clickable items (5-8 related concepts)
- SS2ACarousel: Slideshow/carousel (3-6 sequential steps)
- KcCheckboxAnswerableBuilder: Quiz/practice questions

## Requirements

Create a storyboard with:

1. **Introduction Section** (section-0.0)
   - Hook to engage learners
   - Brief overview of what they'll learn
   - Preview of main topics

2. **For Each Topic** (section-N.1, section-N.2, etc.)
   - Topic header with objectives listed
   - Content sections using appropriate interactions
   - At least one practice question per topic

3. **Summary Section**
   - Key takeaways
   - Transition to final quiz

4. **Final Quiz** (minimum 5 questions)
   - Cover all learning objectives
   - Mix of question types (single, multiple, true_false)
   - Feedback for correct and incorrect answers
   - 80% pass threshold

Each section must:
- Have a unique sectionId (format: section-X.Y)
- Map to at least one objective (except intro/summary)
- Include appropriate interaction type
- Have content as HTML (use <p>, <ul>, <li>, <strong>, <em>)

Return the storyboard as the specified JSON structure.`;
}

/**
 * Count total objectives in design spec
 */
function countObjectives(spec: DesignSpec): number {
  return spec.topics?.reduce((sum, topic) => sum + (topic.objectives?.length || 0), 0) || 0;
}

/**
 * Validate design spec structure
 */
function validateDesignSpec(spec: DesignSpec): void {
  if (!spec.metadata?.title) {
    throw new Error('Design spec missing title');
  }

  if (!spec.topics || spec.topics.length === 0) {
    throw new Error('Design spec has no topics');
  }

  const objectiveCount = countObjectives(spec);
  if (objectiveCount === 0) {
    throw new Error('Design spec has no learning objectives');
  }

  // Validate objective IDs are unique
  const objectiveIds = new Set<string>();
  spec.topics.forEach((topic) => {
    topic.objectives?.forEach((obj) => {
      if (objectiveIds.has(obj.id)) {
        throw new Error(`Duplicate objective ID: ${obj.id}`);
      }
      objectiveIds.add(obj.id);
    });
  });
}

/**
 * Validate storyboard structure
 */
function validateStoryboard(storyboard: Storyboard, designSpec: DesignSpec): void {
  if (!storyboard.sections || storyboard.sections.length === 0) {
    throw new Error('Storyboard has no sections');
  }

  if (!storyboard.finalQuiz?.questions || storyboard.finalQuiz.questions.length < 5) {
    throw new Error('Storyboard final quiz must have at least 5 questions');
  }

  // Validate section IDs are unique
  const sectionIds = new Set<string>();
  storyboard.sections.forEach((section) => {
    if (sectionIds.has(section.sectionId)) {
      throw new Error(`Duplicate section ID: ${section.sectionId}`);
    }
    sectionIds.add(section.sectionId);
  });

  // Collect all objective IDs from design spec
  const validObjectiveIds = new Set<string>();
  designSpec.topics.forEach((topic) => {
    topic.objectives?.forEach((obj) => {
      validObjectiveIds.add(obj.id);
    });
  });

  // Verify all objectives are covered by at least one section
  const coveredObjectives = new Set<string>();
  storyboard.sections.forEach((section) => {
    section.objectiveIds?.forEach((id) => coveredObjectives.add(id));
  });

  // Verify all objectives are assessed by quiz
  const assessedObjectives = new Set<string>();
  storyboard.finalQuiz.questions.forEach((q) => {
    q.objectiveIds?.forEach((id) => assessedObjectives.add(id));
  });

  // Log coverage (don't fail, just warn)
  const uncoveredByContent = [...validObjectiveIds].filter((id) => !coveredObjectives.has(id));
  const unassessed = [...validObjectiveIds].filter((id) => !assessedObjectives.has(id));

  if (uncoveredByContent.length > 0) {
    console.warn('[Designer] Warning: Objectives not covered by content:', uncoveredByContent);
  }

  if (unassessed.length > 0) {
    console.warn('[Designer] Warning: Objectives not assessed by quiz:', unassessed);
  }
}

export const designerAgent = {
  generateDesignSpec,
  generateStoryboard,
};
