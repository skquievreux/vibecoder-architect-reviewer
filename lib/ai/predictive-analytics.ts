import OpenAI from "openai";
import prisma from "@/lib/prisma";
import { getAIClient, getModel } from "@/lib/ai/core";

export type PredictionType =
  | "MAINTENANCE_NEEDED"
  | "CHURN_RISK"
  | "COST_TREND"
  | "SECURITY_RISK"
  | "TECHNICAL_DEBT";

export interface Prediction {
  predictionId: string;
  type: PredictionType;
  confidence: number;
  prediction: any;
  targetDate: Date;
  recommendations: string[];
}

/**
 * Predict maintenance needs for a repository
 */
export async function predictMaintenanceNeeds(
  repositoryId: string
): Promise<Prediction> {
  try {
    const repository = await prisma.repository.findUnique({
      where: { id: repositoryId },
      include: {
        health: true,
        technologies: true,
        tasks: {
          where: { status: "OPEN" },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!repository) {
      throw new Error("Repository not found");
    }

    // Gather historical data
    const healthSnapshots = await prisma.healthSnapshot.findMany({
      where: { date: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } },
      orderBy: { date: "asc" },
    });

    // Prepare context for AI
    const context = {
      repository: {
        name: repository.name,
        lastUpdated: repository.pushedAt,
        health: repository.health,
        technologies: repository.technologies,
        openTasks: repository.tasks.length,
      },
      trends: {
        healthScore: healthSnapshots.map((s) => s.healthScore),
        outdatedDeps: healthSnapshots.map((s) => s.outdatedDependenciesCount),
        vulnerabilities: healthSnapshots.map((s) => s.vulnerabilitiesCount),
      },
    };

    const prompt = `You are a predictive analytics expert for software repositories. Analyze the following data and predict maintenance needs:

Repository: ${context.repository.name}
Last Updated: ${context.repository.lastUpdated}
Current Health Score: ${context.repository.health?.healthScore || "N/A"}
Open Tasks: ${context.repository.openTasks}
Outdated Dependencies: ${context.repository.health?.outdatedDependenciesCount || 0}
Vulnerabilities: ${context.repository.health?.vulnerabilitiesCount || 0}

Historical Trends (last 90 days):
- Health scores: ${context.trends.healthScore.join(", ")}
- Outdated dependencies: ${context.trends.outdatedDeps.join(", ")}
- Vulnerabilities: ${context.trends.vulnerabilities.join(", ")}

Based on this data, provide:
1. Confidence level (0-1) that maintenance will be needed in the next 30 days
2. Specific predictions about what will need attention
3. Recommended actions to prevent issues
4. Estimated time to address issues

Format your response as JSON:
{
  "confidence": number (0-1),
  "maintenanceNeeded": boolean,
  "predictions": [
    {
      "area": "dependencies|security|performance|bugs",
      "likelihood": number (0-1),
      "description": "What will likely happen",
      "timeline": "days until issue"
    }
  ],
  "recommendations": [
    "Specific action to take"
  ],
  "estimatedHours": number
}`;

    const response = await getAIClient().chat.completions.create({
      model: getModel(),
      messages: [
        {
          role: "system",
          content:
            "You are a predictive analytics expert for software maintenance. Always respond with valid JSON.",
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

    // Save prediction
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 30);

    const prediction = await prisma.predictiveAnalytics.create({
      data: {
        repositoryId,
        predictionType: "MAINTENANCE_NEEDED",
        confidence: analysis.confidence || 0,
        prediction: JSON.stringify(analysis),
        targetDate,
      },
    });

    return {
      predictionId: prediction.id,
      type: "MAINTENANCE_NEEDED",
      confidence: analysis.confidence || 0,
      prediction: analysis,
      targetDate,
      recommendations: analysis.recommendations || [],
    };
  } catch (error) {
    console.error("Error predicting maintenance needs:", error);
    throw error;
  }
}

/**
 * Predict repository churn risk
 */
export async function predictChurnRisk(repositoryId: string): Promise<Prediction> {
  try {
    const repository = await prisma.repository.findUnique({
      where: { id: repositoryId },
      include: {
        deployments: {
          orderBy: { lastDeployedAt: "desc" },
          take: 10,
        },
      },
    });

    if (!repository) {
      throw new Error("Repository not found");
    }

    const daysSinceLastPush = repository.pushedAt
      ? Math.floor(
        (Date.now() - new Date(repository.pushedAt).getTime()) /
        (1000 * 60 * 60 * 24)
      )
      : 9999;

    const hasRecentDeployments =
      repository.deployments.some(
        (d) =>
          d.lastDeployedAt &&
          new Date(d.lastDeployedAt).getTime() >
          Date.now() - 30 * 24 * 60 * 60 * 1000
      ) || false;

    const prompt = `Analyze the churn risk for this repository:

Name: ${repository.name}
Days since last push: ${daysSinceLastPush}
Has recent deployments: ${hasRecentDeployments}
Homepage URL: ${repository.homepageUrl || "None"}

Predict:
1. Likelihood (0-1) that this repository will be abandoned
2. Risk factors contributing to churn
3. Recommendations to maintain activity

Response format (JSON):
{
  "confidence": number (0-1),
  "churnRisk": "low|medium|high",
  "riskFactors": ["factor1", "factor2"],
  "recommendations": ["action1", "action2"],
  "suggestedAction": "consolidate|maintain|archive"
}`;

    const response = await getAIClient().chat.completions.create({
      model: getModel(),
      messages: [
        {
          role: "system",
          content: "You are an expert in software project management and churn analysis.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(response.choices[0].message.content || "{}");

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 90);

    const prediction = await prisma.predictiveAnalytics.create({
      data: {
        repositoryId,
        predictionType: "CHURN_RISK",
        confidence: analysis.confidence || 0,
        prediction: JSON.stringify(analysis),
        targetDate,
      },
    });

    return {
      predictionId: prediction.id,
      type: "CHURN_RISK",
      confidence: analysis.confidence || 0,
      prediction: analysis,
      targetDate,
      recommendations: analysis.recommendations || [],
    };
  } catch (error) {
    console.error("Error predicting churn risk:", error);
    throw error;
  }
}

/**
 * Predict cost trends
 */
export async function predictCostTrend(): Promise<Prediction> {
  try {
    const costSnapshots = await prisma.costSnapshot.findMany({
      where: { date: { gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } },
      orderBy: { date: "asc" },
    });

    const costs = costSnapshots.map((s) => ({
      date: s.date,
      total: parseFloat(s.totalMonthlyCostEst?.toString() || "0"),
      supabase: parseFloat(s.supabaseCostEst?.toString() || "0"),
    }));

    const prompt = `Analyze cost trends and predict future costs:

Historical costs (last 6 months):
${costs.map((c) => `${c.date.toISOString().split("T")[0]}: $${c.total}`).join("\n")}

Provide:
1. Predicted cost for next 3 months
2. Trend analysis (increasing, decreasing, stable)
3. Cost optimization recommendations

Response format (JSON):
{
  "confidence": number (0-1),
  "trend": "increasing|decreasing|stable",
  "predictions": [
    {"month": "YYYY-MM", "estimatedCost": number}
  ],
  "recommendations": ["action1", "action2"],
  "potentialSavings": number
}`;

    const response = await getAIClient().chat.completions.create({
      model: getModel(),
      messages: [
        {
          role: "system",
          content: "You are a cloud cost optimization expert.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(response.choices[0].message.content || "{}");

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 90);

    const prediction = await prisma.predictiveAnalytics.create({
      data: {
        repositoryId: "PORTFOLIO",
        predictionType: "COST_TREND",
        confidence: analysis.confidence || 0,
        prediction: JSON.stringify(analysis),
        targetDate,
      },
    });

    return {
      predictionId: prediction.id,
      type: "COST_TREND",
      confidence: analysis.confidence || 0,
      prediction: analysis,
      targetDate,
      recommendations: analysis.recommendations || [],
    };
  } catch (error) {
    console.error("Error predicting cost trend:", error);
    throw error;
  }
}

/**
 * Get prediction history
 */
export async function getPredictionHistory(
  repositoryId?: string,
  type?: PredictionType
) {
  const where: any = {};

  if (repositoryId) {
    where.repositoryId = repositoryId;
  }

  if (type) {
    where.predictionType = type;
  }

  return prisma.predictiveAnalytics.findMany({
    where,
    orderBy: { predictionDate: "desc" },
    take: 50,
  });
}
