-- =====================================================
-- VERIFICAR SE USUÁRIO FOI CRIADO CORRETAMENTE
-- =====================================================

-- 1. Verificar se o usuário existe na tabela auth.users
SELECT 
  'USUÁRIO EM AUTH.USERS' as status,
  id,
  email,
  created_at,
  email_confirmed_at,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'cleyton7silva@gmail.com';

-- 2. Verificar se o usuário existe na tabela public.users
SELECT 
  'USUÁRIO EM PUBLIC.USERS' as status,
  id,
  full_name,
  role,
  created_at,
  updated_at
FROM public.users 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'cleyton7silva@gmail.com'
);

-- 3. Verificar políticas RLS ativas para a tabela users
SELECT 
  'POLÍTICAS RLS ATIVAS' as status,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public';

-- 4. Verificar se RLS está habilitado
SELECT 
  'STATUS RLS' as status,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- 5. Testar query direta como seria feita pelo AuthContext
SELECT 
  'TESTE QUERY AUTHCONTEXT' as status,
  *
FROM public.users 
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'cleyton7silva@gmail.com' LIMIT 1
);