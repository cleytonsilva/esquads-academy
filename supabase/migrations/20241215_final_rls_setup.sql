-- =====================================================
-- CONFIGURAÇÃO FINAL DE RLS PARA PRODUÇÃO
-- =====================================================

-- 1. Reabilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Criar políticas simples e seguras
CREATE POLICY "users_select_own_profile" ON public.users
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "users_insert_own_profile" ON public.users
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own_profile" ON public.users
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Verificar políticas criadas
SELECT 
  'POLÍTICAS FINAIS' as status,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public'
ORDER BY cmd;

-- 4. Verificar status RLS
SELECT 
  'STATUS RLS FINAL' as status,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';