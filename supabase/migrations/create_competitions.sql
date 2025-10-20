-- Criar enum para tipos de competição
CREATE TYPE competition_type AS ENUM ('weekly', 'monthly', 'tournament', 'group_challenge');

-- Criar enum para status de competição
CREATE TYPE competition_status AS ENUM ('upcoming', 'active', 'completed', 'cancelled');

-- Criar tabela de competições
CREATE TABLE competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type competition_type NOT NULL DEFAULT 'weekly',
  status competition_status NOT NULL DEFAULT 'upcoming',
  max_participants INTEGER,
  entry_fee INTEGER DEFAULT 0,
  prize_pool INTEGER DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  rules JSONB,
  requirements JSONB,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;

-- Políticas para competições
CREATE POLICY "public_competitions_view" ON competitions
  FOR SELECT USING (true);

CREATE POLICY "authenticated_users_can_create_competitions" ON competitions
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "creators_can_update_competitions" ON competitions
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "creators_can_delete_competitions" ON competitions
  FOR DELETE USING (auth.uid() = created_by);

-- Conceder permissões
GRANT SELECT ON competitions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON competitions TO authenticated;

-- Criar tabela de participações em competições
CREATE TABLE competition_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_name TEXT,
  score INTEGER DEFAULT 0,
  rank INTEGER,
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'active', 'completed', 'disqualified')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(competition_id, user_id)
);

-- Habilitar RLS para participações
ALTER TABLE competition_participants ENABLE ROW LEVEL SECURITY;

-- Políticas para participações
CREATE POLICY "public_competition_participants_view" ON competition_participants
  FOR SELECT USING (true);

CREATE POLICY "users_can_join_competitions" ON competition_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_participation" ON competition_participants
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_can_leave_competitions" ON competition_participants
  FOR DELETE USING (auth.uid() = user_id);

-- Conceder permissões para participações
GRANT SELECT ON competition_participants TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON competition_participants TO authenticated;

-- Criar tabela de desafios em grupo
CREATE TABLE group_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('quiz', 'project', 'study_time', 'course_completion', 'custom')),
  target_value INTEGER,
  target_unit TEXT, -- 'hours', 'points', 'courses', 'questions', etc.
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  reward_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para desafios em grupo
ALTER TABLE group_challenges ENABLE ROW LEVEL SECURITY;

-- Políticas para desafios em grupo
CREATE POLICY "group_members_can_view_challenges" ON group_challenges
  FOR SELECT USING (
    group_id IS NULL OR 
    EXISTS (
      SELECT 1 FROM study_group_members 
      WHERE group_id = group_challenges.group_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "group_members_can_create_challenges" ON group_challenges
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    (group_id IS NULL OR 
     EXISTS (
       SELECT 1 FROM study_group_members 
       WHERE group_id = group_challenges.group_id 
       AND user_id = auth.uid()
     ))
  );

CREATE POLICY "creators_can_update_group_challenges" ON group_challenges
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "creators_can_delete_group_challenges" ON group_challenges
  FOR DELETE USING (auth.uid() = created_by);

-- Conceder permissões para desafios em grupo
GRANT SELECT, INSERT, UPDATE, DELETE ON group_challenges TO authenticated;

-- Criar tabela de progresso em desafios
CREATE TABLE challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES group_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_value INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  evidence_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

-- Habilitar RLS para progresso
ALTER TABLE challenge_progress ENABLE ROW LEVEL SECURITY;

-- Políticas para progresso
CREATE POLICY "users_can_view_challenge_progress" ON challenge_progress
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM group_challenges gc
      JOIN study_group_members sgm ON gc.group_id = sgm.group_id
      WHERE gc.id = challenge_progress.challenge_id
      AND sgm.user_id = auth.uid()
    )
  );

CREATE POLICY "users_can_update_own_progress" ON challenge_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_modify_own_progress" ON challenge_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Conceder permissões para progresso
GRANT SELECT, INSERT, UPDATE ON challenge_progress TO authenticated;

-- Criar tabela de torneios
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  tournament_type TEXT NOT NULL CHECK (tournament_type IN ('single_elimination', 'double_elimination', 'round_robin', 'swiss')),
  max_participants INTEGER NOT NULL,
  entry_fee INTEGER DEFAULT 0,
  prize_distribution JSONB, -- {"1st": 1000, "2nd": 500, "3rd": 250}
  bracket JSONB, -- Estrutura do bracket
  current_round INTEGER DEFAULT 1,
  total_rounds INTEGER,
  status competition_status NOT NULL DEFAULT 'upcoming',
  registration_start TIMESTAMP WITH TIME ZONE NOT NULL,
  registration_end TIMESTAMP WITH TIME ZONE NOT NULL,
  tournament_start TIMESTAMP WITH TIME ZONE NOT NULL,
  tournament_end TIMESTAMP WITH TIME ZONE,
  rules JSONB,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para torneios
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- Políticas para torneios
CREATE POLICY "public_tournaments_view" ON tournaments
  FOR SELECT USING (true);

CREATE POLICY "authenticated_users_can_create_tournaments" ON tournaments
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "creators_can_update_tournaments" ON tournaments
  FOR UPDATE USING (auth.uid() = created_by);

-- Conceder permissões para torneios
GRANT SELECT ON tournaments TO anon;
GRANT SELECT, INSERT, UPDATE ON tournaments TO authenticated;

-- Criar tabela de participações em torneios
CREATE TABLE tournament_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seed INTEGER, -- Posição no bracket
  current_round INTEGER DEFAULT 1,
  eliminated BOOLEAN DEFAULT false,
  final_position INTEGER,
  prize_won INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tournament_id, user_id)
);

-- Habilitar RLS para participações em torneios
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;

-- Políticas para participações em torneios
CREATE POLICY "public_tournament_participants_view" ON tournament_participants
  FOR SELECT USING (true);

CREATE POLICY "users_can_join_tournaments" ON tournament_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Conceder permissões
GRANT SELECT ON tournament_participants TO anon;
GRANT SELECT, INSERT ON tournament_participants TO authenticated;

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_competitions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_competitions_updated_at
  BEFORE UPDATE ON competitions
  FOR EACH ROW
  EXECUTE FUNCTION update_competitions_updated_at();

CREATE TRIGGER update_group_challenges_updated_at
  BEFORE UPDATE ON group_challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_competitions_updated_at();

CREATE TRIGGER update_challenge_progress_updated_at
  BEFORE UPDATE ON challenge_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_competitions_updated_at();

CREATE TRIGGER update_tournaments_updated_at
  BEFORE UPDATE ON tournaments
  FOR EACH ROW
  EXECUTE FUNCTION update_competitions_updated_at();
