-- =====================================================
-- CRIAR USUÁRIO MANUALMENTE SE NÃO EXISTIR
-- =====================================================

-- 1. Verificar se o usuário existe em auth.users
SELECT 
  'USUÁRIO EM AUTH' as status,
  id,
  email,
  created_at
FROM auth.users 
WHERE email = 'cleyton7silva@gmail.com';

-- 2. Verificar se o usuário existe em public.users
SELECT 
  'USUÁRIO EM PUBLIC' as status,
  id,
  full_name,
  role
FROM public.users 
WHERE id = '9e84ae70-6c0c-4e0a-92f5-dc70959de282';

-- 3. Inserir o usuário manualmente se não existir
INSERT INTO public.users (id, full_name, role, created_at, updated_at)
SELECT 
  '9e84ae70-6c0c-4e0a-92f5-dc70959de282',
  'Cleyton Silva',
  'student',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.users WHERE id = '9e84ae70-6c0c-4e0a-92f5-dc70959de282'
);

-- 4. Verificar se foi criado
SELECT 
  'USUÁRIO CRIADO' as status,
  id,
  full_name,
  role,
  created_at
FROM public.users 
WHERE id = '9e84ae70-6c0c-4e0a-92f5-dc70959de282';