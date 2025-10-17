# Supabase Deploy Guide

This project uses Supabase for DB, Storage, and Edge Functions.

## Prerequisites
- Supabase project and org access
- Access Token (PAT) with write access
- Project ref: anyjcglrdkfkfdylcwxo (from VITE_SUPABASE_URL)

## Login and Link
- PowerShell (Windows):
  - `$env:SUPABASE_ACCESS_TOKEN = 'your_pat_here'`
  - `npx --yes supabase login --token $env:SUPABASE_ACCESS_TOKEN`
  - `npx --yes supabase link --project-ref anyjcglrdkfkfdylcwxo`

## Deploy Edge Functions
- `npx --yes supabase functions deploy ai_generate_course_structure`
- `npx --yes supabase functions deploy ai_generate_lesson_content`
- `npx --yes supabase functions deploy ai_generate_module_quiz`
- `npx --yes supabase functions deploy ai_generate_final_exam`

## Apply Migrations (Remote)
- `npx --yes supabase db push`

Migrations leveraged:
- `20251009_update_roles_admin_student.sql`
- `20251009_add_lesson_attachments.sql`
- `20251009_create_certificate_templates.sql`

## Notes
- Storage buckets created on-demand by API (`/api/uploads`) with public read.
- Edge Functions are simple stubs; replace logic with your AI provider calls.
