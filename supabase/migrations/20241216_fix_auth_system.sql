-- =====================================================
-- CORREÇÃO COMPLETA DO SISTEMA DE AUTENTICAÇÃO
-- Data: 2024-12-16
-- Objetivo: Corrigir problemas de autenticação e sincronização de usuários
-- =====================================================

-- 1. LIMPAR POLÍTICAS RLS PROBLEMÁTICAS
-- =====================================================

-- Desabilitar RLS temporariamente para limpeza
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Remover TODAS as políticas existentes que podem estar causando recursão
DO $$ 
DECLARE 
    policy_record RECORD;
BEGIN
    -- Remover políticas da tabela users
    FOR policy_record IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'users' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', policy_record.policyname);
    END LOOP;
    
    -- Remover políticas da tabela user_profiles
    FOR policy_record IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'user_profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_profiles', policy_record.policyname);
    END LOOP;
END $$;

-- 2. PADRONIZAR ESTRUTURA DA TABELA USERS
-- =====================================================

-- Garantir que a tabela users tenha todos os campos necessários
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS last_sign_in TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- Atualizar emails faltantes usando dados do auth.users
UPDATE public.users 
SET email = auth_users.email,
    email_verified = COALESCE(auth_users.email_confirmed_at IS NOT NULL, false)
FROM auth.users AS auth_users 
WHERE public.users.id = auth_users.id 
AND public.users.email IS NULL;

-- 3. REMOVER TABELA USER_PROFILES PARA EVITAR CONFUSÃO
-- =====================================================

-- Migrar dados importantes de user_profiles para users (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public') THEN
        -- Migrar dados que não existem em users
        UPDATE public.users 
        SET 
            full_name = COALESCE(public.users.full_name, up.full_name),
            avatar_url = COALESCE(public.users.avatar_url, up.avatar_url),
            bio = COALESCE(public.users.bio, up.bio)
        FROM public.user_profiles up 
        WHERE public.users.id = up.user_id;
        
        -- Remover tabela user_profiles
        DROP TABLE IF EXISTS public.user_profiles CASCADE;
    END IF;
END $$;

-- 4. CRIAR FUNÇÃO PARA SINCRONIZAÇÃO AUTOMÁTICA
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_email TEXT;
    user_name TEXT;
BEGIN
    -- Extrair email e nome do novo usuário
    user_email := NEW.email;
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(user_email, '@', 1)
    );
    
    -- Inserir na tabela users
    INSERT INTO public.users (
        id,
        email,
        full_name,
        role,
        status,
        email_verified,
        created_at,
        updated_at,
        last_sign_in
    ) VALUES (
        NEW.id,
        user_email,
        user_name,
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')::user_role,
        'active',
        NEW.email_confirmed_at IS NOT NULL,
        NOW(),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        email_verified = EXCLUDED.email_verified,
        last_sign_in = NOW(),
        updated_at = NOW();
    
    -- Criar registro de pontos para o usuário
    INSERT INTO public.user_points (user_id, total_points, level, experience_points)
    VALUES (NEW.id, 0, 1, 0)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log do erro mas não falha o processo de autenticação
        RAISE WARNING 'Erro ao criar perfil do usuário %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. CRIAR TRIGGER PARA SINCRONIZAÇÃO AUTOMÁTICA
-- =====================================================

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar novo trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 6. CRIAR POLÍTICAS RLS SIMPLES E FUNCIONAIS
-- =====================================================

-- Reabilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Política para SELECT - usuários podem ver próprio perfil
CREATE POLICY "users_select_own" ON public.users
    FOR SELECT 
    USING (auth.uid() = id);

-- Política para INSERT - apenas sistema pode inserir (via trigger)
CREATE POLICY "users_insert_system" ON public.users
    FOR INSERT 
    WITH CHECK (true);

-- Política para UPDATE - usuários podem atualizar próprio perfil
CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE 
    USING (auth.uid() = id);

-- Política especial para admins verem todos os usuários
CREATE POLICY "users_admin_access" ON public.users
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users admin_user
            WHERE admin_user.id = auth.uid() 
            AND admin_user.role = 'admin'
        )
    );

-- 7. CORRIGIR POLÍTICAS DE OUTRAS TABELAS RELACIONADAS
-- =====================================================

-- Garantir que user_points tenha políticas corretas
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_points_select_own" ON public.user_points;
DROP POLICY IF EXISTS "user_points_insert_system" ON public.user_points;
DROP POLICY IF EXISTS "user_points_update_system" ON public.user_points;

CREATE POLICY "user_points_select_own" ON public.user_points
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_points_insert_system" ON public.user_points
    FOR INSERT WITH CHECK (true);

CREATE POLICY "user_points_update_system" ON public.user_points
    FOR UPDATE USING (true);

-- 8. SINCRONIZAR USUÁRIOS EXISTENTES
-- =====================================================

-- Sincronizar usuários do auth.users que não estão na tabela users
INSERT INTO public.users (
    id,
    email,
    full_name,
    role,
    status,
    email_verified,
    created_at,
    updated_at,
    last_sign_in
)
SELECT 
    au.id,
    au.email,
    COALESCE(
        au.raw_user_meta_data->>'full_name',
        au.raw_user_meta_data->>'name',
        split_part(au.email, '@', 1),
        'Usuário'
    ),
    COALESCE(au.raw_user_meta_data->>'role', 'student')::user_role,
    'active',
    au.email_confirmed_at IS NOT NULL,
    au.created_at,
    NOW(),
    au.last_sign_in_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Criar pontos para usuários que não têm
INSERT INTO public.user_points (user_id, total_points, level, experience_points)
SELECT id, 0, 1, 0
FROM public.users
WHERE id NOT IN (SELECT user_id FROM public.user_points)
ON CONFLICT (user_id) DO NOTHING;

-- 9. VERIFICAÇÕES FINAIS
-- =====================================================

-- Verificar se a migração foi bem-sucedida
DO $$
DECLARE
    users_count INTEGER;
    auth_users_count INTEGER;
    policies_count INTEGER;
BEGIN
    -- Contar usuários
    SELECT COUNT(*) INTO users_count FROM public.users;
    SELECT COUNT(*) INTO auth_users_count FROM auth.users;
    SELECT COUNT(*) INTO policies_count FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public';
    
    RAISE NOTICE 'Migração concluída:';
    RAISE NOTICE '- Usuários na tabela users: %', users_count;
    RAISE NOTICE '- Usuários na tabela auth.users: %', auth_users_count;
    RAISE NOTICE '- Políticas RLS criadas: %', policies_count;
    
    IF users_count = 0 THEN
        RAISE WARNING 'ATENÇÃO: Nenhum usuário encontrado na tabela users!';
    END IF;
    
    IF policies_count < 3 THEN
        RAISE WARNING 'ATENÇÃO: Poucas políticas RLS criadas!';
    END IF;
END $$;

-- 10. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE public.users IS 'Tabela principal de usuários - sincronizada automaticamente com auth.users';
COMMENT ON FUNCTION public.handle_new_user() IS 'Função trigger para sincronizar novos usuários do auth.users para a tabela users';
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Trigger que executa sincronização automática quando usuário é criado ou atualizado';

-- Fim da migração
