# Analytics Capability Spec

## Purpose
Provide admins with insight into platform usage and outcomes through dashboards, events, and basic exports.

## Requirements

### Requirement: Admin dashboard metrics
The system SHALL display key platform metrics to admins with near real-time updates.

#### Scenario: View engagement metrics
- **WHEN** an admin opens `/admin/dashboard`
- **THEN** the system SHALL show active users, course progress, and activity charts with recent data

### Requirement: Event collection from core flows
Core flows SHALL emit analytics events for downstream aggregation.

#### Scenario: Emit events on key actions
- **WHEN** a user logs in, completes a lesson, earns a badge, or receives a certificate
- **THEN** the system SHALL emit corresponding events for analytics ingestion

### Requirement: Filtering and time windows
Admins SHALL filter analytics by time window and dimensions.

#### Scenario: Filter by date range
- **WHEN** an admin selects a custom date range
- **THEN** the system SHALL recompute and display charts for the selected period

### Requirement: Export basic reports
Admins SHALL export basic CSV summaries of selected metrics.

#### Scenario: Export CSV
- **WHEN** an admin clicks export on a report
- **THEN** the system SHALL provide a CSV download with the selected metrics
