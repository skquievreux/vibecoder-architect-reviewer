import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN?.replace(/^Bearer\s+/i, '');
const BASE_URL = 'https://api.cloudflare.com/client/v4';

async function getZones() {
    const res = await fetch(`${BASE_URL}/zones`, {
        headers: { 'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`, 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!data.success) throw new Error('Failed to fetch zones: ' + JSON.stringify(data.errors));
    return data.result;
}

async function getAllDnsRecords(zones: any[]) {
    const allRecords = [];
    for (const zone of zones) {
        const res = await fetch(`${BASE_URL}/zones/${zone.id}/dns_records`, {
            headers: { 'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`, 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        if (data.success) {
            allRecords.push(...data.result.map(record => ({ ...record, zone_name: zone.name })));
        }
    }
    return allRecords;
}

async function createUnlockYourSongRepo() {
    console.log('🎵 Creating Unlock Your Song repository...');
    
    // Check if repository already exists
    const existingRepo = await prisma.repository.findFirst({
        where: { name: 'unlock-your-song' }
    });
    
    if (existingRepo) {
        console.log('   ✅ Repository already exists');
        return existingRepo;
    }
    
    // Create the repository
    const repo = await prisma.repository.create({
        data: {
            name: 'unlock-your-song',
            fullName: 'Unlock Your Song',
            nameWithOwner: 'quievreux/unlock-your-song',
            url: 'https://unlock-your-song.vercel.app',
            description: 'Unlock Your Song - Music Platform',
            isPrivate: false,
            deployments: {
                create: {
                    provider: 'vercel',
                    url: 'https://unlock-your-song.vercel.app',
                    status: 'active'
                }
            }
        },
        include: {
            deployments: true
        }
    });
    
    console.log(`   ✅ Created repository: ${repo.name}`);
    return repo;
}

async function main() {
    console.log('🔗 Setting up Unlock Your Song and other missing projects...');

    if (!CLOUDFLARE_API_TOKEN) {
        console.error('❌ CLOUDFLARE_API_TOKEN is not set.');
        process.exit(1);
    }

    // 1. Create Unlock Your Song repository
    const unlockYourSongRepo = await createUnlockYourSongRepo();

    // 2. Get all DNS records
    const zones = await getZones();
    const dnsRecords = await getAllDnsRecords(zones);
    
    console.log(`Found ${dnsRecords.length} DNS records in ${zones.length} zones.\n`);

    // 3. Define all unlock-your-song related projects and their expected domains
    const unlockSongProjects = [
        {
            repoName: 'unlock-your-song',
            expectedDomains: ['go.unlock-your-song.de'],
            vercelUrl: 'https://unlock-your-song.vercel.app'
        },
        
        {
            repoName: 'playlist-generator',
            expectedDomains: ['playlist-generator.unlock-your-song.de'],
            vercelUrl: 'https://playlist-generator.vercel.app'
        },
        {
            repoName: 'artify',
            expectedDomains: ['artify.unlock-your-song.de'],
            vercelUrl: 'https://artify.vercel.app'
        },
        {
            repoName: 'visual-story',
            expectedDomains: ['visual-story.unlock-your-song.de'],
            vercelUrl: 'https://visual-story.vercel.app'
        },
        {
            repoName: 'admin',
            expectedDomains: ['admin.unlock-your-song.de'],
            vercelUrl: 'https://admin.vercel.app'
        }
    ];

    // 4. Create missing repositories and link DNS
    let linkedCount = 0;

    for (const project of unlockSongProjects) {
        console.log(`\n📁 ${project.repoName}`);
        
        // Get or create repository
        let repo = await prisma.repository.findFirst({
            where: { name: project.repoName },
            include: { deployments: true }
        });

        if (!repo) {
            console.log(`   🆕 Creating repository: ${project.repoName}`);
            repo = await prisma.repository.create({
                data: {
                    name: project.repoName,
                    fullName: project.repoName,
                    nameWithOwner: `quievreux/${project.repoName}`,
                    url: project.vercelUrl,
                    description: `${project.repoName} - Part of Unlock Your Song ecosystem`,
                    isPrivate: false,
                    deployments: {
                        create: {
                            provider: 'vercel',
                            url: project.vercelUrl,
                            status: 'active'
                        }
                    }
                },
                include: { deployments: true }
            });
        }

        // Find matching DNS records
        const matchingRecords = dnsRecords.filter(record =>
            project.expectedDomains.includes(record.name) && record.type === 'CNAME'
        );

        if (matchingRecords.length > 0) {
            const bestMatch = matchingRecords[0];
            const customUrl = `https://${bestMatch.name}`;
            
            console.log(`   ✅ Found DNS: ${bestMatch.name} -> ${bestMatch.content}`);
            console.log(`   🔗 Setting customUrl to: ${customUrl}`);
            
            await prisma.repository.update({
                where: { id: repo.id },
                data: { customUrl }
            });
            
            linkedCount++;
        } else {
            console.log(`   ❌ No DNS record found for: ${project.expectedDomains.join(', ')}`);
        }
    }

    // 5. Also handle the missing vercel projects without DNS
    const missingProjects = ['techeroes-quiz', 'inspect-sync-scribe', 'screenshotgallerysystem'];
    
    console.log('\n🔍 Checking missing Vercel projects...');
    
    for (const projectName of missingProjects) {
        const repo = await prisma.repository.findFirst({
            where: { name: projectName },
            include: { deployments: true }
        });
        
        if (repo && !repo.customUrl) {
            console.log(`📁 ${projectName}`);
            console.log(`   ⚠️  No DNS match found, keeping Vercel URL only`);
            
            const deployment = repo.deployments.find(d => d.url?.includes('vercel.app'));
            if (deployment) {
                // Set the Vercel URL as customUrl as fallback
                await prisma.repository.update({
                    where: { id: repo.id },
                    data: { customUrl: deployment.url }
                });
                console.log(`   🔗 Setting customUrl to Vercel URL: ${deployment.url}`);
                linkedCount++;
            }
        }
    }

    console.log(`\n🎉 Done! Linked ${linkedCount} repositories to DNS records or Vercel URLs.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });