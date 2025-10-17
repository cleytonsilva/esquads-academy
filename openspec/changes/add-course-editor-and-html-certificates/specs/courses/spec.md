## MODIFIED Requirements

### Requirement: Rich lesson authoring with WYSIWYG
Admins and instructors SHALL author and edit text lessons using a WYSIWYG editor with embeds and AI assist.

#### Scenario: Author formats text and embeds media
- Given I am in the lesson editor
- When I select content type "text"
- And I type formatted content (bold/italic/lists)
- And I embed an image or a video
- Then the content is saved as HTML and rendered to students

#### Scenario: AI generates lesson content (fallback if edge is down)
- Given I click "Gerar com IA" in the editor
- When the Edge Function is available
- Then generated HTML is inserted at the caret
- When the Edge Function is unavailable
- Then a local fallback still returns a minimal valid structure
