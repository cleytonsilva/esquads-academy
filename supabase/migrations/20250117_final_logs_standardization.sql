-- ============================================================================
-- PADRONIZAÇÃO DEFINITIVA DO SISTEMA DE LOGS
-- ============================================================================
-- Data: 2025-01-17
-- Responsável: Sistema Esquads
-- Descrição: Resolve definitivamente a confusão entre 2 vs 3 logs

-- ========================================
-- LIMPEZA COMPLETA DE FUNÇÕES DUPLICADAS
-- ========================================

-- Remover todas as funções de log duplicadas
DROP FUNCTION IF EXISTS log_notification_creation() CASCADE;
DROP FUNCTION IF EXISTS log_notification_interaction() CASCADE;
DROP FUNCTION IF EXISTS log_notification_read() CASCADE;
DROP FUNCTION IF EXISTS log_notification_update() CASCADE;

-- Remover triggers duplicados
DROP TRIGGER IF EXISTS trigger_log_notification_creation ON notifications;
DROP TRIGGER IF EXISTS trigger_log_notification_interaction ON notifications;
DROP TRIGGER IF EXISTS trigger_log_notification_read ON notifications;
DROP TRIGGER IF EXISTS trigger_log_notification_update ON notifications;

-- ========================================
-- SISTEMA DE LOGS PADRONIZADO (2 LOGS PRINCIPAIS)
-- ========================================

-- LOG 1: CRIAÇÃO DE NOTIFICAÇÕES
CREATE OR REPLACE FUNCTION log_notification_creation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO system_activities (
        activity_type,
        activity_description,
        user_id,
        metadata,
        created_at
    ) VALUES (
        'notification_created',
        'Nova notificação criada: ' || NEW.title,
        NEW.user_id,
        jsonb_build_object(
            'notification_id', NEW.id,
            'type', NEW.type,
            'title', NEW.title,
            'category', COALESCE(NEW.category, 'system'),
            'priority', NEW.priority,
            'is_important', NEW.is_important,
            'grouped_count', COALESCE(NEW.grouped_count, 1),
            'parent_group_id', NEW.parent_group_id,
            'expires_at', NEW.expires_at,
            'created_at', NEW.created_at
        ),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- LOG 2: INTERAÇÃO COM NOTIFICAÇÕES
CREATE OR REPLACE FUNCTION log_notification_interaction()
RETURNS TRIGGER AS $$
DECLARE
    interaction_type TEXT;
    description TEXT;
BEGIN
    -- Determinar tipo de interação
    IF OLD.is_read IS DISTINCT FROM NEW.is_read AND NEW.is_read = true THEN
        interaction_type := 'notification_read';
        description := 'Notificação lida: ' || NEW.title;
    ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
        interaction_type := 'status_changed';
        description := 'Status alterado de ' || OLD.status || ' para ' || NEW.status || ': ' || NEW.title;
    ELSIF OLD.priority IS DISTINCT FROM NEW.priority THEN
        interaction_type := 'priority_changed';
        description := 'Prioridade alterada de ' || OLD.priority || ' para ' || NEW.priority || ': ' || NEW.title;
    ELSIF COALESCE(OLD.grouped_count, 1) IS DISTINCT FROM COALESCE(NEW.grouped_count, 1) THEN
        interaction_type := 'group_updated';
        description := 'Grupo de notificações atualizado: ' || NEW.title;
    ELSE
        interaction_type := 'notification_updated';
        description := 'Notificação atualizada: ' || NEW.title;
    END IF;

    INSERT INTO system_activities (
        activity_type,
        activity_description,
        user_id,
        metadata,
        created_at
    ) VALUES (
        interaction_type,
        description,
        NEW.user_id,
        jsonb_build_object(
            'notification_id', NEW.id,
            'old_values', jsonb_build_object(
                'is_read', OLD.is_read,
                'status', OLD.status,
                'priority', OLD.priority,
                'grouped_count', COALESCE(OLD.grouped_count, 1)
            ),
            'new_values', jsonb_build_object(
                'is_read', NEW.is_read,
                'status', NEW.status,
                'priority', NEW.priority,
                'grouped_count', COALESCE(NEW.grouped_count, 1)
            ),
            'interaction_type', interaction_type,
            'timestamp', NOW()
        ),
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- CRIAR TRIGGERS PADRONIZADOS
-- ========================================

CREATE TRIGGER trigger_log_notification_creation
    AFTER INSERT ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION log_notification_creation();

CREATE TRIGGER trigger_log_notification_interaction
    AFTER UPDATE ON public.notifications
    FOR EACH ROW
    WHEN (
        OLD.is_read IS DISTINCT FROM NEW.is_read OR
        OLD.status IS DISTINCT FROM NEW.status OR
        OLD.priority IS DISTINCT FROM NEW.priority OR
        COALESCE(OLD.grouped_count, 1) IS DISTINCT FROM COALESCE(NEW.grouped_count, 1)
    )
    EXECUTE FUNCTION log_notification_interaction();

-- ========================================
-- DOCUMENTAÇÃO FINAL DO SISTEMA DE LOGS
-- ========================================

INSERT INTO system_activities (
    activity_type,
    activity_description,
    metadata,
    created_at
) VALUES (
    'system_standardization',
    'Sistema de logs padronizado definitivamente - Inconsistências resolvidas',
    jsonb_build_object(
        'migration_file', '20250117_final_logs_standardization.sql',
        'standardization_completed', true,
        'final_log_structure', jsonb_build_object(
            'notification_logs', jsonb_build_object(
                'count', 2,
                'types', ARRAY[
                    'log_notification_creation - Log de criação de notificações',
                    'log_notification_interaction - Log de interações (leitura, mudanças)'
                ]
            ),
            'authentication_logs', jsonb_build_object(
                'count', 3,
                'types', ARRAY[
                    'login_success - Login bem-sucedido',
                    'login_failed - Tentativa de login falhada',
                    'logout - Logout do usuário'
                ]
            ),
            'mission_logs', jsonb_build_object(
                'count', 2,
                'types', ARRAY[
                    'mission_started - Missão iniciada',
                    'mission_completed - Missão completada'
                ]
            ),
            'database_logs', jsonb_build_object(
                'count', 8,
                'types', ARRAY[
                    'schema_update - Atualização de esquema',
                    'data_migration - Migração de dados',
                    'index_creation - Criação de índices',
                    'policy_update - Atualização de políticas',
                    'function_creation - Criação de funções',
                    'trigger_update - Atualização de triggers',
                    'backup_operation - Operação de backup',
                    'maintenance_task - Tarefa de manutenção'
                ]
            )
        ),
        'functions_created', ARRAY[
            'log_notification_creation()',
            'log_notification_interaction()'
        ],
        'triggers_created', ARRAY[
            'trigger_log_notification_creation',
            'trigger_log_notification_interaction'
        ],
        'inconsistency_resolved', true,
        'standard_established', '2 logs para notificações, 3 para autenticação, 2 para missões, 8 para banco',
        'timestamp', NOW()
    ),
    NOW()
);

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================

-- Verificar funções criadas
SELECT 
    'Funções de log padronizadas' as status,
    COUNT(*) as total_functions
FROM pg_proc 
WHERE proname IN (
    'log_notification_creation',
    'log_notification_interaction'
);

-- Verificar triggers criados
SELECT 
    'Triggers de log padronizados' as status,
    COUNT(*) as total_triggers
FROM pg_trigger 
WHERE tgname IN (
    'trigger_log_notification_creation',
    'trigger_log_notification_interaction'
);

-- Comentários para documentação
COMMENT ON FUNCTION log_notification_creation() IS 'Log padronizado de criação de notificações - Sistema de 2 logs principais';
COMMENT ON FUNCTION log_notification_interaction() IS 'Log padronizado de interações com notificações - Sistema de 2 logs principais';

SELECT 'Sistema de logs padronizado com sucesso! Inconsistências resolvidas definitivamente.' as resultado;
