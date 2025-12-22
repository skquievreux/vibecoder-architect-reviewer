
import DashboardClient from "@/app/components/DashboardClient";
import { getRepositories } from "@/lib/repositories";

// This is a Server Component, so it can fetch data directly
export default async function Page() {
  // Fetch repositories directly from the database
  const repos = await getRepositories();

  return <DashboardClient initialRepos={repos} />;
}
