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

async function testProductionApi() {
    try {
        console.log('🧪 Testing production API connectivity...');
        
        // Test data for pilot
        const testData = {
            repoName: "DevVault",
            nameWithOwner: "skquievreux/DevVault",
            repoUrl: "https://github.com/skquievreux/DevVault",
            description: "Pilot repository for enhanced sync testing",
            isPrivate: true,
            apiSpec: JSON.stringify({
                openapi: "3.0.0",
                info: { title: "DevVault API", version: "1.0.0" },
                paths: { "/api/projects": { get: { summary: "Get all projects" } } }
            }),
            packageJson: {
                engines: { node: ">=20.9.0" },
                dependencies: { react: "^19.2.3", next: "^16.1.0" },
                framework: "Next.js"
            },
            fileStructure: ["vercel.json"],
            metadata: {
                framework: "Next.js",
                detectedDeployments: ["Vercel"],
                gitBranch: "main",
                gitCommit: "pilot-test",
                runId: "pilot-run-001",
                timestamp: new Date().toISOString()
            }
        };

        const response = await fetch('https://vibecode.runitfast.xyz/api/system/ingest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'dashboard-master-2024'
            },
            body: JSON.stringify(testData)
        });

        const result = await response.json();
        
        if (response.ok && result.success) {
            console.log('✅ Production API test successful!');
            console.log('📊 Repository created/updated:', result.repoId);
            
            // Verify in database
            const repository = await prisma.repository.findUnique({
                where: { id: result.repoId },
                include: {
                    technologies: true,
                    deployments: true,
                    interfaces: true
                }
            });
            
            if (repository) {
                console.log('\n🔍 Database Verification:');
                console.log(`  - Name: ${repository.nameWithOwner}`);
                console.log(`  - API Spec: ${repository.apiSpec ? '✅' : '❌'}`);
                console.log(`  - Technologies: ${repository.technologies.length}`);
                console.log(`  - Deployments: ${repository.deployments.length}`);
                console.log(`  - Last Updated: ${repository.updatedAt}`);
            }
        } else {
            console.error('❌ Production API test failed:', result.error);
            console.error('HTTP Status:', response.status);
        }
        
        await prisma.$disconnect();
        
    } catch (error) {
        console.error('💥 Production API test error:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

testProductionApi();