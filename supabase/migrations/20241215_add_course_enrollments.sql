-- Migration: Adicionar tabela course_enrollments
-- Data: 2024-12-15
-- Descrição: Criar tabela course_enrollments para tracking de progresso dos estudantes

-- 1. CRIAR TABELA COURSE_ENROLLMENTS
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- 2. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_status ON course_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_progress ON course_enrollments(progress);

-- 3. CONFIGURAR RLS PARA COURSE_ENROLLMENTS
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

-- Política para SELECT - usuários podem ver apenas suas próprias matrículas
DROP POLICY IF EXISTS "enrollments_select_own" ON public.course_enrollments;
CREATE POLICY "enrollments_select_own" ON public.course_enrollments
  FOR SELECT USING (auth.uid() = user_id);

-- Política para INSERT - usuários podem criar suas próprias matrículas
DROP POLICY IF EXISTS "enrollments_insert_own" ON public.course_enrollments;
CREATE POLICY "enrollments_insert_own" ON public.course_enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE - usuários podem atualizar apenas suas próprias matrículas
DROP POLICY IF EXISTS "enrollments_update_own" ON public.course_enrollments;
CREATE POLICY "enrollments_update_own" ON public.course_enrollments
  FOR UPDATE USING (auth.uid() = user_id);

-- 4. CRIAR TRIGGER PARA UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_course_enrollments_updated_at ON course_enrollments;
CREATE TRIGGER update_course_enrollments_updated_at
    BEFORE UPDATE ON course_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. CONCEDER PERMISSÕES
GRANT SELECT, INSERT, UPDATE, DELETE ON course_enrollments TO authenticated;
GRANT SELECT ON course_enrollments TO anon;

-- 6. MIGRAR DADOS EXISTENTES DA TABELA USER_COURSES
INSERT INTO course_enrollments (user_id, course_id, enrolled_at, progress, completed_at, last_accessed_at)
SELECT 
  user_id,
  course_id,
  enrolled_at,
  progress_percentage,
  completed_at,
  last_accessed_at
FROM user_courses
ON CONFLICT (user_id, course_id) DO NOTHING;

-- Log de sucesso
DO $$
BEGIN
  RAISE NOTICE 'Tabela course_enrollments criada com sucesso!';
  RAISE NOTICE 'Dados migrados da tabela user_courses';
END $$;