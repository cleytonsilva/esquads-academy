-- =====================================================
-- CORREÇÃO FINAL DAS POLÍTICAS RLS
-- Data: 2024-12-16
-- Objetivo: Limpar todas as políticas conflitantes e criar políticas simples
-- =====================================================

-- 1. DESABILITAR RLS TEMPORARIAMENTE
-- =====================================================

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS AS POLÍTICAS EXISTENTES
-- =====================================================

-- Políticas da tabela users
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_delete_own" ON public.users;
DROP POLICY IF EXISTS "users_select_simple" ON public.users;
DROP POLICY IF EXISTS "users_insert_simple" ON public.users;
DROP POLICY IF EXISTS "users_update_simple" ON public.users;
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "users_update_policy" ON public.users;
DROP POLICY IF EXISTS "users_delete_policy" ON public.users;
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_can_view_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_can_delete_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_select_final" ON public.users;
DROP POLICY IF EXISTS "users_insert_final" ON public.users;
DROP POLICY IF EXISTS "users_update_final" ON public.users;
DROP POLICY IF EXISTS "users_select_clean" ON public.users;
DROP POLICY IF EXISTS "users_insert_clean" ON public.users;
DROP POLICY IF EXISTS "users_update_clean" ON public.users;
DROP POLICY IF EXISTS "users_select_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_insert_system" ON public.users;
DROP POLICY IF EXISTS "users_admin_access" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.users;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.users;
DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON public.users;
DROP POLICY IF EXISTS "Usuários podem atualizar próprio perfil" ON public.users;
DROP POLICY IF EXISTS "Admins podem ver todos os usuários" ON public.users;
DROP POLICY IF EXISTS "Admins podem atualizar usuários" ON public.users;
DROP POLICY IF EXISTS "admin_full_access_users" ON public.users;

-- Políticas da tabela user_profiles
DROP POLICY IF EXISTS "user_profiles_select_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete_own" ON public.user_profiles;

-- Políticas da tabela user_points
DROP POLICY IF EXISTS "user_points_select_own" ON public.user_points;
DROP POLICY IF EXISTS "user_points_insert_system" ON public.user_points;
DROP POLICY IF EXISTS "user_points_update_system" ON public.user_points;

-- 3. REABILITAR RLS
-- =====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLÍTICAS SIMPLES E FUNCIONAIS
-- =====================================================

-- Políticas para tabela users
CREATE POLICY "users_select" ON public.users
    FOR SELECT
    USING (
        auth.uid() = id OR 
        auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "users_insert" ON public.users
    FOR INSERT
    WITH CHECK (
        auth.uid() = id OR
        auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "users_update" ON public.users
    FOR UPDATE
    USING (
        auth.uid() = id OR 
        auth.jwt() ->> 'role' = 'admin'
    )
    WITH CHECK (
        auth.uid() = id OR 
        auth.jwt() ->> 'role' = 'admin'
    );

-- Políticas para tabela user_profiles
CREATE POLICY "profiles_select" ON public.user_profiles
    FOR SELECT
    USING (
        auth.uid() = user_id OR 
        auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "profiles_insert" ON public.user_profiles
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id OR
        auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "profiles_update" ON public.user_profiles
    FOR UPDATE
    USING (
        auth.uid() = user_id OR 
        auth.jwt() ->> 'role' = 'admin'
    )
    WITH CHECK (
        auth.uid() = user_id OR 
        auth.jwt() ->> 'role' = 'admin'
    );

-- Políticas para tabela user_points
CREATE POLICY "points_select" ON public.user_points
    FOR SELECT
    USING (
        auth.uid() = user_id OR 
        auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "points_insert" ON public.user_points
    FOR INSERT
    WITH CHECK (true); -- Sistema pode inserir pontos

CREATE POLICY "points_update" ON public.user_points
    FOR UPDATE
    USING (true) -- Sistema pode atualizar pontos
    WITH CHECK (true);

-- 5. VERIFICAÇÃO FINAL
-- =====================================================

DO $$
DECLARE
    users_policies INTEGER;
    profiles_policies INTEGER;
    points_policies INTEGER;
BEGIN
    -- Contar políticas criadas
    SELECT COUNT(*) INTO users_policies 
    FROM pg_policies 
    WHERE tablename = 'users' AND schemaname = 'public';
    
    SELECT COUNT(*) INTO profiles_policies 
    FROM pg_policies 
    WHERE tablename = 'user_profiles' AND schemaname = 'public';
    
    SELECT COUNT(*) INTO points_policies 
    FROM pg_policies 
    WHERE tablename = 'user_points' AND schemaname = 'public';
    
    RAISE NOTICE '=== POLÍTICAS RLS CONFIGURADAS ===';
    RAISE NOTICE 'Políticas users: %', users_policies;
    RAISE NOTICE 'Políticas user_profiles: %', profiles_policies;
    RAISE NOTICE 'Políticas user_points: %', points_policies;
    
    IF users_policies = 3 AND profiles_policies = 3 AND points_policies = 3 THEN
        RAISE NOTICE '✅ TODAS AS POLÍTICAS CONFIGURADAS CORRETAMENTE';
    ELSE
        RAISE WARNING '⚠️ ALGUMAS POLÍTICAS PODEM ESTAR FALTANDO';
    END IF;
END $$;

-- 6. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON POLICY "users_select" ON public.users IS 'Usuários podem ver próprio perfil ou admins podem ver todos';
COMMENT ON POLICY "users_insert" ON public.users IS 'Usuários podem inserir próprio perfil ou admins podem inserir qualquer';
COMMENT ON POLICY "users_update" ON public.users IS 'Usuários podem atualizar próprio perfil ou admins podem atualizar qualquer';

COMMENT ON POLICY "profiles_select" ON public.user_profiles IS 'Usuários podem ver próprio perfil ou admins podem ver todos';
COMMENT ON POLICY "profiles_insert" ON public.user_profiles IS 'Usuários podem inserir próprio perfil ou admins podem inserir qualquer';
COMMENT ON POLICY "profiles_update" ON public.user_profiles IS 'Usuários podem atualizar próprio perfil ou admins podem atualizar qualquer';

COMMENT ON POLICY "points_select" ON public.user_points IS 'Usuários podem ver próprios pontos ou admins podem ver todos';
COMMENT ON POLICY "points_insert" ON public.user_points IS 'Sistema pode inserir pontos para qualquer usuário';
COMMENT ON POLICY "points_update" ON public.user_points IS 'Sistema pode atualizar pontos para qualquer usuário';

-- Fim da migração
