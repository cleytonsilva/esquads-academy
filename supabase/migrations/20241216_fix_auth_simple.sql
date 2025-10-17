-- =====================================================
-- CORREÇÃO SIMPLES DO SISTEMA DE AUTENTICAÇÃO
-- Data: 2024-12-16
-- Objetivo: Corrigir problemas de autenticação sem alterar estrutura existente
-- =====================================================

-- 1. CRIAR FUNÇÃO PARA SINCRONIZAÇÃO AUTOMÁTICA
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_email TEXT;
    user_name TEXT;
    user_role TEXT;
BEGIN
    -- Extrair dados do novo usuário
    user_email := NEW.email;
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(user_email, '@', 1),
        'Usuário'
    );
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
    
    -- Inserir na tabela users
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
    
    -- Inserir na tabela user_profiles
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
    
    -- Criar registro de pontos para o usuário
    INSERT INTO public.user_points (user_id, total_points, level, experience_points)
    VALUES (NEW.id, 0, 1, 0)
    ON CONFLICT (user_id) DO NOTHING;
    
    RAISE NOTICE 'Usuário sincronizado: % (%) - Role: %', user_name, user_email, user_role;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log do erro mas não falha o processo de autenticação
        RAISE WARNING 'Erro ao criar perfil do usuário % (%): %', NEW.id, user_email, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. REMOVER TRIGGERS ANTIGOS E CRIAR NOVO
-- =====================================================

-- Remover triggers antigos
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;

-- Criar novo trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 3. SINCRONIZAR USUÁRIOS EXISTENTES
-- =====================================================

-- Sincronizar usuários do auth.users que não estão na tabela users
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

-- Sincronizar usuários do auth.users que não estão na tabela user_profiles
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

-- Criar pontos para usuários que não têm
INSERT INTO public.user_points (user_id, total_points, level, experience_points)
SELECT id, 0, 1, 0
FROM public.users
WHERE id NOT IN (SELECT user_id FROM public.user_points)
ON CONFLICT (user_id) DO NOTHING;

-- 4. VERIFICAÇÕES FINAIS
-- =====================================================

-- Verificar se a migração foi bem-sucedida
DO $$
DECLARE
    users_count INTEGER;
    profiles_count INTEGER;
    auth_users_count INTEGER;
    points_count INTEGER;
BEGIN
    -- Contar usuários
    SELECT COUNT(*) INTO users_count FROM public.users;
    SELECT COUNT(*) INTO profiles_count FROM public.user_profiles;
    SELECT COUNT(*) INTO auth_users_count FROM auth.users;
    SELECT COUNT(*) INTO points_count FROM public.user_points;
    
    RAISE NOTICE '=== MIGRAÇÃO SIMPLES CONCLUÍDA ===';
    RAISE NOTICE 'Usuários na tabela auth.users: %', auth_users_count;
    RAISE NOTICE 'Usuários na tabela users: %', users_count;
    RAISE NOTICE 'Usuários na tabela user_profiles: %', profiles_count;
    RAISE NOTICE 'Registros de pontos: %', points_count;
    
    IF users_count = 0 THEN
        RAISE WARNING 'ATENÇÃO: Nenhum usuário encontrado na tabela users!';
    END IF;
    
    IF profiles_count = 0 THEN
        RAISE WARNING 'ATENÇÃO: Nenhum perfil encontrado na tabela user_profiles!';
    END IF;
    
    RAISE NOTICE '=== STATUS: SUCESSO ===';
END $$;

-- 5. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON FUNCTION public.handle_new_user() IS 'Função trigger para sincronizar novos usuários do auth.users para as tabelas users e user_profiles';
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Trigger que executa sincronização automática quando usuário é criado ou atualizado';

-- Fim da migração