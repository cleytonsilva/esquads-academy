BEGIN;

-- Extend missions table with fields used by API/UI
ALTER TABLE IF EXISTS public.missions
  ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS objective TEXT,
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'terminal',
  ADD COLUMN IF NOT EXISTS content TEXT,
  ADD COLUMN IF NOT EXISTS is_required BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS steps JSONB DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_missions_course ON public.missions(course_id);

COMMIT;

