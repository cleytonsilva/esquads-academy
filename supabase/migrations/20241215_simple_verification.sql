-- Verificação simples da coluna role
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