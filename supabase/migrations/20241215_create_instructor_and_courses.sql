-- Criar instrutor e cursos de exemplo
-- Executado em: 2024-12-15

-- Primeiro, criar um usuário instrutor se não existir
INSERT INTO users (
  id,
  full_name,
  role,
  avatar_url,
  bio,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Instrutor Esquads',
  'instructor',
  'https://via.placeholder.com/150x150?text=Instrutor',
  'Instrutor especialista em tecnologia e desenvolvimento',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Agora inserir cursos com instructor_id válido
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
  '550e8400-e29b-41d4-a716-446655440000',
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
  '550e8400-e29b-41d4-a716-446655440000',
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
  '550e8400-e29b-41d4-a716-446655440000',
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
),
(
  'Machine Learning com Python',
  'Aprenda Machine Learning do zero ao avançado',
  '550e8400-e29b-41d4-a716-446655440000',
  'Ana Costa',
  'Inteligência Artificial',
  'advanced',
  40,
  4.9,
  234,
  299.90,
  'https://via.placeholder.com/300x200?text=ML+Course',
  '{"Python", "Machine Learning", "Data Science", "AI"}',
  true,
  NOW(),
  NOW()
),
(
  'Design UX/UI Moderno',
  'Princípios de design para interfaces digitais',
  '550e8400-e29b-41d4-a716-446655440000',
  'Pedro Lima',
  'Design',
  'intermediate',
  18,
  4.5,
  445,
  129.90,
  'https://via.placeholder.com/300x200?text=UX+UI+Course',
  '{"UX", "UI", "Design", "Figma", "Prototipagem"}',
  true,
  NOW(),
  NOW()
);

-- Verificar se os dados foram inseridos
SELECT 
  'Courses Inserted' as status,
  COUNT(*) as total_courses
FROM courses;

-- Mostrar alguns cursos inseridos
SELECT 
  id,
  title,
  category,
  difficulty_level,
  student_count,
  rating
FROM courses 
ORDER BY created_at DESC 
LIMIT 5;
