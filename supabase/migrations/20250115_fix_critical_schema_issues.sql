-- Adicionar coluna status na tabela social_challenges
ALTER TABLE social_challenges 
ADD COLUMN status text DEFAULT 'active' 
CHECK (status IN ('active', 'completed', 'cancelled', 'draft'));

-- Corrigir relacionamento achievement_posts para user_profiles
-- Primeiro, remover a constraint existente
ALTER TABLE achievement_posts 
DROP CONSTRAINT IF EXISTS achievement_posts_user_id_fkey;

-- Adicionar nova constraint para user_profiles
ALTER TABLE achievement_posts 
ADD CONSTRAINT achievement_posts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(user_id);

-- Atualizar comentário para documentar a mudança
COMMENT ON COLUMN achievement_posts.user_id IS 'References user_profiles.user_id instead of auth.users.id';
