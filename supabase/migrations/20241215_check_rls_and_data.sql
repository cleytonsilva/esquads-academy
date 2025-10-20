-- Verificar RLS e dados na tabela courses
-- Executado em: 2024-12-15

-- 1. Verificar se RLS está ativo na tabela courses
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    hasrls
FROM pg_tables 
WHERE tablename = 'courses';

-- 2. Verificar políticas RLS existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'courses';

-- 3. Contar registros na tabela courses
SELECT 
    'Total courses' as description,
    COUNT(*) as count
FROM courses;

-- 4. Verificar alguns registros (sem RLS)
SELECT 
    id,
    title,
    category,
    is_published,
    created_at
FROM courses 
LIMIT 5;

-- 5. Temporariamente desabilitar RLS para teste (se necessário)
-- ALTER TABLE courses DISABLE ROW LEVEL SECURITY;

-- 6. Verificar se há dados visíveis publicamente
SELECT 
    'Public access test' as test,
    COUNT(*) as visible_courses
FROM courses
