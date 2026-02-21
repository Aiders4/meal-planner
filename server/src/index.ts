import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import './db/connection.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import { errorHandler } from './middleware/error.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
