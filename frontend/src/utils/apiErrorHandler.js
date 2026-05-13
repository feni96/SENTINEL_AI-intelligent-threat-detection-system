/**
 * API Error Handler Utilities
 * Provides reusable error handling, retry logic, and timeout management for API calls
 */

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  constructor(message, statusCode = null, originalError = null) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

/**
 * Timeout error class
 */
export class TimeoutError extends Error {
  constructor(message = 'Request timeout') {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Extracts user-friendly error message from API response
 * @param {Error} error - The error object from axios
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  // Handle timeout errors
  if (error.code === 'ECONNABORTED') {
    return 'Request timeout';
  }

  // Handle network errors
  if (!error.response) {
    return error.message || 'Network error occurred';
  }

  // Handle API response errors
  const { status, data } = error.response;

  // Check for custom error message in response
  if (data?.message) {
    return data.message;
  }

  if (data?.error?.message) {
    return data.error.message;
  }

  // Fallback to status-based messages
  switch (status) {
    case 400:
      return 'Invalid request data';
    case 401:
      return 'Unauthorized - please log in again';
    case 403:
      return 'Access denied';
    case 404:
      return 'Resource not found';
    case 409:
      return 'Conflict - resource already exists';
    case 500:
      return 'Server error - please try again later';
    case 503:
      return 'Service unavailable - please try again later';
    default:
      return `Error: ${status} ${error.response.statusText || 'Unknown error'}`;
  }
};

/**
 * Wraps an API call with timeout handling
 * @param {Promise} apiCall - The API call promise
 * @param {number} timeoutMs - Timeout in milliseconds (default: 10000)
 * @returns {Promise} Promise that rejects with TimeoutError if timeout exceeded
 */
export const withTimeout = (apiCall, timeoutMs = 10000) => {
  return Promise.race([
    apiCall,
    new Promise((_, reject) =>
      setTimeout(() => reject(new TimeoutError('Request timeout')), timeoutMs)
    ),
  ]);
};

/**
 * Retries an API call with exponential backoff
 * @param {Function} apiCallFn - Function that returns the API call promise
 * @param {number} maxRetries - Maximum number of retries (default: 3)
 * @param {number} initialDelayMs - Initial delay in milliseconds (default: 1000)
 * @returns {Promise} Promise that resolves with API response or rejects after all retries fail
 */
export const withRetry = async (
  apiCallFn,
  maxRetries = 3,
  initialDelayMs = 1000
) => {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCallFn();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx) except for specific cases
      if (error.response?.status >= 400 && error.response?.status < 500) {
        // Retry on 408 (Request Timeout) and 429 (Too Many Requests)
        if (error.response.status !== 408 && error.response.status !== 429) {
          throw error;
        }
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = initialDelayMs * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Handles API errors and returns standardized error object
 * @param {Error} error - The error object
 * @returns {Object} Standardized error object with message and statusCode
 */
export const handleAPIError = (error) => {
  const message = getErrorMessage(error);
  const statusCode = error.response?.status || null;

  return {
    message,
    statusCode,
    isTimeout: error instanceof TimeoutError || error.code === 'ECONNABORTED',
    isNetworkError: !error.response,
    originalError: error,
  };
};

/**
 * Creates a state management hook for API calls
 * Returns loading, error, and data states
 * @returns {Object} Object with state and handlers
 */
export const createAsyncState = () => {
  return {
    data: null,
    loading: false,
    error: null,
    isTimeout: false,
  };
};

/**
 * Executes an API call with full error handling and state management
 * @param {Function} apiCallFn - Function that returns the API call promise
 * @param {Object} options - Configuration options
 * @param {number} options.timeout - Timeout in milliseconds (default: 10000)
 * @param {number} options.maxRetries - Maximum retries (default: 0)
 * @param {Function} options.onSuccess - Callback on success
 * @param {Function} options.onError - Callback on error
 * @returns {Promise} Promise that resolves with response data
 */
export const executeAPICall = async (apiCallFn, options = {}) => {
  const {
    timeout = 10000,
    maxRetries = 0,
    onSuccess = null,
    onError = null,
  } = options;

  try {
    let result;

    if (maxRetries > 0) {
      result = await withRetry(apiCallFn, maxRetries);
    } else {
      result = await withTimeout(apiCallFn(), timeout);
    }

    if (onSuccess) {
      onSuccess(result);
    }

    return result;
  } catch (error) {
    const errorInfo = handleAPIError(error);

    if (onError) {
      onError(errorInfo);
    }

    throw errorInfo;
  }
};
