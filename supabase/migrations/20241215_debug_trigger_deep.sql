-- =====================================================
-- DEBUG PROFUNDO: Investigar o trigger e função
-- =====================================================

-- 1. Verificar se a função existe e seu código
SELECT 
  'FUNÇÃO handle_new_user' as check_type,
  proname as function_name,
  prosrc as function_code,
  proowner as owner_id,
  proacl as permissions
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 2. Verificar se o trigger existe
SELECT 
  'TRIGGER on_auth_user_created' as check_type,
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing,
  action_orientation
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 3. Verificar se há outros triggers na tabela auth.users
SELECT 
  'TODOS OS TRIGGERS auth.users' as check_type,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' AND event_object_schema = 'auth';

-- 4. Verificar permissões na tabela public.users
SELECT 
  'PERMISSÕES public.users' as check_type,
  table_schema,
  table_name,
  privilege_type,
  grantee,
  is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'users' AND table_schema = 'public';

-- 5. Verificar se RLS está habilitado e políticas ativas
SELECT 
  'RLS STATUS' as check_type,
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  hasrls as has_rls
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- 6. Listar todas as políticas RLS
SELECT 
  'POLÍTICAS RLS' as check_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command_type,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public';

-- 7. Verificar se há constraints que podem estar falhando
SELECT 
  'CONSTRAINTS' as check_type,
  constraint_name,
  constraint_type,
  table_name,
  column_name
FROM information_schema.constraint_column_usage 
WHERE table_name = 'users' AND table_schema = 'public';

-- 8. Verificar estrutura da tabela users
SELECT 
  'ESTRUTURA TABELA users' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;