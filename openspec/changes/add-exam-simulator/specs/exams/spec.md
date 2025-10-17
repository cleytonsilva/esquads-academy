## ADDED Requirements

### Requirement: Timed exam attempts
The system SHALL allow students to start timed exam attempts and auto-submit when time elapses.

#### Scenario: Start and auto-submit
- **WHEN** a student starts an exam with duration D
- **THEN** a countdown SHALL start and the attempt SHALL auto-submit at D

### Requirement: Question bank and randomization
The system SHALL select questions from a bank with filters (tags, difficulty) and random order.

#### Scenario: Random selection by tag/difficulty
- **WHEN** an exam is configured with tags and difficulty
- **THEN** questions SHALL be drawn randomly matching criteria

### Requirement: Submission and scoring
The system SHALL compute score on submission and persist per-attempt results.

#### Scenario: Submit and receive score
- **WHEN** a student submits answers
- **THEN** the system SHALL compute the score and store results

### Requirement: Review and feedback
The system SHALL support post-exam review with configurable visibility of correct answers and rationales.

#### Scenario: Controlled review visibility
- **WHEN** review is enabled by admin
- **THEN** the student SHALL see configured fields (correctness/explanations)
