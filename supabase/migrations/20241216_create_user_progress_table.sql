-- Criar tabela user_progress que está faltando
-- Esta tabela é necessária para rastrear o progresso dos usuários nos cursos

CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID DEFAULT extensions.gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.module_lessons(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent INTEGER DEFAULT 0, -- em segundos
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices únicos para evitar duplicatas
    UNIQUE(user_id, course_id),
    UNIQUE(user_id, lesson_id),
    UNIQUE(user_id, module_id)
);

-- Comentários para documentação
COMMENT ON TABLE public.user_progress IS 'Rastreia o progresso dos usuários em cursos, módulos e lições';
COMMENT ON COLUMN public.user_progress.progress_percentage IS 'Percentual de conclusão (0-100)';
COMMENT ON COLUMN public.user_progress.time_spent IS 'Tempo gasto em segundos';

-- Habilitar RLS
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_progress
CREATE POLICY "user_progress_select" ON public.user_progress
    FOR SELECT
    USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

CREATE POLICY "user_progress_insert" ON public.user_progress
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

CREATE POLICY "user_progress_update" ON public.user_progress
    FOR UPDATE
    USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    )
    WITH CHECK (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_course_id ON public.user_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON public.user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_module_id ON public.user_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_last_accessed ON public.user_progress(last_accessed_at);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_user_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_progress_updated_at
    BEFORE UPDATE ON public.user_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_user_progress_updated_at();

-- Verificação final
DO $$
BEGIN
    RAISE NOTICE '✅ Tabela user_progress criada com sucesso';
    RAISE NOTICE '✅ Políticas RLS configuradas';
    RAISE NOTICE '✅ Índices criados para performance';
    RAISE NOTICE '✅ Trigger de updated_at configurado';
END $$;
