import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate a secure token for private RSS feed
    const token = nanoid(32);

    // Update user with feed token
    await prisma.user.update({
      where: { id: session.user.id },
      data: { feedToken: token },
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Feed token generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate feed token",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
