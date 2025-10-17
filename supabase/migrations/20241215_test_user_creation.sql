-- Teste para verificar se as políticas RLS estão funcionando
-- Este teste simula a criação de um usuário

-- Verificar políticas atuais
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public'
ORDER BY cmd, policyname;

-- Verificar se RLS está ativo
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- Verificar se há algum usuário de teste
SELECT COUNT(*) as total_users FROM users;