
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

async function findCnameRecord(target: string, zones: any[]) {
    // Clean target (remove https://, trailing slash)
    const cleanTarget = target.replace(/^https?:\/\//, '').replace(/\/$/, '');

    // We have to search in all zones because we don't know which one it belongs to
    // Optimization: In a real large scale, we might guess the zone from the domain if we knew it, 
    // but here we are looking for a CNAME *value* that matches our Vercel URL.

    // We search across all zones for a CNAME record where 'content' == cleanTarget

    for (const zone of zones) {
        try {
            const url = `${BASE_URL}/zones/${zone.id}/dns_records?type=CNAME&content=${cleanTarget}&match=all`;
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`, 'Content-Type': 'application/json' },
            });
            const data = await res.json();

            if (data.success && data.result.length > 0) {
                return data.result[0]; // Return the first match
            }
        } catch (e) {
            console.error(`Error searching zone ${zone.name}:`, e.message);
        }
    }
    return null;
}

async function main() {
    console.log('🔗 Linking Deployments to DNS Records...');

    if (!CLOUDFLARE_API_TOKEN) {
        console.error('❌ CLOUDFLARE_API_TOKEN is not set.');
        process.exit(1);
    }

    // 1. Get all repos with Vercel deployments
    const repos = await prisma.repository.findMany({
        where: {
            deployments: {
                some: {
                    provider: 'vercel' // or just check if URL contains vercel.app
                }
            }
        },
        include: {
            deployments: true
        }
    });

    console.log(`Found ${repos.length} repositories with deployments.`);

    // 2. Fetch all Cloudflare Zones (once)
    console.log('Fetching Cloudflare Zones...');
    const zones = await getZones();
    console.log(`Found ${zones.length} zones.`);

    let linkedCount = 0;

    // 3. Iterate and check
    for (const repo of repos) {
        // Find best deployment (e.g. with vercel.app)
        const deployment = repo.deployments.find(d => d.url && d.url.includes('vercel.app'));

        if (!deployment || !deployment.url) {
            console.log(`Skipping ${repo.name}: No valid Vercel deployment found.`);
            continue;
        }

        const targetUrl = deployment.url;
        console.log(`Checking DNS for ${repo.name} (${targetUrl})...`);

        const dnsRecord = await findCnameRecord(targetUrl, zones);

        if (dnsRecord) {
            console.log(`   ✅ Found CNAME: ${dnsRecord.name} -> ${dnsRecord.content}`);

            // Link it! 
            // We update 'customUrl' AND maybe we could add a Deployment entry for the custom domain if we wanted,
            // but updating customUrl is the primary goal for the "Live Link".

            if (repo.customUrl !== `https://${dnsRecord.name}`) {
                await prisma.repository.update({
                    where: { id: repo.id },
                    data: {
                        customUrl: `https://${dnsRecord.name}`
                    }
                });
                console.log(`   🔄 Updated Repository customUrl.`);
                linkedCount++;
            } else {
                console.log(`   (Already linked)`);
            }
        } else {
            console.log(`   ❌ No CNAME found pointing to this deployment.`);
        }

        // Rate limit kindness
        await new Promise(r => setTimeout(r, 200));
    }

    console.log(`\n🎉 Done! Linked ${linkedCount} repositories to their matching DNS records.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
