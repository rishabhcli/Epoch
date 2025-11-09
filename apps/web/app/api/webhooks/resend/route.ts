import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Resend webhook handler
 * Handles email events: delivered, bounced, complained, opened, clicked
 *
 * Docs: https://resend.com/docs/dashboard/webhooks/introduction
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (recommended for production)
    // const signature = request.headers.get("resend-signature");
    // if (!verifySignature(signature, body)) {
    //   return new NextResponse("Invalid signature", { status: 401 });
    // }

    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return new NextResponse("Invalid webhook payload", { status: 400 });
    }

    const { email_id, to, created_at, subject } = data;

    console.log(`Received webhook: ${type} for ${to}`);

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
        email: to[0] || to, // Resend may send array or string
        type: eventType as any,
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
            email: to[0] || to,
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
            `Auto-unsubscribed ${to[0] || to} due to ${type === "email.complained" ? "complaint" : "hard bounce"}`
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

          console.log(`Paused subscription for ${to[0] || to} due to soft bounce`);
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
 * Verify Resend webhook signature
 * Implementation depends on Resend's signing method
 */
function verifySignature(signature: string | null, body: string): boolean {
  // TODO: Implement signature verification
  // This is a placeholder - check Resend's documentation for the actual implementation
  if (!signature) return false;

  // Resend typically uses HMAC-SHA256
  // const secret = process.env.RESEND_WEBHOOK_SECRET;
  // const expectedSignature = createHmac('sha256', secret).update(body).digest('hex');
  // return timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));

  return true; // For development
}
