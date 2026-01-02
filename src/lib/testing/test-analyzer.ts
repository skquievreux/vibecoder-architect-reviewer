import prisma from "@/lib/prisma";

export interface TestRunParams {
  repositoryId: string;
  branch?: string;
  commitSha?: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  coverage?: number;
  duration?: number;
  results: TestResultData[];
}

export interface TestResultData {
  testName: string;
  filePath?: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  duration?: number;
  errorMessage?: string;
  errorStack?: string;
}

/**
 * Record a test run
 */
export async function recordTestRun(params: TestRunParams): Promise<string> {
  const {
    repositoryId,
    branch,
    commitSha,
    totalTests,
    passedTests,
    failedTests,
    skippedTests,
    coverage,
    duration,
    results,
  } = params;

  try {
    const testRun = await prisma.testRun.create({
      data: {
        repositoryId,
        branch,
        commitSha,
        status:
          failedTests > 0
            ? "FAILED"
            : passedTests > 0
              ? "PASSED"
              : "SKIPPED",
        totalTests,
        passedTests,
        failedTests,
        skippedTests,
        coverage,
        duration,
        completedAt: new Date(),
      },
    });

    // Record individual test results
    await Promise.all(
      results.map((result) =>
        prisma.testResult.create({
          data: {
            testRunId: testRun.id,
            testName: result.testName,
            filePath: result.filePath,
            status: result.status,
            duration: result.duration,
            errorMessage: result.errorMessage,
            errorStack: result.errorStack,
          },
        })
      )
    );

    // Calculate flaky scores
    await updateFlakyScores(testRun.repositoryId);

    return testRun.id;
  } catch (error) {
    console.error("Error recording test run:", error);
    throw error;
  }
}

/**
 * Detect flaky tests
 */
export async function detectFlakyTests(repositoryId: string) {
  try {
    // Get recent test runs
    const recentRuns = await prisma.testRun.findMany({
      where: {
        repositoryId,
        completedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      include: {
        results: true,
      },
      orderBy: { startedAt: "desc" },
      take: 50,
    });

    // Track test name outcomes
    const testOutcomes = new Map<
      string,
      Array<{ status: string; date: Date }>
    >();

    recentRuns.forEach((run) => {
      run.results.forEach((result) => {
        if (!testOutcomes.has(result.testName)) {
          testOutcomes.set(result.testName, []);
        }
        testOutcomes
          .get(result.testName)!
          .push({ status: result.status, date: run.startedAt });
      });
    });

    // Calculate flaky scores
    const flakyTests: Array<{
      testName: string;
      flakyScore: number;
      runs: number;
      failures: number;
      passes: number;
    }> = [];

    testOutcomes.forEach((outcomes, testName) => {
      if (outcomes.length < 3) return; // Need at least 3 runs

      const passes = outcomes.filter((o) => o.status === "PASSED").length;
      const failures = outcomes.filter((o) => o.status === "FAILED").length;
      const total = outcomes.length;

      // Flaky if test has both passes and failures
      if (passes > 0 && failures > 0) {
        // Calculate flaky score: higher if failures/passes ratio is close to 50/50
        const failureRate = failures / total;
        const flakyScore =
          1 - Math.abs(0.5 - failureRate) * 2; // 0-1, higher = more flaky

        if (flakyScore > 0.3) {
          // Consider flaky if score > 0.3
          flakyTests.push({
            testName,
            flakyScore,
            runs: total,
            failures,
            passes,
          });
        }
      }
    });

    return flakyTests.sort((a, b) => b.flakyScore - a.flakyScore);
  } catch (error) {
    console.error("Error detecting flaky tests:", error);
    throw error;
  }
}

/**
 * Update flaky scores for all tests
 */
async function updateFlakyScores(repositoryId: string) {
  try {
    const flakyTests = await detectFlakyTests(repositoryId);

    // Update scores in database
    await Promise.all(
      flakyTests.map(async (test) => {
        // Find all matching test results
        const testResults = await prisma.testResult.findMany({
          where: {
            testName: test.testName,
            testRun: { repositoryId },
          },
          orderBy: { executedAt: "desc" },
          take: 10,
        });

        // Update flaky scores
        await Promise.all(
          testResults.map((result) =>
            prisma.testResult.update({
              where: { id: result.id },
              data: { flakyScore: test.flakyScore },
            })
          )
        );
      })
    );
  } catch (error) {
    console.error("Error updating flaky scores:", error);
  }
}

/**
 * Get test coverage trends
 */
export async function getCoverageTrends(repositoryId: string, days: number = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const testRuns = await prisma.testRun.findMany({
    where: {
      repositoryId,
      startedAt: { gte: startDate },
      coverage: { not: null },
    },
    orderBy: { startedAt: "asc" },
    select: {
      startedAt: true,
      coverage: true,
      totalTests: true,
      passedTests: true,
      failedTests: true,
    },
  });

  return testRuns.map((run) => ({
    date: run.startedAt,
    coverage: run.coverage,
    passRate: (run.passedTests / run.totalTests) * 100,
  }));
}

/**
 * Get test statistics for a repository
 */
export async function getTestStatistics(repositoryId: string) {
  const [latestRun, totalRuns, avgCoverage, flakyTests] = await Promise.all([
    prisma.testRun.findFirst({
      where: { repositoryId },
      orderBy: { startedAt: "desc" },
      include: { results: true },
    }),
    prisma.testRun.count({ where: { repositoryId } }),
    prisma.testRun.aggregate({
      where: { repositoryId, coverage: { not: null } },
      _avg: { coverage: true },
    }),
    detectFlakyTests(repositoryId),
  ]);

  return {
    latestRun,
    totalRuns,
    averageCoverage: avgCoverage._avg.coverage || 0,
    flakyTestCount: flakyTests.length,
    flakyTests: flakyTests.slice(0, 10), // Top 10 flaky tests
  };
}
