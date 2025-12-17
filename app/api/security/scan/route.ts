import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, hasPermission } from "@/lib/auth";
import { scanDependencies } from "@/lib/security/scanner";
import prisma from "@/lib/prisma";

// GET - Fetch security scans
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const repositoryId = searchParams.get("repositoryId");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = {};

    if (repositoryId) {
      where.repositoryId = repositoryId;
    }

    if (status) {
      where.status = status;
    }

    const scans = await prisma.securityScan.findMany({
      where,
      orderBy: { startedAt: "desc" },
      take: limit,
      include: {
        vulnerabilities: {
          where: { status: "OPEN" },
        },
      },
    });

    return NextResponse.json(scans);
  } catch (error) {
    console.error("Error fetching security scans:", error);
    return NextResponse.json(
      { error: "Failed to fetch security scans" },
      { status: 500 }
    );
  }
}

// POST - Trigger a new security scan
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only developers and admins can trigger scans
    if (!hasPermission((session.user as any).role, "DEVELOPER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { repositoryId, repoPath } = body;

    if (!repositoryId) {
      return NextResponse.json(
        { error: "Missing repositoryId" },
        { status: 400 }
      );
    }

    // Verify repository exists
    const repository = await prisma.repository.findUnique({
      where: { id: repositoryId },
    });

    if (!repository) {
      return NextResponse.json(
        { error: "Repository not found" },
        { status: 404 }
      );
    }

    // Start scan in background
    const result = await scanDependencies(repositoryId, repoPath);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error triggering security scan:", error);
    return NextResponse.json(
      { error: "Failed to trigger security scan" },
      { status: 500 }
    );
  }
}
