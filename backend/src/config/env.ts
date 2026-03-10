import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  workosApiKey: requireEnv('WORKOS_API_KEY'),
  workosClientId: requireEnv('WORKOS_CLIENT_ID'),
  sessionSecret: requireEnv('SESSION_SECRET'),
  databaseUrl: requireEnv('DATABASE_URL'),
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  port: parseInt(process.env.PORT ?? '3001', 10),
};
