-- Implementar logs simplificados para sistema de notificações
-- Data: 2025-01-17
-- Responsável: Sistema Esquads
-- Descrição: Implementa 2 logs detalhados simplificados para monitoramento do sistema de notificações

-- 1. LOG DETALHADO: Criação de notificações
CREATE OR REPLACE FUNCTION log_notification_creation()
RETURNS TRIGGER AS $$
BEGIN
    -- Inserir log na tabela system_activities
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
            'created_at', NEW.created_at
        ),
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. LOG DETALHADO: Leitura e interação com notificações
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

    -- Inserir log na tabela system_activities
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
            'timestamps', jsonb_build_object(
                'created_at', NEW.created_at,
                'read_at', NEW.read_at,
                'updated_at', NEW.updated_at,
                'interaction_at', NOW()
            )
        ),
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar triggers
DROP TRIGGER IF EXISTS trigger_log_notification_creation ON public.notifications;
CREATE TRIGGER trigger_log_notification_creation
    AFTER INSERT ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION log_notification_creation();

DROP TRIGGER IF EXISTS trigger_log_notification_interaction ON public.notifications;
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

-- Registrar a implementação dos logs
INSERT INTO system_activities (
    activity_type,
    activity_description,
    metadata,
    created_at
) VALUES (
    'system_enhancement',
    'Implementados 2 logs detalhados simplificados para sistema de notificações',
    jsonb_build_object(
        'migration_file', '20250117_simple_notification_logs.sql',
        'logs_implemented', ARRAY[
            'log_notification_creation - Log detalhado de criação de notificações',
            'log_notification_interaction - Log detalhado de interação com notificações'
        ],
        'functions_created', ARRAY[
            'log_notification_creation()',
            'log_notification_interaction()'
        ],
        'triggers_created', ARRAY[
            'trigger_log_notification_creation',
            'trigger_log_notification_interaction'
        ],
        'features', ARRAY[
            'Rastreamento de criação de notificações',
            'Monitoramento de agrupamento',
            'Log de interações (leitura, mudança de status)',
            'Informações de mudanças detalhadas',
            'Timestamps de interação'
        ],
        'timestamp', NOW()
    ),
    NOW()
);

-- Comentários nas funções
COMMENT ON FUNCTION log_notification_creation() IS 'Log detalhado de criação de notificações incluindo agrupamento';
COMMENT ON FUNCTION log_notification_interaction() IS 'Log detalhado de interações com notificações (leitura, mudanças de status)';

-- Verificação final
SELECT 
    'Logs de notificações implementados com sucesso' as status,
    COUNT(*) as total_functions
FROM pg_proc 
WHERE proname IN (
    'log_notification_creation',
    'log_notification_interaction'
);
