-- =====================================================
-- VERIFICAÇÃO CRÍTICA: Status do trigger e função
-- =====================================================
-- Esta migração verifica se o trigger foi criado corretamente

-- 1. Verificar se a função handle_new_user existe
SELECT 
  'FUNÇÃO handle_new_user' as tipo,
  proname as nome,
  prosrc as codigo
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 2. Verificar se o trigger existe
SELECT 
  'TRIGGER on_auth_user_created' as tipo,
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 3. Verificar permissões na tabela users
SELECT 
  'PERMISSÕES users' as tipo,
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'users' AND table_schema = 'public';

-- 4. Verificar políticas RLS ativas
SELECT 
  'POLÍTICAS RLS' as tipo,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'users';

-- 5. Verificar se RLS está habilitado
SELECT 
  'RLS STATUS' as tipo,
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';