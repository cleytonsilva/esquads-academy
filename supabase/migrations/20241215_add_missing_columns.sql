-- =====================================================
-- MIGRATION: Adicionar colunas faltantes na tabela courses
-- Data: 2024-12-15
-- Descrição: Adiciona difficulty_level e student_count para resolver erros de performance
-- =====================================================

-- Adicionar coluna difficulty_level
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS difficulty_level TEXT DEFAULT 'beginner' 
CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced'));

-- Adicionar coluna student_count
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS student_count INTEGER DEFAULT 0;

-- Criar índices para melhorar performance das queries
CREATE INDEX IF NOT EXISTS idx_courses_difficulty_level ON courses(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_courses_student_count ON courses(student_count);

-- Atualizar dados existentes com valores padrão inteligentes
UPDATE courses 
SET difficulty_level = 'beginner' 
WHERE difficulty_level IS NULL;

UPDATE courses 
SET student_count = 0 
WHERE student_count IS NULL;

-- Comentários para documentação
COMMENT ON COLUMN courses.difficulty_level IS 'Nível de dificuldade do curso: beginner, intermediate, advanced';
COMMENT ON COLUMN courses.student_count IS 'Número de estudantes matriculados no curso';