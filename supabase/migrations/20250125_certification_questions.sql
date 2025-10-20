-- Migration: Sistema de Banco de Questões de Certificação
-- Data: 2025-01-25
-- Descrição: Criar tabela para banco de questões de certificação com workflow de aprovação

-- Criar tabela de questões de certificação
CREATE TABLE certification_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certification TEXT NOT NULL CHECK (certification IN ('AWS', 'Azure', 'CompTIA', 'Oracle', 'Cisco', 'ISC2', 'EC-Council', 'ISACA')),
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- Array de opções com {id, text, is_correct}
  correct_answer_id TEXT NOT NULL,
  explanation TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'archived')),
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0.0,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  approved_by UUID REFERENCES auth.users(id),
  approval_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX idx_certification_questions_certification ON certification_questions(certification);
CREATE INDEX idx_certification_questions_topic ON certification_questions(topic);
CREATE INDEX idx_certification_questions_difficulty ON certification_questions(difficulty);
CREATE INDEX idx_certification_questions_status ON certification_questions(status);
CREATE INDEX idx_certification_questions_created_by ON certification_questions(created_by);

-- Criar tabela de histórico de interações com Agente Blue
CREATE TABLE mission_ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  mission_id UUID REFERENCES missions(id) NOT NULL,
  hint_level INTEGER CHECK (hint_level BETWEEN 1 AND 3),
  user_input TEXT,
  ai_response TEXT,
  was_helpful BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX idx_mission_ai_interactions_user_id ON mission_ai_interactions(user_id);
CREATE INDEX idx_mission_ai_interactions_mission_id ON mission_ai_interactions(mission_id);

-- Criar tabela de compartilhamentos sociais
CREATE TABLE social_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  share_type TEXT CHECK (share_type IN ('badge', 'certificate', 'achievement', 'level_up', 'simulation_score')),
  content_id UUID NOT NULL,
  platform TEXT CHECK (platform IN ('twitter', 'linkedin', 'facebook', 'whatsapp', 'internal')),
  metadata JSONB, -- Dados específicos do compartilhamento
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX idx_social_shares_user_id ON social_shares(user_id);
CREATE INDEX idx_social_shares_share_type ON social_shares(share_type);
CREATE INDEX idx_social_shares_content_id ON social_shares(content_id);

-- Adicionar colunas à tabela missions para suporte a tipos e aprovação
ALTER TABLE missions ADD COLUMN IF NOT EXISTS mission_type TEXT CHECK (mission_type IN ('terminal', 'web_interface', 'chat_textual'));
ALTER TABLE missions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'published'));
ALTER TABLE missions ADD COLUMN IF NOT EXISTS ai_prompt TEXT;
ALTER TABLE missions ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);
ALTER TABLE missions ADD COLUMN IF NOT EXISTS approval_notes TEXT;

-- Adicionar colunas à tabela certificates para tipos expandidos
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS certificate_type TEXT CHECK (certificate_type IN ('course', 'simulation', 'mission_track'));
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS badge_id UUID REFERENCES badge_definitions(id);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS is_shareable BOOLEAN DEFAULT TRUE;

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger para updated_at
CREATE TRIGGER update_certification_questions_updated_at 
    BEFORE UPDATE ON certification_questions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies para certification_questions
ALTER TABLE certification_questions ENABLE ROW LEVEL SECURITY;

-- Admins podem fazer tudo
CREATE POLICY "Admins can manage all questions" ON certification_questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Usuários podem ver apenas questões aprovadas
CREATE POLICY "Users can view approved questions" ON certification_questions
    FOR SELECT USING (status = 'approved');

-- Criadores podem ver suas próprias questões
CREATE POLICY "Creators can view their own questions" ON certification_questions
    FOR SELECT USING (created_by = auth.uid());

-- RLS Policies para mission_ai_interactions
ALTER TABLE mission_ai_interactions ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas suas próprias interações
CREATE POLICY "Users can view their own interactions" ON mission_ai_interactions
    FOR ALL USING (user_id = auth.uid());

-- RLS Policies para social_shares
ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas seus próprios compartilhamentos
CREATE POLICY "Users can view their own shares" ON social_shares
    FOR ALL USING (user_id = auth.uid());

-- Compartilhamentos podem ser visualizados publicamente (para verificação)
CREATE POLICY "Public can view shares" ON social_shares
    FOR SELECT USING (true);

-- Comentários sobre a migration
COMMENT ON TABLE certification_questions IS 'Banco de questões para simulados de certificação empresarial';
COMMENT ON TABLE mission_ai_interactions IS 'Histórico de interações com Agente Blue durante missões';
COMMENT ON TABLE social_shares IS 'Compartilhamentos sociais de conquistas e certificados';

COMMENT ON COLUMN certification_questions.certification IS 'Provedor da certificação (AWS, Azure, CompTIA, etc.)';
COMMENT ON COLUMN certification_questions.topic IS 'Tópico específico da questão (ex: IAM, Networking, Security)';
COMMENT ON COLUMN certification_questions.options IS 'Array JSON com opções de resposta';
COMMENT ON COLUMN certification_questions.success_rate IS 'Taxa de sucesso em % (0.00 a 100.00)';
COMMENT ON COLUMN certification_questions.status IS 'Status no workflow de aprovação';
