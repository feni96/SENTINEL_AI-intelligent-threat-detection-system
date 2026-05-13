/**
 * Unit Tests for State Management Utilities
 * Tests state creation, updates, and queries
 */

import {
  createDataSourceState,
  createMultipleDataSourceState,
  updateDataSourceState,
  setLoading,
  setError,
  setData,
  clearError,
  resetDataSource,
  isAnyLoading,
  hasAnyError,
  getAllErrors,
  getAllData,
} from './stateManagement';

describe('createDataSourceState', () => {
  test('should create initial state for a single data source', () => {
    const state = createDataSourceState('zones');

    expect(state).toEqual({
      zones: {
        data: null,
        loading: false,
        error: null,
        isTimeout: false,
      },
    });
  });

  test('should create state with correct structure', () => {
    const state = createDataSourceState('users');

    expect(state.users).toBeDefined();
    expect(state.users.data).toBeNull();
    expect(state.users.loading).toBe(false);
    expect(state.users.error).toBeNull();
    expect(state.users.isTimeout).toBe(false);
  });
});

describe('createMultipleDataSourceState', () => {
  test('should create initial state for multiple data sources', () => {
    const state = createMultipleDataSourceState(['zones', 'users', 'settings']);

    expect(state).toHaveProperty('zones');
    expect(state).toHaveProperty('users');
    expect(state).toHaveProperty('settings');
  });

  test('should initialize all sources with correct structure', () => {
    const state = createMultipleDataSourceState(['zones', 'users']);

    Object.values(state).forEach((source) => {
      expect(source).toEqual({
        data: null,
        loading: false,
        error: null,
        isTimeout: false,
      });
    });
  });

  test('should handle empty array', () => {
    const state = createMultipleDataSourceState([]);

    expect(state).toEqual({});
  });
});

describe('updateDataSourceState', () => {
  test('should update specific data source without affecting others', () => {
    const initialState = createMultipleDataSourceState(['zones', 'users']);
    const updated = updateDataSourceState(initialState, 'zones', {
      loading: true,
    });

    expect(updated.zones.loading).toBe(true);
    expect(updated.users.loading).toBe(false);
  });

  test('should merge updates with existing state', () => {
    const initialState = createMultipleDataSourceState(['zones']);
    const updated = updateDataSourceState(initialState, 'zones', {
      data: [{ id: 1 }],
      loading: false,
    });

    expect(updated.zones.data).toEqual([{ id: 1 }]);
    expect(updated.zones.loading).toBe(false);
    expect(updated.zones.error).toBeNull();
  });

  test('should not mutate original state', () => {
    const initialState = createMultipleDataSourceState(['zones']);
    const updated = updateDataSourceState(initialState, 'zones', {
      loading: true,
    });

    expect(initialState.zones.loading).toBe(false);
    expect(updated.zones.loading).toBe(true);
  });
});

describe('setLoading', () => {
  test('should set loading state to true', () => {
    const state = createDataSourceState('zones');
    const updated = setLoading(state, 'zones', true);

    expect(updated.zones.loading).toBe(true);
  });

  test('should set loading state to false', () => {
    const state = createDataSourceState('zones');
    state.zones.loading = true;
    const updated = setLoading(state, 'zones', false);

    expect(updated.zones.loading).toBe(false);
  });
});

describe('setError', () => {
  test('should set error message', () => {
    const state = createDataSourceState('zones');
    const updated = setError(state, 'zones', 'Failed to fetch zones');

    expect(updated.zones.error).toBe('Failed to fetch zones');
  });

  test('should clear error when set to null', () => {
    const state = createDataSourceState('zones');
    state.zones.error = 'Previous error';
    const updated = setError(state, 'zones', null);

    expect(updated.zones.error).toBeNull();
  });
});

describe('setData', () => {
  test('should set data and clear error', () => {
    const state = createDataSourceState('zones');
    state.zones.error = 'Previous error';

    const data = [{ id: 1, name: 'Zone 1' }];
    const updated = setData(state, 'zones', data);

    expect(updated.zones.data).toEqual(data);
    expect(updated.zones.error).toBeNull();
  });

  test('should handle null data', () => {
    const state = createDataSourceState('zones');
    const updated = setData(state, 'zones', null);

    expect(updated.zones.data).toBeNull();
    expect(updated.zones.error).toBeNull();
  });

  test('should handle complex data structures', () => {
    const state = createDataSourceState('zones');
    const data = {
      zones: [{ id: 1 }, { id: 2 }],
      total: 2,
    };

    const updated = setData(state, 'zones', data);

    expect(updated.zones.data).toEqual(data);
  });
});

describe('clearError', () => {
  test('should clear error message', () => {
    const state = createDataSourceState('zones');
    state.zones.error = 'Some error';

    const updated = clearError(state, 'zones');

    expect(updated.zones.error).toBeNull();
  });

  test('should not affect other properties', () => {
    const state = createDataSourceState('zones');
    state.zones.error = 'Some error';
    state.zones.loading = true;
    state.zones.data = [{ id: 1 }];

    const updated = clearError(state, 'zones');

    expect(updated.zones.loading).toBe(true);
    expect(updated.zones.data).toEqual([{ id: 1 }]);
  });
});

describe('resetDataSource', () => {
  test('should reset data source to initial state', () => {
    const state = createDataSourceState('zones');
    state.zones.data = [{ id: 1 }];
    state.zones.loading = true;
    state.zones.error = 'Some error';
    state.zones.isTimeout = true;

    const updated = resetDataSource(state, 'zones');

    expect(updated.zones).toEqual({
      data: null,
      loading: false,
      error: null,
      isTimeout: false,
    });
  });

  test('should not affect other data sources', () => {
    const state = createMultipleDataSourceState(['zones', 'users']);
    state.zones.data = [{ id: 1 }];
    state.users.data = [{ id: 2 }];

    const updated = resetDataSource(state, 'zones');

    expect(updated.zones.data).toBeNull();
    expect(updated.users.data).toEqual([{ id: 2 }]);
  });
});

describe('isAnyLoading', () => {
  test('should return false when no sources are loading', () => {
    const state = createMultipleDataSourceState(['zones', 'users']);

    expect(isAnyLoading(state)).toBe(false);
  });

  test('should return true when any source is loading', () => {
    const state = createMultipleDataSourceState(['zones', 'users']);
    state.zones.loading = true;

    expect(isAnyLoading(state)).toBe(true);
  });

  test('should return true when multiple sources are loading', () => {
    const state = createMultipleDataSourceState(['zones', 'users', 'settings']);
    state.zones.loading = true;
    state.users.loading = true;

    expect(isAnyLoading(state)).toBe(true);
  });
});

describe('hasAnyError', () => {
  test('should return false when no sources have errors', () => {
    const state = createMultipleDataSourceState(['zones', 'users']);

    expect(hasAnyError(state)).toBe(false);
  });

  test('should return true when any source has an error', () => {
    const state = createMultipleDataSourceState(['zones', 'users']);
    state.zones.error = 'Failed to fetch';

    expect(hasAnyError(state)).toBe(true);
  });

  test('should return true when multiple sources have errors', () => {
    const state = createMultipleDataSourceState(['zones', 'users']);
    state.zones.error = 'Failed to fetch zones';
    state.users.error = 'Failed to fetch users';

    expect(hasAnyError(state)).toBe(true);
  });
});

describe('getAllErrors', () => {
  test('should return empty object when no errors', () => {
    const state = createMultipleDataSourceState(['zones', 'users']);

    expect(getAllErrors(state)).toEqual({});
  });

  test('should return all errors with source names as keys', () => {
    const state = createMultipleDataSourceState(['zones', 'users', 'settings']);
    state.zones.error = 'Failed to fetch zones';
    state.users.error = 'Failed to fetch users';

    const errors = getAllErrors(state);

    expect(errors).toEqual({
      zones: 'Failed to fetch zones',
      users: 'Failed to fetch users',
    });
    expect(errors.settings).toBeUndefined();
  });

  test('should only include sources with errors', () => {
    const state = createMultipleDataSourceState(['zones', 'users', 'settings']);
    state.zones.error = 'Failed to fetch zones';

    const errors = getAllErrors(state);

    expect(Object.keys(errors)).toEqual(['zones']);
  });
});

describe('getAllData', () => {
  test('should return all data with source names as keys', () => {
    const state = createMultipleDataSourceState(['zones', 'users']);
    state.zones.data = [{ id: 1 }];
    state.users.data = [{ id: 2 }];

    const data = getAllData(state);

    expect(data).toEqual({
      zones: [{ id: 1 }],
      users: [{ id: 2 }],
    });
  });

  test('should include null data for sources without data', () => {
    const state = createMultipleDataSourceState(['zones', 'users']);
    state.zones.data = [{ id: 1 }];

    const data = getAllData(state);

    expect(data.zones).toEqual([{ id: 1 }]);
    expect(data.users).toBeNull();
  });

  test('should handle complex data structures', () => {
    const state = createMultipleDataSourceState(['zones']);
    const complexData = {
      zones: [{ id: 1 }, { id: 2 }],
      total: 2,
      metadata: { page: 1 },
    };
    state.zones.data = complexData;

    const data = getAllData(state);

    expect(data.zones).toEqual(complexData);
  });
});
