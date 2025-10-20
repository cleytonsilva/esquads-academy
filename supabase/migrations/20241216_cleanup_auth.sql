-- =====================================================
-- LIMPEZA COMPLETA DO SISTEMA DE AUTENTICAÇÃO
-- Data: 2024-12-16
-- Objetivo: Remover todas as funções e triggers problemáticos
-- =====================================================

-- 1. REMOVER TODOS OS TRIGGERS ANTIGOS
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;

-- 2. REMOVER TODAS AS FUNÇÕES ANTIGAS
-- =====================================================

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS create_user_profile() CASCADE;

-- 3. CRIAR NOVA FUNÇÃO LIMPA
-- =====================================================

CREATE OR REPLACE FUNCTION public.sync_auth_user()
RETURNS TRIGGER AS $$
DECLARE
    user_email TEXT;
    user_name TEXT;
    user_role TEXT;
BEGIN
    -- Extrair dados do novo usuário do auth.users
    user_email := NEW.email;
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(user_email, '@', 1),
        'Usuário'
    );
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
    
    -- Inserir na tabela users (principal)
    INSERT INTO public.users (
        id,
        full_name,
        role,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        user_name,
        user_role::user_role,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        updated_at = NOW();
    
    -- Inserir na tabela user_profiles (cache)
    INSERT INTO public.user_profiles (
        user_id,
        full_name,
        role,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        user_name,
        user_role,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        updated_at = NOW();
    
    -- Criar registro de pontos
    INSERT INTO public.user_points (user_id, total_points, level, experience_points)
    VALUES (NEW.id, 0, 1, 0)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log do erro mas não falha o processo
        RAISE WARNING 'Erro ao sincronizar usuário % (%): %', NEW.id, user_email, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. CRIAR NOVO TRIGGER
-- =====================================================

CREATE TRIGGER sync_auth_user_trigger
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_auth_user();

-- 5. SINCRONIZAR USUÁRIOS EXISTENTES
-- =====================================================

-- Sincronizar para tabela users
INSERT INTO public.users (
    id,
    full_name,
    role,
    created_at,
    updated_at
)
SELECT 
    au.id,
    COALESCE(
        au.raw_user_meta_data->>'full_name',
        au.raw_user_meta_data->>'name',
        split_part(au.email, '@', 1),
        'Usuário'
    ),
    COALESCE(au.raw_user_meta_data->>'role', 'student')::user_role,
    au.created_at,
    NOW()
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Sincronizar para tabela user_profiles
INSERT INTO public.user_profiles (
    user_id,
    full_name,
    role,
    created_at,
    updated_at
)
SELECT 
    au.id,
    COALESCE(
        au.raw_user_meta_data->>'full_name',
        au.raw_user_meta_data->>'name',
        split_part(au.email, '@', 1),
        'Usuário'
    ),
    COALESCE(au.raw_user_meta_data->>'role', 'student'),
    au.created_at,
    NOW()
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
WHERE up.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Criar pontos para usuários sem pontos
INSERT INTO public.user_points (user_id, total_points, level, experience_points)
SELECT id, 0, 1, 0
FROM public.users
WHERE id NOT IN (SELECT user_id FROM public.user_points)
ON CONFLICT (user_id) DO NOTHING;

-- 6. VERIFICAÇÃO FINAL
-- =====================================================

DO $$
DECLARE
    users_count INTEGER;
    profiles_count INTEGER;
    auth_users_count INTEGER;
    points_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO users_count FROM public.users;
    SELECT COUNT(*) INTO profiles_count FROM public.user_profiles;
    SELECT COUNT(*) INTO auth_users_count FROM auth.users;
    SELECT COUNT(*) INTO points_count FROM public.user_points;
    
    RAISE NOTICE '=== LIMPEZA E SINCRONIZAÇÃO CONCLUÍDA ===';
    RAISE NOTICE 'Auth users: %, Users: %, Profiles: %, Points: %', 
                 auth_users_count, users_count, profiles_count, points_count;
END $$;

-- Fim
