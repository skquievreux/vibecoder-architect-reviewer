import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function main() {
    console.log('Fetching repository metadata from GitHub...');

    try {
        const jsonStr = execSync('gh repo list --limit 100 --json id,name,homepageUrl', { encoding: 'utf-8' });
        const repos = JSON.parse(jsonStr);

        console.log(`Found ${repos.length} repositories. Updating database...`);

        for (const r of repos) {
            if (r.homepageUrl) {
                await prisma.repository.updateMany({
                    where: { name: r.name },
                    data: { homepageUrl: r.homepageUrl }
                });
                console.log(`Updated ${r.name} with homepage: ${r.homepageUrl}`);
            }
        }

        console.log('Metadata sync complete.');

    } catch (error) {
        console.error('Error fetching metadata:', error);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
