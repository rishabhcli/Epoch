import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Handle RFC 8058 one-click unsubscribe (POST request from email client)
 * This endpoint is called by email clients when users click the "Unsubscribe" button
 *
 * RFC 8058 specification: https://www.rfc-editor.org/rfc/rfc8058.html
 */
export async function POST(request: NextRequest) {
  try {
    // The List-Unsubscribe header should include this URL
    // Email clients will POST to this endpoint with the List-Unsubscribe=One-Click body

    const body = await request.text();

    // RFC 8058 specifies the body should be "List-Unsubscribe=One-Click"
    if (body !== "List-Unsubscribe=One-Click") {
      return new NextResponse("Invalid request body", { status: 400 });
    }

    // Get the recipient email from headers if provided by the email service
    // Different email clients may provide this differently
    const recipientEmail =
      request.headers.get("x-recipient") ||
      request.headers.get("list-unsubscribe-email");

    if (!recipientEmail) {
      // If we can't identify the user, we can't unsubscribe them
      // However, we should still return 200 to comply with RFC 8058
      return new NextResponse("OK", { status: 200 });
    }

    // Find and update subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        user: {
          email: recipientEmail,
        },
      },
    });

    if (subscription) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: "UNSUBSCRIBED",
          unsubscribedAt: new Date(),
        },
      });

      // Log the event
      await prisma.emailEvent.create({
        data: {
          messageId: `one-click-${Date.now()}`,
          email: recipientEmail,
          type: "UNSUBSCRIBED",
          data: {
            method: "one-click",
          },
        },
      });
    }

    // RFC 8058 requires a 200 OK response
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("One-click unsubscribe error:", error);

    // Even on error, return 200 to comply with RFC 8058
    // The spec recommends returning success even if the operation fails
    return new NextResponse("OK", { status: 200 });
  }
}
