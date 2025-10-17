-- Inserir dados de exemplo para testar a aplicação
-- Executado em: 2024-12-15

-- Primeiro, criar um usuário instrutor de exemplo se não existir
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'instructor@esquads.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Inserir perfil do instrutor
INSERT INTO users (id, full_name, role, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Maria Silva',
  'instructor',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Inserir dados de exemplo para cursos
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
  tags,
  is_published,
  created_at,
  updated_at
) VALUES 
(
  'React Fundamentals',
  'Aprenda os fundamentos do React para desenvolvimento web moderno',
  '550e8400-e29b-41d4-a716-446655440000',
  'Maria Silva',
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
  'Python para Data Science',
  'Análise de dados e machine learning com Python',
  '550e8400-e29b-41d4-a716-446655440000',
  'Maria Silva',
  'Data Science',
  'intermediate',
  25,
  4.7,
  256,
  149.90,
  'https://via.placeholder.com/300x200?text=Python+Data+Science',
  '{"Python", "Machine Learning", "Data Science", "AI"}',
  true,
  NOW(),
  NOW()
),
(
  'Design UX/UI Moderno',
  'Princípios de design para interfaces digitais',
  '550e8400-e29b-41d4-a716-446655440000',
  'Maria Silva',
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