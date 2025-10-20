-- Criar tabela de estatísticas do usuário
CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  total_study_time INTEGER DEFAULT 0, -- em segundos
  courses_completed INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  achievements_count INTEGER DEFAULT 0,
  social_points INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  likes_received INTEGER DEFAULT 0,
  groups_joined INTEGER DEFAULT 0,
  skill_xp JSONB DEFAULT '{}',
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas suas próprias estatísticas
CREATE POLICY "users_can_view_own_stats" ON user_stats
  FOR SELECT USING (auth.uid() = user_id);

-- Política para usuários atualizarem apenas suas próprias estatísticas
CREATE POLICY "users_can_update_own_stats" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para inserir estatísticas (apenas o próprio usuário)
CREATE POLICY "users_can_insert_own_stats" ON user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para visualização pública (perfis públicos)
CREATE POLICY "public_stats_view" ON user_stats
  FOR SELECT USING (true);

-- Conceder permissões aos roles
GRANT SELECT, INSERT, UPDATE ON user_stats TO authenticated;
GRANT SELECT ON user_stats TO anon;

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_user_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON user_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_updated_at();

-- Função para criar estatísticas iniciais quando um usuário é criado
CREATE OR REPLACE FUNCTION create_initial_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_stats (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar estatísticas iniciais
CREATE TRIGGER create_user_stats_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_initial_user_stats();
