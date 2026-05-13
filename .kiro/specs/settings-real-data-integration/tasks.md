# Implementation Plan: Settings Page - Real Data Integration and Password Change Functionality

## Overview

This implementation plan converts the Settings page from using mock data to fetching and persisting real data from backend APIs. The work is organized into logical phases: zone management, password change, ML model integration, system health monitoring, and settings persistence. Each phase includes implementation tasks and corresponding unit/integration tests.

## Tasks

- [x] 1. Set up data fetching infrastructure and error handling
  - Create utility functions for API error handling and retry logic
  - Set up loading and error state management for all data sources
  - Implement timeout handling (10 seconds) for zone fetch requests
  - _Requirements: 1.1, 1.2, 1.3, 5.1, 5.2, 7.1, 7.2_

- [x] 2. Implement zone data fetching and display
  - [x] 2.1 Fetch zones from GET /api/zones on component mount
    - Implement useEffect hook to fetch zones on page load
    - Handle loading state during fetch
    - Parse zone response and store in state
    - _Requirements: 1.1, 1.6_
  
  - [ ]* 2.2 Write unit tests for zone fetch
    - Test successful zone fetch with mocked API
    - Test error handling for 4xx/5xx responses
    - Test timeout handling after 10 seconds
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 2.3 Render zone list with all required fields
    - Display zone name, IP range, building, department, risk level
    - Implement color coding for risk levels (Critical=red, High=orange, Medium=yellow, Low=green)
    - Add toggle checkbox and delete button for each zone
    - _Requirements: 1.4, 1.5_
  
  - [ ]* 2.4 Write property test for zone list rendering
    - **Property 1: Zone List Rendering Completeness**
    - **Validates: Requirements 1.4**
  
  - [ ]* 2.5 Write property test for risk level color coding
    - **Property 4: Risk Level Color Coding**
    - **Validates: Requirements 1.4**

- [ ] 3. Implement zone toggle functionality
  - [x] 3.1 Implement zone toggle handler
    - Send PUT request to /api/zones/{zoneId} with enabled field
    - Update UI state on success
    - Revert toggle on failure and show error message
    - _Requirements: 2.1, 2.2_
  
  - [ ]* 3.2 Write unit tests for zone toggle
    - Test successful toggle with mocked API
    - Test toggle revert on API failure
    - Test error message display
    - _Requirements: 2.1, 2.2_

- [ ] 4. Implement zone addition functionality
  - [ ] 4.1 Create add zone form with all required fields
    - Render form with: name, building, department, IP range, risk level, zone type
    - Implement form field validation (name 1-100 chars, required fields)
    - Add submit and cancel buttons
    - _Requirements: 3.1_
  
  - [ ] 4.2 Implement zone add handler
    - Validate form data before submission
    - Send POST request to /api/zones with zone data
    - Add new zone to zone list on success
    - Display error message and preserve form data on failure
    - Handle duplicate IP range error specifically
    - _Requirements: 3.2, 3.3, 3.4_
  
  - [ ]* 4.3 Write unit tests for zone addition
    - Test form validation
    - Test successful zone addition
    - Test duplicate IP range error handling
    - Test form data preservation on error
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 5. Implement zone deletion functionality
  - [ ] 5.1 Implement delete zone handler
    - Show confirmation dialog before deletion
    - Send DELETE request to /api/zones/{zoneId} on confirmation
    - Remove zone from list on success
    - Display error message and keep zone in list on failure
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ]* 5.2 Write unit tests for zone deletion
    - Test confirmation dialog display
    - Test successful zone deletion
    - Test error handling on delete failure
    - _Requirements: 4.1, 4.2, 4.3_

- [ ] 6. Implement password change functionality
  - [ ] 6.1 Implement password validation logic
    - Validate current password is not empty
    - Validate new password is at least 8 characters
    - Validate new password matches confirm password
    - Display specific error messages for each validation failure
    - _Requirements: 6.1, 6.2_
  
  - [ ]* 6.2 Write property test for password validation
    - **Property 2: Password Validation Correctness**
    - **Validates: Requirements 6.1**
  
  - [ ] 6.3 Implement password change form submission
    - Send PUT request to /api/auth/change-password with currentPassword and newPassword
    - Display success message on success
    - Clear form fields on success
    - Auto-dismiss success message after 3 seconds
    - _Requirements: 6.3, 6.4_
  
  - [ ] 6.4 Implement password change error handling
    - Handle HTTP 400 (invalid current password) with specific error message
    - Handle HTTP 5xx (server error) with specific error message
    - Preserve form data on error
    - Clear fields on 400 error
    - _Requirements: 6.5, 6.6_
  
  - [ ]* 6.5 Write unit tests for password change
    - Test validation for each rule
    - Test successful password change
    - Test error handling for 400 and 5xx responses
    - Test success message auto-dismiss
    - Test form field clearing/preservation
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ] 7. Implement ML model metrics display
  - [ ] 7.1 Fetch ML model metrics from GET /api/ml/models
    - Fetch on component mount
    - Handle loading state
    - Parse response and store in state
    - _Requirements: 5.1_
  
  - [ ] 7.2 Display ML model metrics as read-only fields
    - Show active model name, accuracy, false positive rate, last trained date
    - Display as read-only (not editable)
    - Format accuracy and false positive rate as percentages
    - Format date in ISO 8601 format
    - _Requirements: 5.3_
  
  - [ ] 7.3 Implement ML service unavailable fallback
    - Display "ML service unavailable" when fetch fails
    - Disable "Enable ML Detection" toggle when service unavailable
    - _Requirements: 5.2_
  
  - [ ]* 7.4 Write unit tests for ML model display
    - Test successful ML metrics fetch and display
    - Test ML service unavailable fallback
    - Test toggle disable when service unavailable
    - _Requirements: 5.1, 5.2, 5.3_

- [ ] 8. Implement system health monitoring
  - [ ] 8.1 Fetch system health from GET /api/system/health
    - Fetch on component mount
    - Handle loading state
    - Parse response and store in state
    - _Requirements: 7.1_
  
  - [ ] 8.2 Display system health information
    - Show server uptime in formatted string (e.g., "5 days, 3 hours, 22 minutes")
    - Show service status (database, ML service, socket.io) as connected/available/active
    - _Requirements: 7.1_
  
  - [ ] 8.3 Implement system health unavailable fallback
    - Display "System data unavailable" when fetch fails
    - Continue displaying other settings sections
    - _Requirements: 7.2_
  
  - [ ]* 8.4 Write unit tests for system health display
    - Test successful system health fetch and display
    - Test system health unavailable fallback
    - Test uptime formatting
    - _Requirements: 7.1, 7.2_

- [ ] 9. Implement settings persistence
  - [ ] 9.1 Implement local state management for settings
    - Store alert settings (severity threshold, confidence score, threat types) in state
    - Store notification settings (channels, severities) in state
    - Store session timeout in state
    - Do NOT persist to backend until save button clicked
    - _Requirements: 8.1_
  
  - [ ]* 9.2 Write property test for local state isolation
    - **Property 3: Local State Isolation**
    - **Validates: Requirements 8.1**
  
  - [ ] 9.3 Implement save all settings handler
    - Collect all modified settings from state
    - Display confirmation dialog showing which settings will be saved
    - Send settings to backend APIs
    - Handle partial failures (some settings save, others fail)
    - Display error message indicating which setting failed
    - _Requirements: 8.2, 8.3_
  
  - [ ]* 9.4 Write unit tests for settings persistence
    - Test local state updates for each setting type
    - Test that changes are not persisted until save clicked
    - Test successful settings save
    - Test error handling for partial failures
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 10. Implement empty zone list handling
  - [ ] 10.1 Display "No zones configured" message for empty list
    - Check if zones array is empty after successful fetch
    - Display "No zones configured" message
    - Show "Add New Zone" button
    - _Requirements: 1.5_
  
  - [ ]* 10.2 Write property test for empty zone list handling
    - **Property 5: Empty Zone List Handling**
    - **Validates: Requirements 1.5**

- [ ] 11. Implement retry mechanisms
  - [ ] 11.1 Add retry button for zone fetch failures
    - Display retry button in error message
    - Implement retry handler that re-fetches zones
    - _Requirements: 1.2, 1.3_
  
  - [ ] 11.2 Add retry button for ML metrics fetch failures
    - Display retry button in error message
    - Implement retry handler that re-fetches ML metrics
    - _Requirements: 5.2_
  
  - [ ] 11.3 Add retry button for system health fetch failures
    - Display retry button in error message
    - Implement retry handler that re-fetches system health
    - _Requirements: 7.2_

- [ ] 12. Checkpoint - Ensure all tests pass
  - Ensure all unit tests pass
  - Ensure all property tests pass
  - Ensure all integration tests pass
  - Ask the user if questions arise.

- [ ] 13. Integration testing and refinement
  - [ ] 13.1 Test zone operations with real backend
    - Test zone fetch, add, toggle, delete with real API
    - Verify error handling with real error responses
    - _Requirements: 1.1, 2.1, 3.2, 4.2_
  
  - [ ] 13.2 Test password change with real backend
    - Test password change with real API
    - Verify error handling with real error responses
    - _Requirements: 6.3, 6.4, 6.5, 6.6_
  
  - [ ] 13.3 Test ML metrics and system health with real backend
    - Test ML metrics fetch with real API
    - Test system health fetch with real API
    - Verify fallback behavior when services unavailable
    - _Requirements: 5.1, 5.2, 7.1, 7.2_

- [ ] 14. Final checkpoint - Ensure all tests pass and Settings page works end-to-end
  - Ensure all tests pass
  - Test Settings page end-to-end with real backend
  - Verify all data is fetched and displayed correctly
  - Verify all operations (add, delete, toggle, password change) work correctly
  - Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Integration tests verify real backend API integration
- All API calls use the existing `api` service from `../services/api`
- Error messages should be user-friendly and specific
- Loading states should be shown during API calls
- Retry mechanisms should be provided for failed operations

