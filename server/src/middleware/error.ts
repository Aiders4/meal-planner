import { Request, Response, NextFunction } from 'express';
import { AIServiceError } from '../services/ai.js';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  req.log.error({ err }, 'Unhandled error');

  if (err instanceof AIServiceError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
}
