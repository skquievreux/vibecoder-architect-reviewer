import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function testDashboardSync() {
    try {
        console.log('🧪 Testing dashboard sync with enhanced workflow...');
        
        // Test data for our pilot repository
        const testData = {
            repoName: "DevVault",
            nameWithOwner: "skquievreux/DevVault",
            repoUrl: "https://github.com/skquievreux/DevVault",
            description: "Development vault for managing projects and resources",
            isPrivate: true,
            apiSpec: JSON.stringify({
                openapi: "3.0.0",
                info: { title: "DevVault API", version: "1.0.0" },
                paths: {
                    "/api/projects": { get: { summary: "Get all projects" } }
                }
            }),
            packageJson: {
                engines: { node: ">=20.9.0" },
                dependencies: { 
                    react: "^19.2.3",
                    next: "^16.1.0" 
                },
                framework: "Next.js"
            },
            fileStructure: ["vercel.json", "Dockerfile"],
            metadata: {
                framework: "Next.js",
                detectedDeployments: ["Vercel", "Docker"],
                gitBranch: "main",
                gitCommit: "abc123def456",
                runId: "test-run-123",
                timestamp: new Date().toISOString()
            }
        };

        console.log('📤 Sending test payload to dashboard...');
        
        // Test the API endpoint directly
        const response = await fetch('http://localhost:3000/api/system/ingest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'dashboard-master-2024' // Using master key
            },
            body: JSON.stringify(testData)
        });

        const result = await response.json();
        
        if (response.ok && result.success) {
            console.log('✅ Test successful!');
            console.log('📊 Repository created/updated:', result.repoId);
            console.log('📋 Repository details:', result.repository);
            
            // Verify the data was stored correctly
            const repository = await prisma.repository.findUnique({
                where: { id: result.repoId },
                include: {
                    technologies: true,
                    deployments: true,
                    interfaces: true
                }
            });
            
            if (repository) {
                console.log('\n🔍 Verification:');
                console.log(`  - Name: ${repository.nameWithOwner}`);
                console.log(`  - API Spec: ${repository.apiSpec ? '✅' : '❌'}`);
                console.log(`  - Technologies: ${repository.technologies.length}`);
                console.log(`  - Deployments: ${repository.deployments.length}`);
                console.log(`  - Last Updated: ${repository.updatedAt}`);
                
                repository.technologies.forEach(tech => {
                    console.log(`    - ${tech.name}: ${tech.version}`);
                });
                
                repository.deployments.forEach(deployment => {
                    console.log(`    - ${deployment.provider}: ${deployment.status}`);
                });
            }
            
        } else {
            console.error('❌ Test failed:', result.error);
            console.error('HTTP Status:', response.status);
        }
        
        await prisma.$disconnect();
        
    } catch (error) {
        console.error('💥 Test error:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

testDashboardSync();