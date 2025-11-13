import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createHmac, timingSafeEqual } from "crypto";
import { Prisma } from "@prisma/client";

/**
 * Resend webhook handler
 * Handles email events: delivered, bounced, complained, opened, clicked
 *
 * Docs: https://resend.com/docs/dashboard/webhooks/introduction
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);

    // Verify webhook signature (production security)
    const signature = request.headers.get("svix-signature");
    if (!verifySignature(signature, rawBody)) {
      console.error("Invalid webhook signature");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { type, data } = body;

    if (!type || !data) {
      return new NextResponse("Invalid webhook payload", { status: 400 });
    }

    const { email_id, to, created_at, subject } = data;

    // Safely extract email address (Resend may send array or string)
    const emailAddress = Array.isArray(to) ? to[0] : to;

    if (!emailAddress || typeof emailAddress !== 'string') {
      console.error(`Invalid email address in webhook: ${to}`);
      return new NextResponse("Invalid email address", { status: 400 });
    }

    console.log(`Received webhook: ${type} for ${emailAddress}`);

    // Map Resend event types to our EmailEventType enum
    const eventTypeMap: Record<string, string> = {
      "email.sent": "SENT",
      "email.delivered": "DELIVERED",
      "email.bounced": "BOUNCED",
      "email.complained": "COMPLAINED",
      "email.opened": "OPENED",
      "email.clicked": "CLICKED",
    };

    const eventType = eventTypeMap[type];

    if (!eventType) {
      console.warn(`Unknown webhook event type: ${type}`);
      return new NextResponse("OK", { status: 200 });
    }

    // Store the event
    await prisma.emailEvent.create({
      data: {
        messageId: email_id,
        email: emailAddress,
        type: eventType as Prisma.EmailEventType,
        data: {
          subject,
          created_at,
          raw: data,
        },
      },
    });

    // Handle bounces and complaints
    if (type === "email.bounced" || type === "email.complained") {
      // Find the user's subscription
      const subscription = await prisma.subscription.findFirst({
        where: {
          user: {
            email: emailAddress,
          },
        },
      });

      if (subscription) {
        // For hard bounces and complaints, automatically unsubscribe
        if (
          type === "email.complained" ||
          (type === "email.bounced" && data.bounce_type === "hard")
        ) {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              status: "UNSUBSCRIBED",
              unsubscribedAt: new Date(),
            },
          });

          console.log(
            `Auto-unsubscribed ${emailAddress} due to ${type === "email.complained" ? "complaint" : "hard bounce"}`
          );
        }

        // For soft bounces, you might want to pause delivery temporarily
        if (type === "email.bounced" && data.bounce_type === "soft") {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              status: "PAUSED",
            },
          });

          console.log(`Paused subscription for ${emailAddress} due to soft bounce`);
        }
      }
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);

    // Return 200 even on error to prevent Resend from retrying
    // Log the error for investigation
    return new NextResponse("OK", { status: 200 });
  }
}

/**
 * Verify Resend webhook signature using Svix format
 * Resend uses Svix for webhook signatures
 * Format: "v1,<timestamp>,<signature>"
 */
function verifySignature(signature: string | null, body: string): boolean {
  // Allow bypassing signature verification in development only
  if (process.env.NODE_ENV === "development" && !process.env.RESEND_WEBHOOK_SECRET) {
    console.warn("WARNING: Webhook signature verification disabled in development");
    return true;
  }

  if (!signature) {
    console.error("Missing webhook signature");
    return false;
  }

  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    console.error("RESEND_WEBHOOK_SECRET not configured");
    return false;
  }

  try {
    // Parse Svix signature format: "v1,timestamp,signature"
    const parts = signature.split(",");
    if (parts.length < 3) {
      console.error("Invalid signature format");
      return false;
    }

    const timestamp = parts[1];
    const receivedSignature = parts[2];

    // Verify timestamp is recent (within 5 minutes)
    const timestampMs = parseInt(timestamp, 10);
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (Math.abs(now - timestampMs) > fiveMinutes) {
      console.error("Webhook timestamp too old or in future");
      return false;
    }

    // Compute expected signature
    const signedPayload = `${timestamp}.${body}`;
    const expectedSignature = createHmac("sha256", secret)
      .update(signedPayload)
      .digest("base64");

    // Constant-time comparison to prevent timing attacks
    if (expectedSignature.length !== receivedSignature.length) {
      return false;
    }

    return timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(receivedSignature)
    );
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}
