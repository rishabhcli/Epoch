import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Resend } from "resend";
import { authConfig } from "./auth.config";
import { prisma } from "@/lib/db";
import type { Adapter } from "next-auth/adapters";

// Validate Resend API key
if (!process.env.RESEND_API_KEY) {
  console.warn("WARNING: RESEND_API_KEY is not set. Email authentication will fail.");
}

const resend = new Resend(process.env.RESEND_API_KEY);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
  },
  providers: [
    {
      id: "resend",
      type: "email",
      name: "Email",
      server: "",
      from: process.env.RESEND_FROM_EMAIL || "noreply@epoch.fm",
      maxAge: 24 * 60 * 60, // 24 hours
      sendVerificationRequest: async ({ identifier: email, url, provider }) => {
        const { host } = new URL(url);

        try {
          await resend.emails.send({
            from: provider.from as string,
            to: email,
            subject: `Sign in to ${host}`,
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                  <title>Sign in to Epoch Pod</title>
                  <style>
                    body {
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                      background-color: #f6f6f6;
                      margin: 0;
                      padding: 0;
                    }
                    .container {
                      max-width: 600px;
                      margin: 40px auto;
                      background-color: #ffffff;
                      border-radius: 8px;
                      overflow: hidden;
                      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    }
                    .header {
                      background-color: #2563eb;
                      padding: 40px 30px;
                      text-align: center;
                    }
                    .header h1 {
                      margin: 0;
                      color: #ffffff;
                      font-size: 28px;
                      font-weight: bold;
                    }
                    .content {
                      padding: 40px 30px;
                    }
                    .content p {
                      color: #333333;
                      line-height: 1.6;
                      margin: 0 0 20px;
                    }
                    .button {
                      display: inline-block;
                      padding: 14px 32px;
                      background-color: #2563eb;
                      color: #ffffff;
                      text-decoration: none;
                      border-radius: 6px;
                      font-weight: 600;
                      margin: 20px 0;
                    }
                    .footer {
                      padding: 20px 30px;
                      background-color: #f6f6f6;
                      text-align: center;
                      color: #666666;
                      font-size: 12px;
                    }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>Epoch Pod</h1>
                    </div>
                    <div class="content">
                      <p>Hello,</p>
                      <p>Click the button below to sign in to your Epoch Pod account:</p>
                      <div style="text-align: center;">
                        <a href="${url}" class="button">Sign In</a>
                      </div>
                      <p style="margin-top: 30px; color: #666666; font-size: 14px;">
                        If you didn't request this email, you can safely ignore it.
                      </p>
                      <p style="color: #666666; font-size: 14px;">
                        This link will expire in 24 hours.
                      </p>
                    </div>
                    <div class="footer">
                      <p>Epoch Pod - Personalized History Podcasts</p>
                    </div>
                  </div>
                </body>
              </html>
            `,
          });
        } catch (error) {
          console.error("Failed to send verification email:", error);
          throw new Error("Failed to send verification email");
        }
      },
    },
  ],
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role as "USER" | "ADMIN";
      }

      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }

      return token;
    },
  },
});
