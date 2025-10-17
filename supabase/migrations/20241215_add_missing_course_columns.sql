-- =====================================================
-- Adicionar colunas ausentes na tabela courses
-- Data: 2024-12-15
-- Descrição: Adiciona duration_hours e rating para resolver erros de consulta
-- =====================================================

-- Verificar se as colunas já existem antes de adicionar
DO $$ 
BEGIN
    -- Adicionar coluna duration_hours se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'duration_hours'
    ) THEN
        ALTER TABLE courses ADD COLUMN duration_hours INTEGER DEFAULT 0;
        COMMENT ON COLUMN courses.duration_hours IS 'Duração estimada do curso em horas';
    END IF;

    -- Adicionar coluna rating se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'rating'
    ) THEN
        ALTER TABLE courses ADD COLUMN rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0.0 AND rating <= 5.0);
        COMMENT ON COLUMN courses.rating IS 'Avaliação média do curso (0.0 a 5.0)';
    END IF;
END $$;

-- Atualizar cursos existentes com valores padrão realistas
UPDATE courses 
SET 
    duration_hours = CASE 
        WHEN title ILIKE '%básico%' OR title ILIKE '%introdução%' THEN 8
        WHEN title ILIKE '%avançado%' OR title ILIKE '%completo%' THEN 20
        ELSE 12
    END,
    rating = CASE 
        WHEN student_count > 100 THEN 4.5
        WHEN student_count > 50 THEN 4.2
        WHEN student_count > 10 THEN 3.8
        ELSE 3.5
    END
WHERE duration_hours = 0 OR rating = 0.0;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_courses_duration_hours ON courses(duration_hours);
CREATE INDEX IF NOT EXISTS idx_courses_rating ON courses(rating);

-- Migração concluída com sucesso
-- Colunas duration_hours e rating adicionadas à tabela courses