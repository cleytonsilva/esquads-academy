-- Teste completo do fluxo de registro
-- Verificar se as políticas RLS estão funcionando corretamente

-- 1. Verificar se RLS está ativo
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- 2. Listar todas as políticas ativas
SELECT 
    policyname,
    cmd as operation,
    permissive,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public'
ORDER BY cmd, policyname;

-- 3. Verificar estrutura da tabela users
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar foreign keys
SELECT 
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
    'auth.users' as table_name,
    COUNT(*) as user_count
FROM auth.users
UNION ALL
SELECT 
    'public.users' as table_name,
    COUNT(*) as user_count
FROM public.users;

-- 6. Verificar se há algum trigger na tabela users
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
    AND event_object_schema = 'public';

-- Resultado esperado:
-- - RLS deve estar ativo (true)
-- - Deve haver 4 políticas (INSERT, SELECT, UPDATE, DELETE)
-- - Tabela deve ter colunas: id, full_name, email, created_at, updated_at
-- - Deve haver FK constraint para auth.users(id)
-- - Contagem de usuários pode variar