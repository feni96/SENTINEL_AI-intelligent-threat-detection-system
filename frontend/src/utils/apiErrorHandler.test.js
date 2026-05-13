/**
 * Unit Tests for API Error Handler Utilities
 * Tests error handling, retry logic, and timeout management
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  APIError,
  TimeoutError,
  getErrorMessage,
  withTimeout,
  withRetry,
  handleAPIError,
  createAsyncState,
  executeAPICall,
} from './apiErrorHandler';

describe('APIError', () => {
  test('should create APIError with message and status code', () => {
    const error = new APIError('Test error', 400);
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe('APIError');
  });

  test('should create APIError with original error', () => {
    const originalError = new Error('Original');
    const error = new APIError('Test error', 500, originalError);
    expect(error.originalError).toBe(originalError);
  });
});

describe('TimeoutError', () => {
  test('should create TimeoutError with default message', () => {
    const error = new TimeoutError();
    expect(error.message).toBe('Request timeout');
    expect(error.name).toBe('TimeoutError');
  });

  test('should create TimeoutError with custom message', () => {
    const error = new TimeoutError('Custom timeout');
    expect(error.message).toBe('Custom timeout');
  });
});

describe('getErrorMessage', () => {
  test('should return timeout message for ECONNABORTED error', () => {
    const error = { code: 'ECONNABORTED' };
    expect(getErrorMessage(error)).toBe('Request timeout');
  });

  test('should return network error message when no response', () => {
    const error = { message: 'Network error' };
    expect(getErrorMessage(error)).toBe('Network error');
  });

  test('should extract message from response.data.message', () => {
    const error = {
      response: {
        status: 400,
        data: { message: 'Custom error message' },
      },
    };
    expect(getErrorMessage(error)).toBe('Custom error message');
  });

  test('should extract message from response.data.error.message', () => {
    const error = {
      response: {
        status: 400,
        data: { error: { message: 'Nested error message' } },
      },
    };
    expect(getErrorMessage(error)).toBe('Nested error message');
  });

  test('should return status-based message for 400', () => {
    const error = {
      response: {
        status: 400,
        statusText: 'Bad Request',
        data: {},
      },
    };
    expect(getErrorMessage(error)).toBe('Invalid request data');
  });

  test('should return status-based message for 401', () => {
    const error = {
      response: {
        status: 401,
        statusText: 'Unauthorized',
        data: {},
      },
    };
    expect(getErrorMessage(error)).toBe('Unauthorized - please log in again');
  });

  test('should return status-based message for 403', () => {
    const error = {
      response: {
        status: 403,
        statusText: 'Forbidden',
        data: {},
      },
    };
    expect(getErrorMessage(error)).toBe('Access denied');
  });

  test('should return status-based message for 404', () => {
    const error = {
      response: {
        status: 404,
        statusText: 'Not Found',
        data: {},
      },
    };
    expect(getErrorMessage(error)).toBe('Resource not found');
  });

  test('should return status-based message for 409', () => {
    const error = {
      response: {
        status: 409,
        statusText: 'Conflict',
        data: {},
      },
    };
    expect(getErrorMessage(error)).toBe('Conflict - resource already exists');
  });

  test('should return status-based message for 500', () => {
    const error = {
      response: {
        status: 500,
        statusText: 'Internal Server Error',
        data: {},
      },
    };
    expect(getErrorMessage(error)).toBe('Server error - please try again later');
  });

  test('should return status-based message for 503', () => {
    const error = {
      response: {
        status: 503,
        statusText: 'Service Unavailable',
        data: {},
      },
    };
    expect(getErrorMessage(error)).toBe('Service unavailable - please try again later');
  });
});

describe('withTimeout', () => {
  test('should resolve with data when promise resolves before timeout', async () => {
    const promise = Promise.resolve({ data: 'test' });
    const result = await withTimeout(promise, 1000);
    expect(result).toEqual({ data: 'test' });
  });

  test('should reject with TimeoutError when promise exceeds timeout', async () => {
    const promise = new Promise((resolve) => {
      setTimeout(() => resolve({ data: 'test' }), 2000);
    });

    await expect(withTimeout(promise, 100)).rejects.toThrow(TimeoutError);
  });

  test('should use default timeout of 10000ms', async () => {
    const promise = new Promise((resolve) => {
      setTimeout(() => resolve({ data: 'test' }), 100);
    });

    const result = await withTimeout(promise);
    expect(result).toEqual({ data: 'test' });
  });

  test('should reject with original error if promise rejects before timeout', async () => {
    const error = new Error('Original error');
    const promise = Promise.reject(error);

    await expect(withTimeout(promise, 1000)).rejects.toThrow('Original error');
  });
});

describe('withRetry', () => {
  test('should resolve on first attempt if successful', async () => {
    const apiCallFn = vi.fn(() => Promise.resolve({ data: 'test' }));
    const result = await withRetry(apiCallFn, 3);

    expect(result).toEqual({ data: 'test' });
    expect(apiCallFn).toHaveBeenCalledTimes(1);
  });

  test('should retry on failure and eventually succeed', async () => {
    let attempts = 0;
    const apiCallFn = vi.fn(() => {
      attempts++;
      if (attempts < 3) {
        return Promise.reject(new Error('Temporary error'));
      }
      return Promise.resolve({ data: 'success' });
    });

    const result = await withRetry(apiCallFn, 3);

    expect(result).toEqual({ data: 'success' });
    expect(apiCallFn).toHaveBeenCalledTimes(3);
  });

  test('should fail after max retries exceeded', async () => {
    const apiCallFn = vi.fn(() =>
      Promise.reject(new Error('Persistent error'))
    );

    await expect(withRetry(apiCallFn, 2)).rejects.toThrow('Persistent error');
    expect(apiCallFn).toHaveBeenCalledTimes(3); // initial + 2 retries
  });

  test('should not retry on 4xx errors (except 408 and 429)', async () => {
    const error = new Error('Bad request');
    error.response = { status: 400 };

    const apiCallFn = vi.fn(() => Promise.reject(error));

    await expect(withRetry(apiCallFn, 3)).rejects.toThrow('Bad request');
    expect(apiCallFn).toHaveBeenCalledTimes(1); // No retries
  });

  test('should retry on 408 (Request Timeout)', async () => {
    let attempts = 0;
    const apiCallFn = vi.fn(() => {
      attempts++;
      if (attempts < 2) {
        const error = new Error('Timeout');
        error.response = { status: 408 };
        return Promise.reject(error);
      }
      return Promise.resolve({ data: 'success' });
    });

    const result = await withRetry(apiCallFn, 3);

    expect(result).toEqual({ data: 'success' });
    expect(apiCallFn).toHaveBeenCalledTimes(2);
  });

  test('should retry on 429 (Too Many Requests)', async () => {
    let attempts = 0;
    const apiCallFn = vi.fn(() => {
      attempts++;
      if (attempts < 2) {
        const error = new Error('Rate limited');
        error.response = { status: 429 };
        return Promise.reject(error);
      }
      return Promise.resolve({ data: 'success' });
    });

    const result = await withRetry(apiCallFn, 3);

    expect(result).toEqual({ data: 'success' });
    expect(apiCallFn).toHaveBeenCalledTimes(2);
  });

  test('should use exponential backoff for delays', async () => {
    vi.useFakeTimers();
    try {
      let attempts = 0;

      const apiCallFn = vi.fn(() => {
        attempts++;
        if (attempts < 3) {
          return Promise.reject(new Error('Temporary error'));
        }
        return Promise.resolve({ data: 'success' });
      });

      const promise = withRetry(apiCallFn, 3, 100);

      // Fast-forward through delays
      await vi.advanceTimersByTimeAsync(100); // First retry delay
      await vi.advanceTimersByTimeAsync(200); // Second retry delay

      const result = await promise;

      expect(result).toEqual({ data: 'success' });
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('handleAPIError', () => {
  test('should return error object with message and status code', () => {
    const error = new Error('Test error');
    error.response = { status: 400 };

    const result = handleAPIError(error);

    expect(result.message).toBe('Invalid request data');
    expect(result.statusCode).toBe(400);
    expect(result.isTimeout).toBe(false);
    expect(result.isNetworkError).toBe(false);
  });

  test('should identify timeout errors', () => {
    const error = new TimeoutError('Request timeout');

    const result = handleAPIError(error);

    expect(result.isTimeout).toBe(true);
    expect(result.message).toBe('Request timeout');
  });

  test('should identify network errors', () => {
    const error = new Error('Network error');

    const result = handleAPIError(error);

    expect(result.isNetworkError).toBe(true);
    expect(result.statusCode).toBeNull();
  });

  test('should include original error in result', () => {
    const error = new Error('Original error');
    error.response = { status: 500 };

    const result = handleAPIError(error);

    expect(result.originalError).toBe(error);
  });
});

describe('createAsyncState', () => {
  test('should create initial async state', () => {
    const state = createAsyncState();

    expect(state).toEqual({
      data: null,
      loading: false,
      error: null,
      isTimeout: false,
    });
  });
});

describe('executeAPICall', () => {
  test('should execute API call and return data', async () => {
    const apiCallFn = vi.fn(() => Promise.resolve({ data: 'test' }));

    const result = await executeAPICall(apiCallFn);

    expect(result).toEqual({ data: 'test' });
    expect(apiCallFn).toHaveBeenCalled();
  });

  test('should call onSuccess callback on success', async () => {
    const apiCallFn = vi.fn(() => Promise.resolve({ data: 'test' }));
    const onSuccess = vi.fn();

    await executeAPICall(apiCallFn, { onSuccess });

    expect(onSuccess).toHaveBeenCalledWith({ data: 'test' });
  });

  test('should call onError callback on error', async () => {
    const error = new Error('Test error');
    error.response = { status: 400 };

    const apiCallFn = vi.fn(() => Promise.reject(error));
    const onError = vi.fn();

    try {
      await executeAPICall(apiCallFn, { onError });
    } catch (e) {
      // Expected to throw
    }

    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0]).toHaveProperty('message');
    expect(onError.mock.calls[0][0]).toHaveProperty('statusCode');
  });

  test('should use custom timeout', async () => {
    const promise = new Promise((resolve) => {
      setTimeout(() => resolve({ data: 'test' }), 2000);
    });

    const apiCallFn = vi.fn(() => promise);

    await expect(
      executeAPICall(apiCallFn, { timeout: 100 })
    ).rejects.toThrow();
  });

  test('should use retry logic when maxRetries specified', async () => {
    vi.useFakeTimers();
    try {
      let attempts = 0;
      const apiCallFn = vi.fn(() => {
        attempts++;
        if (attempts < 2) {
          return Promise.reject(new Error('Temporary error'));
        }
        return Promise.resolve({ data: 'success' });
      });

      const promise = executeAPICall(apiCallFn, { maxRetries: 2 });

      // Fast-forward through retry delays
      await vi.advanceTimersByTimeAsync(1000);

      const result = await promise;

      expect(result).toEqual({ data: 'success' });
      expect(apiCallFn).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  test('should throw error info object on failure', async () => {
    const error = new Error('Test error');
    error.response = { status: 500 };

    const apiCallFn = vi.fn(() => Promise.reject(error));

    try {
      await executeAPICall(apiCallFn);
      expect.fail('Should have thrown');
    } catch (e) {
      expect(e).toHaveProperty('message');
      expect(e).toHaveProperty('statusCode');
      expect(e).toHaveProperty('isTimeout');
      expect(e).toHaveProperty('isNetworkError');
    }
  });
});
