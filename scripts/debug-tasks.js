const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Debugging Repositories and Tasks...");

    const unknownRepos = await prisma.repository.findMany({
        where: { name: 'Unknown Repo' },
        include: { tasks: true }
    });

    console.log(`Found ${unknownRepos.length} repositories named 'Unknown Repo'.`);

    for (const repo of unknownRepos) {
        console.log(`- ID: ${repo.id}, URL: ${repo.url}`);
        console.log(`  Tasks: ${repo.tasks.length}`);
        repo.tasks.forEach(t => console.log(`    - [${t.status}] ${t.title}`));
    }

    const allTasks = await prisma.repoTask.findMany({
        where: { status: 'OPEN' },
        include: { repository: true }
    });

    console.log(`\nTotal Open Tasks: ${allTasks.length}`);
    const tasksByRepo = {};
    allTasks.forEach(t => {
        const name = t.repository ? t.repository.name : 'NULL_REPO';
        tasksByRepo[name] = (tasksByRepo[name] || 0) + 1;
    });
    console.table(tasksByRepo);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
