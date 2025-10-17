-- Teste específico para verificar se conseguimos inserir um usuário
-- Vamos simular o que acontece durante o registro

-- 1. Primeiro, vamos verificar se conseguimos inserir um usuário de teste
-- usando um UUID que sabemos que existe em auth.users

-- Verificar se há algum usuário em auth.users
SELECT 
    id,
    email,
    created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- Se não houver usuários, vamos verificar as políticas novamente
SELECT 
    policyname,
    cmd,
    permissive,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public'
ORDER BY cmd, policyname;

-- Verificar se a função auth.uid() está funcionando
-- (Esta deve retornar NULL quando não há usuário autenticado)
SELECT auth.uid() as current_user_id;

-- Verificar se há algum problema com a estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;