## ADDED Requirements

### Requirement: HTML/CSS/JS certificate templates with live preview
Admins SHALL be able to create, edit, preview, and save certificate templates written in HTML/CSS/JS with variable placeholders.

#### Scenario: Edit and preview template
- Given I open Certificate Designer (Admin)
- When I switch to the Code tab
- And I edit HTML/CSS/JS
- Then a live preview updates with provided sample data

#### Scenario: Save and load templates
- Given I have edited a template
- When I click Save
- Then the template persists in `certificate_templates` (when table exists)
- And otherwise persists to localStorage as fallback

#### Scenario: Download rendered certificate as HTML
- Given a student’s certificate data
- When I click Download
- Then a self-contained `.html` is downloaded with rendered variables and effects

### Requirement: Include moving glare effect by default
The default template SHALL include a subtle moving glare overlay that animates with pointer movement and fades in/out.

#### Scenario: Hover glare animation
- Given the preview is visible
- When I move the pointer across the certificate area
- Then a glare overlay moves and fades smoothly
