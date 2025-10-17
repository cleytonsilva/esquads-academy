-- Verificar foreign keys da tabela users
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

-- Verificar se há usuários na tabela auth.users
SELECT 'Usuários na tabela auth.users:' as info;
SELECT COUNT(*) as total_auth_users FROM auth.users;

-- Verificar se há usuários na tabela public.users
SELECT 'Usuários na tabela public.users:' as info;
SELECT COUNT(*) as total_public_users FROM users;