-- Políticas RLS para tabelas sociais

-- Política para social_posts (permitir leitura para todos os usuários autenticados)
CREATE POLICY "social_posts_select_policy" ON social_posts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "social_posts_insert_policy" ON social_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "social_posts_update_policy" ON social_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "social_posts_delete_policy" ON social_posts
  FOR DELETE USING (auth.uid() = user_id);

-- Política para social_post_likes
CREATE POLICY "social_post_likes_select_policy" ON social_post_likes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "social_post_likes_insert_policy" ON social_post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "social_post_likes_delete_policy" ON social_post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Política para social_comments
CREATE POLICY "social_comments_select_policy" ON social_comments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "social_comments_insert_policy" ON social_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "social_comments_update_policy" ON social_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "social_comments_delete_policy" ON social_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Política para social_activities
CREATE POLICY "social_activities_select_policy" ON social_activities
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "social_activities_insert_policy" ON social_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "social_activities_update_policy" ON social_activities
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "social_activities_delete_policy" ON social_activities
  FOR DELETE USING (auth.uid() = user_id);
