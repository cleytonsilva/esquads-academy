-- Adicionar coluna parent_group_id na tabela notifications
-- Data: 2025-01-17
-- Responsável: Sistema Esquads
-- Descrição: Adiciona coluna parent_group_id para agrupamento de notificações

-- 1. Verificar se a coluna já existe
DO $$
BEGIN
    -- Verificar se a coluna parent_group_id já existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'parent_group_id'
        AND table_schema = 'public'
    ) THEN
        -- Adicionar a coluna parent_group_id
        ALTER TABLE public.notifications 
        ADD COLUMN parent_group_id UUID REFERENCES public.notifications(id);
        
        -- Adicionar comentário na coluna
        COMMENT ON COLUMN public.notifications.parent_group_id IS 'ID da notificação pai para agrupamento de notificações similares';
        
        RAISE NOTICE 'Coluna parent_group_id adicionada com sucesso à tabela notifications';
    ELSE
        RAISE NOTICE 'Coluna parent_group_id já existe na tabela notifications';
    END IF;
END $$;

-- 2. Verificar se outras colunas necessárias existem e adicionar se necessário
DO $$
BEGIN
    -- Verificar e adicionar coluna category se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'category'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.notifications 
        ADD COLUMN category TEXT CHECK (category IN (
            'xp', 'badge', 'mission', 'certificate', 'level', 
            'reputation', 'hint', 'feedback', 'exam', 'achievement', 
            'social', 'system'
        )) DEFAULT 'system';
        
        COMMENT ON COLUMN public.notifications.category IS 'Categoria da notificação para agrupamento e filtragem';
        
        RAISE NOTICE 'Coluna category adicionada com sucesso à tabela notifications';
    END IF;

    -- Verificar e adicionar coluna grouped_count se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'grouped_count'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.notifications 
        ADD COLUMN grouped_count INTEGER DEFAULT 1;
        
        COMMENT ON COLUMN public.notifications.grouped_count IS 'Número de notificações agrupadas nesta notificação';
        
        RAISE NOTICE 'Coluna grouped_count adicionada com sucesso à tabela notifications';
    END IF;

    -- Verificar e adicionar coluna content_hash se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'content_hash'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.notifications 
        ADD COLUMN content_hash TEXT;
        
        COMMENT ON COLUMN public.notifications.content_hash IS 'Hash do conteúdo para detectar notificações duplicadas';
        
        RAISE NOTICE 'Coluna content_hash adicionada com sucesso à tabela notifications';
    END IF;

    -- Verificar e adicionar coluna read_at se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'read_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.notifications 
        ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;
        
        COMMENT ON COLUMN public.notifications.read_at IS 'Timestamp de quando a notificação foi lida';
        
        RAISE NOTICE 'Coluna read_at adicionada com sucesso à tabela notifications';
    END IF;

    -- Verificar e adicionar coluna updated_at se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.notifications 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        COMMENT ON COLUMN public.notifications.updated_at IS 'Timestamp da última atualização da notificação';
        
        RAISE NOTICE 'Coluna updated_at adicionada com sucesso à tabela notifications';
    END IF;
END $$;

-- 3. Atualizar o enum de status se necessário
DO $$
BEGIN
    -- Verificar se o status 'grouped' e 'suppressed' existem
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'grouped' 
        AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'notification_status'
        )
    ) THEN
        -- Se o tipo enum não existir, vamos alterar a constraint check
        ALTER TABLE public.notifications 
        DROP CONSTRAINT IF EXISTS notifications_status_check;
        
        ALTER TABLE public.notifications 
        ADD CONSTRAINT notifications_status_check 
        CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed', 'archived', 'unread', 'suppressed', 'grouped'));
        
        RAISE NOTICE 'Constraint de status atualizada para incluir novos valores';
    END IF;
END $$;

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_notifications_parent_group_id 
ON public.notifications(parent_group_id) 
WHERE parent_group_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_category 
ON public.notifications(category);

CREATE INDEX IF NOT EXISTS idx_notifications_content_hash 
ON public.notifications(content_hash) 
WHERE content_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_user_status 
ON public.notifications(user_id, status);

-- 5. Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_notifications_updated_at ON public.notifications;
CREATE TRIGGER trigger_update_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notifications_updated_at();

-- 6. Atualizar dados existentes
UPDATE public.notifications 
SET 
    category = CASE 
        WHEN type = 'achievement' THEN 'achievement'
        WHEN type = 'mission_completed' THEN 'mission'
        WHEN type = 'badge_earned' THEN 'badge'
        WHEN type = 'level_up' THEN 'level'
        WHEN type = 'course_completed' THEN 'certificate'
        WHEN type = 'streak' THEN 'achievement'
        ELSE 'system'
    END,
    grouped_count = 1,
    updated_at = NOW()
WHERE category IS NULL;

-- Atualizar read_at baseado em is_read
UPDATE public.notifications 
SET read_at = created_at
WHERE is_read = true AND read_at IS NULL;

-- 7. Log da migração
INSERT INTO system_activities (
    activity_type,
    activity_description,
    metadata,
    created_at
) VALUES (
    'database_migration',
    'Adicionada coluna parent_group_id e colunas relacionadas na tabela notifications',
    jsonb_build_object(
        'migration_file', '20250117_add_parent_group_id_notifications.sql',
        'columns_added', ARRAY[
            'parent_group_id',
            'category',
            'grouped_count',
            'content_hash',
            'read_at',
            'updated_at'
        ],
        'indexes_created', ARRAY[
            'idx_notifications_parent_group_id',
            'idx_notifications_category',
            'idx_notifications_content_hash',
            'idx_notifications_user_status'
        ],
        'triggers_created', ARRAY[
            'trigger_update_notifications_updated_at'
        ],
        'timestamp', NOW()
    ),
    NOW()
);

-- 8. Verificação final
SELECT 
    'Verificação da estrutura da tabela notifications' as description,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notifications' 
  AND table_schema = 'public'
  AND column_name IN ('parent_group_id', 'category', 'grouped_count', 'content_hash', 'read_at', 'updated_at')
ORDER BY ordinal_position;
