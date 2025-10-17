## ADDED Requirements
### Requirement: Exam simulator (student)
Students SHALL be able to view available exams, start timed attempts, answer questions, and submit to receive a score.

#### Scenario: List available exams
- WHEN a student opens the Exams page
- THEN the system SHALL list exams with title, question count, time limit, and attempts used vs limit

#### Scenario: Start exam attempt
- WHEN a student starts an exam
- THEN the system SHALL create an `exam_attempts` record and return questions and time limit

#### Scenario: Timed exam countdown
- WHEN an exam has a time limit
- THEN the UI SHALL show a countdown and auto-submit when time reaches zero

#### Scenario: Submit attempt and score
- WHEN a student submits
- THEN the backend SHALL compute score for multiple choice questions and persist `score`, `passed`, and `completed_at`

### Requirement: Multiple-choice only quizzes
All exam and quiz questions SHALL be multiple choice with options and a single correct answer.

#### Scenario: Enforce MC-only in generators
- WHEN the system generates final exams or module quizzes via Edge Functions
- THEN all questions SHALL be emitted with `type: multiple_choice`, an `options` array, and an `answer` matching one of the options

### Requirement: Exam management (admin)
Admins SHALL generate a final exam for a course and list existing exams.

#### Scenario: Generate final exam per course
- WHEN an admin selects a course and clicks “Gerar Exame”
- THEN the backend SHALL call the Edge Function to generate questions and insert a row in `exams`

### Requirement: Question bank (admin)
Admins SHALL manage a reusable question bank for multiple-choice questions with tags and difficulty.

#### Scenario: Create and list questions
- WHEN an admin fills the form with question, options, answer, difficulty, and tags
- THEN the system SHALL persist the item in `exam_question_bank` and show it in the list with filters for text, tag and difficulty
