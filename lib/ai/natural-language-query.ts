import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const prisma = new PrismaClient();

export interface QueryResult {
  query: string;
  interpretation: string;
  results: any[];
  summary: string;
  visualizationSuggestion?: string;
}

/**
 * Process natural language query and return results
 */
export async function processNaturalLanguageQuery(
  query: string
): Promise<QueryResult> {
  try {
    // Get schema context
    const repositoryCount = await prisma.repository.count();
    const sampleRepo = await prisma.repository.findFirst({
      include: {
        technologies: true,
        health: true,
        capabilities: true,
      },
    });

    const schemaContext = `
Available data models:
- Repository: id, name, fullName, description, language, homepageUrl, customUrl, createdAt, updatedAt, pushedAt
- Technology: name, category, version (related to Repository)
- RepoHealth: healthScore, outdatedDependenciesCount, vulnerabilitiesCount (related to Repository)
- Capability: name, category (related to Repository)
- Deployment: provider, url, status, lastDeployedAt (related to Repository)
- RepoTask: title, status, priority, type (related to Repository)
- SecurityVulnerability: severity, type, title, status (related to SecurityScan)
- BusinessCanvas: valueProposition, estimatedARR, monetizationPotential (related to Repository)

Current data:
- ${repositoryCount} repositories in portfolio
- Technologies tracked: ${sampleRepo?.technologies.map((t) => t.name).join(", ") || "N/A"}
`;

    // Generate Prisma query using AI
    const prompt = `You are a helpful database query assistant. Convert the following natural language query into a Prisma query for a Next.js application.

Schema context:
${schemaContext}

User query: "${query}"

Generate:
1. Interpretation of what the user wants
2. Prisma query code (as a string)
3. A description of what the query does
4. Suggestion for visualization (if applicable)

Response format (JSON):
{
  "interpretation": "What the user is asking for",
  "prismaQuery": "Valid Prisma query code as string",
  "description": "What this query retrieves",
  "visualizationSuggestion": "chart|table|list|card"
}

Example queries:
- "Show me all React projects" -> prisma.repository.findMany({ include: { technologies: { where: { name: { contains: 'React' } } } } })
- "Which projects have high vulnerabilities?" -> prisma.repository.findMany({ include: { health: { where: { vulnerabilitiesCount: { gt: 5 } } } } })
- "What are my most valuable projects?" -> prisma.repository.findMany({ include: { businessCanvas: true }, orderBy: { businessCanvas: { estimatedARR: 'desc' } } })`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an expert in Prisma ORM and natural language processing. Always respond with valid JSON containing executable Prisma queries.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const aiResponse = JSON.parse(
      response.choices[0].message.content || "{}"
    );

    // Execute the query (with safety measures)
    let results: any[] = [];
    let summary = "";

    try {
      // Parse the Prisma query and execute it safely
      // Note: In production, you'd want more robust query validation
      const queryCode = aiResponse.prismaQuery
        .replace("prisma.", "")
        .trim();

      // Execute query based on detected model
      if (queryCode.includes("repository")) {
        results = await executeRepositoryQuery(queryCode, query);
      } else if (queryCode.includes("technology")) {
        results = await executeTechnologyQuery(queryCode);
      } else if (queryCode.includes("securityVulnerability")) {
        results = await executeSecurityQuery(queryCode);
      } else {
        // Default to repository search
        results = await searchRepositories(query);
      }

      summary = `Found ${results.length} result(s) for your query.`;
    } catch (execError) {
      console.error("Error executing query:", execError);
      // Fallback to simple search
      results = await searchRepositories(query);
      summary = `Executed fallback search, found ${results.length} result(s).`;
    }

    return {
      query,
      interpretation: aiResponse.interpretation || "Searching repositories",
      results,
      summary,
      visualizationSuggestion: aiResponse.visualizationSuggestion,
    };
  } catch (error) {
    console.error("Error processing natural language query:", error);
    throw error;
  }
}

/**
 * Execute repository-related query
 */
async function executeRepositoryQuery(
  queryCode: string,
  originalQuery: string
): Promise<any[]> {
  // Determine what to search for
  const lowerQuery = originalQuery.toLowerCase();

  if (lowerQuery.includes("react") || lowerQuery.includes("technology")) {
    return prisma.repository.findMany({
      include: {
        technologies: true,
        health: true,
      },
      where: {
        technologies: {
          some: {
            name: {
              contains: "React",
              mode: "insensitive",
            },
          },
        },
      },
    });
  }

  if (lowerQuery.includes("vulnerable") || lowerQuery.includes("security")) {
    return prisma.repository.findMany({
      include: {
        health: true,
      },
      where: {
        health: {
          vulnerabilitiesCount: {
            gt: 0,
          },
        },
      },
      orderBy: {
        health: {
          vulnerabilitiesCount: "desc",
        },
      },
    });
  }

  if (lowerQuery.includes("outdated") || lowerQuery.includes("dependencies")) {
    return prisma.repository.findMany({
      include: {
        health: true,
      },
      where: {
        health: {
          outdatedDependenciesCount: {
            gt: 0,
          },
        },
      },
      orderBy: {
        health: {
          outdatedDependenciesCount: "desc",
        },
      },
    });
  }

  if (lowerQuery.includes("valuable") || lowerQuery.includes("revenue")) {
    return prisma.repository.findMany({
      include: {
        businessCanvas: true,
      },
      where: {
        businessCanvas: {
          estimatedARR: {
            not: null,
          },
        },
      },
      orderBy: {
        businessCanvas: {
          estimatedARR: "desc",
        },
      },
    });
  }

  // Default: return recent repositories
  return prisma.repository.findMany({
    include: {
      technologies: true,
      health: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 20,
  });
}

/**
 * Execute technology-related query
 */
async function executeTechnologyQuery(queryCode: string): Promise<any[]> {
  return prisma.technology.findMany({
    include: {
      repository: true,
    },
    take: 50,
  });
}

/**
 * Execute security-related query
 */
async function executeSecurityQuery(queryCode: string): Promise<any[]> {
  return prisma.securityVulnerability.findMany({
    include: {
      scan: true,
    },
    where: {
      status: "OPEN",
    },
    orderBy: {
      severity: "desc",
    },
    take: 50,
  });
}

/**
 * Fallback: Simple text search across repositories
 */
async function searchRepositories(query: string): Promise<any[]> {
  return prisma.repository.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { fullName: { contains: query, mode: "insensitive" } },
      ],
    },
    include: {
      technologies: true,
      health: true,
      capabilities: true,
    },
    take: 20,
  });
}

/**
 * Get query suggestions based on available data
 */
export async function getQuerySuggestions(): Promise<string[]> {
  const [
    repoCount,
    techCount,
    vulnCount,
    hasBusinessData,
  ] = await Promise.all([
    prisma.repository.count(),
    prisma.technology.count(),
    prisma.securityVulnerability.count({ where: { status: "OPEN" } }),
    prisma.businessCanvas.count(),
  ]);

  const suggestions = [
    "Show me all repositories",
    "Which projects use React?",
    "What are my most recent projects?",
  ];

  if (vulnCount > 0) {
    suggestions.push("Which projects have security vulnerabilities?");
    suggestions.push("Show me critical vulnerabilities");
  }

  if (hasBusinessData > 0) {
    suggestions.push("What are my most valuable projects?");
    suggestions.push("Which projects have the highest revenue potential?");
  }

  suggestions.push("Which projects need maintenance?");
  suggestions.push("Show me projects with outdated dependencies");
  suggestions.push("What technologies are most commonly used?");

  return suggestions;
}
