-- =====================================================
-- CORRIGIR POLÍTICAS RLS PARA PERMITIR LEITURA DO PERFIL
-- =====================================================

-- 1. Remover todas as políticas existentes
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "users_update_policy" ON public.users;
DROP POLICY IF EXISTS "users_delete_policy" ON public.users;

-- 2. Criar política de SELECT mais permissiva
CREATE POLICY "users_select_policy" ON public.users
  FOR SELECT 
  USING (
    -- Permitir que usuários vejam seu próprio perfil
    auth.uid() = id 
    OR 
    -- Permitir que service_role veja qualquer perfil
    auth.role() = 'service_role'
    OR
    -- Permitir que usuários autenticados vejam perfis básicos
    auth.role() = 'authenticated'
  );

-- 3. Criar política de INSERT permissiva
CREATE POLICY "users_insert_policy" ON public.users
  FOR INSERT 
  WITH CHECK (
    -- Permitir inserção se o ID corresponde ao usuário autenticado
    auth.uid() = id
    OR
    -- Permitir inserção via service_role (para triggers)
    auth.role() = 'service_role'
  );

-- 4. Criar política de UPDATE
CREATE POLICY "users_update_policy" ON public.users
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5. Verificar se as políticas foram criadas
SELECT 
  'POLÍTICAS CRIADAS' as status,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public'
ORDER BY cmd;

-- 6. Testar query de SELECT como usuário autenticado
-- (Esta query será executada com as novas políticas)
SELECT 
  'TESTE FINAL' as status,
  COUNT(*) as total_users
FROM public.users;