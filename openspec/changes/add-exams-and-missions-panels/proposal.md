## Why
Students need a missions panel with progress tracking and a functional exam simulator (simulados) aligned to the PRD. Admins need a simple way to generate final exams per course. These features exist in prior projects and can be adapted.

## What Changes
- Add Student Missions panel listing Available, Active, and Completed missions with progress and navigation to details
- Add Student Exams page to list exams, start timed attempts, answer MC questions, and submit for scoring
- Add Express exams API: list exams, start attempts, submit attempts, list own attempts
- Add Admin exam management to generate final exam for a course via Edge Function and list exams

## Impact
- New backend endpoints under `/api/exams` (non-breaking)
- Frontend pages: `/student/missions`, `/student/exams`, and admin `/admin/exams`
- Uses existing Supabase tables: `exams`, `exam_attempts`, `missions`, `mission_progress`

## Risks
- Scoring currently only auto-grades multiple choice; open-ended questions are not auto-scored
- Requires valid Supabase auth token for protected routes

