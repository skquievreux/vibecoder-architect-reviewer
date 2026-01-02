export const DATABASE_URL = process.env.DATABASE_URL;

// Production Prisma client configuration
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
});