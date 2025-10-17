-- Inserir cursos de exemplo - versão final
-- Executado em: 2024-12-15

-- Inserir cursos usando o usuário atual (9e84ae70-6c0c-4e0a-92f5-dc70959de282)
-- que já existe na tabela users

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
    is_published
) VALUES 
(
    'React Fundamentals',
    'Aprenda os fundamentos do React para desenvolvimento web moderno',
    '9e84ae70-6c0c-4e0a-92f5-dc70959de282',
    'João Silva',
    'Desenvolvimento Web',
    'beginner',
    15,
    4.8,
    324,
    99.90,
    'https://via.placeholder.com/300x200?text=React+Course',
    ARRAY['React', 'JavaScript', 'Frontend'],
    true
),
(
    'Node.js Avançado',
    'Desenvolvimento backend com Node.js e Express',
    '9e84ae70-6c0c-4e0a-92f5-dc70959de282',
    'Maria Santos',
    'Backend',
    'intermediate',
    25,
    4.6,
    156,
    149.90,
    'https://via.placeholder.com/300x200?text=Node.js+Course',
    ARRAY['Node.js', 'Express', 'API', 'Backend'],
    true
),
(
    'Python para Iniciantes',
    'Introdução à programação com Python',
    '9e84ae70-6c0c-4e0a-92f5-dc70959de282',
    'Carlos Oliveira',
    'Programação',
    'beginner',
    20,
    4.7,
    892,
    79.90,
    'https://via.placeholder.com/300x200?text=Python+Course',
    ARRAY['Python', 'Programação', 'Algoritmos'],
    true
);

-- Verificar se os cursos foram inseridos
SELECT 
    COUNT(*) as total_courses,
    string_agg(title, ', ') as course_titles
FROM courses;