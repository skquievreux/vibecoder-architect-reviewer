const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const prisma = new PrismaClient();

// Configuration
const TEMP_DIR = path.join(os.tmpdir(), 'task-verification');

async function main() {
    console.log("Starting Task Verification...");

    // 1. Fetch all OPEN tasks
    const tasks = await prisma.repoTask.findMany({
        where: { status: 'OPEN' },
        include: { repository: true }
    });

    console.log(`Found ${tasks.length} open tasks.`);

    if (tasks.length === 0) {
        console.log("No open tasks to verify.");
        return;
    }

    if (!fs.existsSync(TEMP_DIR)) {
        fs.mkdirSync(TEMP_DIR);
    }

    let verifiedCount = 0;

    // Group tasks by repo to avoid re-cloning
    const tasksByRepo = {};
    for (const task of tasks) {
        if (!tasksByRepo[task.repository.name]) {
            tasksByRepo[task.repository.name] = {
                repo: task.repository,
                tasks: []
            };
        }
        tasksByRepo[task.repository.name].tasks.push(task);
    }

    for (const repoName in tasksByRepo) {
        const { repo, tasks } = tasksByRepo[repoName];
        const repoPath = path.join(TEMP_DIR, repoName);

        console.log(`Checking ${repoName}...`);

        try {
            // Cleanup
            if (fs.existsSync(repoPath)) {
                fs.rmSync(repoPath, { recursive: true, force: true });
            }

            // Clone
            try {
                execSync(`git clone --depth 1 ${repo.url} ${repoPath}`, { stdio: 'ignore' });
            } catch (cloneError) {
                console.log(`  - Skipped: Clone failed for ${repo.url}`);
                continue;
            }

            const packageJsonPath = path.join(repoPath, 'package.json');
            if (!fs.existsSync(packageJsonPath)) {
                continue;
            }

            const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            const deps = { ...pkg.dependencies, ...pkg.devDependencies };

            console.log(`  - Versions: Node=${pkg.engines?.node}, Next=${deps.next}, React=${deps.react}`);

            for (const task of tasks) {
                let isCompleted = false;
                const title = task.title.toLowerCase();

                // Heuristics
                if (title.includes('node') && title.includes('20')) {
                    if (pkg.engines && pkg.engines.node && (pkg.engines.node.includes('20') || pkg.engines.node.includes('>=20'))) {
                        isCompleted = true;
                    }
                } else if (title.includes('typescript') && title.includes('5.8')) {
                    if (deps.typescript && deps.typescript.includes('5.8')) {
                        isCompleted = true;
                    }
                } else if (title.includes('supabase') && title.includes('2.49')) {
                    if (deps['@supabase/supabase-js'] && deps['@supabase/supabase-js'].includes('2.49')) {
                        isCompleted = true;
                    }
                } else if (title.includes('next.js') && title.includes('16')) {
                    if (deps.next && (deps.next.includes('16.') || deps.next.includes('^16'))) {
                        isCompleted = true;
                    }
                } else if (title.includes('react') && title.includes('19.2')) {
                    if (deps.react && (deps.react.includes('19.2') || deps.react.includes('^19.2'))) {
                        isCompleted = true;
                    }
                } else if (title.includes('beschreibung') || title.includes('description')) {
                    if (pkg.description && pkg.description.length > 5) {
                        isCompleted = true;
                    }
                }

                // console.log(`    - Checking "${task.title}" -> ${isCompleted ? 'DONE' : 'PENDING'}`);
                console.log(`    - Task: "${task.title}" -> ${isCompleted ? 'DONE' : 'PENDING'}`);

                if (isCompleted) {
                    console.log(`  ✅ Verified: ${task.title}`);
                    await prisma.repoTask.update({
                        where: { id: task.id },
                        data: { status: 'COMPLETED', updatedAt: new Date().toISOString() }
                    });
                    verifiedCount++;
                }
            }

        } catch (e) {
            // console.error(`  ❌ Error checking ${repoName}: ${e.message}`);
        }
    }

    console.log(`\nVerification Complete. Verified ${verifiedCount} tasks.`);

    // Cleanup
    if (fs.existsSync(TEMP_DIR)) {
        fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
