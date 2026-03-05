import { Request, Response, NextFunction } from 'express';
import { AIServiceError } from '../services/ai.js';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error('Unhandled error:', err.stack || err.message);

  if (err instanceof AIServiceError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
}
