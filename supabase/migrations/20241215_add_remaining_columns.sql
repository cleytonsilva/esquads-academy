-- Adicionar colunas faltantes na tabela courses
-- Executado em: 2024-12-15

-- Adicionar coluna rating se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'courses' AND column_name = 'rating') THEN
        ALTER TABLE courses ADD COLUMN rating DECIMAL(3,2) DEFAULT 0.0;
        CREATE INDEX IF NOT EXISTS idx_courses_rating ON courses(rating);
        UPDATE courses SET rating = 4.5 WHERE rating IS NULL;
        COMMENT ON COLUMN courses.rating IS 'Avaliação média do curso (0.0 a 5.0)';
    END IF;
END $$;

-- Adicionar coluna duration_hours se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'courses' AND column_name = 'duration_hours') THEN
        ALTER TABLE courses ADD COLUMN duration_hours INTEGER DEFAULT 10;
        CREATE INDEX IF NOT EXISTS idx_courses_duration ON courses(duration_hours);
        UPDATE courses SET duration_hours = 10 WHERE duration_hours IS NULL;
        COMMENT ON COLUMN courses.duration_hours IS 'Duração do curso em horas';
    END IF;
END $$;

-- Adicionar coluna skills se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'courses' AND column_name = 'skills') THEN
        ALTER TABLE courses ADD COLUMN skills TEXT[] DEFAULT '{}';
        CREATE INDEX IF NOT EXISTS idx_courses_skills ON courses USING GIN(skills);
        UPDATE courses SET skills = '{"Programação", "Desenvolvimento Web"}' WHERE skills IS NULL;
        COMMENT ON COLUMN courses.skills IS 'Array de habilidades que o curso ensina';
    END IF;
END $$;

-- Adicionar coluna price se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'courses' AND column_name = 'price') THEN
        ALTER TABLE courses ADD COLUMN price DECIMAL(10,2) DEFAULT 0.0;
        CREATE INDEX IF NOT EXISTS idx_courses_price ON courses(price);
        UPDATE courses SET price = 99.90 WHERE price IS NULL;
        COMMENT ON COLUMN courses.price IS 'Preço do curso em reais';
    END IF;
END $$;

-- Adicionar coluna thumbnail_url se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'courses' AND column_name = 'thumbnail_url') THEN
        ALTER TABLE courses ADD COLUMN thumbnail_url TEXT;
        UPDATE courses SET thumbnail_url = 'https://via.placeholder.com/300x200?text=Curso' WHERE thumbnail_url IS NULL;
        COMMENT ON COLUMN courses.thumbnail_url IS 'URL da imagem de capa do curso';
    END IF;
END $$;

-- Adicionar coluna instructor_name se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'courses' AND column_name = 'instructor_name') THEN
        ALTER TABLE courses ADD COLUMN instructor_name TEXT DEFAULT 'Instrutor';
        UPDATE courses SET instructor_name = 'Instrutor Esquads' WHERE instructor_name IS NULL;
        COMMENT ON COLUMN courses.instructor_name IS 'Nome do instrutor do curso';
    END IF;
END $$;

-- Verificar se todas as colunas foram criadas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'courses' 
  AND column_name IN ('rating', 'duration_hours', 'skills', 'price', 'thumbnail_url', 'instructor_name', 'difficulty_level', 'student_count')
ORDER BY column_name;
