import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

import { initializeDatabase } from './db/connection.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import mealsRoutes from './routes/meals.js';
import { errorHandler } from './middleware/error.js';

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGIN) {
  console.warn('WARNING: CORS_ORIGIN is not set in production — CORS will allow all origins');
}

app.use(helmet());

const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/meals', mealsRoutes);

app.use(errorHandler);

async function start() {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
