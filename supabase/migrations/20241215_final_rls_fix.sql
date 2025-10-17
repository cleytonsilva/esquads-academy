-- CORREÇÃO DEFINITIVA DAS POLÍTICAS RLS
-- Esta migração resolve o problema de inserção durante o registro

-- 1. Reabilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas existentes
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON users;
DROP POLICY IF EXISTS "users_can_view_own_profile" ON users;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON users;
DROP POLICY IF EXISTS "users_can_delete_own_profile" ON users;
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "users_delete_policy" ON users;

-- 3. Criar políticas corretas que funcionam com o fluxo de registro do Supabase

-- Política para INSERT: Permite inserção se o usuário existe em auth.users
-- Esta é a chave para resolver o problema de registro
CREATE POLICY "Enable insert for authenticated users" ON users
    FOR INSERT 
    WITH CHECK (
        -- Verifica se o ID existe na tabela auth.users
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = users.id
        )
    );

-- Política para SELECT: Permite leitura dos próprios dados
CREATE POLICY "Enable select for users based on user_id" ON users
    FOR SELECT 
    USING (auth.uid() = id);

-- Política para UPDATE: Permite atualização dos próprios dados
CREATE POLICY "Enable update for users based on user_id" ON users
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Política para DELETE: Permite exclusão dos próprios dados
CREATE POLICY "Enable delete for users based on user_id" ON users
    FOR DELETE 
    USING (auth.uid() = id);

-- 4. Verificar se as políticas foram criadas corretamente
SELECT 
    policyname,
    cmd as operation,
    permissive,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public'
ORDER BY cmd, policyname;

-- 5. Verificar se RLS está ativo
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';