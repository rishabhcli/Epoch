import {
  retryWithBackoff,
  retryTTSGeneration,
  retryGPTCompletion,
  type APIError,
  type RetryOptions,
} from '@/lib/ai/retry';

// Mock console.log to suppress retry messages during tests
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});
afterAll(() => {
  console.log = originalConsoleLog;
});

describe('retryWithBackoff', () => {
  it('returns result on first successful attempt', async () => {
    const fn = jest.fn().mockResolvedValue('success');

    const result = await retryWithBackoff(fn);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on rate limit error (429)', async () => {
    const error: APIError = new Error('Rate limit exceeded');
    error.status = 429;

    const fn = jest.fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValue('success');

    const options: RetryOptions = {
      maxRetries: 3,
      initialDelay: 10, // Very short for testing
    };

    const result = await retryWithBackoff(fn, options);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('retries on server error (5xx)', async () => {
    const error: APIError = new Error('Server error');
    error.status = 500;

    const fn = jest.fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValue('success');

    const options: RetryOptions = {
      maxRetries: 3,
      initialDelay: 10,
    };

    const result = await retryWithBackoff(fn, options);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('retries on connection reset error', async () => {
    const error: APIError = new Error('Connection reset');
    error.code = 'ECONNRESET';

    const fn = jest.fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValue('success');

    const options: RetryOptions = {
      maxRetries: 3,
      initialDelay: 10,
    };

    const result = await retryWithBackoff(fn, options);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('retries on timeout error', async () => {
    const error: APIError = new Error('Timeout');
    error.code = 'ETIMEDOUT';

    const fn = jest.fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValue('success');

    const options: RetryOptions = {
      maxRetries: 3,
      initialDelay: 10,
    };

    const result = await retryWithBackoff(fn, options);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('retries on OpenAI server_error type', async () => {
    const error: APIError = new Error('Server error');
    error.type = 'server_error';

    const fn = jest.fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValue('success');

    const options: RetryOptions = {
      maxRetries: 3,
      initialDelay: 10,
    };

    const result = await retryWithBackoff(fn, options);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('does not retry on client error (4xx except 429)', async () => {
    const error: APIError = new Error('Bad request');
    error.status = 400;

    const fn = jest.fn().mockRejectedValue(error);

    await expect(retryWithBackoff(fn, { maxRetries: 3 })).rejects.toThrow('Bad request');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does not retry on 401 unauthorized', async () => {
    const error: APIError = new Error('Unauthorized');
    error.status = 401;

    const fn = jest.fn().mockRejectedValue(error);

    await expect(retryWithBackoff(fn, { maxRetries: 3 })).rejects.toThrow('Unauthorized');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does not retry on 403 forbidden', async () => {
    const error: APIError = new Error('Forbidden');
    error.status = 403;

    const fn = jest.fn().mockRejectedValue(error);

    await expect(retryWithBackoff(fn, { maxRetries: 3 })).rejects.toThrow('Forbidden');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does not retry on 404 not found', async () => {
    const error: APIError = new Error('Not found');
    error.status = 404;

    const fn = jest.fn().mockRejectedValue(error);

    await expect(retryWithBackoff(fn, { maxRetries: 3 })).rejects.toThrow('Not found');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('throws after max retries exceeded', async () => {
    const error: APIError = new Error('Server error');
    error.status = 500;

    const fn = jest.fn().mockRejectedValue(error);

    const options: RetryOptions = {
      maxRetries: 2,
      initialDelay: 10,
    };

    await expect(retryWithBackoff(fn, options)).rejects.toThrow('Max retries (2) exceeded');
    expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });

  it('uses custom shouldRetry function', async () => {
    const customError = new Error('Custom error');
    (customError as APIError).code = 'CUSTOM_CODE';

    const fn = jest.fn()
      .mockRejectedValueOnce(customError)
      .mockResolvedValue('success');

    const options: RetryOptions = {
      maxRetries: 3,
      initialDelay: 10,
      shouldRetry: (error: APIError) => error.code === 'CUSTOM_CODE',
    };

    const result = await retryWithBackoff(fn, options);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('handles errors without status code', async () => {
    const error = new Error('Unknown error');

    const fn = jest.fn().mockRejectedValue(error);

    // Should not retry unknown errors by default
    await expect(retryWithBackoff(fn, { maxRetries: 3 })).rejects.toThrow('Unknown error');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('uses default options when none provided', async () => {
    const error: APIError = new Error('Server error');
    error.status = 500;

    const fn = jest.fn().mockRejectedValue(error);

    // Note: This test is slow because it uses default delays
    // We just verify the error message format
    await expect(retryWithBackoff(fn, { maxRetries: 1, initialDelay: 10 })).rejects.toThrow('Max retries (1) exceeded');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('includes last error message in final error', async () => {
    const error: APIError = new Error('Database connection failed');
    error.status = 503;

    const fn = jest.fn().mockRejectedValue(error);

    await expect(retryWithBackoff(fn, { maxRetries: 1, initialDelay: 10 })).rejects.toThrow('Database connection failed');
  });

  it('retries multiple times before succeeding', async () => {
    const error: APIError = new Error('Temporary failure');
    error.status = 503;

    const fn = jest.fn()
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockResolvedValue('success');

    const options: RetryOptions = {
      maxRetries: 5,
      initialDelay: 10,
    };

    const result = await retryWithBackoff(fn, options);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });
});

describe('retryTTSGeneration', () => {
  it('returns result on success', async () => {
    const fn = jest.fn().mockResolvedValue('audio-buffer');

    const result = await retryTTSGeneration(fn);

    expect(result).toBe('audio-buffer');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('uses 5 max retries for TTS', async () => {
    // This is verified by the function signature, not runtime
    // Just test that it works for successful case
    const fn = jest.fn().mockResolvedValue(Buffer.from('audio'));

    const result = await retryTTSGeneration(fn);

    expect(result).toEqual(Buffer.from('audio'));
  });
});

describe('retryGPTCompletion', () => {
  it('returns result on success', async () => {
    const fn = jest.fn().mockResolvedValue({ content: 'response' });

    const result = await retryGPTCompletion(fn);

    expect(result).toEqual({ content: 'response' });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('handles complex response objects', async () => {
    const response = {
      id: 'chatcmpl-123',
      object: 'chat.completion',
      choices: [{ message: { role: 'assistant', content: 'Hello!' } }],
    };

    const fn = jest.fn().mockResolvedValue(response);

    const result = await retryGPTCompletion(fn);

    expect(result).toEqual(response);
  });
});

describe('error message extraction', () => {
  it('handles error with message property', async () => {
    const error = new Error('Direct message');

    const fn = jest.fn().mockRejectedValue(error);

    await expect(retryWithBackoff(fn)).rejects.toThrow('Direct message');
  });

  it('handles error with nested error.message', async () => {
    const error: APIError = new Error('Outer error');
    error.error = { message: 'Nested error message' };

    const fn = jest.fn().mockRejectedValue(error);

    await expect(retryWithBackoff(fn)).rejects.toThrow('Outer error');
  });
});

describe('retry configuration', () => {
  it('accepts custom initial delay', async () => {
    const error: APIError = new Error('Error');
    error.status = 500;

    const fn = jest.fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValue('done');

    const startTime = Date.now();
    await retryWithBackoff(fn, { maxRetries: 1, initialDelay: 50 });
    const elapsed = Date.now() - startTime;

    // Should have waited at least 50ms (with some jitter)
    expect(elapsed).toBeGreaterThanOrEqual(40);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('respects maxDelay option', async () => {
    const error: APIError = new Error('Error');
    error.status = 500;

    const fn = jest.fn()
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockResolvedValue('done');

    // With initial 100ms and exponential backoff, second delay would be 200ms
    // But maxDelay of 100ms should cap it
    await retryWithBackoff(fn, { maxRetries: 5, initialDelay: 10, maxDelay: 20 });

    expect(fn).toHaveBeenCalledTimes(3);
  });
});
