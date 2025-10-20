-- Diagnóstico crítico de performance para fetchUserProfile
-- Investigar timeout de 8 segundos

-- 1. Verificar se a função get_user_profile_optimized existe
SELECT 
    proname as function_name,
    prosrc as function_body
FROM pg_proc 
WHERE proname = 'get_user_profile_optimized';

-- 2. Verificar índices na tabela user_profiles
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'user_profiles';

-- 3. Verificar estatísticas da tabela user_profiles
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables 
WHERE tablename = 'user_profiles';

-- 4. Verificar RLS policies ativas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 5. Testar query simples na tabela user_profiles
SELECT COUNT(*) as total_profiles FROM user_profiles;

-- 6. Verificar se há locks ou queries lentas
SELECT 
    pid,
    now() - pg_stat_activity.query_start AS duration,
    query,
    state
FROM pg_stat_activity 
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes'
AND state != 'idle';

-- 7. Criar função de diagnóstico simples para testar performance
CREATE OR REPLACE FUNCTION test_user_profile_performance(user_uuid UUID)
RETURNS TABLE(
    test_name TEXT,
    duration_ms NUMERIC,
    result_count INTEGER,
    success BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    duration_ms NUMERIC;
    row_count INTEGER;
BEGIN
    -- Teste 1: Query simples sem RLS
    start_time := clock_timestamp();
    
    SELECT COUNT(*) INTO row_count
    FROM user_profiles 
    WHERE id = user_uuid;
    
    end_time := clock_timestamp();
    duration_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
    
    RETURN QUERY SELECT 
        'simple_select'::TEXT,
        duration_ms,
        row_count,
        (duration_ms < 100)::BOOLEAN;
    
    -- Teste 2: Query com JOIN (se houver)
    start_time := clock_timestamp();
    
    SELECT COUNT(*) INTO row_count
    FROM user_profiles up
    LEFT JOIN auth.users au ON up.id = au.id
    WHERE up.id = user_uuid;
    
    end_time := clock_timestamp();
    duration_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
    
    RETURN QUERY SELECT 
        'join_select'::TEXT,
        duration_ms,
        row_count,
        (duration_ms < 200)::BOOLEAN;
        
    -- Teste 3: Verificar se função otimizada existe e funciona
    BEGIN
        start_time := clock_timestamp();
        
        PERFORM get_user_profile_optimized(user_uuid);
        
        end_time := clock_timestamp();
        duration_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
        
        RETURN QUERY SELECT 
            'optimized_function'::TEXT,
            duration_ms,
            1,
            (duration_ms < 500)::BOOLEAN;
            
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 
            'optimized_function'::TEXT,
            -1::NUMERIC,
            0,
            FALSE;
    END;
END;
$$;

-- 8. Criar função de fallback ultra-simples
CREATE OR REPLACE FUNCTION get_user_profile_simple(user_uuid UUID)
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
    RETURN QUERY
    SELECT 
        up.id,
        COALESCE(au.email, '')::TEXT as email,
        COALESCE(up.full_name, '')::TEXT as full_name,
        COALESCE(up.role, 'student')::TEXT as role,
        COALESCE(up.created_at, NOW()) as created_at
    FROM user_profiles up
    LEFT JOIN auth.users au ON up.id = au.id
    WHERE up.id = user_uuid
    LIMIT 1;
END;
$$;

-- 9. Garantir índices essenciais
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_id_fast 
ON user_profiles (id) 
WHERE id IS NOT NULL;

-- 10. Atualizar estatísticas da tabela
ANALYZE user_profiles;

-- Comentários para execução
-- Execute esta migração e depois teste:
-- SELECT * FROM test_user_profile_performance('9e84ae70-6c0c-4e0a-92f5-dc70959de282');
-- SELECT * FROM get_user_profile_simple('9e84ae70-6c0c-4e0a-92f5-dc70959de282');
