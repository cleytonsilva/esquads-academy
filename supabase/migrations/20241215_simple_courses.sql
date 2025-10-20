-- Criar cursos simples usando o usuário atual
-- Executado em: 2024-12-15

-- Primeiro, vamos verificar se há usuários existentes
DO $$
DECLARE
    existing_user_id UUID;
BEGIN
    -- Pegar o primeiro usuário existente ou usar o usuário atual da sessão
    SELECT id INTO existing_user_id 
    FROM auth.users 
    LIMIT 1;
    
    -- Se não houver usuário, usar um UUID padrão e criar entrada na tabela users
    IF existing_user_id IS NULL THEN
        existing_user_id := '9e84ae70-6c0c-4e0a-92f5-dc70959de282'; -- ID do usuário atual
        
        -- Inserir na tabela users se não existir
        INSERT INTO users (
            id,
            full_name,
            role,
            created_at,
            updated_at
        ) VALUES (
            existing_user_id,
            'Instrutor Esquads',
            'instructor',
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO NOTHING;
    END IF;
    
    -- Inserir cursos usando o usuário existente
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
    ) VALUES 
    (
        'React Fundamentals',
        'Aprenda os fundamentos do React para desenvolvimento web moderno',
        existing_user_id,
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
    ),
    (
        'Node.js Avançado',
        'Desenvolvimento backend com Node.js e Express',
        existing_user_id,
        'Maria Santos',
        'Backend',
        'intermediate',
        25,
        4.6,
        156,
        149.90,
        'https://via.placeholder.com/300x200?text=Node.js+Course',
        '{"Node.js", "Express", "API", "Backend"}',
        true,
        NOW(),
        NOW()
    ),
    (
        'Python para Iniciantes',
        'Introdução à programação com Python',
        existing_user_id,
        'Carlos Oliveira',
        'Programação',
        'beginner',
        20,
        4.7,
        892,
        79.90,
        'https://via.placeholder.com/300x200?text=Python+Course',
        '{"Python", "Programação", "Algoritmos"}',
        true,
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Cursos inseridos com sucesso usando instructor_id: %', existing_user_id;
END $$;

-- Verificar se os dados foram inseridos
SELECT 
    'Courses Inserted' as status,
    COUNT(*) as total_courses
FROM courses;

-- Mostrar cursos inseridos
SELECT 
    id,
    title,
    category,
    difficulty_level,
    student_count,
    rating,
    instructor_name
FROM courses 
ORDER BY created_at DESC;
