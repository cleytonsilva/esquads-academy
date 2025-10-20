-- Criar tabela para posts de conquistas compartilhadas
CREATE TABLE achievement_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'private')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id) -- Um usuário pode compartilhar cada conquista apenas uma vez
);

-- Habilitar RLS
ALTER TABLE achievement_posts ENABLE ROW LEVEL SECURITY;

-- Política para visualização pública
CREATE POLICY "public_achievement_posts_view" ON achievement_posts
  FOR SELECT USING (visibility = 'public');

-- Política para usuários verem seus próprios posts
CREATE POLICY "users_can_view_own_achievement_posts" ON achievement_posts
  FOR SELECT USING (auth.uid() = user_id);

-- Política para usuários criarem posts
CREATE POLICY "users_can_create_achievement_posts" ON achievement_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para usuários atualizarem seus próprios posts
CREATE POLICY "users_can_update_own_achievement_posts" ON achievement_posts
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para usuários deletarem seus próprios posts
CREATE POLICY "users_can_delete_own_achievement_posts" ON achievement_posts
  FOR DELETE USING (auth.uid() = user_id);

-- Conceder permissões
GRANT SELECT, INSERT, UPDATE, DELETE ON achievement_posts TO authenticated;
GRANT SELECT ON achievement_posts TO anon;

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_achievement_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_achievement_posts_updated_at
  BEFORE UPDATE ON achievement_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_achievement_posts_updated_at();

-- Criar tabela para curtidas em posts de conquistas
CREATE TABLE achievement_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES achievement_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Habilitar RLS para curtidas
ALTER TABLE achievement_post_likes ENABLE ROW LEVEL SECURITY;

-- Políticas para curtidas
CREATE POLICY "public_achievement_post_likes_view" ON achievement_post_likes
  FOR SELECT USING (true);

CREATE POLICY "users_can_like_achievement_posts" ON achievement_post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_unlike_achievement_posts" ON achievement_post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Conceder permissões para curtidas
GRANT SELECT, INSERT, DELETE ON achievement_post_likes TO authenticated;
GRANT SELECT ON achievement_post_likes TO anon;

-- Função para atualizar contador de curtidas
CREATE OR REPLACE FUNCTION update_achievement_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE achievement_posts 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE achievement_posts 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar contador de curtidas
CREATE TRIGGER achievement_post_like_count_trigger
  AFTER INSERT OR DELETE ON achievement_post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_achievement_post_likes_count();

-- Criar tabela para comentários em posts de conquistas
CREATE TABLE achievement_post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES achievement_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para comentários
ALTER TABLE achievement_post_comments ENABLE ROW LEVEL SECURITY;

-- Políticas para comentários
CREATE POLICY "public_achievement_post_comments_view" ON achievement_post_comments
  FOR SELECT USING (true);

CREATE POLICY "users_can_comment_achievement_posts" ON achievement_post_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_achievement_comments" ON achievement_post_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_can_delete_own_achievement_comments" ON achievement_post_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Conceder permissões para comentários
GRANT SELECT, INSERT, UPDATE, DELETE ON achievement_post_comments TO authenticated;
GRANT SELECT ON achievement_post_comments TO anon;

-- Função para atualizar contador de comentários
CREATE OR REPLACE FUNCTION update_achievement_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE achievement_posts 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE achievement_posts 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar contador de comentários
CREATE TRIGGER achievement_post_comment_count_trigger
  AFTER INSERT OR DELETE ON achievement_post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_achievement_post_comments_count();
