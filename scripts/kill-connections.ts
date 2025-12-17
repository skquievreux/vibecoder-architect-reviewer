
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function killAllConnections() {
    console.log('Attempting to KILL all other database connections...');
    try {
        // This query terminates all connections except the one executing this query
        const result = await prisma.$executeRawUnsafe(`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE pid <> pg_backend_pid()
      AND datname = current_database();
    `);

        console.log(`Successfully signaled kill command. Affected rows matches: ${result}`);
        console.log('Waiting 5 seconds for connections to drain...');
        await new Promise(r => setTimeout(r, 5000));
        console.log('Done.');

    } catch (error: any) {
        console.error('CRITICAL: Could not execute kill command. The database might be completely locked out.');
        console.error('Error details:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

killAllConnections();
