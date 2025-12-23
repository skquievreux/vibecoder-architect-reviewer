import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
const envLocalPath = path.join(process.cwd(), '.env.local');
const envPath = path.join(process.cwd(), '.env');

if (fs.existsSync(envLocalPath)) {
    const envConfig = require('dotenv').parse(fs.readFileSync(envLocalPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
} else if (fs.existsSync(envPath)) {
    const envConfig = require('dotenv').parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const prisma = new PrismaClient();

async function analyzeAndExportRepositories() {
    try {
        console.log('🔍 Analyzing repository database...');
        
        // Get total statistics
        const total = await prisma.repository.count();
        const privateReposCount = await prisma.repository.count({ where: { isPrivate: true } });
        const withApiSpec = await prisma.repository.count({ where: { apiSpec: { not: null } } });
        const withInterfaces = await prisma.repository.count({
            where: { interfaces: { some: {} } }
        });
        
        console.log('\n=== REPOSITORY STATISTICS ===');
        console.log(`Total Repositories: ${total}`);
        console.log(`Private Repositories: ${privateReposCount}`);
        console.log(`With API Specs: ${withApiSpec}`);
        console.log(`With Interfaces: ${withInterfaces}`);
        console.log('============================');

        // Get all private repositories with interface count for pilot selection
        const privateRepos = await prisma.repository.findMany({
            where: { isPrivate: true },
            select: {
                name: true,
                nameWithOwner: true,
                url: true,
                language: true,
                description: true,
                updatedAt: true
            }
        });

        // Get interface counts separately
        const interfaceCounts = await prisma.interface.groupBy({
            by: ['repositoryId'],
            _count: { repositoryId: true }
        });

        const interfaceCountMap = new Map();
        interfaceCounts.forEach(item => {
            interfaceCountMap.set(item.repositoryId, item._count.repositoryId);
        });

        console.log(`\n📋 Found ${privateRepos.length} private repositories`);
        
        // Export all private repositories for full rollout
        const allReposCsv = privateRepos.map(repo => repo.nameWithOwner).join('\n');
        fs.writeFileSync('all-repositories.csv', allReposCsv);
        console.log(`✅ Exported ${privateRepos.length} repositories to all-repositories.csv`);

        // Sort by interface count and select top 10 for pilot
        const privateReposWithCounts = privateRepos.map(repo => ({
            ...repo,
            interfaceCount: interfaceCountMap.get(repo.id) || 0
        })).sort((a, b) => b.interfaceCount - a.interfaceCount);

        const pilotRepos = privateReposWithCounts.slice(0, 10);
        const pilotReposCsv = pilotRepos.map(repo => repo.nameWithOwner).join('\n');
        fs.writeFileSync('pilot-repositories.csv', pilotReposCsv);
        
        console.log(`\n🎯 SELECTED PILOT REPOSITORIES (Top 10 by interface count):`);
        pilotRepos.forEach((repo, index) => {
            console.log(`${index + 1}. ${repo.nameWithOwner}`);
            console.log(`   Language: ${repo.language || 'N/A'}`);
            console.log(`   Interfaces: ${repo.interfaceCount}`);
            console.log(`   Last Updated: ${repo.updatedAt.toLocaleDateString()}`);
            console.log('');
        });
        
        console.log(`✅ Exported ${pilotRepos.length} pilot repositories to pilot-repositories.csv`);
        
        // Generate detailed report
        const report = {
            summary: {
                total,
                private: privateReposCount,
                withApiSpec,
                withInterfaces,
                exportDate: new Date().toISOString()
            },
            pilot: pilotRepos.map(repo => ({
                nameWithOwner: repo.nameWithOwner,
                language: repo.language,
                interfaceCount: repo.interfaceCount,
                lastUpdated: repo.updatedAt
            })),
            rollout: {
                totalPrivate: privateReposCount,
                pilotCount: 10,
                remainingCount: privateReposCount - 10
            }
        };
        
        fs.writeFileSync('repository-analysis-report.json', JSON.stringify(report, null, 2));
        console.log(`📊 Generated detailed report: repository-analysis-report.json`);
        
        await prisma.$disconnect();
        return report;
        
    } catch (error) {
        console.error('❌ Error analyzing repositories:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

analyzeAndExportRepositories();