-- Adicionar coluna is_published na tabela courses
-- Executado em: 2024-12-15

-- Adicionar coluna is_published se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'courses' AND column_name = 'is_published') THEN
        ALTER TABLE courses ADD COLUMN is_published BOOLEAN DEFAULT true;
        CREATE INDEX IF NOT EXISTS idx_courses_is_published ON courses(is_published);
        UPDATE courses SET is_published = true WHERE is_published IS NULL;
        COMMENT ON COLUMN courses.is_published IS 'Indica se o curso está publicado e visível';
    END IF;
END $$;

-- Verificar se a coluna foi criada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'courses' AND column_name = 'is_published';