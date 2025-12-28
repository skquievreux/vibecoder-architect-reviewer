
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const deployments = await prisma.deployment.findMany({
        include: { repository: { include: { technologies: true } } },
        orderBy: { lastDeployedAt: 'desc' }
    });

    // Analyze Repository Sources for Deployments
    const deployConnections = deployments.map(d => ({
        repoName: d.repository.name,
        repoUrl: d.repository.url,
        isLocal: d.repository.url.startsWith('local://'),
        provider: d.provider
    }));

    const localDeploys = deployConnections.filter(d => d.isLocal);
    const githubDeploys = deployConnections.filter(d => d.repoUrl.includes('github.com'));

    console.log(`\n🔍 Data Source Analysis:`);
    console.log(`   Total Deployments: ${deployments.length}`);
    console.log(`   Linked to GitHub Repos: ${githubDeploys.length}`);
    console.log(`   Linked to Local Folders: ${localDeploys.length}`);

    if (localDeploys.length > 0) {
        console.log(`   ⚠️  Warning: Found ${localDeploys.length} deployments linked to local-only folders. These might be duplicates.`);
    }

    // Filter mainly for the detailed report if desired, but for now just show categorization
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
        console.log(`   ${"Deployment".padEnd(30)} | ${"Host".padEnd(10)} | ${"Status".padEnd(10)} | ${"Vulnerable React".padEnd(20)} | ${"Nachweis (Proof)"}`);
        console.log(`   ${"-".repeat(100)}`);

        deps.slice(0, 15).forEach(d => {
            const date = d.lastDeployedAt ? d.lastDeployedAt.toISOString().split('T')[0] : 'N/A';
            const statusIcon = (d.status === 'READY' || d.status === 'active' || d.status === 'success') ? '✅' :
                (d.status === 'ERROR' || d.status === 'failure') ? '🔴' : 'ℹ️ ';

            // Find React version
            const reactTech = d.repository.technologies?.find((t: any) => t.name.toLowerCase() === 'react');
            const reactVersion = reactTech?.version || '?';
            // Vulnerability Logic (Based on CVE-2025-55182)
            // React < 19.2.1 is vulnerable if on v19 branch. 
            // React < 18.3.1 is vulnerable if on v18 branch.
            let isVulnerable = false;
            const cleanVersion = reactVersion.replace(/^[\^~]/, '');

            if (cleanVersion.startsWith('19')) {
                // Check if smaller than 19.2.1
                // distinct comparison roughly:
                if (cleanVersion === '19.0.0' || cleanVersion.startsWith('19.0') ||
                    cleanVersion === '19.1.0' || cleanVersion.startsWith('19.1') ||
                    cleanVersion === '19.2.0') {
                    isVulnerable = true;
                }
            } else if (cleanVersion.startsWith('18')) {
                if (cleanVersion !== '18.3.1' && !cleanVersion.startsWith('18.3')) {
                    isVulnerable = true;
                }
            }

            const reactDisplay = isVulnerable ? `${reactVersion} 🔴` : `${reactVersion} ✅`;

            // Verification
            const verification = d.verificationStatus === 'VERIFIED' ? '✅ Verified' :
                d.verificationProof ? `📝 ${d.verificationProof.substring(0, 15)}...` : '❌ Missing';

            console.log(`   ${d.repository.name.substring(0, 30).padEnd(30)} | ${"Vercel".padEnd(10)} | ${statusIcon} ${d.status?.substring(0, 8).padEnd(6)} | ${reactDisplay.padEnd(20)} | ${verification}`);
        });
        if (deps.length > 15) console.log(`   ... and ${deps.length - 15} more`);
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
