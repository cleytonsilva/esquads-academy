-- Correção definitiva das políticas RLS para a tabela users
-- O problema é que as políticas podem estar muito restritivas

-- Primeiro, vamos remover todas as políticas existentes
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "users_delete_policy" ON users;
DROP POLICY IF EXISTS "usuarios_proprios_dados" ON users;

-- Verificar se RLS está ativo (deve estar)
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- Criar políticas mais permissivas para permitir inserção durante o registro
-- Política para INSERT: permite inserção se o ID corresponde ao usuário autenticado
CREATE POLICY "users_can_insert_own_profile" ON users
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Política para SELECT: permite leitura dos próprios dados
CREATE POLICY "users_can_view_own_profile" ON users
    FOR SELECT 
    USING (auth.uid() = id);

-- Política para UPDATE: permite atualização dos próprios dados
CREATE POLICY "users_can_update_own_profile" ON users
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Política para DELETE: permite exclusão dos próprios dados (se necessário)
CREATE POLICY "users_can_delete_own_profile" ON users
    FOR DELETE 
    USING (auth.uid() = id);

-- Verificar as políticas criadas
SELECT 
    policyname,
    cmd,
    permissive,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public'
ORDER BY cmd, policyname;