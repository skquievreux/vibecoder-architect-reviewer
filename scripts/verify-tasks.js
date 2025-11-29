const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Verifying Task Management System...");

    // 1. Create or Find a Repo
    let repo = await prisma.repository.findFirst();
    if (!repo) {
        console.log("No repo found, creating dummy...");
        repo = await prisma.repository.create({
            data: {
                name: "test-repo-tasks",
                fullName: "test/test-repo-tasks",
                nameWithOwner: "test/test-repo-tasks",
                url: "https://github.com/test/test-repo-tasks",
                description: "Test Repo",
                isPrivate: false,
                updatedAt: new Date(),
                pushedAt: new Date(),
                createdAt: new Date(),
                languages: []
            }
        });
    }
    console.log(`Using Repo: ${repo.name} (${repo.id})`);

    // 2. Create a Task (Simulate AI API)
    console.log("Creating Task...");
    const taskTitle = "Verify Task Logic " + Date.now();

    // Use raw query if model not in client yet, or try standard
    try {
        await prisma.repoTask.create({
            data: {
                repositoryId: repo.id,
                title: taskTitle,
                priority: "HIGH",
                type: "SECURITY",
                status: "OPEN"
            }
        });
        console.log("Task created via Prisma Client");
    } catch (e) {
        console.log("Prisma Client failed (expected if stale), trying Raw SQL...");
        const crypto = require('crypto');
        await prisma.$executeRawUnsafe(
            'INSERT INTO RepoTask (id, repositoryId, title, status, priority, type, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            crypto.randomUUID(), repo.id, taskTitle, 'OPEN', 'HIGH', 'SECURITY', new Date().toISOString(), new Date().toISOString()
        );
        console.log("Task created via Raw SQL");
    }

    // 3. Fetch Tasks
    console.log("Fetching Tasks...");
    let tasks;
    try {
        tasks = await prisma.repoTask.findMany({ where: { repositoryId: repo.id } });
    } catch (e) {
        tasks = await prisma.$queryRawUnsafe(`SELECT * FROM RepoTask WHERE repositoryId = '${repo.id}'`);
    }

    const myTask = tasks.find(t => t.title === taskTitle);
    if (myTask) {
        console.log("✅ Task found:", myTask.title);
    } else {
        console.error("❌ Task not found!");
        process.exit(1);
    }

    // 4. Update Task
    console.log("Updating Task...");
    try {
        await prisma.repoTask.update({
            where: { id: myTask.id },
            data: { status: "COMPLETED" }
        });
    } catch (e) {
        await prisma.$executeRawUnsafe(
            'UPDATE RepoTask SET status = ?, updatedAt = ? WHERE id = ?',
            'COMPLETED', new Date().toISOString(), myTask.id
        );
    }

    console.log("✅ Task updated to COMPLETED");
    console.log("Verification Successful!");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
