-- ============================================================================
-- CONSOLIDAÇÃO FINAL DOS LOGS - RESOLVER INCONSISTÊNCIAS DEFINITIVAMENTE
-- ============================================================================
-- Data: 2025-01-17
-- Responsável: Sistema Esquads
-- Descrição: Consolidação final para resolver todas as inconsistências de logs

-- ========================================
-- LIMPEZA COMPLETA DE FUNÇÕES DUPLICADAS
-- ========================================

-- Remover todas as funções de log existentes para recriação limpa
DROP FUNCTION IF EXISTS log_notification_creation() CASCADE;
DROP FUNCTION IF EXISTS log_notification_interaction() CASCADE;
DROP FUNCTION IF EXISTS log_notification_read() CASCADE;
DROP FUNCTION IF EXISTS log_notification_update() CASCADE;

-- Remover triggers existentes
DROP TRIGGER IF EXISTS trigger_log_notification_creation ON notifications;
DROP TRIGGER IF EXISTS trigger_log_notification_interaction ON notifications;
DROP TRIGGER IF EXISTS trigger_log_notification_read ON notifications;
DROP TRIGGER IF EXISTS trigger_log_notification_update ON notifications;

-- ========================================
-- SISTEMA DE LOGS CONSOLIDADO (2 LOGS PRINCIPAIS)
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
        CASE 
            WHEN NEW.parent_group_id IS NOT NULL THEN 
                'Notificação agrupada criada: ' || NEW.title
            ELSE 
                'Nova notificação criada: ' || NEW.title
        END,
        NEW.user_id,
        jsonb_build_object(
            'notification_id', NEW.id,
            'user_id', NEW.user_id,
            'type', NEW.type,
            'title', NEW.title,
            'category', COALESCE(NEW.category, 'system'),
            'priority', NEW.priority,
            'status', NEW.status,
            'parent_group_id', NEW.parent_group_id,
            'grouped_count', COALESCE(NEW.grouped_count, 1),
            'is_important', NEW.is_important,
            'expires_at', NEW.expires_at,
            'session_info', jsonb_build_object(
                'timestamp', NOW(),
                'action', 'notification_creation'
            )
        ),
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- LOG 2: INTERAÇÕES COM NOTIFICAÇÕES (leitura, mudanças de status, etc.)
CREATE OR REPLACE FUNCTION log_notification_interaction()
RETURNS TRIGGER AS $$
DECLARE
    interaction_type TEXT;
    old_status TEXT;
    new_status TEXT;
BEGIN
    -- Determinar tipo de interação
    old_status := COALESCE(OLD.status, 'unknown');
    new_status := NEW.status;
    
    interaction_type := CASE
        WHEN OLD.is_read = false AND NEW.is_read = true THEN 'notification_read'
        WHEN OLD.status != NEW.status THEN 'status_changed'
        WHEN COALESCE(OLD.grouped_count, 1) != COALESCE(NEW.grouped_count, 1) THEN 'group_updated'
        WHEN OLD.priority != NEW.priority THEN 'priority_changed'
        ELSE 'notification_updated'
    END;

    INSERT INTO system_activities (
        activity_type,
        activity_description,
        user_id,
        metadata,
        created_at
    ) VALUES (
        interaction_type,
        CASE interaction_type
            WHEN 'notification_read' THEN 'Notificação lida: ' || NEW.title
            WHEN 'status_changed' THEN 'Status alterado de ' || old_status || ' para ' || new_status || ': ' || NEW.title
            WHEN 'group_updated' THEN 'Grupo de notificações atualizado: ' || NEW.title
            WHEN 'priority_changed' THEN 'Prioridade alterada: ' || NEW.title
            ELSE 'Notificação atualizada: ' || NEW.title
        END,
        NEW.user_id,
        jsonb_build_object(
            'notification_id', NEW.id,
            'user_id', NEW.user_id,
            'interaction_type', interaction_type,
            'changes', jsonb_build_object(
                'status_from', old_status,
                'status_to', new_status,
                'is_read_from', COALESCE(OLD.is_read, false),
                'is_read_to', NEW.is_read,
                'priority_from', OLD.priority,
                'priority_to', NEW.priority,
                'grouped_count_from', COALESCE(OLD.grouped_count, 1),
                'grouped_count_to', COALESCE(NEW.grouped_count, 1)
            ),
            'notification_data', jsonb_build_object(
                'type', NEW.type,
                'title', NEW.title,
                'category', COALESCE(NEW.category, 'system'),
                'parent_group_id', NEW.parent_group_id
            ),
            'session_info', jsonb_build_object(
                'timestamp', NOW(),
                'action', 'notification_interaction'
            )
        ),
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- CRIAÇÃO DOS TRIGGERS CONSOLIDADOS
-- ========================================

-- Trigger para criação de notificações
CREATE TRIGGER trigger_log_notification_creation
    AFTER INSERT ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION log_notification_creation();

-- Trigger para interações com notificações
CREATE TRIGGER trigger_log_notification_interaction
    AFTER UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION log_notification_interaction();

-- ========================================
-- LOGS DE SISTEMA PADRONIZADOS
-- ========================================

-- Log da consolidação final
INSERT INTO system_activities (
    activity_type,
    activity_description,
    metadata,
    created_at
) VALUES (
    'system_logs_consolidated',
    'Sistema de logs consolidado definitivamente - Inconsistências resolvidas',
    jsonb_build_object(
        'migration_file', '20250117_final_logs_consolidation.sql',
        'actions_performed', ARRAY[
            'Removidas todas as funções duplicadas de logs',
            'Criadas 2 funções principais consolidadas',
            'Padronizado sistema de logs de notificações',
            'Resolvidas inconsistências entre 2 vs 3 logs',
            'Implementados triggers consolidados'
        ],
        'final_structure', jsonb_build_object(
            'notification_logs', 2,
            'functions_created', ARRAY[
                'log_notification_creation',
                'log_notification_interaction'
            ],
            'triggers_created', ARRAY[
                'trigger_log_notification_creation',
                'trigger_log_notification_interaction'
            ]
        ),
        'status', 'completed',
        'timestamp', NOW()
    ),
    NOW()
);

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================

-- Verificar se as funções foram criadas corretamente
SELECT 
    'Funções de log consolidadas criadas' as status,
    COUNT(*) as total_functions
FROM pg_proc 
WHERE proname IN (
    'log_notification_creation',
    'log_notification_interaction'
);

-- Verificar triggers
SELECT 
    'Triggers de log consolidados criados' as status,
    COUNT(*) as total_triggers
FROM pg_trigger 
WHERE tgname IN (
    'trigger_log_notification_creation',
    'trigger_log_notification_interaction'
);

-- Comentários para documentação
COMMENT ON FUNCTION log_notification_creation() IS 'Log consolidado de criação de notificações - parte do sistema de 2 logs principais';
COMMENT ON FUNCTION log_notification_interaction() IS 'Log consolidado de interações com notificações - parte do sistema de 2 logs principais';

SELECT 'Consolidação de logs concluída com sucesso! Sistema padronizado com 2 logs principais.'
