-- Adicionar coluna status na tabela notifications
-- Data: 2025-01-17
-- Responsável: Sistema Esquads
-- Descrição: Adiciona coluna status para controlar o estado das notificações

-- Verificar se a coluna já existe antes de adicionar
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'status'
        AND table_schema = 'public'
    ) THEN
        -- Adicionar a coluna status com valores permitidos
        ALTER TABLE notifications 
        ADD COLUMN status text DEFAULT 'pending' 
        CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed', 'archived'));

        -- Atualizar registros existentes baseado no campo is_read
        UPDATE notifications 
        SET status = CASE 
            WHEN is_read = true THEN 'read'
            WHEN is_read = false THEN 'delivered'
            ELSE 'pending'
        END;

        -- Criar índices para melhor performance
        CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
        CREATE INDEX IF NOT EXISTS idx_notifications_user_status ON notifications(user_id, status);

        -- Comentário na coluna
        COMMENT ON COLUMN notifications.status IS 'Status da notificação: pending, sent, delivered, read, failed, archived';

        RAISE NOTICE 'Coluna status adicionada com sucesso à tabela notifications';
    ELSE
        RAISE NOTICE 'Coluna status já existe na tabela notifications';
    END IF;
END $$;

-- Log da alteração no sistema de atividades
INSERT INTO system_activities (
    activity_type,
    activity_description,
    metadata,
    created_at
) VALUES (
    'database_migration',
    'Adicionada coluna status na tabela notifications',
    jsonb_build_object(
        'table', 'notifications',
        'column', 'status',
        'migration_file', '20250117_add_status_column_notifications.sql',
        'affected_rows', (SELECT COUNT(*) FROM notifications),
        'timestamp', NOW()
    ),
    NOW()
) ON CONFLICT DO NOTHING;
