BEGIN;

CREATE TABLE IF NOT EXISTS public.certificate_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  background_url TEXT,
  elements JSONB DEFAULT '[]'::jsonb, -- array de elementos (textos/imagens) com posições
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certificate_templates_default ON certificate_templates(is_default);

-- Opcional: bucket para backgrounds e assets será criado via API se necessário

COMMIT;

