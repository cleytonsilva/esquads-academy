-- Debug completo das políticas RLS da tabela users
-- Este script vai nos ajudar a entender exatamente o que está acontecendo

-- 1. Verificar se RLS está ativo
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    relrowsecurity as rls_forced
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE tablename = 'users' AND schemaname = 'public';

-- 2. Listar todas as políticas da tabela users
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

-- 3. Verificar estrutura da tabela users
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar constraints da tabela
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    ccu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'users' AND tc.table_schema = 'public';

-- 5. Verificar se há dados na tabela
SELECT COUNT(*) as total_users FROM users;

-- 6. Testar se conseguimos inserir um usuário de teste (simulando o auth.uid())
-- Nota: Este teste só funcionará se executado com um usuário autenticado