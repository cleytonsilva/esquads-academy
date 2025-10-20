-- Migração para corrigir recursão infinita nas políticas RLS da tabela users
-- Data: 2025-01-17
-- Problema: Erro "infinite recursion detected in policy for relation users"

-- 1. Remover todas as políticas RLS existentes da tabela users
DROP POLICY IF EXISTS "users_own_data" ON users;
DROP POLICY IF EXISTS "users_public_read" ON users;
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "users_delete_policy" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable update for users based on email" ON users;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON users;

-- 2. Garantir que as permissões básicas estejam corretas
GRANT SELECT ON users TO anon;
GRANT ALL PRIVILEGES ON users TO authenticated;

-- 3. Criar políticas RLS simples e não recursivas
-- Política para SELECT: usuários podem ver apenas seus próprios dados
CREATE POLICY "users_select_own_data" ON users
    FOR SELECT 
    USING (auth.uid() = id);

-- Política para INSERT: apenas usuários autenticados podem inserir
CREATE POLICY "users_insert_authenticated" ON users
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Política para UPDATE: usuários podem atualizar apenas seus próprios dados
CREATE POLICY "users_update_own_data" ON users
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Política para DELETE: usuários podem deletar apenas seus próprios dados
CREATE POLICY "users_delete_own_data" ON users
    FOR DELETE 
    USING (auth.uid() = id);

-- 4. Política especial para administradores (sem recursão)
-- Administradores podem ver todos os usuários
CREATE POLICY "users_admin_access" ON users
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM auth.users au 
            WHERE au.id = auth.uid() 
            AND au.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- 5. Verificar se RLS está habilitado
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 6. Comentários para documentação
COMMENT ON POLICY "users_select_own_data" ON users IS 'Permite que usuários vejam apenas seus próprios dados';
COMMENT ON POLICY "users_insert_authenticated" ON users IS 'Permite inserção apenas para usuários autenticados';
COMMENT ON POLICY "users_update_own_data" ON users IS 'Permite que usuários atualizem apenas seus próprios dados';
COMMENT ON POLICY "users_delete_own_data" ON users IS 'Permite que usuários deletem apenas seus próprios dados';
COMMENT ON POLICY "users_admin_access" ON users IS 'Permite acesso total para administradores';
