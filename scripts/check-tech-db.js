const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTechnologies() {
    const techs = await prisma.technology.findMany({
        where: {
            name: {
                in: ['React', 'react', 'Next.js', 'next', 'NextJS']
            }
        },
        include: {
            repository: {
                select: {
                    name: true
                }
            }
        },
        take: 20
    });

    console.log(`Found ${techs.length} React/Next.js entries in database:\n`);

    if (techs.length > 0) {
        console.table(techs.map(t => ({
            Repository: t.repository.name,
            Technology: t.name,
            Version: t.version || 'N/A',
            Category: t.category || 'N/A'
        })));
    } else {
        console.log('❌ No React/Next.js technologies found in database!');
        console.log('The Technology table might be empty or not synced.');
    }

    await prisma.$disconnect();
}

checkTechnologies().catch(console.error);
