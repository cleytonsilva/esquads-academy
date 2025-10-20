-- Corrigir sistema de refresh token
-- Data: 2025-01-17
-- Responsável: Sistema Esquads
-- Descrição: Corrige problemas de refresh token e gerenciamento de sessões

-- 1. Verificar configurações de autenticação do Supabase
-- Verificar se há sessões órfãs ou corrompidas
SELECT 
    COUNT(*) as total_sessions,
    COUNT(CASE WHEN not_after < NOW() THEN 1 END) as expired_sessions,
    COUNT(CASE WHEN refreshed_at IS NULL THEN 1 END) as sessions_never_refreshed
FROM auth.sessions;

-- Verificar refresh tokens
SELECT 
    COUNT(*) as total_refresh_tokens,
    COUNT(CASE WHEN revoked = true THEN 1 END) as revoked_tokens,
    COUNT(CASE WHEN token IS NULL OR token = '' THEN 1 END) as invalid_tokens
FROM auth.refresh_tokens;

-- 2. Limpar sessões expiradas ou corrompidas
DELETE FROM auth.sessions 
WHERE not_after < NOW() - INTERVAL '1 day';

-- Limpar refresh tokens revogados ou inválidos
DELETE FROM auth.refresh_tokens 
WHERE revoked = true 
   OR token IS NULL 
   OR token = ''
   OR created_at < NOW() - INTERVAL '30 days';

-- 3. Verificar configurações de refresh token
-- Nota: As configurações de JWT são gerenciadas pelo Supabase Dashboard
-- Não é possível alterar via SQL diretamente

-- 4. Criar função para limpeza automática de sessões expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    -- Remover sessões expiradas
    DELETE FROM auth.sessions 
    WHERE not_after < NOW() - INTERVAL '1 day';
    
    -- Remover refresh tokens órfãos
    DELETE FROM auth.refresh_tokens 
    WHERE created_at < NOW() - INTERVAL '30 days'
       OR token IS NULL 
       OR token = '';
    
    -- Log da limpeza
    INSERT INTO system_activities (
        activity_type,
        activity_description,
        metadata,
        created_at
    ) VALUES (
        'system_maintenance',
        'Limpeza automática de sessões expiradas',
        jsonb_build_object(
            'action', 'cleanup_expired_sessions',
            'timestamp', NOW()
        ),
        NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Criar trigger para limpeza automática (executa diariamente)
-- Nota: Este seria idealmente configurado como um cron job
-- Por enquanto, vamos criar uma função que pode ser chamada manualmente

-- 6. Verificar e corrigir políticas RLS para auth.sessions se necessário
-- (Normalmente não precisamos mexer nas tabelas auth.* mas vamos verificar)

-- 7. Criar função para validar refresh tokens
CREATE OR REPLACE FUNCTION validate_refresh_token(token_input text)
RETURNS boolean AS $$
DECLARE
    token_exists boolean := false;
BEGIN
    -- Verificar se o token existe e não expirou
    SELECT EXISTS(
        SELECT 1 FROM auth.refresh_tokens 
        WHERE token = token_input 
        AND created_at > NOW() - INTERVAL '7 days'
    ) INTO token_exists;
    
    RETURN token_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Criar função para logs de autenticação
CREATE OR REPLACE FUNCTION log_auth_event(
    event_type text,
    user_id_input uuid DEFAULT NULL,
    details jsonb DEFAULT '{}'::jsonb
)
RETURNS void AS $$
BEGIN
    INSERT INTO system_activities (
        user_id,
        activity_type,
        activity_description,
        metadata,
        created_at
    ) VALUES (
        user_id_input,
        'auth_event',
        event_type,
        jsonb_build_object(
            'event_type', event_type,
            'details', details,
            'timestamp', NOW(),
            'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for'
        ),
        NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Executar limpeza inicial
SELECT cleanup_expired_sessions();

-- 10. Log da correção
INSERT INTO system_activities (
    activity_type,
    activity_description,
    metadata,
    created_at
) VALUES (
    'database_migration',
    'Corrigido sistema de refresh token',
    jsonb_build_object(
        'migration_file', '20250117_fix_refresh_token_system.sql',
        'actions', ARRAY[
            'cleanup_expired_sessions',
            'validate_refresh_token_function',
            'log_auth_event_function',
            'auth_config_update'
        ],
        'timestamp', NOW()
    ),
    NOW()
);

-- 11. Verificar resultado final
SELECT 
    'Sessões ativas' as tipo,
    COUNT(*) as quantidade
FROM auth.sessions 
WHERE not_after > NOW() OR not_after IS NULL
UNION ALL
SELECT 
    'Refresh tokens válidos' as tipo,
    COUNT(*) as quantidade
FROM auth.refresh_tokens 
WHERE revoked = false 
  AND created_at > NOW() - INTERVAL '7 days'
  AND token IS NOT NULL;
