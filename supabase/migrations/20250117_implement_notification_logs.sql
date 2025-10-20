-- Implementar logs detalhados para sistema de notificações
-- Data: 2025-01-17
-- Responsável: Sistema Esquads
-- Descrição: Implementa 2 logs detalhados para monitoramento do sistema de notificações

-- 1. LOG DETALHADO: Criação e agrupamento de notificações
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
        'category', NEW.category,
        'priority', NEW.priority,
        'status', NEW.status,
        'parent_group_id', NEW.parent_group_id,
        'grouped_count', NEW.grouped_count,
        'content_hash', NEW.content_hash,
        'is_important', NEW.is_important,
        'expires_at', NEW.expires_at,
        'created_at', NEW.created_at,
        'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for',
        'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
    );

    -- Se é uma notificação agrupada, adicionar informações do grupo
    IF NEW.parent_group_id IS NOT NULL THEN
        SELECT jsonb_build_object(
            'parent_notification_id', parent.id,
            'parent_title', parent.title,
            'parent_created_at', parent.created_at,
            'total_grouped_notifications', parent.grouped_count
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

-- Criar trigger para log de criação de notificações
DROP TRIGGER IF EXISTS trigger_log_notification_creation ON public.notifications;
CREATE TRIGGER trigger_log_notification_creation
    AFTER INSERT ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION log_notification_creation();

-- 2. LOG DETALHADO: Leitura e interação com notificações
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
        WHEN OLD.grouped_count != NEW.grouped_count THEN 'group_updated'
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
                'to', NEW.grouped_count
            )
        ),
        'notification_data', jsonb_build_object(
            'type', NEW.type,
            'title', NEW.title,
            'category', NEW.category,
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

    -- Adicionar informações específicas para notificações lidas
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

-- Criar trigger para log de interações com notificações
DROP TRIGGER IF EXISTS trigger_log_notification_interaction ON public.notifications;
CREATE TRIGGER trigger_log_notification_interaction
    AFTER UPDATE ON public.notifications
    FOR EACH ROW
    WHEN (
        OLD.is_read IS DISTINCT FROM NEW.is_read OR
        OLD.status IS DISTINCT FROM NEW.status OR
        OLD.priority IS DISTINCT FROM NEW.priority OR
        OLD.grouped_count IS DISTINCT FROM NEW.grouped_count
    )
    EXECUTE FUNCTION log_notification_interaction();

-- 3. Função para consultar logs de notificações
CREATE OR REPLACE FUNCTION get_notification_logs(
    p_user_id UUID DEFAULT NULL,
    p_notification_id UUID DEFAULT NULL,
    p_activity_type TEXT DEFAULT NULL,
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
    id UUID,
    activity_type TEXT,
    activity_description TEXT,
    user_id UUID,
    notification_id UUID,
    interaction_type TEXT,
    changes JSONB,
    notification_data JSONB,
    timestamps JSONB,
    session_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sa.id,
        sa.activity_type,
        sa.activity_description,
        sa.user_id,
        (sa.metadata->>'notification_id')::UUID as notification_id,
        sa.metadata->>'interaction_type' as interaction_type,
        sa.metadata->'changes' as changes,
        sa.metadata->'notification_data' as notification_data,
        sa.metadata->'timestamps' as timestamps,
        sa.metadata->'session_info' as session_info,
        sa.created_at
    FROM system_activities sa
    WHERE 
        sa.activity_type IN ('notification_created', 'notification_read', 'status_changed', 'group_updated', 'priority_changed', 'notification_updated')
        AND (p_user_id IS NULL OR sa.user_id = p_user_id)
        AND (p_notification_id IS NULL OR (sa.metadata->>'notification_id')::UUID = p_notification_id)
        AND (p_activity_type IS NULL OR sa.activity_type = p_activity_type)
        AND (p_start_date IS NULL OR sa.created_at >= p_start_date)
        AND (p_end_date IS NULL OR sa.created_at <= p_end_date)
    ORDER BY sa.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Função para estatísticas de notificações
CREATE OR REPLACE FUNCTION get_notification_stats(
    p_user_id UUID DEFAULT NULL,
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS JSONB AS $$
DECLARE
    stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_notifications_created', COUNT(*) FILTER (WHERE activity_type = 'notification_created'),
        'total_notifications_read', COUNT(*) FILTER (WHERE activity_type = 'notification_read'),
        'total_status_changes', COUNT(*) FILTER (WHERE activity_type = 'status_changed'),
        'total_group_updates', COUNT(*) FILTER (WHERE activity_type = 'group_updated'),
        'avg_time_to_read_seconds', AVG(
            CASE 
                WHEN activity_type = 'notification_read' 
                THEN (metadata->'read_metrics'->>'time_to_read_seconds')::NUMERIC
                ELSE NULL 
            END
        ),
        'notifications_by_category', (
            SELECT jsonb_object_agg(
                category,
                count
            )
            FROM (
                SELECT 
                    metadata->'notification_data'->>'category' as category,
                    COUNT(*) as count
                FROM system_activities
                WHERE 
                    activity_type = 'notification_created'
                    AND (p_user_id IS NULL OR user_id = p_user_id)
                    AND created_at BETWEEN p_start_date AND p_end_date
                GROUP BY metadata->'notification_data'->>'category'
            ) cat_stats
        ),
        'notifications_by_priority', (
            SELECT jsonb_object_agg(
                priority,
                count
            )
            FROM (
                SELECT 
                    metadata->'notification_data'->>'priority' as priority,
                    COUNT(*) as count
                FROM system_activities
                WHERE 
                    activity_type = 'notification_created'
                    AND (p_user_id IS NULL OR user_id = p_user_id)
                    AND created_at BETWEEN p_start_date AND p_end_date
                GROUP BY metadata->'notification_data'->>'priority'
            ) priority_stats
        ),
        'read_rate_percentage', (
            CASE 
                WHEN COUNT(*) FILTER (WHERE activity_type = 'notification_created') > 0
                THEN ROUND(
                    (COUNT(*) FILTER (WHERE activity_type = 'notification_read')::NUMERIC / 
                     COUNT(*) FILTER (WHERE activity_type = 'notification_created')::NUMERIC) * 100, 2
                )
                ELSE 0
            END
        ),
        'period', jsonb_build_object(
            'start_date', p_start_date,
            'end_date', p_end_date,
            'days', EXTRACT(DAYS FROM (p_end_date - p_start_date))
        )
    ) INTO stats
    FROM system_activities
    WHERE 
        activity_type IN ('notification_created', 'notification_read', 'status_changed', 'group_updated')
        AND (p_user_id IS NULL OR user_id = p_user_id)
        AND created_at BETWEEN p_start_date AND p_end_date;

    RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Políticas RLS para as funções de log
-- Permitir que usuários vejam apenas seus próprios logs
CREATE POLICY "users_own_notification_logs" ON system_activities
    FOR SELECT USING (
        activity_type IN ('notification_created', 'notification_read', 'status_changed', 'group_updated', 'priority_changed', 'notification_updated')
        AND (
            user_id = auth.uid() OR 
            auth.jwt() ->> 'role' = 'admin' OR
            auth.jwt() ->> 'role' = 'moderator'
        )
    );

-- 6. Registrar a implementação dos logs
INSERT INTO system_activities (
    activity_type,
    activity_description,
    metadata,
    created_at
) VALUES (
    'system_enhancement',
    'Implementados 2 logs detalhados para sistema de notificações',
    jsonb_build_object(
        'migration_file', '20250117_implement_notification_logs.sql',
        'logs_implemented', ARRAY[
            'log_notification_creation - Log detalhado de criação e agrupamento de notificações',
            'log_notification_interaction - Log detalhado de leitura e interação com notificações'
        ],
        'functions_created', ARRAY[
            'log_notification_creation()',
            'log_notification_interaction()',
            'get_notification_logs()',
            'get_notification_stats()'
        ],
        'triggers_created', ARRAY[
            'trigger_log_notification_creation',
            'trigger_log_notification_interaction'
        ],
        'features', ARRAY[
            'Rastreamento completo de criação de notificações',
            'Monitoramento de agrupamento de notificações',
            'Log de interações (leitura, mudança de status, prioridade)',
            'Métricas de tempo de leitura',
            'Estatísticas de uso por categoria e prioridade',
            'Informações de sessão (IP, User-Agent)',
            'Políticas RLS para segurança dos logs'
        ],
        'timestamp', NOW()
    ),
    NOW()
);

-- 7. Comentários nas funções
COMMENT ON FUNCTION log_notification_creation() IS 'Log detalhado de criação de notificações incluindo agrupamento';
COMMENT ON FUNCTION log_notification_interaction() IS 'Log detalhado de interações com notificações (leitura, mudanças de status)';
COMMENT ON FUNCTION get_notification_logs() IS 'Consulta logs de notificações com filtros avançados';
COMMENT ON FUNCTION get_notification_stats() IS 'Estatísticas detalhadas do sistema de notificações';

-- Verificação final
SELECT 
    'Logs de notificações implementados com sucesso' as status,
    COUNT(*) as total_functions
FROM pg_proc 
WHERE proname IN (
    'log_notification_creation',
    'log_notification_interaction', 
    'get_notification_logs',
    'get_notification_stats'
);
