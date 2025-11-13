/**
 * Retry utility with exponential backoff for API calls
 * Handles rate limiting and transient errors
 */

/**
 * API Error interface covering common error formats
 */
export interface APIError extends Error {
  status?: number;
  code?: string;
  type?: string;
  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
}

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: APIError) => boolean;
}

/**
 * Retry a function with exponential backoff
 *
 * @param fn - The async function to retry
 * @param options - Retry configuration
 * @returns The result of the function
 * @throws The last error if all retries fail
 *
 * @example
 * ```typescript
 * const result = await retryWithBackoff(
 *   () => openai.chat.completions.create({...}),
 *   { maxRetries: 3, initialDelay: 1000 }
 * );
 * ```
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    shouldRetry = defaultShouldRetry,
  } = options;

  let lastError: APIError | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as APIError;

      // Don't retry if it's the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Check if we should retry this error
      if (!shouldRetry(error)) {
        throw error;
      }

      // Calculate delay with exponential backoff and jitter
      const baseDelay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
      const jitter = Math.random() * baseDelay * 0.1; // Add 10% jitter
      const delay = baseDelay + jitter;

      console.log(
        `[Retry] Attempt ${attempt + 1}/${maxRetries} failed: ${getErrorMessage(error)}. ` +
        `Retrying in ${Math.round(delay)}ms...`
      );

      await sleep(delay);
    }
  }

  // All retries exhausted
  throw new Error(
    `Max retries (${maxRetries}) exceeded. Last error: ${getErrorMessage(lastError)}`
  );
}

/**
 * Default retry logic - retries on rate limits and server errors
 */
function defaultShouldRetry(error: APIError): boolean {
  // Retry on rate limit errors
  if (error.status === 429 || error.code === 'rate_limit_exceeded') {
    return true;
  }

  // Retry on 5xx server errors
  if (error.status >= 500 && error.status < 600) {
    return true;
  }

  // Retry on network errors
  if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
    return true;
  }

  // Retry on OpenAI specific errors
  if (error.type === 'server_error' || error.type === 'timeout') {
    return true;
  }

  // Don't retry on client errors (4xx except 429)
  if (error.status >= 400 && error.status < 500 && error.status !== 429) {
    return false;
  }

  // Default: don't retry unknown errors
  return false;
}

/**
 * Extract error message from various error formats
 */
function getErrorMessage(error: APIError | unknown): string {
  if (!error) return 'Unknown error';
  if (typeof error === 'string') return error;

  // Check if it's an APIError
  const apiError = error as APIError;
  if (apiError.message) return apiError.message;
  if (apiError.error?.message) return apiError.error.message;

  return 'Unknown error';
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry specifically for OpenAI TTS generation
 * Uses longer delays and more retries since TTS is expensive
 */
export async function retryTTSGeneration<T>(
  fn: () => Promise<T>
): Promise<T> {
  return retryWithBackoff(fn, {
    maxRetries: 5,        // More retries for expensive operations
    initialDelay: 2000,   // Start with 2s delay
    maxDelay: 60000,      // Max 60s between retries
  });
}

/**
 * Retry specifically for GPT-4 completions
 * Balanced settings for text generation
 */
export async function retryGPTCompletion<T>(
  fn: () => Promise<T>
): Promise<T> {
  return retryWithBackoff(fn, {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30000,
  });
}
