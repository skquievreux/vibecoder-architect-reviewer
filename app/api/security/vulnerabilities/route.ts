import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Fetch vulnerabilities
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const scanId = searchParams.get("scanId");
    const severity = searchParams.get("severity");
    const status = searchParams.get("status") || "OPEN";
    const limit = parseInt(searchParams.get("limit") || "100");

    const where: any = {};

    if (scanId) {
      where.scanId = scanId;
    }

    if (severity) {
      where.severity = severity;
    }

    if (status) {
      where.status = status;
    }

    const [vulnerabilities, summary] = await Promise.all([
      prisma.securityVulnerability.findMany({
        where,
        orderBy: [
          { severity: "desc" },
          { detectedAt: "desc" },
        ],
        take: limit,
        include: {
          scan: {
            select: {
              repositoryId: true,
              scanType: true,
            },
          },
        },
      }),
      prisma.securityVulnerability.groupBy({
        by: ["severity"],
        where,
        _count: true,
      }),
    ]);

    const summaryMap = summary.reduce(
      (acc, item) => {
        acc[item.severity.toLowerCase()] = item._count;
        acc.total += item._count;
        return acc;
      },
      { total: 0, critical: 0, high: 0, medium: 0, low: 0 } as any
    );

    return NextResponse.json({
      vulnerabilities,
      summary: summaryMap,
    });
  } catch (error) {
    console.error("Error fetching vulnerabilities:", error);
    return NextResponse.json(
      { error: "Failed to fetch vulnerabilities" },
      { status: 500 }
    );
  }
}

// PATCH - Update vulnerability status
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const updated = await prisma.securityVulnerability.update({
      where: { id },
      data: {
        status,
        fixedAt: status === "FIXED" ? new Date() : null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating vulnerability:", error);
    return NextResponse.json(
      { error: "Failed to update vulnerability" },
      { status: 500 }
    );
  }
}
