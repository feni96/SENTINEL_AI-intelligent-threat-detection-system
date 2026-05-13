# Requirements Document: Settings Page - Real Data Integration and Password Change Functionality

## Introduction

The Settings page currently displays mock/hardcoded data for zones, ML models, and system monitoring information. This feature integrates the Settings page with real backend APIs to fetch and persist live configuration data. The page will support zone management (add, delete, toggle), password changes, and display real ML model metrics and system health information.

## Glossary

- **Zone**: A network area with defined IP range, building location, department, and risk level
- **Zone_Manager**: The system component responsible for zone CRUD operations
- **Auth_Service**: The authentication service handling password changes
- **ML_Service**: The machine learning service providing model metrics and health status
- **System_Monitor**: The system component providing health and uptime information
- **Admin**: The authenticated user with administrative privileges
- **IP_Range**: A valid IP address or CIDR notation (e.g., 10.0.2.0/24)
- **Risk_Level**: Classification of zone security risk (Low, Medium, High, Critical)
- **Zone_Type**: Category of zone (Academic, Administrative, Student Housing, Infrastructure, Public Access, Research)
- **Enabled_State**: Boolean flag indicating if a zone is active (true) or inactive (false)
- **ML_Model_Metrics**: Data including model name, accuracy, false positive rate, and training date
- **System_Health**: Data including uptime, database status, ML service status, and socket.io status

## Requirements

### Requirement 1: Zone Data Fetching

**User Story:** As an administrator, I want the Settings page to fetch real zone data from the backend, so that I can see the current network zones configured in the system.

#### Acceptance Criteria

1. WHEN the Settings page loads, THE Zone_Manager SHALL fetch zones from GET /api/zones endpoint and display the list with zone name, IP range, building, department, and risk level.

2. IF the zone fetch request fails with HTTP 4xx or 5xx status, THEN THE Zone_Manager SHALL display an error message indicating the failure reason and provide a "Retry" button to reload zones.

3. IF the zone fetch request times out after 10 seconds, THEN THE Zone_Manager SHALL display an error message "Failed to load zones: Request timeout" and provide a "Retry" button.

4. WHEN zone data is successfully fetched, THE Zone_Manager SHALL display zones in a list format with each zone showing: enabled toggle checkbox, zone name, IP range, building name, risk level (color-coded: Critical=red, High=orange, Medium=yellow, Low=green), and Delete button.

5. IF a zone list is empty after successful fetch, THE Zone_Manager SHALL display "No zones configured" message and show the "Add New Zone" button.

6. WHEN the page loads or user refreshes, THE Zone_Manager SHALL reload all zone data from backend API without requiring user action.

### Requirement 2: Zone Toggle Functionality

**User Story:** As an administrator, I want to enable or disable zones without leaving the Settings page, so that I can quickly manage zone status.

#### Acceptance Criteria

1. WHEN a user toggles a zone's enabled status, THE Zone_Manager SHALL send a PUT request to /api/zones/{zoneId} with the updated enabled field and update the UI to reflect the new state.

2. IF the zone toggle request fails, THEN THE Zone_Manager SHALL revert the UI toggle to its previous state and display an error message indicating the failure.

### Requirement 3: Zone Addition

**User Story:** As an administrator, I want to add new zones through the Settings page, so that I can expand network coverage without accessing the backend directly.

#### Acceptance Criteria

1. WHEN a user clicks "Add New Zone", THE Zone_Manager SHALL display a form with required fields: name (1-100 characters), building (required), department (required), IP range (valid CIDR notation or single IP), risk level (Low/Medium/High/Critical), and zone type (Academic/Administrative/Student Housing/Infrastructure/Public Access/Research).

2. WHEN a user submits the add zone form with valid data, THE Zone_Manager SHALL send a POST request to /api/zones with the zone data and add the new zone to the displayed list.

3. IF the add zone request fails with validation error (e.g., duplicate IP range), THEN THE Zone_Manager SHALL display an error message indicating the specific validation failure and keep the form open with user data preserved.

4. WHEN a user adds a zone with an IP range that already exists in another zone, THE Zone_Manager SHALL display an error message "IP range already assigned to another zone" and keep the form open.

### Requirement 4: Zone Deletion

**User Story:** As an administrator, I want to delete zones from the Settings page, so that I can remove outdated or incorrect zone configurations.

#### Acceptance Criteria

1. WHEN a user clicks "Delete" on a zone, THE Zone_Manager SHALL display a confirmation dialog asking "Are you sure you want to delete this zone?" and only proceed with deletion if user confirms.

2. WHEN a user confirms zone deletion, THE Zone_Manager SHALL send a DELETE request to /api/zones/{zoneId} and remove the zone from the displayed list.

3. IF the zone delete request fails, THEN THE Zone_Manager SHALL display an error message and keep the zone in the list.

### Requirement 5: ML Model Metrics Display

**User Story:** As an administrator, I want to see real ML model metrics on the Settings page, so that I can monitor the performance of the threat detection model.

#### Acceptance Criteria

1. WHEN the Settings page loads, THE ML_Service SHALL fetch ML model metrics from GET /api/ml/models endpoint and display: active model name, accuracy percentage (0-100), false positive rate (0-100), and last trained date in ISO 8601 format.

2. IF the ML model metrics fetch fails or the service is unavailable, THEN THE ML_Service SHALL display "ML service unavailable" for model information and set the "Enable ML Detection" toggle to disabled state.

3. WHEN the Settings page is displayed, THE ML_Service SHALL display ML model information as read-only fields (not editable) showing: active model name, accuracy percentage, false positive rate, and last trained date.

4. WHEN a user toggles the "Enable ML Detection" checkbox, THE ML_Service SHALL update the modelEnabled state and persist this setting to backend when "Save All Settings" is clicked.

### Requirement 6: Password Change Functionality

**User Story:** As an administrator, I want to change my password through the Settings page, so that I can maintain account security.

#### Acceptance Criteria

1. WHEN a user enters the current password, new password, and confirm password in the password change form, THE Auth_Service SHALL validate that: new password is at least 8 characters long, new password matches confirm password, and current password is not empty.

2. IF password validation fails, THEN THE Auth_Service SHALL display a specific error message indicating which validation rule failed (e.g., "New passwords do not match" or "Password must be at least 8 characters").

3. WHEN a user submits the password change form with valid data, THE Auth_Service SHALL send a PUT request to /api/auth/change-password with currentPassword and newPassword fields.

4. IF the password change request succeeds, THEN THE Auth_Service SHALL display a success message "Password changed successfully", clear all password form fields, and automatically dismiss the success message after 3 seconds.

5. IF the password change request fails with HTTP 400 status (invalid current password), THEN THE Auth_Service SHALL display an error message "Current password is incorrect" and keep the form open with fields cleared.

6. IF the password change request fails with HTTP 5xx status, THEN THE Auth_Service SHALL display an error message "Password change failed: Server error" and keep the form open with user data preserved.

### Requirement 7: System Health Monitoring

**User Story:** As an administrator, I want to see real system health information on the Settings page, so that I can monitor the overall system status.

#### Acceptance Criteria

1. WHEN the Settings page loads, THE System_Monitor SHALL fetch system health data from GET /api/system/health endpoint and display: server uptime in formatted string (e.g., "5 days, 3 hours, 22 minutes"), and service status (database, ML service, socket.io) as connected/available/active.

2. IF the system health fetch fails, THEN THE System_Monitor SHALL display "System data unavailable" for monitoring information and continue displaying other settings sections.

### Requirement 8: Settings Persistence

**User Story:** As an administrator, I want to save all modified settings at once, so that I can manage multiple configuration changes efficiently.

#### Acceptance Criteria

1. WHEN a user modifies alert settings (severity threshold, confidence score, threat types), notification settings (channels, severities), or session timeout, THE System SHALL store these values in component state but NOT persist to backend until user clicks "Save All Settings" button.

2. WHEN a user clicks "Save All Settings" button, THE System SHALL display a confirmation dialog showing which settings will be saved and persist all modified settings to backend APIs.

3. IF any settings save request fails, THEN THE System SHALL display an error message indicating which setting failed to save and allow user to retry or cancel.

