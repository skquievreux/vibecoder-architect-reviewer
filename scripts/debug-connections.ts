
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkConnections() {
    try {
        console.log('Checking database connection status...');

        // Query pg_stat_activity to see active connections
        const connections = await prisma.$queryRaw`
      SELECT count(*)::int as count, state, application_name 
      FROM pg_stat_activity 
      GROUP BY state, application_name;
    `;

        console.log('--- Connection Stats ---');
        console.table(connections);

        // Get max connections setting
        const maxConn = await prisma.$queryRaw`SHOW max_connections;`;
        console.log('Max Connections settings:', maxConn);

    } catch (error: any) {
        console.error('FAILED to connect or query:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkConnections();
