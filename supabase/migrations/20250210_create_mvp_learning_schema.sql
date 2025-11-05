BEGIN;

-- Garantir que os novos papéis estejam disponíveis no enum user_role
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'user_role' AND e.enumlabel = 'editor'
    ) THEN
        ALTER TYPE user_role ADD VALUE 'editor';
    END IF;
END;
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'user_role' AND e.enumlabel = 'aluno'
    ) THEN
        ALTER TYPE user_role ADD VALUE 'aluno';
    END IF;
END;
$$;

-- =====================================================================
-- Tabela: trilhas
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.trilhas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT,
    carreira_alvo TEXT,
    nivel TEXT CHECK (nivel IN ('iniciante', 'intermediario', 'avancado')) DEFAULT 'iniciante',
    tags TEXT[] DEFAULT '{}'::TEXT[],
    capa_url TEXT,
    criado_por UUID REFERENCES public.users(id) ON DELETE SET NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trilhas_ativo ON public.trilhas (ativo);
CREATE INDEX IF NOT EXISTS idx_trilhas_nivel ON public.trilhas (nivel);

ALTER TABLE public.trilhas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS trilhas_select_public ON public.trilhas;
CREATE POLICY trilhas_select_public ON public.trilhas
    FOR SELECT
    USING (
        ativo = true
        OR EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'editor', 'mission_architect')
        )
    );

DROP POLICY IF EXISTS trilhas_admin_manage ON public.trilhas;
CREATE POLICY trilhas_admin_manage ON public.trilhas
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'editor', 'mission_architect')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'editor', 'mission_architect')
        )
    );

DROP TRIGGER IF EXISTS update_trilhas_updated_at ON public.trilhas;
CREATE TRIGGER update_trilhas_updated_at
    BEFORE UPDATE ON public.trilhas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- Tabela: missoes
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.missoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trilha_id UUID REFERENCES public.trilhas(id) ON DELETE SET NULL,
    titulo TEXT NOT NULL,
    contexto TEXT,
    tipo TEXT CHECK (tipo IN ('terminal', 'firewall', 'quiz', 'cloud', 'laboratorio', 'desafio')) NOT NULL,
    xp INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    ordem INTEGER,
    criado_por UUID REFERENCES public.users(id) ON DELETE SET NULL,
    publicado_em TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_missoes_trilha ON public.missoes (trilha_id);
CREATE INDEX IF NOT EXISTS idx_missoes_tipo ON public.missoes (tipo);
CREATE INDEX IF NOT EXISTS idx_missoes_ativo ON public.missoes (ativo);

ALTER TABLE public.missoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS missoes_select_public ON public.missoes;
CREATE POLICY missoes_select_public ON public.missoes
    FOR SELECT
    USING (
        ativo = true
        OR EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'editor', 'mission_architect')
        )
    );

DROP POLICY IF EXISTS missoes_manage_admin ON public.missoes;
CREATE POLICY missoes_manage_admin ON public.missoes
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'editor', 'mission_architect')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'editor', 'mission_architect')
        )
    );

DROP TRIGGER IF EXISTS update_missoes_updated_at ON public.missoes;
CREATE TRIGGER update_missoes_updated_at
    BEFORE UPDATE ON public.missoes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- Tabela: perguntas
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.perguntas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    missao_id UUID REFERENCES public.missoes(id) ON DELETE CASCADE,
    trilha_id UUID REFERENCES public.trilhas(id) ON DELETE SET NULL,
    tipo TEXT CHECK (tipo IN ('alternativa', 'aberta', 'desafio_pratico', 'simulado', 'dissertativa')) NOT NULL,
    questao TEXT NOT NULL,
    resposta_correta TEXT,
    explicacao_ia TEXT,
    metadados JSONB DEFAULT '{}'::JSONB,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_perguntas_missao ON public.perguntas (missao_id);
CREATE INDEX IF NOT EXISTS idx_perguntas_trilha ON public.perguntas (trilha_id);
CREATE INDEX IF NOT EXISTS idx_perguntas_tipo ON public.perguntas (tipo);

ALTER TABLE public.perguntas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS perguntas_select_public ON public.perguntas;
CREATE POLICY perguntas_select_public ON public.perguntas
    FOR SELECT
    USING (
        ativo = true
        OR EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'editor', 'mission_architect')
        )
    );

DROP POLICY IF EXISTS perguntas_manage_admin ON public.perguntas;
CREATE POLICY perguntas_manage_admin ON public.perguntas
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'editor', 'mission_architect')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'editor', 'mission_architect')
        )
    );

DROP TRIGGER IF EXISTS update_perguntas_updated_at ON public.perguntas;
CREATE TRIGGER update_perguntas_updated_at
    BEFORE UPDATE ON public.perguntas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- Ajustes na tabela badges
-- =====================================================================
ALTER TABLE public.badges
    ADD COLUMN IF NOT EXISTS criterio JSONB DEFAULT '{}'::JSONB;

-- =====================================================================
-- Tabela: relatorios
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.relatorios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    missao_id UUID REFERENCES public.missoes(id) ON DELETE SET NULL,
    resultado_json JSONB DEFAULT '{}'::JSONB,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_relatorios_usuario ON public.relatorios (usuario_id);
CREATE INDEX IF NOT EXISTS idx_relatorios_missao ON public.relatorios (missao_id);

ALTER TABLE public.relatorios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS relatorios_select_own ON public.relatorios;
CREATE POLICY relatorios_select_own ON public.relatorios
    FOR SELECT
    USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS relatorios_modify_admin ON public.relatorios;
CREATE POLICY relatorios_modify_admin ON public.relatorios
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );

-- =====================================================================
-- Tabela: progresso
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.progresso (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    trilha_id UUID NOT NULL REFERENCES public.trilhas(id) ON DELETE CASCADE,
    xp_total INTEGER DEFAULT 0,
    nivel INTEGER DEFAULT 1,
    badges_conquistadas UUID[] DEFAULT '{}'::UUID[],
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (usuario_id, trilha_id)
);

CREATE INDEX IF NOT EXISTS idx_progresso_usuario ON public.progresso (usuario_id);
CREATE INDEX IF NOT EXISTS idx_progresso_trilha ON public.progresso (trilha_id);

ALTER TABLE public.progresso ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS progresso_select_own ON public.progresso;
CREATE POLICY progresso_select_own ON public.progresso
    FOR SELECT
    USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS progresso_modify_own ON public.progresso;
CREATE POLICY progresso_modify_own ON public.progresso
    FOR ALL
    USING (auth.uid() = usuario_id)
    WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS progresso_admin_manage ON public.progresso;
CREATE POLICY progresso_admin_manage ON public.progresso
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'editor', 'mission_architect')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'editor', 'mission_architect')
        )
    );

DROP TRIGGER IF EXISTS update_progresso_updated_at ON public.progresso;
CREATE TRIGGER update_progresso_updated_at
    BEFORE UPDATE ON public.progresso
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- Tabela: ranking
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.ranking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trilha_id UUID NOT NULL REFERENCES public.trilhas(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    xp INTEGER DEFAULT 0,
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ranking_unique ON public.ranking (trilha_id, usuario_id);

ALTER TABLE public.ranking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ranking_select_public ON public.ranking;
CREATE POLICY ranking_select_public ON public.ranking
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS ranking_manage_admin ON public.ranking;
CREATE POLICY ranking_manage_admin ON public.ranking
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'editor', 'mission_architect')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'editor', 'mission_architect')
        )
    );

-- =====================================================================
-- Tabela: media
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_user ON public.media (user_id);

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS media_select_owner ON public.media;
CREATE POLICY media_select_owner ON public.media
    FOR SELECT
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );

DROP POLICY IF EXISTS media_manage_owner ON public.media;
CREATE POLICY media_manage_owner ON public.media
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS media_manage_admin ON public.media;
CREATE POLICY media_manage_admin ON public.media
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );

-- =====================================================================
-- Tabela: settings
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_name TEXT,
    logo_url TEXT,
    theme JSONB DEFAULT '{}'::JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS settings_admin_manage ON public.settings;
CREATE POLICY settings_admin_manage ON public.settings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role = 'admin'
        )
    );

DROP POLICY IF EXISTS settings_admin_read ON public.settings;
CREATE POLICY settings_admin_read ON public.settings
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'editor')
        )
    );

DROP TRIGGER IF EXISTS update_settings_updated_at ON public.settings;
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
