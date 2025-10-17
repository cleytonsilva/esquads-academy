-- Teste crítico para verificar o serviço Auth do Supabase
-- Vamos verificar se há algum problema com a configuração Auth

-- 1. Verificar se o schema auth existe e está acessível
SELECT 
    'Auth Schema Check' as test_name,
    schema_name
FROM information_schema.schemata 
WHERE schema_name = 'auth';

-- 2. Verificar se a tabela auth.users existe e está acessível
SELECT 
    'Auth Users Table' as test_name,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'auth' AND table_name = 'users';

-- 3. Verificar estrutura da tabela auth.users
SELECT 
    'Auth Users Structure' as test_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'auth' AND table_name = 'users'
ORDER BY ordinal_position;

-- 4. Verificar se há usuários existentes em auth.users
SELECT 
    'Auth Users Count' as test_name,
    COUNT(*) as total_users
FROM auth.users;

-- 5. Verificar configurações de Auth
SELECT 
    'Auth Config' as test_name,
    name,
    setting
FROM pg_settings 
WHERE name LIKE '%auth%' OR name LIKE '%jwt%'
ORDER BY name;

-- 6. Verificar se há triggers ou funções relacionadas ao Auth
SELECT 
    'Auth Triggers' as test_name,
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
ORDER BY trigger_name;

-- 7. Verificar políticas RLS na tabela auth.users
SELECT 
    'Auth RLS Policies' as test_name,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE schemaname = 'auth' AND tablename = 'users'
ORDER BY cmd, policyname;