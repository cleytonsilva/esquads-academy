-- CORREÇÃO EMERGENCIAL DE PERFORMANCE - fetchUserProfile timeout
-- Implementar fallback simples e otimizações críticas

-- 1. Criar função de fallback ultra-rápida
CREATE OR REPLACE FUNCTION get_user_profile_emergency(user_uuid UUID)
RETURNS TABLE(
    id UUID,
    email TEXT,
    full_name TEXT,
    role TEXT,
    created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Query mais simples possível, sem JOINs complexos
    RETURN QUERY
    SELECT 
        up.id,
        COALESCE(up.email, '')::TEXT as email,
        COALESCE(up.full_name, '')::TEXT as full_name,
        COALESCE(up.role, 'student')::TEXT as role,
        COALESCE(up.created_at, NOW()) as created_at
    FROM user_profiles up
    WHERE up.id = user_uuid
    LIMIT 1;
END;
$$;

-- 2. Garantir índice essencial para performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_id_emergency 
ON user_profiles (id);

-- 3. Criar função de teste de performance
CREATE OR REPLACE FUNCTION test_emergency_performance(user_uuid UUID)
RETURNS TABLE(
    test_result TEXT,
    duration_ms NUMERIC,
    success BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    duration_ms NUMERIC;
    profile_count INTEGER;
BEGIN
    -- Teste da função de emergência
    start_time := clock_timestamp();
    
    SELECT COUNT(*) INTO profile_count
    FROM get_user_profile_emergency(user_uuid);
    
    end_time := clock_timestamp();
    duration_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
    
    RETURN QUERY SELECT 
        'emergency_function'::TEXT,
        duration_ms,
        (duration_ms < 100 AND profile_count > 0)::BOOLEAN;
END;
$$;

-- 4. Atualizar estatísticas para melhor performance
ANALYZE user_profiles;

-- 5. Comentários para uso
-- Para testar: SELECT * FROM test_emergency_performance('9e84ae70-6c0c-4e0a-92f5-dc70959de282');
-- Para usar: SELECT * FROM get_user_profile_emergency('9e84ae70-6c0c-4e0a-92f5-dc70959de282');
