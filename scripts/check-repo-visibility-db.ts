
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load env
const envLocalPath = path.join(process.cwd(), '.env.local');
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envLocalPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));
    for (const k in envConfig) process.env[k] = envConfig[k];
}

const prisma = new PrismaClient();

async function main() {
    const repos = await prisma.repository.findMany({
        select: {
            isPrivate: true,
            nameWithOwner: true
        }
    });

    const privateRepos = repos.filter(r => r.isPrivate);
    const publicRepos = repos.filter(r => !r.isPrivate);

    console.log(`Total Repos: ${repos.length}`);
    console.log(`Private: ${privateRepos.length}`);
    console.log(`Public: ${publicRepos.length}`);

    // Also check if any are null (might default to false in DB but good to know)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
