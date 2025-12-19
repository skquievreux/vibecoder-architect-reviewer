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

async function main() {
    console.log('🔍 Analyzing DNS Records for Vercel Deployments...');

    if (!CLOUDFLARE_API_TOKEN) {
        console.error('❌ CLOUDFLARE_API_TOKEN is not set.');
        process.exit(1);
    }

    // Get repositories with deployments
    const repos = await prisma.repository.findMany({
        where: {
            deployments: {
                some: {
                    provider: 'vercel'
                }
            }
        },
        include: {
            deployments: true
        }
    });

    console.log(`Found ${repos.length} repositories with deployments.`);
    console.log('Fetching all DNS Records...');
    
    const zones = await getZones();
    const dnsRecords = await getAllDnsRecords(zones);
    
    console.log(`Found ${dnsRecords.length} DNS records in ${zones.length} zones.\n`);

    // Print DNS records that look like Vercel domains
    console.log('📋 DNS Records potentially related to Vercel:');
    const vercelRelatedRecords = dnsRecords.filter(record => 
        record.content?.includes('vercel') || 
        record.name?.includes('unlock-your-song') ||
        record.name?.includes('melody-maker') ||
        record.name?.includes('heldenquiz') ||
        record.name?.includes('techeroes')
    );
    
    vercelRelatedRecords.forEach(record => {
        console.log(`  ${record.type}: ${record.name} -> ${record.content} (Zone: ${record.zone_name})`);
    });

    // Try to match repositories with DNS records
    console.log('\n🔗 Attempting to match repositories with DNS records...');
    let linkedCount = 0;

    for (const repo of repos) {
        const deployment = repo.deployments.find(d => d.url && d.url.includes('vercel.app'));
        
        if (!deployment || !deployment.url) {
            console.log(`Skipping ${repo.name}: No valid Vercel deployment found.`);
            continue;
        }

        // Extract the Vercel subdomain
        const vercelSubdomain = deployment.url.replace(/^https?:\/\//, '').replace(/\.vercel\.app.*$/, '');
        
        // Look for DNS records that might match this repo
        const matchingRecords = dnsRecords.filter(record => 
            record.name?.includes(repo.name.toLowerCase()) ||
            record.name?.includes('unlock-your-song') ||
            record.name?.includes('melody-maker') ||
            (record.content?.includes('vercel') && record.content?.includes(vercelSubdomain))
        );

        console.log(`\n📁 ${repo.name} (${deployment.url})`);
        console.log(`   Vercel subdomain: ${vercelSubdomain}`);
        
        if (matchingRecords.length > 0) {
            console.log(`   ✅ Found ${matchingRecords.length} matching DNS records:`);
            matchingRecords.forEach(record => {
                console.log(`      ${record.type}: ${record.name} -> ${record.content}`);
            });
            
            // Use the first match to update customUrl
            const bestMatch = matchingRecords[0];
            const customUrl = bestMatch.type === 'CNAME' ? `https://${bestMatch.name}` : `https://${bestMatch.name}`;
            
            if (repo.customUrl !== customUrl) {
                await prisma.repository.update({
                    where: { id: repo.id },
                    data: { customUrl }
                });
                console.log(`   🔄 Updated customUrl to: ${customUrl}`);
                linkedCount++;
            } else {
                console.log(`   ✅ CustomUrl already set correctly`);
            }
        } else {
            console.log(`   ❌ No matching DNS records found`);
        }
    }

    console.log(`\n🎉 Done! Linked ${linkedCount} repositories to DNS records.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });