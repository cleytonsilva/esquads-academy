-- Corrigir constraint e inserir dados de exemplo
-- Executado em: 2024-12-15

-- Primeiro, vamos verificar se podemos tornar instructor_id nullable temporariamente
-- ou inserir dados usando o usuário atual autenticado

-- Inserir dados usando o usuário atual da sessão (se autenticado)
INSERT INTO courses (
    title,
    description,
    instructor_id,
    instructor_name,
    category,
    difficulty_level,
    duration_hours,
    rating,
    student_count,
    price,
    thumbnail_url,
    skills,
    is_published,
    created_at,
    updated_at
) 
SELECT 
    'React Fundamentals',
    'Aprenda os fundamentos do React para desenvolvimento web moderno',
    auth.uid(),
    'João Silva',
    'Desenvolvimento Web',
    'beginner',
    15,
    4.8,
    324,
    99.90,
    'https://via.placeholder.com/300x200?text=React+Course',
    '{"React", "JavaScript", "Frontend"}',
    true,
    NOW(),
    NOW()
WHERE auth.uid() IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM courses WHERE title = 'React Fundamentals');

-- Se não há usuário autenticado, vamos inserir usando uma abordagem diferente
-- Vamos verificar se existe algum usuário na tabela users
DO $$
DECLARE
    user_count INTEGER;
    sample_user_id UUID;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    
    IF user_count = 0 THEN
        -- Se não há usuários, vamos criar um usuário de exemplo
        -- Primeiro inserir em auth.users (se possível) ou apenas em users
        INSERT INTO users (
            id,
            full_name,
            role,
            created_at,
            updated_at
        ) VALUES (
            '9e84ae70-6c0c-4e0a-92f5-dc70959de282',
            'Instrutor Esquads',
            'instructor',
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO NOTHING;
        
        sample_user_id := '9e84ae70-6c0c-4e0a-92f5-dc70959de282';
    ELSE
        -- Usar o primeiro usuário existente
        SELECT id INTO sample_user_id FROM users LIMIT 1;
    END IF;
    
    -- Inserir cursos de exemplo se não existirem
    INSERT INTO courses (
        title,
        description,
        instructor_id,
        instructor_name,
        category,
        difficulty_level,
        duration_hours,
        rating,
        student_count,
        price,
        thumbnail_url,
        skills,
        is_published,
        created_at,
        updated_at
    ) 
    SELECT * FROM (VALUES
        ('React Fundamentals', 'Aprenda os fundamentos do React para desenvolvimento web moderno', sample_user_id, 'João Silva', 'Desenvolvimento Web', 'beginner', 15, 4.8, 324, 99.90, 'https://via.placeholder.com/300x200?text=React+Course', '{"React", "JavaScript", "Frontend"}', true, NOW(), NOW()),
        ('Node.js Avançado', 'Desenvolvimento backend com Node.js e Express', sample_user_id, 'Maria Santos', 'Backend', 'intermediate', 25, 4.6, 156, 149.90, 'https://via.placeholder.com/300x200?text=Node.js+Course', '{"Node.js", "Express", "API", "Backend"}', true, NOW(), NOW()),
        ('Python para Iniciantes', 'Introdução à programação com Python', sample_user_id, 'Carlos Oliveira', 'Programação', 'beginner', 20, 4.7, 892, 79.90, 'https://via.placeholder.com/300x200?text=Python+Course', '{"Python", "Programação", "Algoritmos"}', true, NOW(), NOW())
    ) AS v(title, description, instructor_id, instructor_name, category, difficulty_level, duration_hours, rating, student_count, price, thumbnail_url, skills, is_published, created_at, updated_at)
    WHERE NOT EXISTS (SELECT 1 FROM courses WHERE courses.title = v.title);
    
    RAISE NOTICE 'Cursos inseridos usando instructor_id: %', sample_user_id;
END $$;

-- Verificar resultados
SELECT 
    'Final Status' as status,
    COUNT(*) as total_courses,
    string_agg(title, ', ') as course_titles
FROM courses;
