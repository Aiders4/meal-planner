import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { pinoHttp } from 'pino-http';
import { randomUUID } from 'crypto';

dotenv.config();

import { logger } from './lib/logger.js';
import { initializeDatabase } from './db/connection.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import mealsRoutes from './routes/meals.js';
import partnersRoutes from './routes/partners.js';
import { errorHandler } from './middleware/error.js';

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3001;

app.use(helmet());

const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(
  pinoHttp({
    logger,
    genReqId: (req) => {
      const inbound = req.headers['x-request-id'];
      if (typeof inbound === 'string' && inbound.length > 0 && inbound.length <= 128) {
        return inbound;
      }
      return randomUUID();
    },
    customLogLevel: (_req, res, err) => {
      if (err || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
    serializers: {
      req: (req) => ({ id: req.id, method: req.method, url: req.url }),
      res: (res) => ({ statusCode: res.statusCode }),
    },
  }),
);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/meals', mealsRoutes);
app.use('/api/partners', partnersRoutes);

app.use(errorHandler);

async function start() {
  if (!process.env.JWT_SECRET) {
    logger.fatal('JWT_SECRET environment variable is required');
    process.exit(1);
  }
  if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGIN) {
    logger.fatal('CORS_ORIGIN environment variable is required in production');
    process.exit(1);
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    logger.warn('ANTHROPIC_API_KEY is not set — meal generation will fail');
  }

  await initializeDatabase();
  app.listen(PORT, () => {
    logger.info({ port: PORT }, `Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  logger.fatal({ err }, 'Failed to start server');
  process.exit(1);
});
