import { Sequelize } from 'sequelize';
import { env } from './env';

export const sequelize = new Sequelize(env.databaseUrl, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV !== 'production' ? console.log : false,
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },
});
