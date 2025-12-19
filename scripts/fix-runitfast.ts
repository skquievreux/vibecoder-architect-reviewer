import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔧 Korrigiere doppelte Run It Fast Domain-Zuordnungen...');

    // Get all repos with runitfast.xyz custom URLs
    const repos = await prisma.repository.findMany({
        where: {
            customUrl: {
                contains: 'runitfast.xyz'
            }
        },
        include: {
            deployments: true
        }
    });

    console.log(`Found ${repos.length} repositories with runitfast.xyz domains.`);

    // Fix duplicates and ensure proper mapping
    const domainMappings = {
        'heldenquiz': 'heldenquiz.runitfast.xyz',
        'comicgenerator': 'comicgenerator.runitfast.xyz',
        'comicgenerator-techeroes': 'techeroes.runitfast.xyz', // Different domain
        'shader': 'shader.runitfast.xyz',
        'vibecoder-architect-reviewer': 'vibecode.runitfast.xyz',
        'visualimagecomposer': 'visualimage.runitfast.xyz',
        'kitools': 'kitools.runitfast.xyz',
        'transkriptor': 'transkriptor.runitfast.xyz',
        'karbendrop': 'karbendrop.runitfast.xyz',
        'soundbowl': 'soundbowl.runitfast.xyz',
        'svg': 'svg.runitfast.xyz',
        'voice': 'voice.runitfast.xyz',
        'voicestage': 'voicestage.runitfast.xyz',
        'runninggame': 'runninggame.runitfast.xyz',
        'quievreux': 'quievreux.runitfast.xyz',
        'techeroes': 'techeroes.runitfast.xyz',
        'clipsync': 'clipsync.runitfast.xyz',
        'dreamedit': 'dreamedit.runitfast.xyz',
        'artify': 'artify.runitfast.xyz',
        'visualstory': 'visual-story.runitfast.xyz'
    };

    for (const repo of repos) {
        const deployment = repo.deployments.find(d => d.url?.includes('vercel.app'));
        
        if (!deployment || !deployment.url) {
            console.log(`Skipping ${repo.name}: No Vercel deployment found.`);
            continue;
        }

        const expectedDomain = domainMappings[repo.name as keyof typeof domainMappings];
        
        if (expectedDomain) {
            const correctCustomUrl = `https://${expectedDomain}`;
            
            if (repo.customUrl !== correctCustomUrl) {
                console.log(`🔧 ${repo.name}: ${repo.customUrl} → ${correctCustomUrl}`);
                
                await prisma.repository.update({
                    where: { id: repo.id },
                    data: { customUrl: correctCustomUrl }
                });
            } else {
                console.log(`✅ ${repo.name}: Already correct (${repo.customUrl})`);
            }
        } else {
            console.log(`⚠️  ${repo.name}: No domain mapping found, keeping current URL`);
        }
    }

    console.log('\n🎉 Domain-Zuordnungen korrigiert!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });