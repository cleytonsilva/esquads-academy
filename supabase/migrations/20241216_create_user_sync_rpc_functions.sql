-- =====================================================
-- CRIAR FUNÇÕES RPC PARA SINCRONIZAÇÃO DE USUÁRIOS
-- Data: 2024-12-16
-- Objetivo: Resolver problemas de casting de enum user_role
-- =====================================================

-- 1. FUNÇÃO PARA UPSERT NA TABELA USERS
-- =====================================================

CREATE OR REPLACE FUNCTION upsert_user_with_role(
  p_id UUID,
  p_full_name TEXT,
  p_role TEXT,
  p_created_at TIMESTAMPTZ DEFAULT NOW(),
  p_updated_at TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_record RECORD;
  enum_role user_role;
BEGIN
  -- Converter string para enum user_role
  IF LOWER(p_role) = 'admin' THEN
    enum_role := 'admin'::user_role;
  ELSIF LOWER(p_role) = 'instructor' THEN
    enum_role := 'instructor'::user_role;
  ELSIF LOWER(p_role) = 'student' THEN
    enum_role := 'student'::user_role;
  ELSIF LOWER(p_role) = 'moderator' THEN
    enum_role := 'admin'::user_role; -- Moderator vira admin
  ELSE
    enum_role := 'student'::user_role; -- Default
  END IF;

  -- Fazer upsert na tabela users
  INSERT INTO public.users (id, full_name, role, created_at, updated_at)
  VALUES (p_id, p_full_name, enum_role, p_created_at, p_updated_at)
  ON CONFLICT (id) 
  DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = EXCLUDED.updated_at
  RETURNING * INTO result_record;

  -- Retornar resultado como JSON
  RETURN row_to_json(result_record);
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Erro em upsert_user_with_role: %', SQLERRM;
    RETURN NULL;
END;
$$;

-- 2. FUNÇÃO PARA UPSERT NA TABELA USER_PROFILES
-- =====================================================

CREATE OR REPLACE FUNCTION upsert_user_profile_with_role(
  p_user_id UUID,
  p_full_name TEXT,
  p_role TEXT,
  p_created_at TIMESTAMPTZ DEFAULT NOW(),
  p_updated_at TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_record RECORD;
  enum_role user_role;
BEGIN
  -- Converter string para enum user_role
  IF LOWER(p_role) = 'admin' THEN
    enum_role := 'admin'::user_role;
  ELSIF LOWER(p_role) = 'instructor' THEN
    enum_role := 'instructor'::user_role;
  ELSIF LOWER(p_role) = 'student' THEN
    enum_role := 'student'::user_role;
  ELSIF LOWER(p_role) = 'moderator' THEN
    enum_role := 'admin'::user_role; -- Moderator vira admin
  ELSE
    enum_role := 'student'::user_role; -- Default
  END IF;

  -- Fazer upsert na tabela user_profiles
  INSERT INTO public.user_profiles (user_id, full_name, role, created_at, updated_at)
  VALUES (p_user_id, p_full_name, enum_role, p_created_at, p_updated_at)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = EXCLUDED.updated_at
  RETURNING * INTO result_record;

  -- Retornar resultado como JSON
  RETURN row_to_json(result_record);
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Erro em upsert_user_profile_with_role: %', SQLERRM;
    RETURN NULL;
END;
$$;

-- 3. CONCEDER PERMISSÕES
-- =====================================================

GRANT EXECUTE ON FUNCTION upsert_user_with_role TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_user_profile_with_role TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_user_with_role TO service_role;
GRANT EXECUTE ON FUNCTION upsert_user_profile_with_role TO service_role;