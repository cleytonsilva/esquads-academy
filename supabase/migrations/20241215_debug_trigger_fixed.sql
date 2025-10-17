-- =====================================================
-- DEBUG PROFUNDO: Investigar o trigger e função (CORRIGIDO)
-- =====================================================

-- 1. Verificar se a função existe e seu código
SELECT 
  'FUNÇÃO handle_new_user' as check_type,
  proname as function_name,
  prosrc as function_code
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 2. Verificar se o trigger existe
SELECT 
  'TRIGGER on_auth_user_created' as check_type,
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 3. Verificar se RLS está habilitado
SELECT 
  'RLS STATUS' as check_type,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- 4. Listar todas as políticas RLS
SELECT 
  'POLÍTICAS RLS' as check_type,
  schemaname,
  tablename,
  policyname,
  cmd as command_type
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public';

-- 5. Verificar estrutura da tabela users
SELECT 
  'ESTRUTURA TABELA users' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Testar se conseguimos inserir diretamente (simulando o trigger)
DO $$
DECLARE
    test_id UUID := gen_random_uuid();
BEGIN
    -- Tentar inserir um usuário de teste
    INSERT INTO public.users (id, full_name, role, created_at, updated_at)
    VALUES (
        test_id,
        'Teste Debug',
        'student',
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'SUCESSO: Inserção direta funcionou com ID: %', test_id;
    
    -- Limpar o teste
    DELETE FROM public.users WHERE id = test_id;
    RAISE NOTICE 'LIMPEZA: Usuário de teste removido';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERRO na inserção direta: % - %', SQLSTATE, SQLERRM;
END $$;