import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  processNaturalLanguageQuery,
  getQuerySuggestions,
} from "@/lib/ai/natural-language-query";

// GET - Get query suggestions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const suggestions = await getQuerySuggestions();

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Error fetching query suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}

// POST - Process natural language query
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const result = await processNaturalLanguageQuery(query);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error processing natural language query:", error);
    return NextResponse.json(
      { error: "Failed to process query" },
      { status: 500 }
    );
  }
}
