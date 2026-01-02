import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, hasPermission } from "@/lib/auth";
import { reviewCode, getCodeReviewHistory } from "@/lib/ai/code-reviewer";

// GET - Get code review history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const repositoryId = searchParams.get("repositoryId");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!repositoryId) {
      return NextResponse.json(
        { error: "Missing repositoryId" },
        { status: 400 }
      );
    }

    const history = await getCodeReviewHistory(repositoryId, limit);

    return NextResponse.json(history);
  } catch (error) {
    console.error("Error fetching code review history:", error);
    return NextResponse.json(
      { error: "Failed to fetch code review history" },
      { status: 500 }
    );
  }
}

// POST - Trigger code review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission((session.user as any).role, "DEVELOPER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { repositoryId, code, prNumber, commitSha, language } = body;

    if (!repositoryId || !code) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await reviewCode({
      repositoryId,
      code,
      prNumber,
      commitSha,
      language,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error performing code review:", error);
    return NextResponse.json(
      { error: "Failed to perform code review" },
      { status: 500 }
    );
  }
}
