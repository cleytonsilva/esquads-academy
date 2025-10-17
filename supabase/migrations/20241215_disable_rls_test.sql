-- =====================================================
-- TESTE CRÍTICO: Desabilitar RLS temporariamente
-- =====================================================
-- Esta migração desabilita RLS para testar se é isso que causa o erro

-- 1. Desabilitar RLS temporariamente
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 2. Verificar se RLS foi desabilitado
SELECT 
  'RLS STATUS APÓS DESABILITAR' as check_type,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- 3. Testar inserção direta sem RLS
DO $$
DECLARE
    test_id UUID := gen_random_uuid();
BEGIN
    -- Tentar inserir um usuário de teste sem RLS
    INSERT INTO public.users (id, full_name, role, created_at, updated_at)
    VALUES (
        test_id,
        'Teste Sem RLS',
        'student',
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'SUCESSO SEM RLS: Inserção funcionou com ID: %', test_id;
    
    -- Limpar o teste
    DELETE FROM public.users WHERE id = test_id;
    RAISE NOTICE 'LIMPEZA: Usuário de teste removido';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERRO mesmo sem RLS: % - %', SQLSTATE, SQLERRM;
END $$;