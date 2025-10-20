-- =====================================================
-- CORREÇÃO CRÍTICA: ADICIONAR COLUNA ROLE EM USER_PROFILES
-- =====================================================

-- Problema: A coluna 'role' não existe na tabela user_profiles
-- Isso está causando erros críticos no sistema de autenticação

-- 1. ADICIONAR COLUNA ROLE NA TABELA USER_PROFILES
-- =====================================================

-- Verificar se a tabela user_profiles existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles'
    ) THEN
        RAISE EXCEPTION 'Tabela user_profiles não existe. Execute primeiro a migração ultimate_fix.sql';
    END IF;
END $$;

-- Adicionar coluna role se não existir
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'student' NOT NULL 
CHECK (role IN ('admin', 'moderator', 'instructor', 'student'));

-- 2. POPULAR DADOS EXISTENTES COM ROLE PADRÃO
-- =====================================================

-- Atualizar registros existentes que não têm role definida
UPDATE public.user_profiles 
SET role = 'student' 
WHERE role IS NULL;

-- Sincronizar roles da tabela users (se existir a coluna lá)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'role'
    ) THEN
        -- Atualizar user_profiles com roles da tabela users
        UPDATE public.user_profiles 
        SET role = u.role
        FROM public.users u
        WHERE user_profiles.user_id = u.id
        AND u.role IS NOT NULL;
    END IF;
END $$;

-- 3. CRIAR FUNÇÃO PARA SINCRONIZAR ROLES
-- =====================================================

CREATE OR REPLACE FUNCTION sync_user_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Quando role é atualizada na tabela users, sincronizar com user_profiles
    IF TG_TABLE_NAME = 'users' AND TG_OP = 'UPDATE' THEN
        IF OLD.role IS DISTINCT FROM NEW.role THEN
            UPDATE public.user_profiles 
            SET role = NEW.role, updated_at = now()
            WHERE user_id = NEW.id;
        END IF;
        RETURN NEW;
    END IF;
    
    -- Quando role é atualizada na tabela user_profiles, sincronizar com users
    IF TG_TABLE_NAME = 'user_profiles' AND TG_OP = 'UPDATE' THEN
        IF OLD.role IS DISTINCT FROM NEW.role THEN
            -- Verificar se a coluna role existe na tabela users
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'users' 
                AND column_name = 'role'
            ) THEN
                UPDATE public.users 
                SET role = NEW.role, updated_at = now()
                WHERE id = NEW.user_id;
            END IF;
        END IF;
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 4. CRIAR TRIGGERS PARA SINCRONIZAÇÃO
-- =====================================================

-- Trigger para sincronizar quando users.role é atualizada
DROP TRIGGER IF EXISTS trigger_sync_user_role_from_users ON public.users;
CREATE TRIGGER trigger_sync_user_role_from_users
    AFTER UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_role();

-- Trigger para sincronizar quando user_profiles.role é atualizada
DROP TRIGGER IF EXISTS trigger_sync_user_role_from_profiles ON public.user_profiles;
CREATE TRIGGER trigger_sync_user_role_from_profiles
    AFTER UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_role();

-- 5. CRIAR FUNÇÃO PARA CRIAR PERFIL AUTOMATICAMENTE
-- =====================================================

CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Criar perfil automaticamente quando um usuário é criado
    INSERT INTO public.user_profiles (
        user_id,
        full_name,
        role,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        COALESCE(NEW.full_name, NEW.email),
        COALESCE(NEW.role, 'student'),
        now(),
        now()
    ) ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS trigger_create_user_profile ON public.users;
CREATE TRIGGER trigger_create_user_profile
    AFTER INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();

-- 6. VERIFICAÇÕES E VALIDAÇÕES
-- =====================================================

-- Verificar se a coluna foi adicionada corretamente
SELECT 
    'COLUNA ROLE ADICIONADA' as status,
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
AND column_name = 'role';

-- Verificar constraint CHECK
SELECT 
    'CONSTRAINT CHECK' as status,
    cc.constraint_name,
    cc.check_clause
FROM information_schema.check_constraints cc
JOIN information_schema.constraint_column_usage ccu 
    ON cc.constraint_name = ccu.constraint_name
WHERE ccu.table_schema = 'public' 
AND ccu.table_name = 'user_profiles'
AND ccu.column_name = 'role';

-- Verificar dados existentes
SELECT 
    'DADOS EXISTENTES' as status,
    role,
    count(*) as quantidade
FROM public.user_profiles 
GROUP BY role
ORDER BY role;

-- Verificar triggers criados
SELECT 
    'TRIGGERS CRIADOS' as status,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND trigger_name LIKE '%sync_user_role%'
ORDER BY trigger_name;

-- Log de sucesso
SELECT 'MIGRAÇÃO CONCLUÍDA COM SUCESSO' as status, now() as timestamp;
