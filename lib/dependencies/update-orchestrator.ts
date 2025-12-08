import { PrismaClient } from "@prisma/client";
import { analyzeBlastRadius } from "./blast-radius";

const prisma = new PrismaClient();

export interface UpdatePlanParams {
  title: string;
  description?: string;
  packageUpdates: {
    packageName: string;
    fromVersion: string;
    toVersion: string;
  }[];
  repositoryIds: string[];
  priority?: string;
  testStrategy?: string;
  rollbackPlan?: string;
}

/**
 * Create a coordinated update plan across multiple repositories
 */
export async function createUpdatePlan(
  params: UpdatePlanParams
): Promise<string> {
  const {
    title,
    description,
    packageUpdates,
    repositoryIds,
    priority = "MEDIUM",
    testStrategy,
    rollbackPlan,
  } = params;

  try {
    // Analyze blast radius for each package
    const blastRadiusAnalysis = await Promise.all(
      packageUpdates.map((pkg) =>
        analyzeBlastRadius(pkg.packageName, pkg.toVersion)
      )
    );

    // Determine affected repos from blast radius
    const allAffectedRepos = new Set(repositoryIds);
    blastRadiusAnalysis.forEach((analysis) => {
      analysis.affectedRepositories.forEach((repo) =>
        allAffectedRepos.add(repo)
      );
    });

    // Create update plan
    const plan = await prisma.updatePlan.create({
      data: {
        title,
        description,
        priority,
        affectedRepos: JSON.stringify(Array.from(allAffectedRepos)),
        dependencies: JSON.stringify(packageUpdates),
        testStrategy: testStrategy || "Run automated tests before merge",
        rollbackPlan:
          rollbackPlan || "Revert commits and redeploy previous version",
        status: "PLANNED",
      },
    });

    // Create execution tasks for each repository
    await Promise.all(
      Array.from(allAffectedRepos).flatMap((repoId) =>
        packageUpdates.map((pkg) =>
          prisma.updateExecution.create({
            data: {
              planId: plan.id,
              repositoryId: repoId,
              packageName: pkg.packageName,
              fromVersion: pkg.fromVersion,
              toVersion: pkg.toVersion,
              status: "PENDING",
            },
          })
        )
      )
    );

    return plan.id;
  } catch (error) {
    console.error("Error creating update plan:", error);
    throw error;
  }
}

/**
 * Execute an update plan
 */
export async function executeUpdatePlan(planId: string): Promise<void> {
  try {
    const plan = await prisma.updatePlan.findUnique({
      where: { id: planId },
      include: {
        updates: true,
      },
    });

    if (!plan) {
      throw new Error("Update plan not found");
    }

    // Update plan status
    await prisma.updatePlan.update({
      where: { id: planId },
      data: {
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
    });

    // Execute updates sequentially to avoid conflicts
    for (const update of plan.updates) {
      await executeUpdate(update.id);
    }

    // Update plan status
    const completedUpdates = await prisma.updateExecution.count({
      where: { planId, status: "SUCCESS" },
    });

    const failedUpdates = await prisma.updateExecution.count({
      where: { planId, status: "FAILED" },
    });

    await prisma.updatePlan.update({
      where: { id: planId },
      data: {
        status:
          failedUpdates > 0
            ? "FAILED"
            : completedUpdates === plan.updates.length
            ? "COMPLETED"
            : "IN_PROGRESS",
        completedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error executing update plan:", error);
    throw error;
  }
}

/**
 * Execute a single update
 */
async function executeUpdate(updateId: string): Promise<void> {
  try {
    const update = await prisma.updateExecution.findUnique({
      where: { id: updateId },
    });

    if (!update) {
      throw new Error("Update not found");
    }

    await prisma.updateExecution.update({
      where: { id: updateId },
      data: {
        status: "RUNNING",
        startedAt: new Date(),
      },
    });

    // Simulate update execution (in production, this would trigger actual package updates)
    // For now, we'll mark it as successful
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await prisma.updateExecution.update({
      where: { id: updateId },
      data: {
        status: "SUCCESS",
        completedAt: new Date(),
        logs: `Updated ${update.packageName} from ${update.fromVersion} to ${update.toVersion}`,
      },
    });
  } catch (error) {
    console.error("Error executing update:", error);

    await prisma.updateExecution.update({
      where: { id: updateId },
      data: {
        status: "FAILED",
        completedAt: new Date(),
        logs: `Failed to update: ${error}`,
      },
    });
  }
}

/**
 * Get all update plans
 */
export async function getUpdatePlans(status?: string) {
  const where = status ? { status } : {};

  return prisma.updatePlan.findMany({
    where,
    include: {
      updates: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
