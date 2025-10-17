-- Teste final para verificar se o registro está funcionando
-- Vamos simular o processo completo de registro

-- 1. Verificar se RLS está ativo
SELECT 
    'RLS Status' as test_name,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- 2. Listar todas as políticas ativas
SELECT 
    'Active Policies' as test_name,
    policyname,
    cmd as operation,
    permissive
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public'
ORDER BY cmd, policyname;

-- 3. Verificar estrutura da tabela users
SELECT 
    'Table Structure' as test_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar foreign keys
SELECT 
    'Foreign Keys' as test_name,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'users'
    AND tc.table_schema = 'public';

-- 5. Contar usuários existentes
SELECT 
    'User Counts' as test_name,
    'auth.users' as table_name,
    COUNT(*) as user_count
FROM auth.users
UNION ALL
SELECT 
    'User Counts' as test_name,
    'public.users' as table_name,
    COUNT(*) as user_count
FROM public.users;

-- Resultado esperado:
-- - RLS deve estar ativo (true)
-- - Deve haver 4 políticas (INSERT, SELECT, UPDATE, DELETE)
-- - Tabela deve ter colunas: id, full_name, email, created_at, updated_at
-- - Deve haver FK constraint para auth.users(id)
-- - Sistema está pronto para registro