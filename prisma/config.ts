// This is your Prisma database configuration
export const DATABASE_URL = process.env.DATABASE_URL;

// Set up Prisma Client with proper PostgreSQL adapter
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();