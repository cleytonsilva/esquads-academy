-- =====================================================
-- CORRIGIR RECURSÃO INFINITA NAS POLÍTICAS RLS
-- =====================================================

-- 1. Desabilitar RLS temporariamente
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 2. Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "users_update_policy" ON public.users;
DROP POLICY IF EXISTS "users_delete_policy" ON public.users;

-- 3. Reabilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas simples e sem recursão
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5. Verificar se as políticas foram criadas corretamente
SELECT 
  'POLÍTICAS CRIADAS' as status,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public'
ORDER BY cmd;

-- 6. Testar query simples
SELECT 
  'TESTE QUERY' as status,
  COUNT(*) as total_