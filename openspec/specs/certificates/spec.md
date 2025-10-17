# Certificates Capability Spec

## Purpose
Issue, verify, and deliver course completion certificates with verifiable data for students.

## Requirements

### Requirement: Certificate issuance upon completion
The system SHALL issue certificates to students who meet completion criteria for a course or path.

#### Scenario: Issue certificate on course completion
- **WHEN** a student completes a course with required criteria
- **THEN** the system SHALL generate a certificate record with course, student and completion metadata

### Requirement: Certificate verification and sharing
The system SHALL provide verification data and a shareable link for each issued certificate.

#### Scenario: Public verification link
- **WHEN** a verification link is accessed
- **THEN** the system SHALL display certificate validity and key details without exposing sensitive data

### Requirement: Download and render
The system SHALL allow students to download a rendered certificate suitable for sharing.

#### Scenario: Download certificate artifact
- **WHEN** a student requests download of their certificate
- **THEN** the system SHALL provide a downloadable artifact (e.g., image or HTML) representing the certificate
