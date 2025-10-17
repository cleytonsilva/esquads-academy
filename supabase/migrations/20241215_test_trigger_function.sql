-- =====================================================
-- TESTE CRÍTICO: Testar o trigger handle_new_user
-- =====================================================
-- Esta migração testa se o trigger funciona corretamente

-- 1. Primeiro, vamos verificar se podemos inserir diretamente na tabela users
-- (isso deve funcionar se as políticas RLS estão corretas)
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
BEGIN
    -- Tentar inserir um usuário de teste diretamente
    INSERT INTO public.users (id, full_name, role, created_at, updated_at)
    VALUES (
        test_user_id,
        'Teste Direto',
        'student',
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'SUCESSO: Inserção direta na tabela users funcionou com ID: %', test_user_id;
    
    -- Limpar o teste
    DELETE FROM public.users WHERE id = test_user_id;
    RAISE NOTICE 'LIMPEZA: Usuário de teste removido';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERRO na inserção direta: % - %', SQLSTATE, SQLERRM;
END $$;

-- 2. Verificar se a função handle_new_user pode ser executada
DO $$
DECLARE
    test_record RECORD;
BEGIN
    -- Simular um registro NEW como seria passado pelo trigger
    SELECT 
        gen_random_uuid() as id,
        'test@example.com' as email,
        '{"full_name": "Teste Trigger", "role": "student"}'::jsonb as raw_user_meta_data,
        NOW() as created_at
    INTO test_record;
    
    RAISE NOTICE 'TESTE: Simulando execução da função handle_new_user';
    RAISE NOTICE 'ID de teste: %', test_record.id;
    RAISE NOTICE 'Metadata: %', test_record.raw_user_meta_data;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERRO no teste da função: % - %', SQLSTATE, SQLERRM;
END $$;

-- 3. Verificar se existem conflitos de constraint
SELECT 
    'CONSTRAINTS users' as tipo,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'users' AND table_schema = 'public';

-- 4. Verificar se há dados órfãos que podem causar conflito
SELECT 
    'DADOS ÓRFÃOS' as tipo,
    COUNT(*) as total_users_public
FROM public.users;

SELECT 
    'DADOS AUTH' as tipo,
    COUNT(*) as total_users_auth
FROM auth.users;