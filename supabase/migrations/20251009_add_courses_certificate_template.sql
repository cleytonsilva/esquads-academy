BEGIN;

ALTER TABLE IF EXISTS public.courses
  ADD COLUMN IF NOT EXISTS certificate_template_id UUID REFERENCES public.certificate_templates(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_courses_certificate_template ON public.courses(certificate_template_id);

COMMIT;

