-- Esquads Academy - Políticas RLS para Sistema Social

-- Habilitar RLS em todas as tabelas sociais
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_leaderboard ENABLE ROW LEVEL SECURITY;

-- Políticas para social_posts
CREATE POLICY "Posts são visíveis para usuários autenticados" ON social_posts
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários podem criar posts" ON social_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem editar seus próprios posts" ON social_posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios posts" ON social_posts
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para social_comments
CREATE POLICY "Comentários são visíveis para usuários autenticados" ON social_comments
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários podem criar comentários" ON social_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem editar seus próprios comentários" ON social_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios comentários" ON social_comments
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para social_post_likes
CREATE POLICY "Curtidas em posts são visíveis para usuários autenticados" ON social_post_likes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários podem curtir posts" ON social_post_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem remover suas curtidas" ON social_post_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para social_comment_likes
CREATE POLICY "Curtidas em comentários são visíveis para usuários autenticados" ON social_comment_likes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários podem curtir comentários" ON social_comment_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem remover curtidas de comentários" ON social_comment_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para study_groups
CREATE POLICY "Grupos públicos são visíveis para usuários autenticados" ON study_groups
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        (is_private = false OR creator_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM study_group_members WHERE group_id = id AND user_id = auth.uid()))
    );

CREATE POLICY "Usuários podem criar grupos" ON study_groups
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Criadores podem editar seus grupos" ON study_groups
    FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Criadores podem deletar seus grupos" ON study_groups
    FOR DELETE USING (auth.uid() = creator_id);

-- Políticas para study_group_members
CREATE POLICY "Membros de grupos são visíveis para membros do grupo" ON study_group_members
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        EXISTS (SELECT 1 FROM study_group_members sgm WHERE sgm.group_id = group_id AND sgm.user_id = auth.uid())
    );

CREATE POLICY "Usuários podem se juntar a grupos" ON study_group_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem sair de grupos" ON study_group_members
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para group_messages
CREATE POLICY "Mensagens são visíveis para membros do grupo" ON group_messages
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        EXISTS (SELECT 1 FROM study_group_members WHERE group_id = group_messages.group_id AND user_id = auth.uid())
    );

CREATE POLICY "Membros podem enviar mensagens" ON group_messages
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (SELECT 1 FROM study_group_members WHERE group_id = group_messages.group_id AND user_id = auth.uid())
    );

-- Políticas para private_messages
CREATE POLICY "Usuários podem ver suas mensagens privadas" ON private_messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Usuários podem enviar mensagens privadas" ON private_messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Políticas para private_conversations
CREATE POLICY "Usuários podem ver suas conversas" ON private_conversations
    FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Usuários podem criar conversas" ON private_conversations
    FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Políticas para social_activities
CREATE POLICY "Atividades públicas são visíveis para usuários autenticados" ON social_activities
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        (is_public = true OR user_id = auth.uid())
    );

CREATE POLICY "Sistema pode criar atividades" ON social_activities
    FOR INSERT WITH CHECK (true); -- Permitir inserção pelo sistema

-- Políticas para social_notifications
CREATE POLICY "Usuários podem ver suas notificações" ON social_notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode criar notificações" ON social_notifications
    FOR INSERT WITH CHECK (true); -- Permitir inserção pelo sistema

CREATE POLICY "Usuários podem marcar notificações como lidas" ON social_notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para user_follows
CREATE POLICY "Seguidores são visíveis para usuários autenticados" ON user_follows
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários podem seguir outros" ON user_follows
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Usuários podem parar de seguir" ON user_follows
    FOR DELETE USING (auth.uid() = follower_id);

-- Políticas para social_challenges
CREATE POLICY "Desafios ativos são visíveis para usuários autenticados" ON social_challenges
    FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "Usuários podem criar desafios" ON social_challenges
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Criadores podem editar seus desafios" ON social_challenges
    FOR UPDATE USING (auth.uid() = creator_id);

-- Políticas para challenge_participants
CREATE POLICY "Participantes são visíveis para usuários autenticados" ON challenge_participants
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários podem se inscrever em desafios" ON challenge_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu progresso" ON challenge_participants
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para social_leaderboard
CREATE POLICY "Leaderboard é visível para usuários autenticados" ON social_leaderboard
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Sistema pode atualizar leaderboard" ON social_leaderboard
    FOR ALL USING (true); -- Permitir operações pelo sistema

-- Conceder permissões básicas para roles
GRANT SELECT ON social_posts TO authenticated;
GRANT INSERT, UPDATE, DELETE ON social_posts TO authenticated;

GRANT SELECT ON social_comments TO authenticated;
GRANT INSERT, UPDATE, DELETE ON social_comments TO authenticated;

GRANT SELECT ON social_post_likes TO authenticated;
GRANT INSERT, DELETE ON social_post_likes TO authenticated;

GRANT SELECT ON social_comment_likes TO authenticated;
GRANT INSERT, DELETE ON social_comment_likes TO authenticated;

GRANT SELECT ON study_groups TO authenticated;
GRANT INSERT, UPDATE, DELETE ON study_groups TO authenticated;

GRANT SELECT ON study_group_members TO authenticated;
GRANT INSERT, DELETE ON study_group_members TO authenticated;

GRANT SELECT ON group_messages TO authenticated;
GRANT INSERT ON group_messages TO authenticated;

GRANT SELECT ON private_messages TO authenticated;
GRANT INSERT ON private_messages TO authenticated;

GRANT SELECT ON private_conversations TO authenticated;
GRANT INSERT ON private_conversations TO authenticated;

GRANT SELECT ON social_activities TO authenticated;
GRANT INSERT ON social_activities TO authenticated;

GRANT SELECT ON social_notifications TO authenticated;
GRANT UPDATE ON social_notifications TO authenticated;

GRANT SELECT ON user_follows TO authenticated;
GRANT INSERT, DELETE ON user_follows TO authenticated;

GRANT SELECT ON social_challenges TO authenticated;
GRANT INSERT, UPDATE ON social_challenges TO authenticated;

GRANT SELECT ON challenge_participants TO authenticated;
GRANT INSERT, UPDATE ON challenge_participants TO authenticated;

GRANT SELECT ON social_leaderboard TO authenticated;
