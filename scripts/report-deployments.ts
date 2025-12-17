
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const deployments = await prisma.deployment.findMany({
        include: { repository: true },
        orderBy: { lastDeployedAt: 'desc' }
    });

    console.log(`\n📊 Deployment Report (${deployments.length} found)\n`);

    // Group by Provider
    const byProvider: Record<string, any[]> = {};
    const successCount = deployments.filter(d => d.status === 'READY' || d.status === 'success' || d.status === 'Active').length;
    const failureCount = deployments.filter(d => d.status === 'ERROR' || d.status === 'failure' || d.status === 'CANCELED').length;

    deployments.forEach(d => {
        const prov = d.provider.split(':')[0]; // Group GitHub:production as GitHub
        if (!byProvider[prov]) byProvider[prov] = [];
        byProvider[prov].push(d);
    });

    console.log(`📈 Summary:`);
    console.log(`   Total:   ${deployments.length}`);
    console.log(`   Active/Success: ✅ ${successCount}`);
    console.log(`   Failed/Error:   ❌ ${failureCount}`);
    console.log(`\n---------------------------------------------------`);

    for (const [provider, deps] of Object.entries(byProvider)) {
        console.log(`\n☁️  ${provider} (${deps.length})`);
        console.log(`   ${"Repository".padEnd(30)} | ${"Status".padEnd(10)} | ${"Last Deployed"}`);
        console.log(`   ${"-".repeat(65)}`);

        deps.slice(0, 15).forEach(d => {
            const date = d.lastDeployedAt ? d.lastDeployedAt.toISOString().split('T')[0] : 'N/A';
            const statusIcon = (d.status === 'READY' || d.status === 'success') ? '✅' :
                (d.status === 'ERROR' || d.status === 'failure') ? '❌' : 'ℹ️ ';

            console.log(`   ${d.repository.name.substring(0, 30).padEnd(30)} | ${statusIcon} ${d.status?.substring(0, 8).padEnd(6)} | ${date}`);
        });
        if (deps.length > 15) console.log(`   ... and ${deps.length - 15} more`);
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
