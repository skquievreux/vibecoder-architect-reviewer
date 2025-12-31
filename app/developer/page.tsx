import prisma from "@/lib/prisma";
import DeveloperPortalClient from './DeveloperPortalClient';

export const dynamic = 'force-dynamic';

export default async function DeveloperPortal() {
    const repos = await prisma.repository.findMany({
        orderBy: { name: 'asc' }
    });

    const serializedRepos = repos.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description,
        apiSpec: r.apiSpec,
        isPrivate: r.isPrivate
    }));

    return <DeveloperPortalClient repositories={serializedRepos} />;
}
