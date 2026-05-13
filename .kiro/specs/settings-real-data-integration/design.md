# Design Document: Settings Page - Real Data Integration and Password Change Functionality

## Overview

The Settings page will be refactored to fetch and display real data from backend APIs instead of mock data. The design implements four main data integration layers: Zone Management, ML Model Metrics, System Health Monitoring, and Password Change functionality. Each layer includes error handling, loading states, and user feedback mechanisms.

The implementation uses React hooks (useState, useEffect) for state management and the existing `api` service for HTTP communication. All API calls include proper error handling with user-friendly error messages and retry mechanisms.

## Architecture

### Component Structure

```
Settings (Main Component)
├── Zone Management Section
│   ├── Zone List Display
│   ├── Zone Toggle Handler
│   ├── Add Zone Form
│   ├── Delete Zone Handler
│   └── Error Display
├── ML Model Section
│   ├── Model Metrics Display
│   ├── ML Service Health Check
│   └── Error Fallback
├── System Health Section
│   ├── Uptime Display
│   ├── Service Status Display
│   └── Error Fallback
├── Password Change Section
│   ├── Password Form
│   ├── Validation Logic
│   ├── Success/Error Messages
│   └── Auto-dismiss Handler
└── Settings Persistence Section
    ├── Alert Settings
    ├── Notification Settings
    ├── Session Timeout
    └── Save All Settings Handler
```

### Data Flow

1. **Page Load**: useEffect triggers on component mount
   - Fetch zones from GET /api/zones
   - Fetch ML metrics from GET /api/ml/models
   - Fetch system health from GET /api/system/health
   - Set loading states and error states

2. **Zone Operations**: User interactions trigger API calls
   - Toggle: PUT /api/zones/{zoneId} with enabled field
   - Add: POST /api/zones with zone data
   - Delete: DELETE /api/zones/{zoneId}
   - Update local state on success, revert on failure

3. **Password Change**: Form submission triggers validation and API call
   - Validate form fields locally
   - Send PUT /api/auth/change-password
   - Display success/error messages
   - Auto-dismiss success message after 3 seconds

4. **Settings Persistence**: User clicks "Save All Settings"
   - Collect all modified settings from state
   - Display confirmation dialog
   - Persist to backend APIs
   - Handle partial failures

## Components and Interfaces

### Zone Management Component

**State Variables:**
```javascript
zones: Zone[]                    // Array of zone objects
loadingZones: boolean           // Loading state for zone fetch
zoneError: string              // Error message for zone operations
showAddZoneForm: boolean       // Toggle for add zone form visibility
newZone: ZoneFormData          // Form data for new zone
```

**Zone Interface:**
```javascript
{
  _id: string,
  name: string,                // 1-100 characters
  building: string,
  department: string,
  ipRange: string,             // CIDR notation or single IP
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical',
  zoneType: 'Academic' | 'Administrative' | 'Student Housing' | 'Infrastructure' | 'Public Access' | 'Research',
  enabled: boolean,
  createdAt: string,
  updatedAt: string
}
```

**API Endpoints:**
- GET /api/zones - Fetch all zones
- POST /api/zones - Create new zone
- PUT /api/zones/{zoneId} - Update zone (toggle enabled)
- DELETE /api/zones/{zoneId} - Delete zone

### Password Change Component

**State Variables:**
```javascript
passwordForm: {
  current: string,             // Current password
  new: string,                 // New password
  confirm: string              // Confirm new password
}
passwordError: string          // Error message
passwordSuccess: string        // Success message
```

**Validation Rules:**
- Current password: not empty
- New password: minimum 8 characters
- Confirm password: must match new password
- New password must differ from current password

**API Endpoint:**
- PUT /api/auth/change-password - Change password

### ML Model Component

**State Variables:**
```javascript
mlModel: {
  activeModel: string,         // Model name
  accuracy: number,            // 0-100 percentage
  falsePositiveRate: number,   // 0-100 percentage
  lastTrained: string          // ISO 8601 date
}
modelEnabled: boolean          // ML detection toggle
```

**API Endpoint:**
- GET /api/ml/models - Fetch ML model metrics

### System Health Component

**State Variables:**
```javascript
systemHealth: {
  uptime: string,              // Formatted uptime string
  database: 'connected' | 'disconnected',
  mlService: 'available' | 'unavailable',
  socketIO: 'active' | 'inactive'
}
```

**API Endpoint:**
- GET /api/system/health - Fetch system health

## Data Models

### Zone Model
```javascript
{
  _id: ObjectId,
  name: string,
  building: string,
  department: string,
  ipRange: string,
  riskLevel: string,
  zoneType: string,
  enabled: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Password Change Request
```javascript
{
  currentPassword: string,
  newPassword: string
}
```

### ML Model Metrics Response
```javascript
{
  activeModel: string,
  accuracy: number,
  falsePositiveRate: number,
  lastTrained: string,
  status: 'available' | 'unavailable'
}
```

### System Health Response
```javascript
{
  uptime: string,
  database: string,
  mlService: string,
  socketIO: string,
  timestamp: string
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Zone List Rendering Completeness

*For any* fetched zone data, the rendered zone list SHALL display all required fields (name, IP range, building, risk level) and include action buttons (toggle, delete) for each zone.

**Validates: Requirements 1.4**

### Property 2: Password Validation Correctness

*For any* password input combination, the validation logic SHALL correctly identify violations of the rules: new password minimum 8 characters, new password matches confirm password, and current password is not empty.

**Validates: Requirements 6.1**

### Property 3: Local State Isolation

*For any* modification to alert settings, notification settings, or session timeout, the changes SHALL be stored in component state but NOT sent to backend APIs until the "Save All Settings" button is clicked.

**Validates: Requirements 8.1**

### Property 4: Risk Level Color Coding

*For any* zone with a risk level (Low, Medium, High, Critical), the rendered zone SHALL display the correct color: Low=green, Medium=yellow, High=orange, Critical=red.

**Validates: Requirements 1.4**

### Property 5: Empty Zone List Handling

*For any* successful zone fetch that returns an empty array, the Settings page SHALL display "No zones configured" message and show the "Add New Zone" button.

**Validates: Requirements 1.5**

## Error Handling

### Zone Operations Errors

| Error Scenario | HTTP Status | User Message | Recovery |
|---|---|---|---|
| Zone fetch timeout | N/A | "Failed to load zones: Request timeout" | Retry button |
| Zone fetch failure | 4xx/5xx | "Failed to fetch zones: [error message]" | Retry button |
| Zone toggle failure | 4xx/5xx | "Failed to update zone: [error message]" | Revert toggle, show error |
| Duplicate IP range | 400 | "IP range already assigned to another zone" | Keep form open, preserve data |
| Zone add failure | 4xx/5xx | "Failed to add zone: [error message]" | Keep form open, preserve data |
| Zone delete failure | 4xx/5xx | "Failed to delete zone: [error message]" | Keep zone in list, show error |

### Password Change Errors

| Error Scenario | HTTP Status | User Message | Recovery |
|---|---|---|---|
| Validation failure | Client-side | "New passwords do not match" or "Password must be at least 8 characters" | Keep form open |
| Invalid current password | 400 | "Current password is incorrect" | Clear fields, keep form open |
| Server error | 5xx | "Password change failed: Server error" | Keep form open, preserve data |

### ML Service Errors

| Error Scenario | HTTP Status | User Message | Recovery |
|---|---|---|---|
| ML metrics fetch failure | 4xx/5xx | "ML service unavailable" | Disable ML toggle, show fallback |
| ML service offline | N/A | "ML service unavailable" | Disable ML toggle, show fallback |

### System Health Errors

| Error Scenario | HTTP Status | User Message | Recovery |
|---|---|---|---|
| System health fetch failure | 4xx/5xx | "System data unavailable" | Continue displaying other sections |

## Testing Strategy

### Unit Tests

**Zone Management:**
- Test zone list rendering with various zone data
- Test zone toggle state management
- Test add zone form validation
- Test delete zone confirmation dialog
- Test error message display for zone operations
- Test empty zone list display

**Password Change:**
- Test password validation rules (length, match, not empty)
- Test error message display for validation failures
- Test success message display and auto-dismiss
- Test form field clearing on success
- Test form field preservation on error

**ML Model:**
- Test ML model metrics display
- Test ML service unavailable fallback
- Test ML toggle state management

**System Health:**
- Test system health data display
- Test system health unavailable fallback

**Settings Persistence:**
- Test local state updates for alert settings
- Test local state updates for notification settings
- Test local state updates for session timeout
- Test that changes are not persisted until save button clicked

### Integration Tests

**Zone Operations:**
- Test zone fetch on page load with mocked API
- Test zone toggle with mocked API success/failure
- Test zone add with mocked API success/failure
- Test zone delete with mocked API success/failure
- Test retry functionality for failed operations

**Password Change:**
- Test password change form submission with mocked API
- Test success message display and auto-dismiss
- Test error handling for different HTTP status codes

**Data Fetching:**
- Test concurrent fetching of zones, ML metrics, and system health
- Test error handling when one fetch fails while others succeed
- Test page refresh reloads all data

### Property-Based Tests

**Property 1: Zone List Rendering Completeness**
- Generate random zone data with varying field values
- Render zone list component
- Verify all required fields are present in rendered output
- Verify action buttons are present for each zone

**Property 2: Password Validation Correctness**
- Generate random password combinations
- Apply validation logic
- Verify validation results match expected rules
- Test edge cases: empty strings, whitespace, special characters

**Property 3: Local State Isolation**
- Generate random setting modifications
- Verify changes are in component state
- Verify no API calls are made until save button clicked
- Verify API calls include all modified settings

**Property 4: Risk Level Color Coding**
- Generate zones with each risk level
- Render zones
- Verify correct color is applied for each risk level

**Property 5: Empty Zone List Handling**
- Fetch empty zone array
- Verify "No zones configured" message is displayed
- Verify "Add New Zone" button is visible

## Implementation Notes

1. **API Service**: Use existing `api` service from `../services/api` for all HTTP calls
2. **Error Handling**: All API calls wrapped in try-catch with specific error messages
3. **Loading States**: Show loading indicators during API calls
4. **Timeout**: Set 10-second timeout for zone fetch requests
5. **Auto-dismiss**: Success messages auto-dismiss after 3 seconds
6. **Confirmation Dialogs**: Use window.confirm() for destructive actions
7. **Form Preservation**: Keep form data in state when errors occur
8. **State Reversion**: Revert UI state on failed operations (e.g., toggle revert)
9. **Concurrent Requests**: Use Promise.all() for fetching multiple data sources
10. **Retry Mechanism**: Provide retry buttons for failed operations

