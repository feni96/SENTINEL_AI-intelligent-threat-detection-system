/**
 * Custom Hook: useAsyncState
 * Manages loading, error, and data states for async API calls
 * Provides a reusable pattern for all data fetching operations
 */

import { useState, useCallback, useEffect } from 'react';
import { handleAPIError, withTimeout, withRetry } from './apiErrorHandler';

/**
 * Hook for managing async state with loading and error handling
 * @param {Function} asyncFn - Async function to execute
 * @param {Object} options - Configuration options
 * @param {number} options.timeout - Timeout in milliseconds (default: 10000)
 * @param {number} options.maxRetries - Maximum retries (default: 0)
 * @param {boolean} options.autoExecute - Execute on mount (default: true)
 * @returns {Object} State and handlers
 */
export const useAsyncState = (asyncFn, options = {}) => {
  const {
    timeout = 10000,
    maxRetries = 0,
    autoExecute = true,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(autoExecute);
  const [error, setError] = useState(null);
  const [isTimeout, setIsTimeout] = useState(false);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsTimeout(false);

    try {
      let result;

      if (maxRetries > 0) {
        result = await withRetry(asyncFn, maxRetries);
      } else {
        result = await withTimeout(asyncFn(), timeout);
      }

      setData(result);
      return result;
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);
      setIsTimeout(errorInfo.isTimeout);
      throw errorInfo;
    } finally {
      setLoading(false);
    }
  }, [asyncFn, timeout, maxRetries]);

  const retry = useCallback(() => {
    return execute();
  }, [execute]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    setIsTimeout(false);
  }, []);

  // Auto-execute on mount if enabled
  useEffect(() => {
    if (autoExecute) {
      execute();
    }
  }, []);

  return {
    data,
    loading,
    error,
    isTimeout,
    execute,
    retry,
    reset,
  };
};

export default useAsyncState;
