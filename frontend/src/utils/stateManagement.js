/**
 * State Management Utilities
 * Provides patterns for managing loading and error states across multiple data sources
 */

/**
 * Creates initial state for a data source
 * @param {string} name - Name of the data source
 * @returns {Object} Initial state object
 */
export const createDataSourceState = (name) => {
  return {
    [name]: {
      data: null,
      loading: false,
      error: null,
      isTimeout: false,
    },
  };
};

/**
 * Creates initial state for multiple data sources
 * @param {string[]} names - Array of data source names
 * @returns {Object} Initial state object with all data sources
 */
export const createMultipleDataSourceState = (names) => {
  const state = {};
  names.forEach((name) => {
    state[name] = {
      data: null,
      loading: false,
      error: null,
      isTimeout: false,
    };
  });
  return state;
};

/**
 * Updates state for a specific data source
 * @param {Object} state - Current state
 * @param {string} source - Data source name
 * @param {Object} updates - Updates to apply
 * @returns {Object} Updated state
 */
export const updateDataSourceState = (state, source, updates) => {
  return {
    ...state,
    [source]: {
      ...state[source],
      ...updates,
    },
  };
};

/**
 * Sets loading state for a data source
 * @param {Object} state - Current state
 * @param {string} source - Data source name
 * @param {boolean} loading - Loading state
 * @returns {Object} Updated state
 */
export const setLoading = (state, source, loading) => {
  return updateDataSourceState(state, source, { loading });
};

/**
 * Sets error state for a data source
 * @param {Object} state - Current state
 * @param {string} source - Data source name
 * @param {string|null} error - Error message
 * @returns {Object} Updated state
 */
export const setError = (state, source, error) => {
  return updateDataSourceState(state, source, { error });
};

/**
 * Sets data for a data source
 * @param {Object} state - Current state
 * @param {string} source - Data source name
 * @param {*} data - Data to set
 * @returns {Object} Updated state
 */
export const setData = (state, source, data) => {
  return updateDataSourceState(state, source, { data, error: null });
};

/**
 * Clears error for a data source
 * @param {Object} state - Current state
 * @param {string} source - Data source name
 * @returns {Object} Updated state
 */
export const clearError = (state, source) => {
  return updateDataSourceState(state, source, { error: null });
};

/**
 * Resets state for a data source
 * @param {Object} state - Current state
 * @param {string} source - Data source name
 * @returns {Object} Updated state
 */
export const resetDataSource = (state, source) => {
  return updateDataSourceState(state, source, {
    data: null,
    loading: false,
    error: null,
    isTimeout: false,
  });
};

/**
 * Checks if any data source is loading
 * @param {Object} state - Current state
 * @returns {boolean} True if any source is loading
 */
export const isAnyLoading = (state) => {
  return Object.values(state).some((source) => source.loading);
};

/**
 * Checks if any data source has an error
 * @param {Object} state - Current state
 * @returns {boolean} True if any source has an error
 */
export const hasAnyError = (state) => {
  return Object.values(state).some((source) => source.error);
};

/**
 * Gets all errors from state
 * @param {Object} state - Current state
 * @returns {Object} Object with source names as keys and errors as values
 */
export const getAllErrors = (state) => {
  const errors = {};
  Object.entries(state).forEach(([source, sourceState]) => {
    if (sourceState.error) {
      errors[source] = sourceState.error;
    }
  });
  return errors;
};

/**
 * Gets all data from state
 * @param {Object} state - Current state
 * @returns {Object} Object with source names as keys and data as values
 */
export const getAllData = (state) => {
  const data = {};
  Object.entries(state).forEach(([source, sourceState]) => {
    data[source] = sourceState.data;
  });
  return data;
};
