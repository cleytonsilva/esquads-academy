# Courses Capability Spec

## Purpose
Enable admins to create structured courses with modules and lessons, and deliver them to students.

## Requirements

### Requirement: Rich lesson authoring with WYSIWYG
Admins and instructors SHALL author and edit text lessons using a WYSIWYG editor with support for basic formatting and media embeds.

#### Scenario: Author formats text and embeds media
- **WHEN** an admin edits a text lesson
- **THEN** the editor SHALL support bold, italic, lists, headings
- **AND** the editor SHALL allow image and video embeds
- **AND** the content SHALL be saved as HTML and rendered to students

#### Scenario: Render lesson to students
- **WHEN** a student opens a published text lesson
- **THEN** the system SHALL render the stored HTML safely

### Requirement: Course structure and modules
Courses SHALL be organized into modules and lessons, supporting creation, update, publish and unpublish states.

#### Scenario: Create course with modules
- **WHEN** an admin creates a new course with modules and lessons
- **THEN** the system SHALL persist the structure and metadata

#### Scenario: Publish controls visibility
- **WHEN** a course or lesson is unpublished
- **THEN** students SHALL not see it in listings or navigation

### Requirement: Enrollment and progress tracking
The system SHALL track student enrollments and per-lesson progress.

#### Scenario: Enroll and track progress
- **WHEN** a student enrolls in a course and completes lessons
- **THEN** the system SHALL record enrollment and update progress percentage

### Requirement: Versioning and drafts
The system SHALL support draft editing and publishing of courses without affecting students until published.

#### Scenario: Draft edits are isolated
- **WHEN** an admin edits draft content
- **THEN** students SHALL continue to see the last published version until publish occurs
