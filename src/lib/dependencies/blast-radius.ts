import prisma from "@/lib/prisma";

export interface BlastRadiusResult {
  packageName: string;
  version: string;
  affectedRepositories: string[];
  dependentPackages: string[];
  riskLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  estimatedImpact: {
    repositoryCount: number;
    downstreamDependencies: number;
    updateComplexity: number; // 1-10
  };
}

/**
 * Analyze the blast radius of updating a package
 */
export async function analyzeBlastRadius(
  packageName: string,
  newVersion?: string
): Promise<BlastRadiusResult> {
  try {
    // Find all dependencies with this package name
    const dependencies = await prisma.dependencyNode.findMany({
      where: { packageName },
      include: {
        dependents: {
          include: {
            source: true,
          },
        },
      },
    });

    const affectedRepositories = new Set<string>();
    const dependentPackages = new Set<string>();

    // Traverse dependency graph
    for (const dep of dependencies) {
      affectedRepositories.add(dep.repositoryId);

      // Get all packages that depend on this one
      for (const dependent of dep.dependents) {
        dependentPackages.add(dependent.source.packageName);
        affectedRepositories.add(dependent.source.repositoryId);
      }
    }

    const repoCount = affectedRepositories.size;
    const depCount = dependentPackages.size;

    // Calculate risk level based on impact
    let riskLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    if (repoCount > 20 || depCount > 50) {
      riskLevel = "CRITICAL";
    } else if (repoCount > 10 || depCount > 20) {
      riskLevel = "HIGH";
    } else if (repoCount > 5 || depCount > 10) {
      riskLevel = "MEDIUM";
    } else {
      riskLevel = "LOW";
    }

    // Calculate update complexity (1-10)
    const updateComplexity = Math.min(
      10,
      Math.ceil((repoCount + depCount / 5) / 3)
    );

    return {
      packageName,
      version: dependencies[0]?.version || "unknown",
      affectedRepositories: Array.from(affectedRepositories),
      dependentPackages: Array.from(dependentPackages),
      riskLevel,
      estimatedImpact: {
        repositoryCount: repoCount,
        downstreamDependencies: depCount,
        updateComplexity,
      },
    };
  } catch (error) {
    console.error("Error analyzing blast radius:", error);
    throw error;
  }
}

/**
 * Get dependency graph for visualization
 */
export async function getDependencyGraph(repositoryId?: string) {
  const where = repositoryId ? { repositoryId } : {};

  const nodes = await prisma.dependencyNode.findMany({
    where,
    include: {
      dependencies: {
        include: {
          target: true,
        },
      },
      dependents: {
        include: {
          source: true,
        },
      },
    },
  });

  // Transform to graph format
  const graphNodes = nodes.map((node) => ({
    id: node.id,
    label: `${node.packageName}@${node.version}`,
    packageName: node.packageName,
    version: node.version,
    isOutdated: node.isOutdated,
    hasVulnerability: node.hasVulnerability,
    type: node.type,
  }));

  const edges = nodes.flatMap((node) =>
    node.dependencies.map((dep) => ({
      source: node.id,
      target: dep.targetId,
      versionRange: dep.versionRange,
    }))
  );

  return { nodes: graphNodes, edges };
}
