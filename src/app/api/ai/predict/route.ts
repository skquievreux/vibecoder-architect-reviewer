import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  predictMaintenanceNeeds,
  predictChurnRisk,
  predictCostTrend,
  getPredictionHistory,
} from "@/lib/ai/predictive-analytics";

// GET - Get prediction history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const repositoryId = searchParams.get("repositoryId");
    const type = searchParams.get("type") as any;

    const history = await getPredictionHistory(
      repositoryId || undefined,
      type
    );

    return NextResponse.json(history);
  } catch (error) {
    console.error("Error fetching predictions:", error);
    return NextResponse.json(
      { error: "Failed to fetch predictions" },
      { status: 500 }
    );
  }
}

// POST - Generate new prediction
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, repositoryId } = body;

    if (!type) {
      return NextResponse.json({ error: "Missing type" }, { status: 400 });
    }

    let result;

    switch (type) {
      case "MAINTENANCE_NEEDED":
        if (!repositoryId) {
          return NextResponse.json(
            { error: "Missing repositoryId" },
            { status: 400 }
          );
        }
        result = await predictMaintenanceNeeds(repositoryId);
        break;

      case "CHURN_RISK":
        if (!repositoryId) {
          return NextResponse.json(
            { error: "Missing repositoryId" },
            { status: 400 }
          );
        }
        result = await predictChurnRisk(repositoryId);
        break;

      case "COST_TREND":
        result = await predictCostTrend();
        break;

      default:
        return NextResponse.json(
          { error: "Invalid prediction type" },
          { status: 400 }
        );
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error generating prediction:", error);
    return NextResponse.json(
      { error: "Failed to generate prediction" },
      { status: 500 }
    );
  }
}
