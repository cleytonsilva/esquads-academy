# Proposal — Add Course WYSIWYG + HTML Certificate Templates

## Context
The platform already includes a Quill-based rich text editor for lessons and a canvas-based certificate designer. To align with PRD (customizable certificate templates) and make content authoring first-class, this change formalizes the WYSIWYG capability in specs and adds an HTML/CSS/JS certificate template editor with live preview and variable injection.

## Goals
- Expose a robust WYSIWYG flow for lesson text with media embeds and AI assist.
- Enable admins to create editable certificate templates in HTML/CSS/JS with variables.
- Provide a live preview (including provided “glare” effect) and simple export/download as HTML.
- Persist templates using Supabase table `certificate_templates` when available; fallback to local storage if schema is missing.

## Non-Goals
- Generating PDFs server-side (can be future work).
- Full DB migrations in this change; we add graceful fallback only.
- Replacing the existing canvas designer — we add an HTML tab alongside it.

## High-Level Design
- Courses: Keep current Quill editor, document requirements, ensure it’s reachable from lesson authoring.
- Certificates: New `CertificateHtmlEditor` React component with three editors (HTML/CSS/JS), preview in an iframe, variables like `{{student_name}}`, `{{course_title}}`, etc. Include glare overlay and mousemove animation in default template.
- Utilities: `buildCertificateHtml(data, template)` to assemble a single HTML document from code + data.
- Admin UI: Extend `admin/CertificateDesigner` with tabs: Visual (existing canvas) and Code (new HTML editor).
- Downloads: Provide a front-end download of the rendered HTML; existing JSON download remains as fallback.

## Risks & Mitigations
- Missing DB columns: use localStorage and a safe default template.
- XSS risk in templates: preview runs in sandboxed iframe; no direct `dangerouslySetInnerHTML` injection outside iframe.

## Acceptance Criteria
- Admin can switch to the Code tab and edit HTML/CSS/JS and see live preview.
- Default template shows a subtle moving glare effect on hover.
- Admin can save template and load it again (via DB or localStorage fallback).
- Certificates can be downloaded as self-contained `.html` containing rendered data.

