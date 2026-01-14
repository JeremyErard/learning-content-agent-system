import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { config, getConfigStatus } from './config/index.js';
import { testConnection } from './config/database.js';
import routes from './api/routes/index.js';

const app = express();

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
  const configStatus = getConfigStatus();
  const dbConnected = await testConnection();

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    config: configStatus,
    database: dbConnected ? 'connected' : 'disconnected',
  });
});

// API routes
app.use('/api', routes);

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const port = config.port;
app.listen(port, () => {
  console.log(`LCAS API running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);

  const status = getConfigStatus();
  if (status.missing.length > 0) {
    console.warn('Missing configuration:', status.missing.join(', '));
  }
});
