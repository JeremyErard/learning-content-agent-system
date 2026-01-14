import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';

export interface AuthenticatedRequest extends Request {
  apiKeyName?: string;
}

/**
 * API Key authentication middleware
 * Validates X-API-Key header against configured secret
 */
export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const apiKey = req.headers['x-api-key'] as string | undefined;

  if (!apiKey) {
    res.status(401).json({ error: 'Missing X-API-Key header' });
    return;
  }

  if (apiKey !== config.apiKeySecret) {
    res.status(403).json({ error: 'Invalid API key' });
    return;
  }

  req.apiKeyName = 'default';
  next();
}

/**
 * Optional authentication - allows unauthenticated requests but marks them
 */
export function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const apiKey = req.headers['x-api-key'] as string | undefined;

  if (apiKey && apiKey === config.apiKeySecret) {
    req.apiKeyName = 'default';
  }

  next();
}
