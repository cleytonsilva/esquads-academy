## ADDED Requirements

### Requirement: Two-Factor Authentication (2FA)
The system SHALL require an additional authentication factor for users with `mfa_enabled = true`.

#### Scenario: Admin login requires OTP
- **WHEN** an admin provides valid credentials and `mfa_enabled = true`
- **THEN** the system SHALL generate a one-time code, store a hash with TTL 5 minutes, and send the OTP via email
- **AND** the UI SHALL prompt for the OTP code
- **AND** the login SHALL only complete after successful OTP verification

#### Scenario: Student login without 2FA
- **WHEN** a student provides valid credentials and `mfa_enabled = false`
- **THEN** the system SHALL log in without the OTP challenge

#### Scenario: OTP expired
- **WHEN** user enters a valid expired code after TTL
- **THEN** the system SHALL reject the code with an "expired" error and allow resend respecting rate limits

#### Scenario: Rate limiting and attempts
- **WHEN** OTP verification is attempted more than 5 times
- **THEN** the system SHALL lock the OTP and require new code generation

#### Scenario: Resend cooldown
- **WHEN** user requests OTP resend
- **THEN** the system SHALL enforce a minimum 30s cooldown between sends

#### Scenario: Audit and observability
- **WHEN** OTP is sent or verified
- **THEN** the system SHALL emit events `auth.otp_sent` and `auth.otp_verified` for analytics