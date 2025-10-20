-- Migração para adicionar role mission_architect
-- Data: 2025-01-25

-- Adicionar o novo valor ao enum user_role se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'mission_architect') THEN
        ALTER TYPE user_role ADD VALUE 'mission_architect';
    END IF;
END $$;
