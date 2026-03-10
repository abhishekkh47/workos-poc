import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { env } from './config/env';
import { sequelize } from './config/db';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';

// Import models so Sequelize registers them before sync
import './models/user';

const app = express();

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/api', userRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function start() {
  // alter: true updates existing columns/adds new ones without dropping the table
  await sequelize.sync({ alter: true });
  console.log('Database synced successfully');

  app.listen(env.port, () => {
    console.log(`Backend running on http://localhost:${env.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
