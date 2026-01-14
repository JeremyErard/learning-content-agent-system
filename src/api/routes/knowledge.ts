import { Router } from 'express';
import { query, queryOne } from '../../config/database.js';

const router = Router();

interface ExampleCourse {
  id: string;
  title: string;
  format: string;
  topics: string[];
  industries: string[];
  components_used: string[];
  design_spec: object;
  sample_pages: object;
  quality_score: number;
  times_used: number;
  created_at: Date;
}

// GET /api/knowledge/examples - List all example courses
router.get('/examples', async (req, res) => {
  try {
    const examples = await query<ExampleCourse>(
      `SELECT id, title, format, topics, industries, components_used,
              quality_score, times_used, created_at
       FROM example_courses
       ORDER BY quality_score DESC`
    );

    res.json({ examples });
  } catch (error) {
    console.error('Failed to fetch examples:', error);
    res.status(500).json({ error: 'Failed to fetch examples' });
  }
});

// GET /api/knowledge/examples/:title - Get example by title
router.get('/examples/:title', async (req, res) => {
  try {
    const { title } = req.params;

    const example = await queryOne<ExampleCourse>(
      `SELECT * FROM example_courses WHERE title = $1`,
      [title]
    );

    if (!example) {
      return res.status(404).json({ error: 'Example not found' });
    }

    // Increment times_used
    await query(
      'UPDATE example_courses SET times_used = times_used + 1 WHERE id = $1',
      [example.id]
    );

    res.json({ example });
  } catch (error) {
    console.error('Failed to fetch example:', error);
    res.status(500).json({ error: 'Failed to fetch example' });
  }
});

export default router;
