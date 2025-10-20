-- =====================================================
-- DESABILITAR RLS COMPLETAMENTE PARA RESOLVER RECURSÃO
-- =====================================================

-- 1. Remover TODAS as políticas
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_delete_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "users_update_policy" ON public.users;
DROP POLICY IF EXISTS "users_delete_policy" ON public.users;

-- 2. Desabilitar RLS completamente
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 3. Verificar que não há políticas
SELECT 
  'POLÍTICAS RESTANTES' as status,
  COUNT(*) as count
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public';

-- 4. Verificar status RLS
SELECT 
  'STATUS RLS' as status,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- 5. Testar query direta
SELECT 
  'TESTE QUERY DIRETA' as status,
  COUNT(*) as total_users
FROM public.users;
