## MODIFIED Requirements
### Requirement: AI-assisted missions with progressive hints
The system SHALL provide interactive missions with chatbot assistance and progressive hints, and present them in a student missions panel grouping active, available, and completed missions.

#### Scenario: Start mission from panel
- WHEN a student clicks “Iniciar” on an Available mission in the Missions panel
- THEN the system SHALL create a mission_progress record and navigate to the mission detail

#### Scenario: Show active missions with progress
- WHEN a student has mission_progress with status active
- THEN the Missions panel SHALL display those missions with a progress bar and a link to continue

#### Scenario: Show completed missions
- WHEN a student has completed missions
- THEN the Missions panel SHALL list them in a Completed section

### Requirement: Mission progress tracking
The system SHALL persist mission progress, status, and completion outcomes per student and reflect it in the Missions panel.

#### Scenario: Resume mission from panel
- WHEN a student clicks on an active mission
- THEN the system SHALL navigate to the mission detail where progress is restored

