-- ==============================================================
-- MIGRAÇÃO: Correção de Tabelas Sociais e Políticas RLS
-- Data: 2025-10-17
-- Descrição: Corrige estrutura e permissões das tabelas sociais
-- ==============================================================

-- 1. Garantir que a tabela social_post_likes existe
CREATE TABLE IF NOT EXISTS social_post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(post_id, user_id)
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_social_post_likes_post_id ON social_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_social_post_likes_user_id ON social_post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_social_post_likes_created_at ON social_post_likes(created_at DESC);

-- 3. Habilitar RLS
ALTER TABLE social_post_likes ENABLE ROW LEVEL SECURITY;

-- 4. Remover políticas antigas
DROP POLICY IF EXISTS "social_post_likes_select_policy" ON social_post_likes;
DROP POLICY IF EXISTS "social_post_likes_insert_policy" ON social_post_likes;
DROP POLICY IF EXISTS "social_post_likes_delete_policy" ON social_post_likes;
DROP POLICY IF EXISTS "Users can view all likes" ON social_post_likes;
DROP POLICY IF EXISTS "Users can like posts" ON social_post_likes;
DROP POLICY IF EXISTS "Users can unlike their own likes" ON social_post_likes;

-- 5. Criar políticas RLS corretas
-- Permitir que todos vejam todos os likes
CREATE POLICY "social_post_likes_select_policy" 
  ON social_post_likes 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Permitir que usuários curtam posts
CREATE POLICY "social_post_likes_insert_policy" 
  ON social_post_likes 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Permitir que usuários removam seus próprios likes
CREATE POLICY "social_post_likes_delete_policy" 
  ON social_post_likes 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- 6. Garantir que a tabela social_likes existe (alternativa)
CREATE TABLE IF NOT EXISTS social_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(post_id, user_id)
);

-- 7. Criar índices
CREATE INDEX IF NOT EXISTS idx_social_likes_post_id ON social_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_social_likes_user_id ON social_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_social_likes_created_at ON social_likes(created_at DESC);

-- 8. Habilitar RLS para social_likes
ALTER TABLE social_likes ENABLE ROW LEVEL SECURITY;

-- 9. Remover políticas antigas de social_likes
DROP POLICY IF EXISTS "social_likes_select_policy" ON social_likes;
DROP POLICY IF EXISTS "social_likes_insert_policy" ON social_likes;
DROP POLICY IF EXISTS "social_likes_delete_policy" ON social_likes;

-- 10. Criar políticas RLS para social_likes
CREATE POLICY "social_likes_select_policy" 
  ON social_likes 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "social_likes_insert_policy" 
  ON social_likes 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "social_likes_delete_policy" 
  ON social_likes 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- 11. Garantir que a tabela social_comments existe
CREATE TABLE IF NOT EXISTS social_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES social_comments(id) ON DELETE CASCADE,
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. Criar índices
CREATE INDEX IF NOT EXISTS idx_social_comments_post_id ON social_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_user_id ON social_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_parent_id ON social_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_created_at ON social_comments(created_at DESC);

-- 13. Habilitar RLS para social_comments
ALTER TABLE social_comments ENABLE ROW LEVEL SECURITY;

-- 14. Remover políticas antigas
DROP POLICY IF EXISTS "social_comments_select_policy" ON social_comments;
DROP POLICY IF EXISTS "social_comments_insert_policy" ON social_comments;
DROP POLICY IF EXISTS "social_comments_update_policy" ON social_comments;
DROP POLICY IF EXISTS "social_comments_delete_policy" ON social_comments;

-- 15. Criar políticas RLS para social_comments
CREATE POLICY "social_comments_select_policy" 
  ON social_comments 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "social_comments_insert_policy" 
  ON social_comments 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "social_comments_update_policy" 
  ON social_comments 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "social_comments_delete_policy" 
  ON social_comments 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- 16. Atualizar timestamp em social_comments
CREATE OR REPLACE FUNCTION update_social_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_social_comments_updated_at ON social_comments;
CREATE TRIGGER update_social_comments_updated_at
  BEFORE UPDATE ON social_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_social_comments_updated_at();

