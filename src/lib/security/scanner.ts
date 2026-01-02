import { exec } from "child_process";
import { promisify } from "util";
import { notifyAdmins } from "../notifications";
import prisma from "@/lib/prisma";

const execAsync = promisify(exec);

export interface ScanResult {
  scanId: string;
  vulnerabilities: Vulnerability[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface Vulnerability {
  severity: string;
  type: string;
  title: string;
  description: string;
  affectedPackage?: string;
  currentVersion?: string;
  fixedVersion?: string;
  cveId?: string;
  cvssScore?: number;
}

/**
 * Scan a repository for dependency vulnerabilities using npm audit
 */
export async function scanDependencies(
  repositoryId: string,
  repoPath?: string
): Promise<ScanResult> {
  const scan = await prisma.securityScan.create({
    data: {
      repositoryId,
      scanType: "DEPENDENCY",
      status: "RUNNING",
    },
  });

  try {
    const vulnerabilities: Vulnerability[] = [];

    // If repoPath is provided, run npm audit
    if (repoPath) {
      try {
        const { stdout } = await execAsync(`cd ${repoPath} && npm audit --json`, {
          timeout: 60000,
        });

        const auditResult = JSON.parse(stdout);

        // Parse npm audit results
        if (auditResult.vulnerabilities) {
          for (const [packageName, vulnData] of Object.entries(
            auditResult.vulnerabilities as any
          )) {
            const vuln = vulnData as any;
            vulnerabilities.push({
              severity: vuln.severity?.toUpperCase() || "MEDIUM",
              type: "DEPENDENCY",
              title: `${packageName} vulnerability`,
              description: vuln.via?.[0]?.title || "Vulnerability detected",
              affectedPackage: packageName,
              currentVersion: vuln.range,
              fixedVersion: vuln.fixAvailable?.version,
              cveId: vuln.via?.[0]?.cve?.[0],
              cvssScore: vuln.via?.[0]?.cvss?.score,
            });
          }
        }
      } catch (error: any) {
        // npm audit returns non-zero exit code if vulnerabilities found
        if (error.stdout) {
          const auditResult = JSON.parse(error.stdout);
          if (auditResult.vulnerabilities) {
            for (const [packageName, vulnData] of Object.entries(
              auditResult.vulnerabilities as any
            )) {
              const vuln = vulnData as any;
              vulnerabilities.push({
                severity: vuln.severity?.toUpperCase() || "MEDIUM",
                type: "DEPENDENCY",
                title: `${packageName} vulnerability`,
                description: vuln.via?.[0]?.title || "Vulnerability detected",
                affectedPackage: packageName,
                currentVersion: vuln.range,
                fixedVersion: vuln.fixAvailable?.version,
                cveId: vuln.via?.[0]?.cve?.[0],
                cvssScore: vuln.via?.[0]?.cvss?.score,
              });
            }
          }
        }
      }
    }

    // Calculate summary
    const summary = {
      total: vulnerabilities.length,
      critical: vulnerabilities.filter((v) => v.severity === "CRITICAL").length,
      high: vulnerabilities.filter((v) => v.severity === "HIGH").length,
      medium: vulnerabilities.filter((v) => v.severity === "MEDIUM").length,
      low: vulnerabilities.filter((v) => v.severity === "LOW").length,
    };

    // Save vulnerabilities to database
    await Promise.all(
      vulnerabilities.map((vuln) =>
        prisma.securityVulnerability.create({
          data: {
            scanId: scan.id,
            severity: vuln.severity,
            type: vuln.type,
            title: vuln.title,
            description: vuln.description,
            affectedPackage: vuln.affectedPackage,
            currentVersion: vuln.currentVersion,
            fixedVersion: vuln.fixedVersion,
            cveId: vuln.cveId,
            cvssScore: vuln.cvssScore,
          },
        })
      )
    );

    // Update scan status
    await prisma.securityScan.update({
      where: { id: scan.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        summary: JSON.stringify(summary),
      },
    });

    // Notify admins if critical or high vulnerabilities found
    if (summary.critical > 0 || summary.high > 0) {
      await notifyAdmins({
        type: "SECURITY",
        severity: summary.critical > 0 ? "CRITICAL" : "HIGH",
        title: "Critical security vulnerabilities detected",
        message: `Found ${summary.critical} critical and ${summary.high} high severity vulnerabilities in repository scan`,
        metadata: { scanId: scan.id, summary },
        link: `/security?scan=${scan.id}`,
      });
    }

    return {
      scanId: scan.id,
      vulnerabilities,
      summary,
    };
  } catch (error) {
    console.error("Error scanning dependencies:", error);

    await prisma.securityScan.update({
      where: { id: scan.id },
      data: {
        status: "FAILED",
        completedAt: new Date(),
      },
    });

    throw error;
  }
}

/**
 * Calculate security score for a repository (0-100)
 */
export async function calculateSecurityScore(repositoryId: string): Promise<number> {
  // Get latest scan
  const latestScan = await prisma.securityScan.findFirst({
    where: {
      repositoryId,
      status: "COMPLETED",
    },
    orderBy: { startedAt: "desc" },
    include: {
      vulnerabilities: {
        where: { status: "OPEN" },
      },
    },
  });

  if (!latestScan) {
    return 100; // No scan performed yet, assume secure
  }

  const vulnerabilities = latestScan.vulnerabilities;

  // Calculate penalty points based on vulnerability severity
  let penaltyPoints = 0;
  vulnerabilities.forEach((vuln) => {
    switch (vuln.severity) {
      case "CRITICAL":
        penaltyPoints += 25;
        break;
      case "HIGH":
        penaltyPoints += 15;
        break;
      case "MEDIUM":
        penaltyPoints += 5;
        break;
      case "LOW":
        penaltyPoints += 1;
        break;
    }
  });

  // Calculate score (max penalty of 100 points)
  const score = Math.max(0, 100 - Math.min(penaltyPoints, 100));

  return Math.round(score);
}

/**
 * Get security status for a repository
 */
export async function getSecurityStatus(repositoryId: string) {
  const [latestScan, openVulnerabilities, score] = await Promise.all([
    prisma.securityScan.findFirst({
      where: { repositoryId },
      orderBy: { startedAt: "desc" },
      include: {
        vulnerabilities: {
          where: { status: "OPEN" },
        },
      },
    }),
    prisma.securityVulnerability.count({
      where: {
        scan: { repositoryId },
        status: "OPEN",
      },
    }),
    calculateSecurityScore(repositoryId),
  ]);

  return {
    latestScan,
    openVulnerabilities,
    score,
    status:
      score >= 90
        ? "EXCELLENT"
        : score >= 75
          ? "GOOD"
          : score >= 50
            ? "FAIR"
            : "POOR",
  };
}
