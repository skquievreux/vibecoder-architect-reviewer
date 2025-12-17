import OpenAI from "openai";
import prisma from "@/lib/prisma";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface CodeReviewResult {
  reviewId: string;
  securityScore: number;
  qualityScore: number;
  findings: CodeFinding[];
  suggestions: CodeSuggestion[];
  summary: string;
}

export interface CodeFinding {
  type: "security" | "performance" | "maintainability" | "style";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  location?: {
    file: string;
    line?: number;
  };
  suggestion?: string;
}

export interface CodeSuggestion {
  category: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
}

/**
 * Perform AI-powered code review
 */
export async function reviewCode(params: {
  repositoryId: string;
  code?: string;
  prNumber?: number;
  commitSha?: string;
  language?: string;
}): Promise<CodeReviewResult> {
  const { repositoryId, code, prNumber, commitSha, language } = params;

  try {
    // Prepare context for AI
    const context = {
      repository: await prisma.repository.findUnique({
        where: { id: repositoryId },
        include: {
          technologies: true,
        },
      }),
      code,
      prNumber,
      commitSha,
      language,
    };

    // Generate code review using OpenAI
    const prompt = `You are an expert code reviewer. Analyze the following code and provide a comprehensive review:

Repository: ${context.repository?.name || "Unknown"}
Language: ${language || "Unknown"}
Technologies: ${context.repository?.technologies.map((t) => t.name).join(", ") || "N/A"}

Code to review:
\`\`\`${language || ""}
${code || "No code provided"}
\`\`\`

Please provide:
1. Security issues (critical vulnerabilities, common pitfalls)
2. Performance concerns (inefficient algorithms, resource usage)
3. Code quality issues (maintainability, readability, best practices)
4. Specific suggestions for improvement

Format your response as JSON with the following structure:
{
  "securityScore": number (0-100),
  "qualityScore": number (0-100),
  "findings": [
    {
      "type": "security|performance|maintainability|style",
      "severity": "critical|high|medium|low",
      "title": "Finding title",
      "description": "Detailed description",
      "suggestion": "How to fix"
    }
  ],
  "suggestions": [
    {
      "category": "Category name",
      "title": "Suggestion title",
      "description": "Detailed description",
      "impact": "high|medium|low"
    }
  ],
  "summary": "Overall assessment"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an expert code reviewer specializing in security, performance, and code quality. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(
      response.choices[0].message.content || "{}"
    );

    // Save review to database
    const review = await prisma.aICodeReview.create({
      data: {
        repositoryId,
        prNumber,
        commitSha,
        language,
        analysis: JSON.stringify(analysis.findings || []),
        suggestions: JSON.stringify(analysis.suggestions || []),
        securityScore: analysis.securityScore || 0,
        qualityScore: analysis.qualityScore || 0,
      },
    });

    return {
      reviewId: review.id,
      securityScore: analysis.securityScore || 0,
      qualityScore: analysis.qualityScore || 0,
      findings: analysis.findings || [],
      suggestions: analysis.suggestions || [],
      summary: analysis.summary || "Code review completed",
    };
  } catch (error) {
    console.error("Error performing code review:", error);
    throw error;
  }
}

/**
 * Get code review history for a repository
 */
export async function getCodeReviewHistory(
  repositoryId: string,
  limit: number = 10
) {
  return prisma.aICodeReview.findMany({
    where: { repositoryId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Analyze code patterns across multiple repositories
 */
export async function analyzeCodePatterns(repositoryIds: string[]) {
  const reviews = await prisma.aICodeReview.findMany({
    where: {
      repositoryId: { in: repositoryIds },
    },
    orderBy: { createdAt: "desc" },
  });

  const analysis = {
    totalReviews: reviews.length,
    averageSecurityScore:
      reviews.reduce((acc, r) => acc + (r.securityScore || 0), 0) /
      reviews.length,
    averageQualityScore:
      reviews.reduce((acc, r) => acc + (r.qualityScore || 0), 0) /
      reviews.length,
    commonIssues: [] as any[],
  };

  // Extract common findings
  const findingsMap = new Map<string, number>();
  reviews.forEach((review) => {
    try {
      const findings = JSON.parse(review.analysis);
      findings.forEach((finding: any) => {
        const key = `${finding.type}:${finding.title}`;
        findingsMap.set(key, (findingsMap.get(key) || 0) + 1);
      });
    } catch (e) {
      // Skip invalid JSON
    }
  });

  // Convert to sorted array
  analysis.commonIssues = Array.from(findingsMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([key, count]) => ({
      issue: key.split(":")[1],
      type: key.split(":")[0],
      occurrences: count,
    }));

  return analysis;
}
