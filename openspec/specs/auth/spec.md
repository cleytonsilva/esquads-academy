# Auth Capability Spec

## Purpose
Authenticate users, manage sessions and roles, and enforce secure access aligned with RLS.

## Requirements

### Requirement: User authentication and sessions
The system SHALL authenticate users via email and password using Supabase Auth and maintain sessions across navigation.

#### Scenario: Login success
- **WHEN** a user provides valid credentials
- **THEN** the system SHALL create a session and load the user profile
- **AND** persist the session until logout or expiry

#### Scenario: Login failure
- **WHEN** a user provides invalid credentials
- **THEN** the system SHALL reject the login with an error

#### Scenario: Logout
- **WHEN** a signed-in user triggers logout
- **THEN** the system SHALL clear the session and cached user state

#### Scenario: Password reset
- **WHEN** a user requests password recovery
- **THEN** the system SHALL send a recovery email via the auth provider

### Requirement: Role-based access control (RBAC)
The system SHALL enforce role-based routing and access for `admin` and `student` roles.

#### Scenario: Admin redirect after login
- **WHEN** an authenticated user has role `admin`
- **THEN** the system SHALL redirect to `/admin/dashboard`

#### Scenario: Student redirect after login
- **WHEN** an authenticated user has role `student`
- **THEN** the system SHALL redirect to `/student/dashboard`

#### Scenario: Unauthorized access blocked
- **WHEN** a user without the required role accesses an admin route
- **THEN** the system SHALL deny access and redirect appropriately

### Requirement: Profile normalization and RLS alignment
The system SHALL maintain a profile row linked to `auth.users` and respect Row Level Security policies.

#### Scenario: Profile row ownership
- **WHEN** a user reads or updates their profile
- **THEN** the operation SHALL be permitted only for the profile where `user_id = auth.uid()`

#### Scenario: Service actions use elevated context
- **WHEN** background tasks require broader access (e.g., admin sync)
- **THEN** the system SHALL use service role with audited access

### Requirement: Email verification before privileged actions
The system SHALL require verified emails for privileged operations.

#### Scenario: Prevent unverified admin access
- **WHEN** a user email is not verified
- **THEN** the system SHALL prevent access to admin features until verification
