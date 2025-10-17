-- Verificar se a coluna role foi adicionada corretamente
SELECT 
    'VERIFICAÇÃO COLUNA ROLE' as status,
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
AND column_name = 'role';

-- Verificar estrutura completa da tabela user_profiles
SELECT 
    'ESTRUTURA COMPLETA USER_PROFILES' as status,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Verificar se há dados na tabela
SELECT 
    'DADOS NA TABELA' as status,
    count(*) as total_registros
FROM public.user_profiles;

-- Tentar inserir um registro de teste
INSERT INTO public.user_profiles (
    user_id,
    full_name,
    role,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'Teste Role',
    'student',
    now(),
    now()
) ON CONFLICT (user_id) DO NOTHING;

-- Verificar se o insert funcionou
SELECT 
    'TESTE INSERT' as status,
    user_id,
    full_name,
    role
FROM public.user_profiles 
WHERE full_name = 'Teste Role';