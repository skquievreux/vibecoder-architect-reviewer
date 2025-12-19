import { PrismaClient } from '@prisma/client';

export const DATABASE_URL = process.env.DATABASE_URL;

export const prisma = new PrismaClient();