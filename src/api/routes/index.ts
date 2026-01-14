import { Router } from 'express';
import { getConfigStatus } from '../../config/index.js';
import { authenticate } from '../../middleware/auth.js';
import knowledgeRouter from './knowledge.js';

const router = Router();

// Status endpoint (public)
router.get('/status', (req, res) => {
  const status = getConfigStatus();
  res.json({
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: status.database,
      ai: status.ai,
      aws: status.aws,
    },
  });
});

// Protected routes - require X-API-Key header
router.use('/generation', authenticate, (req, res) => {
  res.status(501).json({ error: 'Generation API not yet implemented' });
});

router.use('/review', authenticate, (req, res) => {
  res.status(501).json({ error: 'Review API not yet implemented' });
});

router.use('/publish', authenticate, (req, res) => {
  res.status(501).json({ error: 'Publish API not yet implemented' });
});

router.use('/analytics', authenticate, (req, res) => {
  res.status(501).json({ error: 'Analytics API not yet implemented' });
});

// Knowledge routes (public for reading examples)
router.use('/knowledge', knowledgeRouter);

router.use('/xapi', (req, res) => {
  res.status(501).json({ error: 'xAPI endpoint not yet implemented' });
});

export default router;
