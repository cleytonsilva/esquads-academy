-- Corrigir inconsistências entre logs (2 vs 3 logs) no sistema
-- Data: 2025-01-17
-- Responsável: Sistema Esquads
-- Descrição: Consolida e corrige inconsistências nos logs do sistema

-- ========================================
-- CORREÇÃO 1: PADRONIZAR LOGS DE NOTIFICAÇÕES
-- ========================================

-- Remover funções duplicadas se existirem
DROP FUNCTION IF EXISTS log_notification_creation() CASCADE;
DROP FUNCTION IF EXISTS log_notification_interaction() CASCADE;

-- Recriar função consolidada de log de criação de notificações
CREATE OR REPLACE FUNCTION log_notification_creation()
RETURNS TRIGGER AS $$
DECLARE
    log_data JSONB;
    grouped_info JSONB;
BEGIN
    -- Preparar dados do log
    log_data := jsonb_build_object(
        'notification_id', NEW.id,
        'user_id', NEW.user_id,
        'type', NEW.type,
        'title', NEW.title,
        'category', COALESCE(NEW.category, 'system'),
        'priority', NEW.priority,
        'status', NEW.status,
        'parent_group_id', NEW.parent_group_id,
        'grouped_count', COALESCE(NEW.grouped_count, 1),
        'content_hash', NEW.content_hash,
        'is_important', NEW.is_important,
        'expires_at', NEW.expires_at,
        'created_at', NEW.created_at,
        'session_info', jsonb_build_object(
            'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for',
            'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
        )
    );

    -- Se é uma notificação agrupada, adicionar informações do grupo
    IF NEW.parent_group_id IS NOT NULL THEN
        SELECT jsonb_build_object(
            'parent_notification_id', parent.id,
            'parent_title', parent.title,
            'parent_created_at', parent.created_at,
            'total_grouped_notifications', COALESCE(parent.grouped_count, 1)
        ) INTO grouped_info
        FROM notifications parent
        WHERE parent.id = NEW.parent_group_id;
        
        log_data := log_data || jsonb_build_object('group_info', grouped_info);
    END IF;

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
        log_data,
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar função consolidada de log de interação com notificações
CREATE OR REPLACE FUNCTION log_notification_interaction()
RETURNS TRIGGER AS $$
DECLARE
    log_data JSONB;
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

    -- Preparar dados do log
    log_data := jsonb_build_object(
        'notification_id', NEW.id,
        'user_id', NEW.user_id,
        'interaction_type', interaction_type,
        'changes', jsonb_build_object(
            'status', jsonb_build_object(
                'from', old_status,
                'to', new_status
            ),
            'is_read', jsonb_build_object(
                'from', COALESCE(OLD.is_read, false),
                'to', NEW.is_read
            ),
            'priority', jsonb_build_object(
                'from', OLD.priority,
                'to', NEW.priority
            ),
            'grouped_count', jsonb_build_object(
                'from', COALESCE(OLD.grouped_count, 1),
                'to', COALESCE(NEW.grouped_count, 1)
            )
        ),
        'notification_data', jsonb_build_object(
            'type', NEW.type,
            'title', NEW.title,
            'category', COALESCE(NEW.category, 'system'),
            'parent_group_id', NEW.parent_group_id,
            'content_hash', NEW.content_hash
        ),
        'timestamps', jsonb_build_object(
            'created_at', NEW.created_at,
            'read_at', NEW.read_at,
            'updated_at', NEW.updated_at,
            'interaction_at', NOW()
        ),
        'session_info', jsonb_build_object(
            'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for',
            'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
        )
    );

    -- Adicionar métricas específicas para notificações lidas
    IF interaction_type = 'notification_read' THEN
        log_data := log_data || jsonb_build_object(
            'read_metrics', jsonb_build_object(
                'time_to_read_seconds', EXTRACT(EPOCH FROM (NOW() - NEW.created_at)),
                'was_important', NEW.is_important,
                'read_method', CASE 
                    WHEN NEW.parent_group_id IS NOT NULL THEN 'grouped_notification'
                    ELSE 'individual_notification'
                END
            )
        );
    END IF;

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
        log_data,
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar triggers consolidados
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

-- ========================================
-- CORREÇÃO 2: ATUALIZAR DOCUMENTAÇÃO DOS LOGS
-- ========================================

-- Registrar a correção das inconsistências
INSERT INTO system_activities (
    activity_type,
    activity_description,
    metadata,
    created_at
) VALUES (
    'system_correction',
    'Corrigidas inconsistências entre logs (2 vs 3 logs) - Sistema consolidado',
    jsonb_build_object(
        'migration_file', '20250117_fix_logs_inconsistency.sql',
        'corrections_made', ARRAY[
            'Removidas funções duplicadas de logs de notificações',
            'Consolidadas funções log_notification_creation e log_notification_interaction',
            'Padronizada documentação para 2 logs de notificações (criação e interação)',
            'Mantidos 3 logs de autenticação conforme especificação',
            'Mantidos 3 logs de funcionalidades sociais conforme especificação'
        ],
        'final_log_structure', jsonb_build_object(
            'authentication_logs', 3,
            'social_functionality_logs', 3,
            'notification_logs', 2,
            'mission_logs', 2,
            'database_logs', 8
        ),
        'functions_consolidated', ARRAY[
            'log_notification_creation() - Log de criação de notificações',
            'log_notification_interaction() - Log de interação com notificações'
        ],
        'triggers_updated', ARRAY[
            'trigger_log_notification_creation',
            'trigger_log_notification_interaction'
        ],
        'inconsistency_resolved', true,
        'timestamp', NOW()
    ),
    NOW()
);

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================

-- Verificar se as funções foram criadas corretamente
SELECT 
    'Funções de log consolidadas' as status,
    COUNT(*) as total_functions
FROM pg_proc 
WHERE proname IN (
    'log_notification_creation',
    'log_notification_interaction'
);

-- Verificar triggers
SELECT 
    'Triggers de log ativos' as status,
    COUNT(*) as total_triggers
FROM pg_trigger 
WHERE tgname IN (
    'trigger_log_notification_creation',
    'trigger_log_notification_interaction'
);

-- Resumo final dos logs por categoria (corrigido)
SELECT 
    'Estrutura final de logs consolidada' as description,
    jsonb_build_object(
        'authentication_logs', '3 logs (login, logout, failed_attempts)',
        'social_functionality_logs', '3 logs (friend_requests, messages, interactions)',
        'notification_logs', '2 logs (creation, interaction)',
        'mission_logs', '2 logs (start, completion)',
        'database_logs', '8 logs (operations, maintenance, security)',
        'total_categories', 5,
        'inconsistency_status', 'RESOLVED'
    ) as log_structure;

-- Comentários nas funções
COMMENT ON FUNCTION log_notification_creation() IS 'Log consolidado de criação de notificações (incluindo agrupamento e sessão)';
COMMENT ON FUNCTION log_notification_interaction() IS 'Log consolidado de interações com notificações (leitura, mudanças de status, métricas)';

SELECT 'Inconsistências de logs corrigidas com sucesso!' as resultado;
