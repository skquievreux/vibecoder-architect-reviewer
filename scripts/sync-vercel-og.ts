import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const envLocalPath = join(process.cwd(), '.env.local');
if (existsSync(envLocalPath)) {
    const envConfig = dotenv.parse(readFileSync(envLocalPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const prisma = new PrismaClient();
const VERCEL_TOKEN = process.env.VERCEL_API_TOKEN;
const SCREENSHOT_DIR = join(process.cwd(), 'public', 'screenshots');

async function downloadImage(url: string, filepath: string) {
    const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
    });
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    writeFileSync(filepath, buffer);
}

async function main() {
    if (!VERCEL_TOKEN) {
        console.error('❌ VERCEL_API_TOKEN is missing');
        process.exit(1);
    }

    if (!existsSync(SCREENSHOT_DIR)) {
        mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }

    console.log('📡 Fetching Vercel projects...');
    const projectRes = await fetch('https://api.vercel.com/v9/projects', {
        headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
    });
    const projectData = (await projectRes.json()) as any;

    if (!projectData.projects) {
        console.error('❌ Could not fetch projects:', projectData);
        process.exit(1);
    }

    const repos = await prisma.repository.findMany();

    for (const project of projectData.projects) {
        const repo = repos.find(r => r.name.toLowerCase() === project.name.toLowerCase());
        if (!repo) continue;

        console.log(`🔍 Processing ${repo.name}...`);

        const depRes = await fetch(`https://api.vercel.com/v6/deployments?projectId=${project.id}&limit=1&state=READY`, {
            headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
        });
        const depData = (await depRes.json()) as any;
        const latest = depData.deployments?.[0];

        if (!latest) {
            console.log(`   ⚠️ No ready deployment for ${repo.name}`);
            continue;
        }

        const filename = `${repo.name}.png`;
        const filepath = join(SCREENSHOT_DIR, filename);
        const publicUrl = `/screenshots/${filename}`;

        // Using the screenshot API endpoint provided by the user
        const teamId = "skquievreuxs-projects";
        const screenshotUrl = `https://vercel.com/api/screenshot?dark=0&deploymentId=${latest.uid}&teamId=${teamId}&withStatus=1`;

        try {
            await downloadImage(screenshotUrl, filepath);
            await prisma.repository.update({
                where: { id: repo.id },
                data: { previewImageUrl: publicUrl }
            });
            console.log(`   ✅ Saved screenshot for ${repo.name}`);
        } catch (e: any) {
            console.error(`   ❌ Failed to download screenshot for ${repo.name}: ${e.message}`);
        }
    }

    await prisma.$disconnect();
    console.log('✨ Vercel OG Sync completed.');
}

main().catch(console.error);
