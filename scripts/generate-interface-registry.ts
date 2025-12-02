import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const PORTFOLIO_PATH = path.join(__dirname, '../portfolio.json');
const REGISTRY_PATH = path.join(__dirname, '../interfaces-registry.yaml');

interface PortfolioRepo {
    id: string;
    repoName: string;
    description: string;
    url: string;
    source: string;
}

interface InterfaceEntry {
    id: string;
    repo_name: string;
    type: string;
    details: string;
}

async function main() {
    console.log('Starting Interface Registry Generation...');

    // 1. Read Portfolio
    if (!fs.existsSync(PORTFOLIO_PATH)) {
        console.error('portfolio.json not found!');
        process.exit(1);
    }
    const portfolioData = JSON.parse(fs.readFileSync(PORTFOLIO_PATH, 'utf-8'));

    // Flatten portfolio structure
    let repos: PortfolioRepo[] = [];
    if (portfolioData.portfolio) {
        Object.values(portfolioData.portfolio).forEach((category: any) => {
            Object.values(category).forEach((subCategory: any) => {
                if (Array.isArray(subCategory)) {
                    repos = repos.concat(subCategory);
                }
            });
        });
    }

    console.log(`Found ${repos.length} repositories.`);

    const interfaces: InterfaceEntry[] = [];

    // 2. Detect Interfaces (Heuristics)
    for (const repo of repos) {
        // Heuristic: Supabase
        if (repo.source && repo.source.includes('supabase') || repo.description.toLowerCase().includes('supabase')) {
            interfaces.push({
                id: `${repo.repoName}-supabase`,
                repo_name: repo.repoName,
                type: 'database_connection',
                details: 'Supabase (PostgreSQL)'
            });
        }

        // Heuristic: API
        if (repo.repoName.toLowerCase().includes('api') || repo.description.toLowerCase().includes('api')) {
            interfaces.push({
                id: `${repo.repoName}-rest-api`,
                repo_name: repo.repoName,
                type: 'rest_api',
                details: 'REST API Endpoint'
            });
        }

        // Heuristic: OpenAI
        if (repo.description.toLowerCase().includes('openai') || repo.description.toLowerCase().includes('gpt')) {
            interfaces.push({
                id: `${repo.repoName}-openai`,
                repo_name: repo.repoName,
                type: 'cloud_service',
                details: 'OpenAI API'
            });
        }
    }

    console.log(`Detected ${interfaces.length} interfaces.`);

    // 3. Generate YAML
    let yamlContent = `registry_version: 1.0\ngenerated_at: "${new Date().toISOString()}"\ninterfaces:\n`;
    for (const iface of interfaces) {
        yamlContent += `  - id: "${iface.id}"\n    repo_name: "${iface.repo_name}"\n    type: "${iface.type}"\n    details: "${iface.details}"\n`;
    }

    fs.writeFileSync(REGISTRY_PATH, yamlContent);
    console.log(`Written registry to ${REGISTRY_PATH}`);

    // 4. Sync to DB
    console.log('Syncing to Database...');
    for (const iface of interfaces) {
        // Find repo first
        const repo = await prisma.repository.findFirst({
            where: { name: iface.repo_name }
        });

        if (repo) {
            await prisma.interface.create({
                data: {
                    repositoryId: repo.id,
                    type: iface.type,
                    details: iface.details,
                    direction: 'OUTGOING' // Assumption for now
                }
            });
        } else {
            console.warn(`Repo ${iface.repo_name} not found in DB, skipping interface sync.`);
        }
    }

    console.log('Database sync complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
