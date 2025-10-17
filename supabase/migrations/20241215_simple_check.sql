-- Verificação simples de dados e RLS
-- Executado em: 2024-12-15

-- 1. Contar registros na tabela courses
SELECT 
    'Total courses' as description,
    COUNT(*) as count
FROM courses;

-- 2. Verificar alguns registros
SELECT 
    id,
    title,
    category,
    is_published,
    instructor_name
FROM courses 
LIMIT 5;

-- 3. Verificar se RLS está bloqueando acesso público
-- Desabilitar RLS temporariamente para teste
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;

-- 4. Verificar novamente após desabilitar RLS
SELECT 
    'After disabling RLS' as test,
    COUNT(*) as visible_courses
FROM courses;