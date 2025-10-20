-- =====================================================
-- MIGRATION CRÍTICA: Correção de Estrutura de Dados
-- Data: 2024-12-15
-- Descrição: Implementa todas as correções críticas identificadas
-- Resolve os 3 erros críticos: perfil do usuário, coerção JSON e certificados
-- =====================================================

BEGIN;

-- 1. CRIAR TABELA USER_PROFILES
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  interests TEXT[] DEFAULT '{}',
  skill_level TEXT DEFAULT 'beginner' CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
  learning_goals TEXT[] DEFAULT '{}',
  preferred_duration TEXT DEFAULT 'medium' CHECK (preferred_duration IN ('short', 'medium', 'long')),
  completed_courses TEXT[] DEFAULT '{}',
  current_courses TEXT[] DEFAULT '{}',
  favorite_categories TEXT[] DEFAULT '{}',
  learning_style TEXT DEFAULT 'visual' CHECK (learning_style IN ('visual', 'auditory', 'kinesthetic', 'reading')),
  time_availability TEXT DEFAULT 'medium' CHECK (time_availability IN ('low', 'medium', 'high')),
  level INTEGER DEFAULT 1,
  total_points INTEGER DEFAULT 0,
  activity_pattern TEXT DEFAULT 'mixed',
  difficulty_preference TEXT DEFAULT 'medium',
  preferred_categories TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. CRIAR TABELA COURSE_ENROLLMENTS
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  progress_percentage INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'dropped')),
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  time_spent INTEGER DEFAULT 0,
  final_grade DECIMAL(5,2),
  UNIQUE(user_id, course_id)
);

-- 3. ATUALIZAR TABELA CERTIFICATES (se existir)
DO $$
BEGIN
  -- Verificar se a tabela certificates existe
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'certificates' AND table_schema = 'public') THEN
    -- Adicionar colunas se não existirem
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'course_title') THEN
      ALTER TABLE public.certificates ADD COLUMN course_title TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'instructor_name') THEN
      ALTER TABLE public.certificates ADD COLUMN instructor_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'completion_date') THEN
      ALTER TABLE public.certificates ADD COLUMN completion_date TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'certificate_hash') THEN
      ALTER TABLE public.certificates ADD COLUMN certificate_hash TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'blockchain_verified') THEN
      ALTER TABLE public.certificates ADD COLUMN blockchain_verified BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'skills_acquired') THEN
      ALTER TABLE public.certificates ADD COLUMN skills_acquired TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'grade') THEN
      ALTER TABLE public.certificates ADD COLUMN grade DECIMAL(5,2);
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'hours_completed') THEN
      ALTER TABLE public.certificates ADD COLUMN hours_completed INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'verification_url') THEN
      ALTER TABLE public.certificates ADD COLUMN verification_url TEXT;
    END IF;

    -- Adicionar constraint única para certificate_hash se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'certificates_certificate_hash_key'
        AND table_name = 'certificates'
    ) THEN
        ALTER TABLE public.certificates ADD CONSTRAINT certificates_certificate_hash_key UNIQUE (certificate_hash);
    END IF;
  ELSE
    -- Criar tabela certificates se não existir
    CREATE TABLE public.certificates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
      course_title TEXT,
      instructor_name TEXT,
      completion_date TIMESTAMPTZ DEFAULT NOW(),
      certificate_hash TEXT UNIQUE,
      blockchain_verified BOOLEAN DEFAULT false,
      skills_acquired TEXT[] DEFAULT '{}',
      grade DECIMAL(5,2),
      hours_completed INTEGER,
      verification_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- 4. CRIAR TABELA MISSION_PROGRESS
CREATE TABLE IF NOT EXISTS public.mission_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id TEXT NOT NULL, -- Usando TEXT pois missions podem ser geradas dinamicamente
  current_phase INTEGER DEFAULT 0,
  progress_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'failed')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  points_earned INTEGER DEFAULT 0,
  UNIQUE(user_id, mission_id)
);

-- 5. CRIAR TABELA LESSON_PROGRESS
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID, -- Pode referenciar module_lessons se existir
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completion_date TIMESTAMPTZ,
  time_spent INTEGER DEFAULT 0,
  score DECIMAL(5,2),
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- 6. CRIAR TABELA USER_BADGES
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  description TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  points_value INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'
);

-- 7. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_status ON course_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_hash ON certificates(certificate_hash);
CREATE INDEX IF NOT EXISTS idx_mission_progress_user_id ON mission_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_mission_progress_status ON mission_progress(status);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_course_id ON lesson_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);

-- 8. CONFIGURAR RLS PARA USER_PROFILES
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_profiles_select_own" ON public.user_profiles;
CREATE POLICY "user_profiles_select_own" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_profiles_insert_own" ON public.user_profiles;
CREATE POLICY "user_profiles_insert_own" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_profiles_update_own" ON public.user_profiles;
CREATE POLICY "user_profiles_update_own" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Permitir que admins vejam todos os perfis
DROP POLICY IF EXISTS "user_profiles_admin_access" ON public.user_profiles;
CREATE POLICY "user_profiles_admin_access" ON public.user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 9. CONFIGURAR RLS PARA COURSE_ENROLLMENTS
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "enrollments_select_own" ON public.course_enrollments;
CREATE POLICY "enrollments_select_own" ON public.course_enrollments
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "enrollments_insert_own" ON public.course_enrollments;
CREATE POLICY "enrollments_insert_own" ON public.course_enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "enrollments_update_own" ON public.course_enrollments;
CREATE POLICY "enrollments_update_own" ON public.course_enrollments
  FOR UPDATE USING (auth.uid() = user_id);

-- 10. CONFIGURAR RLS PARA CERTIFICATES
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "certificates_select_own" ON public.certificates;
CREATE POLICY "certificates_select_own" ON public.certificates
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "certificates_insert_own" ON public.certificates;
CREATE POLICY "certificates_insert_own" ON public.certificates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 11. CONFIGURAR RLS PARA MISSION_PROGRESS
ALTER TABLE public.mission_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mission_progress_select_own" ON public.mission_progress;
CREATE POLICY "mission_progress_select_own" ON public.mission_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "mission_progress_insert_own" ON public.mission_progress;
CREATE POLICY "mission_progress_insert_own" ON public.mission_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "mission_progress_update_own" ON public.mission_progress;
CREATE POLICY "mission_progress_update_own" ON public.mission_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- 12. CONFIGURAR RLS PARA LESSON_PROGRESS
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lesson_progress_select_own" ON public.lesson_progress;
CREATE POLICY "lesson_progress_select_own" ON public.lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "lesson_progress_insert_own" ON public.lesson_progress;
CREATE POLICY "lesson_progress_insert_own" ON public.lesson_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "lesson_progress_update_own" ON public.lesson_progress;
CREATE POLICY "lesson_progress_update_own" ON public.lesson_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- 13. CONFIGURAR RLS PARA USER_BADGES
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_badges_select_own" ON public.user_badges;
CREATE POLICY "user_badges_select_own" ON public.user_badges
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_badges_insert_own" ON public.user_badges;
CREATE POLICY "user_badges_insert_own" ON public.user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 14. CRIAR TRIGGERS PARA UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lesson_progress_updated_at ON lesson_progress;
CREATE TRIGGER update_lesson_progress_updated_at 
    BEFORE UPDATE ON lesson_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_certificates_updated_at ON certificates;
CREATE TRIGGER update_certificates_updated_at 
    BEFORE UPDATE ON certificates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 15. CONCEDER PERMISSÕES
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON course_enrollments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON mission_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON lesson_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON certificates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_badges TO authenticated;

-- Permitir acesso anônimo para leitura de dados públicos
GRANT SELECT ON user_profiles TO anon;
GRANT SELECT ON certificates TO anon;

-- 16. INSERIR DADOS PADRÃO PARA USUÁRIOS EXISTENTES
-- Criar perfis padrão para usuários que já existem
INSERT INTO public.user_profiles (user_id, interests, skill_level, learning_goals, preferred_categories)
SELECT 
  id,
  ARRAY['cibersegurança', 'programação'],
  'beginner',
  ARRAY['aprender fundamentos', 'obter certificação'],
  ARRAY['geral', 'cibersegurança']
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profiles WHERE user_id = auth.users.id
)
ON CONFLICT (user_id) DO NOTHING;

COMMIT;

-- Log de sucesso
DO $$
BEGIN
  RAISE NOTICE 'Migration 20241215_critical_fixes.sql executada com sucesso!';
  RAISE NOTICE 'Tabelas criadas: user_profiles, course_enrollments, mission_progress, lesson_progress, user_badges';
  RAISE NOTICE 'Tabela certificates atualizada com novas colunas';
  RAISE NOTICE 'Políticas RLS configuradas para todas as tabelas';
  RAISE NOTICE 'Índices de performance criados';
  RAISE NOTICE 'Triggers automáticos configurados';
END $$;
