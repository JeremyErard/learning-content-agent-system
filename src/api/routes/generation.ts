/**
 * Generation API Routes
 *
 * Endpoints for course generation lifecycle.
 */

import { Router, Request, Response } from 'express';
import { generationService } from '../../services/generation.js';
import { GenerationRequest } from '../../agents/types.js';

const router = Router();

/**
 * POST /api/generation/start
 * Start a new course generation
 */
router.post('/start', async (req: Request, res: Response) => {
  try {
    const body = req.body as Partial<GenerationRequest>;

    // Validate required fields
    if (!body.topic) {
      res.status(400).json({ error: 'topic is required' });
      return;
    }

    if (!body.format || !['elearning', 'workshop', 'scenario'].includes(body.format)) {
      res.status(400).json({ error: 'format must be elearning, workshop, or scenario' });
      return;
    }

    if (!body.audience) {
      res.status(400).json({ error: 'audience is required' });
      return;
    }

    if (!body.durationMinutes || body.durationMinutes < 5 || body.durationMinutes > 120) {
      res.status(400).json({ error: 'durationMinutes must be between 5 and 120' });
      return;
    }

    const request: GenerationRequest = {
      topic: body.topic,
      format: body.format,
      audience: body.audience,
      durationMinutes: body.durationMinutes,
      curriculum: body.curriculum,
      prerequisite: body.prerequisite,
      additionalContext: body.additionalContext,
      sourceUrls: body.sourceUrls,
    };

    const result = await generationService.startGeneration(request);

    res.status(201).json({
      courseId: result.courseId,
      status: result.status,
      message: 'Course generation started',
      statusUrl: `/api/generation/${result.courseId}/status`,
    });
  } catch (error) {
    console.error('[Generation API] Start error:', error);
    res.status(500).json({
      error: 'Failed to start generation',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/generation/:courseId/status
 * Get generation status
 */
router.get('/:courseId/status', async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    const status = await generationService.getGenerationStatus(courseId);

    if (!status) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    res.json(status);
  } catch (error) {
    console.error('[Generation API] Status error:', error);
    res.status(500).json({
      error: 'Failed to get status',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/generation/:courseId/design-spec
 * Get the generated design spec
 */
router.get('/:courseId/design-spec', async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    const result = await generationService.getDesignSpec(courseId);

    if (!result) {
      res.status(404).json({ error: 'Design spec not found or not yet generated' });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error('[Generation API] Design spec error:', error);
    res.status(500).json({
      error: 'Failed to get design spec',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/generation/:courseId/storyboard
 * Get the generated storyboard
 */
router.get('/:courseId/storyboard', async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    const result = await generationService.getStoryboard(courseId);

    if (!result) {
      res.status(404).json({ error: 'Storyboard not found or not yet generated' });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error('[Generation API] Storyboard error:', error);
    res.status(500).json({
      error: 'Failed to get storyboard',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
