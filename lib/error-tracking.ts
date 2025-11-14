/**
 * Error Tracking Integration
 *
 * This module provides integration with error tracking services like Sentry.
 * It automatically detects available services and sends errors appropriately.
 */

import { serverEnv } from '@/lib/env';
import type { AppError } from './errors';

/**
 * Error tracking provider interface
 */
interface ErrorTrackingProvider {
  captureException(error: Error, context?: Record<string, any>): void;
  captureMessage(message: string, level: 'info' | 'warning' | 'error', context?: Record<string, any>): void;
}

/**
 * Sentry error tracking provider
 * Uses Sentry's HTTP API for lightweight error tracking without requiring the full SDK
 */
class SentryProvider implements ErrorTrackingProvider {
  private dsn: string;
  private environment: string;

  constructor(dsn: string) {
    this.dsn = dsn;
    this.environment = serverEnv.NODE_ENV;
  }

  /**
   * Parse Sentry DSN to extract project details
   */
  private parseDSN(dsn: string) {
    try {
      const url = new URL(dsn);
      const pathMatch = url.pathname.match(/^\/(\d+)$/);
      if (!pathMatch) throw new Error('Invalid DSN format');

      return {
        projectId: pathMatch[1],
        host: url.host,
        protocol: url.protocol.replace(':', ''),
        publicKey: url.username,
      };
    } catch (error) {
      console.error('Failed to parse Sentry DSN:', error);
      return null;
    }
  }

  /**
   * Send error to Sentry via HTTP API
   */
  async captureException(error: Error, context?: Record<string, any>) {
    const dsnInfo = this.parseDSN(this.dsn);
    if (!dsnInfo) return;

    const { protocol, host, projectId, publicKey } = dsnInfo;
    const endpoint = `${protocol}://${host}/api/${projectId}/store/`;

    const payload = {
      event_id: this.generateEventId(),
      timestamp: new Date().toISOString(),
      platform: 'node',
      level: 'error',
      environment: this.environment,
      server_name: process.env.VERCEL_URL || 'localhost',
      exception: {
        values: [
          {
            type: error.name,
            value: error.message,
            stacktrace: this.parseStackTrace(error.stack),
          },
        ],
      },
      extra: context,
      tags: {
        ...(error instanceof Object && 'statusCode' in error && { statusCode: (error as any).statusCode }),
        ...(error instanceof Object && 'isOperational' in error && { operational: (error as any).isOperational }),
      },
    };

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sentry-Auth': `Sentry sentry_version=7, sentry_key=${publicKey}, sentry_client=epoch-pod/1.0`,
        },
        body: JSON.stringify(payload),
      });
    } catch (fetchError) {
      // Don't throw - we don't want error tracking to break the app
      console.error('Failed to send error to Sentry:', fetchError);
    }
  }

  async captureMessage(message: string, level: 'info' | 'warning' | 'error', context?: Record<string, any>) {
    const dsnInfo = this.parseDSN(this.dsn);
    if (!dsnInfo) return;

    const { protocol, host, projectId, publicKey } = dsnInfo;
    const endpoint = `${protocol}://${host}/api/${projectId}/store/`;

    const payload = {
      event_id: this.generateEventId(),
      timestamp: new Date().toISOString(),
      platform: 'node',
      level,
      environment: this.environment,
      server_name: process.env.VERCEL_URL || 'localhost',
      message: {
        formatted: message,
      },
      extra: context,
    };

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sentry-Auth': `Sentry sentry_version=7, sentry_key=${publicKey}, sentry_client=epoch-pod/1.0`,
        },
        body: JSON.stringify(payload),
      });
    } catch (fetchError) {
      console.error('Failed to send message to Sentry:', fetchError);
    }
  }

  /**
   * Generate a unique event ID for Sentry
   */
  private generateEventId(): string {
    return Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  /**
   * Parse stack trace into Sentry format
   */
  private parseStackTrace(stack?: string) {
    if (!stack) return { frames: [] };

    const lines = stack.split('\n').slice(1); // Skip first line (error message)
    const frames = lines
      .map((line) => {
        const match = line.match(/at (?:(.+?) )?\(?(.*?):(\d+):(\d+)\)?$/);
        if (!match) return null;

        return {
          function: match[1] || '<anonymous>',
          filename: match[2],
          lineno: parseInt(match[3], 10),
          colno: parseInt(match[4], 10),
        };
      })
      .filter(Boolean)
      .reverse(); // Sentry wants frames in reverse order

    return { frames };
  }
}

/**
 * No-op provider for when error tracking is not configured
 */
class NoOpProvider implements ErrorTrackingProvider {
  captureException() {
    // No-op
  }

  captureMessage() {
    // No-op
  }
}

/**
 * Initialize the error tracking provider based on environment configuration
 */
function initializeProvider(): ErrorTrackingProvider {
  // Check if Sentry DSN is configured
  if (serverEnv.SENTRY_DSN) {
    return new SentryProvider(serverEnv.SENTRY_DSN);
  }

  // No error tracking configured
  return new NoOpProvider();
}

/**
 * Global error tracking instance
 */
export const errorTracker = initializeProvider();

/**
 * Capture an exception with optional context
 */
export function captureException(error: Error | AppError, context?: Record<string, any>) {
  errorTracker.captureException(error, context);
}

/**
 * Capture a message with optional context
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, any>) {
  errorTracker.captureMessage(message, level, context);
}

/**
 * Check if error tracking is enabled
 */
export function isErrorTrackingEnabled(): boolean {
  return serverEnv.SENTRY_DSN !== undefined;
}
