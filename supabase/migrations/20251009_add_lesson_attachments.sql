BEGIN;

-- Add attachments to module_lessons for rich content assets
ALTER TABLE IF EXISTS public.module_lessons
  ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

COMMIT;

