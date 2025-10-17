-- CORREÇÃO RÁPIDA DE PERFORMANCE - fetchUserProfile timeout
-- Implementar fallback simples sem transações complexas

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
    -- Query mais simples possível
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

-- 2. Garantir índice essencial (sem CONCURRENTLY)
CREATE INDEX IF NOT EXISTS idx_user_profiles_id_emergency 
ON user_profiles (id);

-- 3. Atualizar estatísticas
ANALYZE user_profiles;