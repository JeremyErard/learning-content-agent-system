/**
 * Course Generation Service
 *
 * Orchestrates the course generation pipeline using agents.
 */

import { v4 as uuidv4 } from 'uuid';
import { query, queryOne } from '../config/database.js';
import { researcherAgent } from '../agents/researcher.js';
import { designerAgent } from '../agents/designer.js';
import {
  GenerationRequest,
  GenerationLogEntry,
  GenerationPhase,
  GenerationStatus,
  DesignSpec,
  Storyboard,
} from '../agents/types.js';

interface Course {
  id: string;
  course_id: string;
  title: string;
  status: GenerationStatus;
  generation_request: GenerationRequest;
  generation_log: GenerationLogEntry[];
  design_spec: DesignSpec | null;
  storyboard: Storyboard | null;
  current_phase: GenerationPhase;
  progress: number;
}

/**
 * Start a new course generation
 */
export async function startGeneration(request: GenerationRequest): Promise<{
  courseId: string;
  status: GenerationStatus;
}> {
  const courseId = uuidv4();
  const slug = generateSlug(request.topic);
  const title = request.topic;

  // Create course record
  // Note: generation_log is JSONB[] so we use array syntax
  await query(
    `INSERT INTO courses (
      course_id, slug, title, format, curriculum, audience,
      duration_minutes, prerequisite, status, generation_request, generation_log
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, ARRAY[$11::jsonb])`,
    [
      courseId,
      slug,
      title,
      request.format,
      request.curriculum || null,
      request.audience,
      request.durationMinutes,
      request.prerequisite || null,
      'researching',
      JSON.stringify(request),
      JSON.stringify(createLogEntry('init', 'Course generation started')),
    ]
  );

  // Start async generation (non-blocking)
  runGenerationPipeline(courseId, request).catch((error) => {
    console.error('[Generation] Pipeline failed for', courseId, error);
    updateCourseStatus(courseId, 'failed', 'research', 0, [
      createLogEntry('error', `Generation failed: ${error.message}`),
    ]);
  });

  return { courseId, status: 'researching' };
}

/**
 * Get generation status
 */
export async function getGenerationStatus(courseId: string): Promise<{
  courseId: string;
  status: GenerationStatus;
  currentPhase: GenerationPhase;
  progress: number;
  log: GenerationLogEntry[];
} | null> {
  const course = await queryOne<Course>(
    `SELECT course_id, status, generation_log FROM courses WHERE course_id = $1`,
    [courseId]
  );

  if (!course) {
    return null;
  }

  // Determine current phase from status
  const phaseMap: Record<GenerationStatus, GenerationPhase> = {
    pending: 'research',
    researching: 'research',
    designing: 'design',
    building: 'build',
    review: 'complete',
    complete: 'complete',
    failed: 'research',
  };

  const progressMap: Record<GenerationStatus, number> = {
    pending: 0,
    researching: 20,
    designing: 50,
    building: 80,
    review: 90,
    complete: 100,
    failed: 0,
  };

  return {
    courseId: course.course_id,
    status: course.status,
    currentPhase: phaseMap[course.status],
    progress: progressMap[course.status],
    log: course.generation_log || [],
  };
}

/**
 * Get design spec for a course
 */
export async function getDesignSpec(courseId: string): Promise<{
  courseId: string;
  designSpec: DesignSpec;
} | null> {
  const course = await queryOne<Course>(
    `SELECT course_id, design_spec FROM courses WHERE course_id = $1`,
    [courseId]
  );

  if (!course || !course.design_spec) {
    return null;
  }

  return {
    courseId: course.course_id,
    designSpec: course.design_spec,
  };
}

/**
 * Get storyboard for a course
 */
export async function getStoryboard(courseId: string): Promise<{
  courseId: string;
  storyboard: Storyboard;
} | null> {
  const course = await queryOne<Course>(
    `SELECT course_id, storyboard FROM courses WHERE course_id = $1`,
    [courseId]
  );

  if (!course || !course.storyboard) {
    return null;
  }

  return {
    courseId: course.course_id,
    storyboard: course.storyboard,
  };
}

/**
 * Run the full generation pipeline
 */
async function runGenerationPipeline(
  courseId: string,
  request: GenerationRequest
): Promise<void> {
  const logs: GenerationLogEntry[] = [];

  try {
    // Phase 1: Research
    console.log('[Generation] Starting research phase for', courseId);
    const researchStart = Date.now();

    const research = await researcherAgent.research(request);

    logs.push(createLogEntry('research', 'Research completed', Date.now() - researchStart));
    logs.push(createLogEntry('research', `Found ${research.mainTopics.length} main topics`));

    await updateCourseStatus(courseId, 'designing', 'design', 30, logs);

    // Phase 2: Design Spec
    console.log('[Generation] Starting design phase for', courseId);
    const designStart = Date.now();

    const designSpec = await designerAgent.generateDesignSpec(research, request);

    logs.push(createLogEntry('design', 'Design spec generated', Date.now() - designStart));

    // Save design spec
    await query(
      `UPDATE courses SET design_spec = $1, updated_at = NOW() WHERE course_id = $2`,
      [JSON.stringify(designSpec), courseId]
    );

    await updateCourseStatus(courseId, 'designing', 'storyboard', 50, logs);

    // Phase 3: Storyboard
    console.log('[Generation] Starting storyboard phase for', courseId);
    const storyboardStart = Date.now();

    const storyboard = await designerAgent.generateStoryboard(designSpec, research);

    logs.push(createLogEntry('storyboard', 'Storyboard generated', Date.now() - storyboardStart));
    logs.push(createLogEntry('storyboard', `Created ${storyboard.sections.length} sections`));
    logs.push(createLogEntry('storyboard', `Created ${storyboard.finalQuiz.questions.length} quiz questions`));

    // Save storyboard
    await query(
      `UPDATE courses SET storyboard = $1, updated_at = NOW() WHERE course_id = $2`,
      [JSON.stringify(storyboard), courseId]
    );

    // Update to review status (awaiting human review before build)
    await updateCourseStatus(courseId, 'review', 'complete', 90, logs);

    console.log('[Generation] Pipeline completed for', courseId);
  } catch (error) {
    console.error('[Generation] Pipeline error for', courseId, error);
    logs.push(createLogEntry('error', `Pipeline failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    await updateCourseStatus(courseId, 'failed', 'research', 0, logs);
    throw error;
  }
}

/**
 * Update course status and logs
 */
async function updateCourseStatus(
  courseId: string,
  status: GenerationStatus,
  _phase: GenerationPhase,
  _progress: number,
  newLogs: GenerationLogEntry[]
): Promise<void> {
  // Append new logs to existing using array_cat
  // Build the array elements for PostgreSQL
  const logJsonStrings = newLogs.map((l) => JSON.stringify(l));

  // Use array_cat to concatenate arrays properly
  const placeholders = logJsonStrings.map((_, i) => `$${i + 3}::jsonb`).join(', ');

  await query(
    `UPDATE courses
     SET status = $1,
         generation_log = array_cat(generation_log, ARRAY[${placeholders}]),
         updated_at = NOW()
     WHERE course_id = $2`,
    [status, courseId, ...logJsonStrings]
  );
}

/**
 * Create a log entry
 */
function createLogEntry(
  phase: string,
  message: string,
  durationMs?: number
): GenerationLogEntry {
  return {
    timestamp: new Date().toISOString(),
    phase,
    message,
    durationMs,
  };
}

/**
 * Generate URL-friendly slug from topic
 */
function generateSlug(topic: string): string {
  return topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

export const generationService = {
  startGeneration,
  getGenerationStatus,
  getDesignSpec,
  getStoryboard,
};
