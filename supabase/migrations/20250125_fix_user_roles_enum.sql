-- Migração para corrigir enum de roles de usuário
-- Data: 2025-01-25
-- Descrição: Atualiza enum user_role para incluir mission_architect

-- Verificar se o tipo enum user_role existe
DO $$
BEGIN
    -- Se o tipo não existir, criar
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('student', 'instructor', 'admin', 'mission_architect');
    ELSE
        -- Se existir, adicionar o novo valor se não estiver presente
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'mission_architect') THEN
            ALTER TYPE user_role ADD VALUE 'mission_architect';
        END IF;
    END IF;
END $$;

-- Verificar se a coluna role na tabela users usa o tipo correto
DO $$
BEGIN
    -- Se a coluna role não for do tipo user_role, alterar
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'role' 
        AND data_type = 'character varying'
    ) THEN
        -- Primeiro, atualizar valores inválidos
        UPDATE users SET role = 'student' WHERE role NOT IN ('student', 'instructor', 'admin', 'mission_architect');
        
        -- Alterar o tipo da coluna
        ALTER TABLE users ALTER COLUMN role TYPE user_role USING role::user_role;
    END IF;
END $$;

-- Garantir que a coluna role tenha um valor padrão
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'student';

-- Comentário
COMMENT ON TYPE user_role IS 'Enum para tipos de usuário: student, instructor, admin, mission_architect';
