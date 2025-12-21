import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface VercelProject {
    id: string;
    name: string;
    link?: {
        type: string;
        repo?: string;
    };
    targets?: {
        production?: {
            url: string;
            alias?: string[];
            readyState?: string;
            createdAt?: string;
        };
    };
}

interface VercelDomain {
    id: string;
    name: string;
    verified: boolean;
    createdAt: string;
}

const VERCEL_TOKEN = process.env.VERCEL_API_TOKEN;

async function fetchWithAuth(url: string): Promise<any> {
    if (!VERCEL_TOKEN) throw new Error('VERCEL_API_TOKEN is not set');
    
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${VERCEL_TOKEN}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(`API Error: ${response.status} - ${error.message || 'Unknown error'}`);
    }
    
    return response.json();
}

async function getVercelProjects(): Promise<VercelProject[]> {
    console.log('📡 Fetching Vercel projects...');
    
    try {
        const data = await fetchWithAuth('https://api.vercel.com/v9/projects');
        console.log(`   Found ${data.projects?.length || 0} projects`);
        return data.projects || [];
    } catch (error) {
        console.error('   ❌ Failed to fetch projects:', error);
        return [];
    }
}

async function getVercelDomains(projectId: string): Promise<VercelDomain[]> {
    try {
        const data = await fetchWithAuth(`https://api.vercel.com/v9/projects/${projectId}/domains`);
        return data.domains || [];
    } catch (error) {
        console.error(`   ❌ Failed to fetch domains for project ${projectId}:`, error);
        return [];
    }
}

async function findRepository(project: VercelProject): Promise<any> {
    // Method 1: Exact GitHub repo match
    if (project.link?.repo) {
        const repo = await prisma.repository.findFirst({
            where: { nameWithOwner: project.link.repo }
        });
        if (repo) return repo;
    }
    
    // Method 2: Name match
    const repoByName = await prisma.repository.findFirst({
        where: { name: project.name }
    });
    if (repoByName) return repoByName;
    
    // Method 3: Partial name match (for names like "heldenquiz" vs "heldenquiz-app")
    const repoByPartialName = await prisma.repository.findFirst({
        where: { 
            name: { 
                contains: project.name.split('-')[0].toLowerCase() 
            } 
        }
    });
    if (repoByPartialName) return repoByPartialName;
    
    return null;
}

async function createOrUpdateDeployment(repoId: string, project: VercelProject) {
    const productionTarget = project.targets?.production;
    
    if (!productionTarget) {
        console.log(`   ⚠️  No production target for project ${project.name}`);
        return null;
    }
    
    // Determine best URL
    let deploymentUrl = productionTarget.url;
    
    // Prefer .vercel.app alias if available
    if (productionTarget.alias) {
        const vercelAlias = productionTarget.alias.find(alias => alias.includes('.vercel.app'));
        if (vercelAlias) deploymentUrl = `https://${vercelAlias}`;
        else if (productionTarget.alias[0]) deploymentUrl = `https://${productionTarget.alias[0]}`;
    }
    
    // Clean URL format
    if (!deploymentUrl.startsWith('https://')) {
        deploymentUrl = `https://${deploymentUrl}`;
    }
    
    // Update or create deployment
    const existingDeployment = await prisma.deployment.findFirst({
        where: { repositoryId: repoId, provider: 'vercel' }
    });
    
    if (existingDeployment) {
        await prisma.deployment.update({
            where: { id: existingDeployment.id },
            data: {
                url: deploymentUrl,
                status: productionTarget.readyState || 'READY',
                lastDeployedAt: new Date(productionTarget.createdAt || Date.now())
            }
        });
        console.log(`   ✅ Updated deployment: ${deploymentUrl}`);
    } else {
        await prisma.deployment.create({
            data: {
                repositoryId: repoId,
                provider: 'vercel',
                url: deploymentUrl,
                status: productionTarget.readyState || 'READY',
                lastDeployedAt: new Date(productionTarget.createdAt || Date.now())
            }
        });
        console.log(`   ✅ Created deployment: ${deploymentUrl}`);
    }
    
    return deploymentUrl;
}

async function updateCustomDomains(repoId: string, projectId: string, repoName: string) {
    try {
        const domains = await getVercelDomains(projectId);
        const customDomains = domains.filter(d => d.verified && !d.name.endsWith('.vercel.app'));
        
        if (customDomains.length > 0) {
            const primaryDomain = customDomains[0];
            const customUrl = `https://${primaryDomain.name}`;
            
            await prisma.repository.update({
                where: { id: repoId },
                data: { customUrl }
            });
            
            console.log(`   🔗 Linked custom domain: ${customUrl}`);
            return customUrl;
        }
    } catch (error) {
        console.error(`   ❌ Failed to fetch domains for ${repoName}:`, error);
    }
    
    return null;
}

async function main() {
    console.log('🚀 Enhanced Vercel Deployment Synchronization...');
    
    try {
        const projects = await getVercelProjects();
        if (projects.length === 0) {
            console.log('❌ No projects found. Please check VERCEL_API_TOKEN.');
            return;
        }
        
        let syncedCount = 0;
        let domainLinkedCount = 0;
        
        for (const project of projects) {
            console.log(`\n📁 Processing project: ${project.name}`);
            
            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const repo = await findRepository(project);
            
            if (!repo) {
                console.log(`   ❌ No matching repository found for project ${project.name}`);
                continue;
            }
            
            console.log(`   📋 Found repository: ${repo.name} (ID: ${repo.id})`);
            
            // Handle deployment
            const deploymentUrl = await createOrUpdateDeployment(repo.id, project);
            
            if (deploymentUrl) {
                syncedCount++;
                
                // Handle custom domains
                const customUrl = await updateCustomDomains(repo.id, project.id, repo.name);
                if (customUrl) domainLinkedCount++;
            }
        }
        
        console.log(`\n🎉 Synchronization complete!`);
        console.log(`   ✅ Deployments synchronized: ${syncedCount}/${projects.length}`);
        console.log(`   🔗 Custom domains linked: ${domainLinkedCount}`);
        
    } catch (error) {
        console.error('❌ Synchronization failed:', error);
        process.exit(1);
    }
    
    await prisma.$disconnect();
}

main().catch(console.error);