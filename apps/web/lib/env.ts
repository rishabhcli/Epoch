/**
 * Environment Variable Validation
 *
 * This module validates all required environment variables at startup
 * using Zod schemas. This ensures the app fails fast with clear error
 * messages if configuration is missing or invalid.
 */

import { z } from "zod";

/**
 * Server-side environment variables schema
 * These are only available on the server
 */
const serverEnvSchema = z.object({
  // Database
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid PostgreSQL connection string"),

  // OpenAI
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),

  // Vercel Blob Storage
  BLOB_READ_WRITE_TOKEN: z.string().min(1, "BLOB_READ_WRITE_TOKEN is required"),

  // Email (Resend)
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  RESEND_FROM_EMAIL: z.string().email("RESEND_FROM_EMAIL must be a valid email").optional(),

  // NextAuth
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL").optional(),
  NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters").optional(),

  // OAuth Providers (optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  // Node Environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

/**
 * Client-side environment variables schema
 * These are exposed to the browser (must be prefixed with NEXT_PUBLIC_)
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url("NEXT_PUBLIC_APP_URL must be a valid URL").optional(),
  NEXT_PUBLIC_APP_NAME: z.string().default("Epoch Pod"),
});

/**
 * Combined environment schema
 */
const envSchema = z.object({
  server: serverEnvSchema,
  client: clientEnvSchema,
});

/**
 * Validate and parse environment variables
 */
function validateEnv() {
  try {
    const parsed = envSchema.parse({
      server: {
        DATABASE_URL: process.env.DATABASE_URL,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
        RESEND_API_KEY: process.env.RESEND_API_KEY,
        RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
        GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
        NODE_ENV: process.env.NODE_ENV,
      },
      client: {
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
      },
    });

    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err) => {
        const path = err.path.slice(1).join(".");
        return `  ❌ ${path}: ${err.message}`;
      });

      console.error("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.error("⚠️  Environment Variable Validation Failed");
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      console.error("Missing or invalid environment variables:\n");
      console.error(missingVars.join("\n"));
      console.error("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.error("Please check your .env file and ensure all required");
      console.error("environment variables are set correctly.");
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

      throw new Error("Environment validation failed. Please fix the errors above.");
    }

    throw error;
  }
}

/**
 * Validated environment variables
 * This ensures type safety when accessing env vars throughout the app
 */
export const env = validateEnv();

/**
 * Type-safe access to server environment variables
 */
export const serverEnv = env.server;

/**
 * Type-safe access to client environment variables
 * Safe to use in browser code
 */
export const clientEnv = env.client;

/**
 * Check if we're in production
 */
export const isProd = serverEnv.NODE_ENV === "production";

/**
 * Check if we're in development
 */
export const isDev = serverEnv.NODE_ENV === "development";

/**
 * Check if we're in test
 */
export const isTest = serverEnv.NODE_ENV === "test";
