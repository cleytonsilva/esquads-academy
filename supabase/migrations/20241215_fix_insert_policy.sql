-- Correção da política de INSERT para permitir registro
-- O problema pode ser que auth.uid() retorna NULL durante o processo de registro

-- Remover a política de INSERT atual
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON users;

-- Criar uma política mais permissiva para INSERT
-- Esta política permite inserção se:
-- 1. O usuário está autenticado E o ID corresponde (auth.uid() = id)
-- 2. OU se estamos inserindo um novo usuário durante o registro
CREATE POLICY "users_insert_policy" ON users
    FOR INSERT 
    WITH CHECK (
        -- Permite inserção se o ID corresponde ao usuário autenticado
        auth.uid() = id
        -- OU se o ID existe na tabela auth.users (usuário foi criado pelo Supabase Auth)
        OR EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = users.id
        )
    );

-- Verificar as políticas após a alteração
SELECT 
    policyname,
    cmd,
    permissive,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public'
ORDER BY cmd, policyname;
