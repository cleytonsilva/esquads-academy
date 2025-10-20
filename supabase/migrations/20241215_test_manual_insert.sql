-- Teste de inserção manual na tabela users
-- Este script vai testar se conseguimos inserir dados diretamente

-- Primeiro, vamos verificar o estado atual da tabela
SELECT 'Estado atual da tabela users:' as info;
SELECT COUNT(*) as total_users FROM users;

-- Verificar políticas ativas
SELECT 'Políticas RLS ativas:' as info;
SELECT 
    policyname,
    cmd,
    permissive,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public'
ORDER BY cmd;

-- Verificar se RLS está ativo
SELECT 'Status RLS:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- Tentar inserir um usuário de teste usando service role
-- Nota: Este teste só funcionará se executado com service_role_key
INSERT INTO users (id, full_name, role, avatar_url, bio) 
VALUES (
    gen_random_uuid(),
    'Usuário Teste Manual',
    'student',
    null,
    'Usuário criado para teste manual'
) 
ON CONFLICT (id) DO NOTHING;

-- Verificar se a inserção funcionou
SELECT 'Após inserção manual:' as info;
SELECT COUNT(*) as total_users FROM users;
SELECT * FROM users WHERE full_name = 'Usuário Teste Manual' LIMIT 1;
