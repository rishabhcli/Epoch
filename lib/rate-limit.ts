/**
 * Rate Limiting Configuration
 *
 * This module provides rate limiting for API routes using Upstash Redis.
 * It protects against API abuse and excessive OpenAI API costs.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

/**
 * Initialize Redis client
 * Falls back to in-memory rate limiting if Redis is not configured
 */
let redis: Redis | undefined;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

/**
 * Create a Map-based cache for in-memory rate limiting
 * Used when Redis is not available (development/testing)
 */
const inMemoryCache = new Map<string, { count: number; reset: number }>();

/**
 * In-memory rate limiter
 */
function inMemoryRateLimit(
  identifier: string,
  limit: number,
  window: number
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  const key = identifier;
  const entry = inMemoryCache.get(key);

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    // 1% chance
    for (const [k, v] of inMemoryCache.entries()) {
      if (v.reset < now) {
        inMemoryCache.delete(k);
      }
    }
  }

  if (!entry || entry.reset < now) {
    // Create new entry
    inMemoryCache.set(key, {
      count: 1,
      reset: now + window,
    });

    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: now + window,
    };
  }

  // Increment existing entry
  if (entry.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: entry.reset,
    };
  }

  entry.count++;
  inMemoryCache.set(key, entry);

  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    reset: entry.reset,
  };
}

/**
 * Rate limiter for general API endpoints
 * 100 requests per minute per IP
 */
export const generalRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1 m"),
      analytics: true,
      prefix: "ratelimit:general",
    })
  : null;

/**
 * Rate limiter for AI generation endpoints
 * 10 requests per hour per user (expensive operations)
 */
export const aiGenerationRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 h"),
      analytics: true,
      prefix: "ratelimit:ai",
    })
  : null;

/**
 * Rate limiter for authentication endpoints
 * 5 requests per minute per IP (prevent brute force)
 */
export const authRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      analytics: true,
      prefix: "ratelimit:auth",
    })
  : null;

/**
 * Rate limiter for voting/interaction endpoints
 * 20 requests per minute per IP
 */
export const interactionRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "1 m"),
      analytics: true,
      prefix: "ratelimit:interaction",
    })
  : null;

/**
 * Get client identifier from request
 * Uses IP address, falling back to a random identifier for development
 */
export function getClientIdentifier(req: NextRequest): string {
  // Try to get IP from various headers
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback for development
  return "dev-client";
}

/**
 * Get user identifier from request
 * Prefers user ID, falls back to IP address
 */
export function getUserIdentifier(req: NextRequest, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  return `ip:${getClientIdentifier(req)}`;
}

/**
 * Rate limiting middleware helper
 * Apply rate limiting to API routes
 */
export async function withRateLimit(
  req: NextRequest,
  limiter: Ratelimit | null,
  options: {
    identifier?: string;
    fallbackLimit?: number;
    fallbackWindow?: number;
  } = {}
): Promise<{ success: boolean; headers: Record<string, string> }> {
  const identifier = options.identifier || getClientIdentifier(req);

  // Use in-memory rate limiting if Redis is not configured
  if (!limiter) {
    const result = inMemoryRateLimit(
      identifier,
      options.fallbackLimit || 100,
      options.fallbackWindow || 60000 // 1 minute
    );

    const headers = {
      "X-RateLimit-Limit": result.limit.toString(),
      "X-RateLimit-Remaining": result.remaining.toString(),
      "X-RateLimit-Reset": new Date(result.reset).toISOString(),
    };

    return { success: result.success, headers };
  }

  // Use Redis-based rate limiting
  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  const headers = {
    "X-RateLimit-Limit": limit.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": new Date(reset).toISOString(),
  };

  return { success, headers };
}

/**
 * Create a rate-limited response
 */
export function rateLimitResponse(headers: Record<string, string>): NextResponse {
  return NextResponse.json(
    {
      error: "Too Many Requests",
      message: "You have exceeded the rate limit. Please try again later.",
    },
    {
      status: 429,
      headers,
    }
  );
}

/**
 * Rate limiting wrapper for API route handlers
 * Usage:
 *
 * ```ts
 * export const POST = rateLimitHandler(
 *   async (req) => {
 *     // Your handler logic
 *     return NextResponse.json({ success: true });
 *   },
 *   { limiter: aiGenerationRateLimit, fallbackLimit: 10, fallbackWindow: 3600000 }
 * );
 * ```
 */
export function rateLimitHandler(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: {
    limiter: Ratelimit | null;
    identifier?: (req: NextRequest) => string;
    fallbackLimit?: number;
    fallbackWindow?: number;
  }
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Get identifier
    const identifier = options.identifier ? options.identifier(req) : getClientIdentifier(req);

    // Check rate limit
    const { success, headers } = await withRateLimit(req, options.limiter, {
      identifier,
      fallbackLimit: options.fallbackLimit,
      fallbackWindow: options.fallbackWindow,
    });

    // If rate limit exceeded, return 429
    if (!success) {
      return rateLimitResponse(headers);
    }

    // Call handler and add rate limit headers
    const response = await handler(req);

    // Add rate limit headers to response
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  };
}
