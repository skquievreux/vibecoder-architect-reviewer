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
    console.log('🔍 Correctly matching repositories with DNS Records...');

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
    
    const zones = await getZones();
    const dnsRecords = await getAllDnsRecords(zones);
    
    console.log(`Found ${dnsRecords.length} DNS records in ${zones.length} zones.\n`);

    let linkedCount = 0;

    for (const repo of repos) {
        const deployment = repo.deployments.find(d => d.url && d.url.includes('vercel.app'));
        
        if (!deployment || !deployment.url) {
            console.log(`Skipping ${repo.name}: No valid Vercel deployment found.`);
            continue;
        }

        console.log(`\n📁 ${repo.name} (${deployment.url})`);

        // Exact matching strategy
        let bestMatch = null;

        // 1. Look for exact name matches
        const exactMatch = dnsRecords.find(record => 
            (record.name === repo.name.toLowerCase() && record.type === 'CNAME') ||
            (record.name === `${repo.name.toLowerCase()}.runitfast.xyz` && record.type === 'CNAME')
        );

        if (exactMatch) {
            console.log(`   ✅ Found exact match: ${exactMatch.name} -> ${exactMatch.content}`);
            bestMatch = exactMatch;
        }

        // 2. Special cases for known repositories
        if (!bestMatch) {
            const specialCases = {
                'heldenquiz': ['heldenquiz.runitfast.xyz'],
                'comicgenerator': ['comicgenerator.runitfast.xyz'],
                'shader': ['shader.runitfast.xyz'],
                'melody-maker': ['go.unlock-your-song.de'], // As mentioned by user
                'techeroes-quiz': ['evolution.unlock-your-song.de'], // Maybe?
                'visualimagecomposer': ['visualimage.runitfast.xyz'],
                'vibecoder-architect-reviewer': ['vibecode.runitfast.xyz'],
                'comicgenerator-techeroes': ['comicgenerator.runitfast.xyz'], // Fallback
                'inspect-sync-scribe': ['evolution.unlock-your-song.de'], // Maybe?
                'screenshotgallerysystem': ['evolution.unlock-your-song.de'] // Maybe?
            };

            const possibleMatches = specialCases[repo.name as keyof typeof specialCases] || [];
            
            for (const matchName of possibleMatches) {
                const specialMatch = dnsRecords.find(record => 
                    record.name === matchName && record.type === 'CNAME'
                );
                if (specialMatch) {
                    console.log(`   ✅ Found special match: ${specialMatch.name} -> ${specialMatch.content}`);
                    bestMatch = specialMatch;
                    break;
                }
            }
        }

        // Only set if we found a legitimate match
        if (bestMatch && bestMatch.content?.includes('vercel')) {
            const customUrl = `https://${bestMatch.name}`;
            
            console.log(`   🔗 Setting customUrl to: ${customUrl}`);
            
            await prisma.repository.update({
                where: { id: repo.id },
                data: { customUrl }
            });
            
            linkedCount++;
        } else if (bestMatch) {
            console.log(`   ⚠️  Found match but it's not a Vercel CNAME: ${bestMatch.name} -> ${bestMatch.content}`);
        } else {
            console.log(`   ❌ No matching DNS record found`);
        }
    }

    console.log(`\n🎉 Done! Correctly linked ${linkedCount} repositories to their DNS records.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });