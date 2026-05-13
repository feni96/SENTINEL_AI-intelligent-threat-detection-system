# Data Fetching Infrastructure Guide

This guide explains how to use the data fetching utilities for API error handling, retry logic, and timeout management in the Sentinel AI frontend.

## Overview

The data fetching infrastructure provides:

1. **Error Handling**: Standardized error messages and error classification
2. **Retry Logic**: Automatic retry with exponential backoff
3. **Timeout Management**: Request timeout handling (default 10 seconds)
4. **State Management**: Reusable patterns for loading and error states
5. **Custom Hooks**: React hooks for managing async operations

## Core Utilities

### 1. API Error Handler (`apiErrorHandler.js`)

#### Error Classes

```javascript
import { APIError, TimeoutError } from './utils/apiErrorHandler';

// Create custom API errors
const error = new APIError('Failed to fetch zones', 400);

// Timeout errors
const timeoutError = new TimeoutError('Request took too long');
```

#### Error Message Extraction

```javascript
import { getErrorMessage } from './utils/apiErrorHandler';

try {
  // API call
} catch (error) {
  const message = getErrorMessage(error);
  // Returns user-friendly message like "Invalid request data"
}
```

#### Timeout Handling

```javascript
import { withTimeout } from './utils/apiErrorHandler';

// Wrap API call with 10-second timeout
const result = await withTimeout(
  api.get('/zones'),
  10000 // timeout in milliseconds
);
```

#### Retry Logic

```javascript
import { withRetry } from './utils/apiErrorHandler';

// Retry up to 3 times with exponential backoff
const result = await withRetry(
  () => api.get('/zones'),
  3,        // max retries
  1000      // initial delay in ms
);
```

#### Full Error Handling

```javascript
import { handleAPIError } from './utils/apiErrorHandler';

try {
  // API call
} catch (error) {
  const errorInfo = handleAPIError(error);
  console.log(errorInfo.message);        // User-friendly message
  console.log(errorInfo.statusCode);     // HTTP status code
  console.log(errorInfo.isTimeout);      // Is it a timeout?
  console.log(errorInfo.isNetworkError); // Is it a network error?
}
```

#### Execute API Call with Full Options

```javascript
import { executeAPICall } from './utils/apiErrorHandler';

const result = await executeAPICall(
  () => api.get('/zones'),
  {
    timeout: 10000,
    maxRetries: 3,
    onSuccess: (data) => console.log('Success:', data),
    onError: (errorInfo) => console.log('Error:', errorInfo.message)
  }
);
```

### 2. State Management (`stateManagement.js`)

#### Create State for Single Data Source

```javascript
import { createDataSourceState, setLoading, setData, setError } from './utils/stateManagement';

const state = createDataSourceState('zones');
// Result: { zones: { data: null, loading: false, error: null, isTimeout: false } }

// Update state
const updated = setLoading(state, 'zones', true);
const updated2 = setData(updated, 'zones', [{ id: 1 }]);
const updated3 = setError(updated2, 'zones', 'Failed to fetch');
```

#### Create State for Multiple Data Sources

```javascript
import { createMultipleDataSourceState } from './utils/stateManagement';

const state = createMultipleDataSourceState(['zones', 'users', 'settings']);
// Result: { zones: {...}, users: {...}, settings: {...} }
```

#### Query State

```javascript
import { isAnyLoading, hasAnyError, getAllErrors, getAllData } from './utils/stateManagement';

if (isAnyLoading(state)) {
  // Show loading indicator
}

if (hasAnyError(state)) {
  // Show error message
}

const errors = getAllErrors(state);
// Result: { zones: 'Failed to fetch zones', users: 'Failed to fetch users' }

const data = getAllData(state);
// Result: { zones: [...], users: [...], settings: {...} }
```

### 3. Custom Hook (`useAsyncState.js`)

#### Basic Usage

```javascript
import { useAsyncState } from './utils/useAsyncState';
import api from './services/api';

function MyComponent() {
  const { data, loading, error, retry } = useAsyncState(
    () => api.get('/zones'),
    { timeout: 10000 }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error} <button onClick={retry}>Retry</button></div>;
  
  return <div>{data.zones.map(z => <div key={z._id}>{z.name}</div>)}</div>;
}
```

#### Advanced Options

```javascript
const { data, loading, error, isTimeout, execute, retry, reset } = useAsyncState(
  () => api.get('/zones'),
  {
    timeout: 10000,      // Request timeout in ms
    maxRetries: 3,       // Number of retries
    autoExecute: true    // Execute on mount (default: true)
  }
);

// Manual execution
await execute();

// Retry failed request
await retry();

// Reset state
reset();
```

## Usage Patterns

### Pattern 1: Simple Data Fetch with Error Handling

```javascript
import { useState, useEffect } from 'react';
import api from '../services/api';
import { handleAPIError } from '../utils/apiErrorHandler';

function Settings() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        setLoading(true);
        const response = await api.get('/zones');
        setZones(response.data.data.zones);
        setError(null);
      } catch (err) {
        const errorInfo = handleAPIError(err);
        setError(errorInfo.message);
      } finally {
        setLoading(false);
      }
    };

    fetchZones();
  }, []);

  if (loading) return <div>Loading zones...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{zones.map(z => <div key={z._id}>{z.name}</div>)}</div>;
}
```

### Pattern 2: Multiple Data Sources with State Management

```javascript
import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  createMultipleDataSourceState, 
  updateDataSourceState,
  isAnyLoading,
  hasAnyError 
} from '../utils/stateManagement';

function Settings() {
  const [state, setState] = useState(
    createMultipleDataSourceState(['zones', 'mlModels', 'systemHealth'])
  );

  useEffect(() => {
    const fetchAllData = async () => {
      // Fetch zones
      setState(prev => updateDataSourceState(prev, 'zones', { loading: true }));
      try {
        const response = await api.get('/zones');
        setState(prev => updateDataSourceState(prev, 'zones', { 
          data: response.data.data.zones,
          error: null 
        }));
      } catch (error) {
        setState(prev => updateDataSourceState(prev, 'zones', { 
          error: error.message 
        }));
      }

      // Similar for mlModels and systemHealth...
    };

    fetchAllData();
  }, []);

  if (isAnyLoading(state)) return <div>Loading...</div>;
  if (hasAnyError(state)) return <div>Error loading data</div>;

  return <div>Data loaded successfully</div>;
}
```

### Pattern 3: Using Custom Hook

```javascript
import { useAsyncState } from '../utils/useAsyncState';
import api from '../services/api';

function Settings() {
  const zones = useAsyncState(
    () => api.get('/zones'),
    { timeout: 10000 }
  );

  const mlModels = useAsyncState(
    () => api.get('/ml/models'),
    { timeout: 10000 }
  );

  if (zones.loading || mlModels.loading) return <div>Loading...</div>;
  if (zones.error) return <div>Error: {zones.error} <button onClick={zones.retry}>Retry</button></div>;
  if (mlModels.error) return <div>Error: {mlModels.error} <button onClick={mlModels.retry}>Retry</button></div>;

  return (
    <div>
      <div>Zones: {zones.data.zones.length}</div>
      <div>ML Models: {mlModels.data.models.length}</div>
    </div>
  );
}
```

## Error Handling Best Practices

### 1. Always Handle Timeouts

```javascript
import { handleAPIError } from '../utils/apiErrorHandler';

try {
  const result = await api.get('/zones');
} catch (error) {
  const errorInfo = handleAPIError(error);
  if (errorInfo.isTimeout) {
    // Show timeout-specific message
    showMessage('Request timed out. Please try again.');
  } else {
    showMessage(errorInfo.message);
  }
}
```

### 2. Provide Retry Buttons

```javascript
function ZoneList() {
  const { data, error, retry } = useAsyncState(
    () => api.get('/zones'),
    { timeout: 10000 }
  );

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        <button onClick={retry}>Retry</button>
      </div>
    );
  }

  return <div>{/* render zones */}</div>;
}
```

### 3. Use Exponential Backoff for Retries

```javascript
import { withRetry } from '../utils/apiErrorHandler';

// Automatically retries with exponential backoff
const result = await withRetry(
  () => api.get('/zones'),
  3,     // max retries
  1000   // initial delay (1s, then 2s, then 4s)
);
```

## Timeout Configuration

### Default Timeout (10 seconds)

```javascript
// Uses default 10-second timeout
const result = await withTimeout(api.get('/zones'));
```

### Custom Timeout

```javascript
// 5-second timeout
const result = await withTimeout(api.get('/zones'), 5000);

// 30-second timeout for long-running operations
const result = await withTimeout(api.get('/reports'), 30000);
```

## Testing

All utilities include comprehensive unit tests. Run tests with:

```bash
npm test
```

Tests cover:
- Error message extraction
- Timeout handling
- Retry logic with exponential backoff
- State management operations
- Error classification

## Summary

The data fetching infrastructure provides a robust foundation for:

1. **Consistent error handling** across all API calls
2. **Automatic retry logic** with exponential backoff
3. **Timeout management** with configurable timeouts
4. **State management patterns** for loading and error states
5. **React hooks** for easy integration in components

Use these utilities to ensure reliable, user-friendly data fetching throughout the application.
