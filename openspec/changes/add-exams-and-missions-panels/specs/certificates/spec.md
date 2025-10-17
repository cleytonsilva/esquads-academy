## ADDED Requirements
### Requirement: Auto-issue certificate on final exam pass
Students who pass a final exam SHALL have a certificate issued automatically.

#### Scenario: Issue on exam pass
- WHEN a student submits a final exam attempt with a score >= passing score
- THEN the backend SHALL create a certificate record for the course if one does not already exist
- AND the record SHALL include verification data and a link for validation

