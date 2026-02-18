import DashboardClient from "@/app/components/DashboardClient";
import { getRepositories } from "@/lib/repositories";

export default async function Page() {
    const repos = await getRepositories();
    return <DashboardClient initialRepos={repos} />;
}
