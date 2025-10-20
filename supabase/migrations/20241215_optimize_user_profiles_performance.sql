-- =====================================================
-- OTIMIZAÇÃO DE PERFORMANCE: USER_PROFILES
-- =====================================================

-- Problema: Query timeout de 2 segundos na consulta de perfis
-- Solução: Criar índices otimizados e melhorar performance

-- 1. CRIAR ÍNDICES PARA OTIMIZAR CONSULTAS
-- =====================================================

-- Índice principal para consultas por ID (mais comum)
CREATE INDEX IF NOT EXISTS idx_user_profiles_id_optimized 
ON public.user_profiles (id) 
INCLUDE (full_name, role, avatar_url, bio);

-- Índice para consultas por role (para verificações de permissão)
CREATE INDEX IF NOT EXISTS idx_user_profiles_role 
ON public.user_profiles (role);

-- Índice para consultas por email (se necessário)
CREATE INDEX IF NOT EXISTS idx_user_profiles_email 
ON public.user_profiles (id, full_name) 
WHERE role IS NOT NULL;

-- Índice para consultas de usuários ativos
CREATE INDEX IF NOT EXISTS idx_user_profiles_active 
ON public.user_profiles (id, role, updated_at) 
WHERE role IN ('admin', 'moderator', 'instructor', 'student');

-- 2. OTIMIZAR ESTRUTURA DA TABELA
-- =====================================================

-- Adicionar constraint para melhorar performance de consultas
ALTER TABLE public.user_profiles 
ADD CONSTRAINT chk_user_profiles_role_valid 
CHECK (role IN ('admin', 'moderator', 'instructor', 'student'));

-- Garantir que campos essenciais não sejam nulos
UPDATE public.user_profiles 
SET full_name = COALESCE(full_name, 'Usuário')
WHERE full_name IS NULL OR full_name = '';

UPDATE public.user_profiles 
SET role = 'student'
WHERE role IS NULL;

-- 3. CRIAR FUNÇÃO OTIMIZADA PARA BUSCAR PERFIL
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_profile_optimized(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    role TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    -- Consulta otimizada com índice específico
    RETURN QUERY
    SELECT 
        up.id,
        up.full_name,
        up.role,
        up.avatar_url,
        up.bio,
        up.created_at,
        up.updated_at
    FROM public.user_profiles up
    WHERE up.id = user_uuid
    LIMIT 1;
    
    -- Se não encontrar, retornar linha vazia (não NULL)
    IF NOT FOUND THEN
        RETURN;
    END IF;
END;
$$;

-- 4. CRIAR FUNÇÃO DE CACHE PARA PERFIS FREQUENTES
-- =====================================================

-- Tabela de cache para perfis acessados frequentemente
CREATE TABLE IF NOT EXISTS public.user_profiles_cache (
    user_id UUID PRIMARY KEY,
    profile_data JSONB NOT NULL,
    cached_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '1 hour')
);

-- Índice para limpeza automática de cache expirado
CREATE INDEX IF NOT EXISTS idx_user_profiles_cache_expires 
ON public.user_profiles_cache (expires_at);

-- Função para buscar perfil com cache
CREATE OR REPLACE FUNCTION get_user_profile_cached(user_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    cached_profile JSONB;
    fresh_profile RECORD;
BEGIN
    -- Verificar se existe cache válido
    SELECT profile_data INTO cached_profile
    FROM public.user_profiles_cache
    WHERE user_id = user_uuid 
    AND expires_at > now();
    
    -- Se encontrou cache válido, retornar
    IF cached_profile IS NOT NULL THEN
        RETURN cached_profile;
    END IF;
    
    -- Buscar perfil fresco do banco
    SELECT * INTO fresh_profile
    FROM get_user_profile_optimized(user_uuid);
    
    -- Se encontrou perfil, cachear e retornar
    IF fresh_profile.id IS NOT NULL THEN
        cached_profile := to_jsonb(fresh_profile);
        
        -- Inserir/atualizar cache
        INSERT INTO public.user_profiles_cache (user_id, profile_data)
        VALUES (user_uuid, cached_profile)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            profile_data = EXCLUDED.profile_data,
            cached_at = now(),
            expires_at = now() + INTERVAL '1 hour';
            
        RETURN cached_profile;
    END IF;
    
    -- Se não encontrou, retornar NULL
    RETURN NULL;
END;
$$;

-- 5. TRIGGER PARA INVALIDAR CACHE QUANDO PERFIL É ATUALIZADO
-- =====================================================

CREATE OR REPLACE FUNCTION invalidate_user_profile_cache()
RETURNS TRIGGER AS $$
BEGIN
    -- Remover cache quando perfil é atualizado
    DELETE FROM public.user_profiles_cache 
    WHERE user_id = COALESCE(NEW.id, OLD.id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para invalidar cache
DROP TRIGGER IF EXISTS trigger_invalidate_user_profile_cache ON public.user_profiles;
CREATE TRIGGER trigger_invalidate_user_profile_cache
    AFTER INSERT OR UPDATE OR DELETE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION invalidate_user_profile_cache();

-- 6. LIMPEZA AUTOMÁTICA DE CACHE EXPIRADO
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Remover entradas de cache expiradas
    DELETE FROM public.user_profiles_cache 
    WHERE expires_at < now();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$;

-- 7. CONFIGURAR RLS PARA NOVAS TABELAS
-- =====================================================

-- Habilitar RLS na tabela de cache
ALTER TABLE public.user_profiles_cache ENABLE ROW LEVEL SECURITY;

-- Política para cache: usuários só podem ver seu próprio cache
CREATE POLICY "users_own_cache" ON public.user_profiles_cache
    FOR ALL USING (auth.uid() = user_id);

-- Política para funções: permitir acesso às funções otimizadas
GRANT EXECUTE ON FUNCTION get_user_profile_optimized(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_profile_cached(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_cache() TO authenticated;

-- 8. ESTATÍSTICAS E MONITORAMENTO
-- =====================================================

-- Atualizar estatísticas da tabela para otimizador
ANALYZE public.user_profiles;
ANALYZE public.user_profiles_cache;

-- Verificar índices criados
SELECT 
    'ÍNDICES CRIADOS' as status,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('user_profiles', 'user_profiles_cache')
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Verificar funções criadas
SELECT 
    'FUNÇÕES CRIADAS' as status,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name LIKE '%user_profile%'
ORDER BY routine_name;

-- Log de sucesso
SELECT 'OTIMIZAÇÃO DE PERFORMANCE CONCLUÍDA' as status, now() as timestamp;
