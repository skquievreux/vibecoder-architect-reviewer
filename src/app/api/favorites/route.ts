import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Get user's favorite repositories
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favorites = await prisma.repositoryFavorite.findMany({
      where: {
        userId: (session.user as any).id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ favorites });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}

// POST - Add repository to favorites
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { repositoryId } = body;

    if (!repositoryId) {
      return NextResponse.json(
        { error: "Missing repositoryId" },
        { status: 400 }
      );
    }

    const favorite = await prisma.repositoryFavorite.upsert({
      where: {
        userId_repositoryId: {
          userId: (session.user as any).id,
          repositoryId,
        },
      },
      create: {
        userId: (session.user as any).id,
        repositoryId,
      },
      update: {},
    });

    return NextResponse.json({ favorite }, { status: 201 });
  } catch (error) {
    console.error("Error adding favorite:", error);
    return NextResponse.json(
      { error: "Failed to add favorite" },
      { status: 500 }
    );
  }
}

// DELETE - Remove repository from favorites
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const repositoryId = searchParams.get("repositoryId");

    if (!repositoryId) {
      return NextResponse.json(
        { error: "Missing repositoryId" },
        { status: 400 }
      );
    }

    await prisma.repositoryFavorite.deleteMany({
      where: {
        userId: (session.user as any).id,
        repositoryId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing favorite:", error);
    return NextResponse.json(
      { error: "Failed to remove favorite" },
      { status: 500 }
    );
  }
}
