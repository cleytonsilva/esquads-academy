-- =====================================================
-- CORREÇÃO CRÍTICA DE ERROS DO SISTEMA
-- =====================================================

-- 1. CORRIGIR RECURSÃO INFINITA NAS POLÍTICAS RLS DA TABELA USERS
-- =====================================================

-- Desabilitar RLS temporariamente
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Remover TODAS as políticas existentes da tabela users
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "users_update_policy" ON public.users;
DROP POLICY IF EXISTS "users_delete_policy" ON public.users;
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_can_view_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_can_delete_own_profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.users;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.users;
DROP POLICY IF EXISTS "admin_full_access_users" ON public.users;
DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON public.users;
DROP POLICY IF EXISTS "Usuários podem atualizar próprio perfil" ON public.users;
DROP POLICY IF EXISTS "Admins podem ver todos os usuários" ON public.users;
DROP POLICY IF EXISTS "Admins podem atualizar usuários" ON public.users;
DROP POLICY IF EXISTS "users_select_simple" ON public.users;
DROP POLICY IF EXISTS "users_insert_simple" ON public.users;
DROP POLICY IF EXISTS "users_update_simple" ON public.users;

-- Reabilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Criar políticas simples e sem recursão
CREATE POLICY "users_select_final" ON public.users
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "users_insert_final" ON public.users
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_final" ON public.users
  FOR UPDATE 
  USING (auth.uid() = id);

-- 2. CRIAR TABELA USER_PROFILES FALTANTE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid DEFAULT extensions.gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  bio text,
  preferences jsonb DEFAULT '{}',
  learning_goals text[],
  skill_level text DEFAULT 'beginner' CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- RLS para user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_profiles_select_own" ON public.user_profiles
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "user_profiles_insert_own" ON public.user_profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profiles_update_own" ON public.user_profiles
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- 3. ADICIONAR COLUNAS FALTANTES NA TABELA COURSES
-- =====================================================

-- Adicionar coluna instructor_name
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS instructor_name text;

-- Adicionar coluna category
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'geral';

-- Atualizar instructor_name com base no instructor_id
UPDATE public.courses 
SET instructor_name = (
  SELECT full_name 
  FROM public.users 
  WHERE users.id = courses.instructor_id
)
WHERE instructor_name IS NULL;

-- 4. CRIAR FUNÇÃO PARA ATUALIZAR AUTOMATICAMENTE INSTRUCTOR_NAME
-- =====================================================

CREATE OR REPLACE FUNCTION update_course_instructor_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar instructor_name quando instructor_id mudar
  IF TG_OP = 'UPDATE' AND OLD.instructor_id IS DISTINCT FROM NEW.instructor_id THEN
    NEW.instructor_name = (
      SELECT full_name 
      FROM public.users 
      WHERE id = NEW.instructor_id
    );
  END IF;
  
  -- Para INSERT, definir instructor_name
  IF TG_OP = 'INSERT' THEN
    NEW.instructor_name = (
      SELECT full_name 
      FROM public.users 
      WHERE id = NEW.instructor_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_update_course_instructor_name ON public.courses;
CREATE TRIGGER trigger_update_course_instructor_name
  BEFORE INSERT OR UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION update_course_instructor_name();

-- 5. VERIFICAÇÕES FINAIS
-- =====================================================

-- Verificar políticas da tabela users
SELECT 
  'POLÍTICAS USERS' as status,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public'
ORDER BY cmd;

-- Verificar se user_profiles foi criada
SELECT 
  'TABELA USER_PROFILES' as status,
  EXISTS(
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles'
  ) as exists;

-- Verificar colunas adicionadas em courses
SELECT 
  'COLUNAS COURSES' as status,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'courses'
AND column_name IN ('instructor_name', 'category')
ORDER BY column_name;
