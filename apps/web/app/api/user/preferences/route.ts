import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { UserPreferencesSchema } from "@epoch/schema";

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = UserPreferencesSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid preferences", details: validation.error.issues },
        { status: 400 }
      );
    }

    // Update user preferences
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        preferences: validation.data as any, // Store as JSON
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Preferences update error:", error);
    return NextResponse.json(
      {
        error: "Failed to update preferences",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
