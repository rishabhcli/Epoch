import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Handle traditional unsubscribe (GET request from email link)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invalid Unsubscribe Link</title>
          <style>
            body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; }
            .error { color: #dc2626; }
          </style>
        </head>
        <body>
          <h1 class="error">Invalid unsubscribe link</h1>
          <p>The unsubscribe link you clicked is invalid or has expired.</p>
        </body>
      </html>
    `,
      {
        status: 400,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }

  try {
    // Find user by email or token (you'd need to store the token properly)
    // For now, we'll look up by the token in email events
    const emailEvent = await prisma.emailEvent.findFirst({
      where: {
        data: {
          path: ["unsubscribeToken"],
          equals: token,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!emailEvent) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invalid Unsubscribe Link</title>
            <style>
              body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; }
              .error { color: #dc2626; }
            </style>
          </head>
          <body>
            <h1 class="error">Link not found</h1>
            <p>We couldn't find this unsubscribe link. It may have already been used.</p>
          </body>
        </html>
      `,
        {
          status: 404,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    }

    // Find and update subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        user: {
          email: emailEvent.email,
        },
      },
      include: { user: true },
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
          messageId: emailEvent.messageId,
          email: emailEvent.email,
          type: "UNSUBSCRIBED",
        },
      });
    }

    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Unsubscribed Successfully</title>
          <style>
            body {
              font-family: system-ui;
              max-width: 600px;
              margin: 50px auto;
              padding: 20px;
              text-align: center;
            }
            .success { color: #16a34a; }
            .button {
              display: inline-block;
              margin-top: 20px;
              padding: 12px 24px;
              background: #2563eb;
              color: white;
              text-decoration: none;
              border-radius: 6px;
            }
          </style>
        </head>
        <body>
          <h1 class="success">✓ You've been unsubscribed</h1>
          <p>You will no longer receive emails from Epoch Pod.</p>
          <p>We're sorry to see you go!</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}" class="button">
            Return to Epoch Pod
          </a>
        </body>
      </html>
    `,
      {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  } catch (error) {
    console.error("Unsubscribe error:", error);

    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Unsubscribe Error</title>
          <style>
            body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; }
            .error { color: #dc2626; }
          </style>
        </head>
        <body>
          <h1 class="error">Something went wrong</h1>
          <p>We encountered an error while processing your unsubscribe request. Please try again later.</p>
        </body>
      </html>
    `,
      {
        status: 500,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }
}
