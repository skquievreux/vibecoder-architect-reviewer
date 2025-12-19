import { PrismaClient } from '@prisma/client';

const DATABASE_URL = process.env.DATABASE_URL;
const prisma = new PrismaClient();

export default prisma;