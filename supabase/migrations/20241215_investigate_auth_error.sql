-- Investigação do erro Database error saving new user

-- Verificar se a tabela auth.users existe
SELECT 'Verificando auth.users' as status;

SELECT count(*) as auth_users_exists
FROM information_schema.tables 
WHERE table_schema = 'auth' AND table_name = 'users';

-- Verificar RLS na tabela auth.users
SELECT 'Verificando RLS auth.users' as status;

SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'auth' AND tablename = 'users';

-- Verificar nossa tabela users
SELECT 'Verificando public.users' as status;

SELECT count(*) as public_users_exists
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'users';

-- Verificar triggers na nossa tabela
SELECT 'Verificando triggers' as status;

SELECT 
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers 
WHERE event_object_schema = 'public' AND event_object_table = 'users';

-- Verificar políticas RLS na nossa tabela
SELECT 'Verificando políticas RLS' as status;

SELECT 
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'users';