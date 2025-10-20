-- Esquads Academy - Sistema Social
-- Criação de todas as tabelas necessárias para o sistema social

-- Enum para tipos de posts
CREATE TYPE post_type AS ENUM ('discussion', 'achievement', 'question', 'announcement');

-- Enum para tipos de grupos
CREATE TYPE group_type AS ENUM ('study_group', 'course_group', 'general');

-- Enum para status de mensagens
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');

-- Enum para tipos de atividades
CREATE TYPE activity_type AS ENUM ('course_completed', 'badge_earned', 'post_created', 'comment_added', 'group_joined', 'achievement_unlocked');

-- Enum para tipos de notificações
CREATE TYPE notification_type AS ENUM ('like', 'comment', 'message', 'group_invite', 'achievement', 'mention');

-- Tabela de posts/discussões
CREATE TABLE social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    post_type post_type NOT NULL DEFAULT 'discussion',
    tags TEXT[],
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    is_moderated BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de comentários
CREATE TABLE social_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES social_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de curtidas em posts
CREATE TABLE social_post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Tabela de curtidas em comentários
CREATE TABLE social_comment_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES social_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- Tabela de grupos de estudo
CREATE TABLE study_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_type group_type NOT NULL DEFAULT 'study_group',
    max_members INTEGER DEFAULT 10,
    is_private BOOLEAN DEFAULT false,
    invite_code TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de membros dos grupos
CREATE TABLE study_group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- 'admin', 'moderator', 'member'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- Tabela de mensagens dos grupos
CREATE TABLE group_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text', -- 'text', 'image', 'file', 'system'
    attachment_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de mensagens privadas
CREATE TABLE private_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status message_status DEFAULT 'sent',
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de conversas privadas
CREATE TABLE private_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_message_id UUID REFERENCES private_messages(id),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user1_id, user2_id),
    CHECK (user1_id < user2_id) -- Garante ordem consistente
);

-- Tabela de atividades do feed
CREATE TABLE social_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type activity_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB, -- dados específicos da atividade
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de notificações sociais
CREATE TABLE social_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notification_type notification_type NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    related_id UUID, -- ID do post, comentário, etc.
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de seguir usuários
CREATE TABLE user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- Tabela de competições/desafios
CREATE TABLE social_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    max_participants INTEGER,
    prize_description TEXT,
    rules JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de participantes dos desafios
CREATE TABLE challenge_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES social_challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    progress JSONB,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(challenge_id, user_id)
);

-- Tabela de leaderboard social
CREATE TABLE social_leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period TEXT NOT NULL, -- 'weekly', 'monthly', 'all_time'
    social_points INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    likes_received INTEGER DEFAULT 0,
    rank_position INTEGER,
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, period, period_start)
);

-- Índices para performance
CREATE INDEX idx_social_posts_user ON social_posts(user_id);
CREATE INDEX idx_social_posts_course ON social_posts(course_id);
CREATE INDEX idx_social_posts_type ON social_posts(post_type);
CREATE INDEX idx_social_posts_created ON social_posts(created_at DESC);
CREATE INDEX idx_social_comments_post ON social_comments(post_id);
CREATE INDEX idx_social_comments_user ON social_comments(user_id);
CREATE INDEX idx_social_post_likes_post ON social_post_likes(post_id);
CREATE INDEX idx_social_post_likes_user ON social_post_likes(user_id);
CREATE INDEX idx_study_groups_creator ON study_groups(creator_id);
CREATE INDEX idx_study_groups_course ON study_groups(course_id);
CREATE INDEX idx_study_group_members_group ON study_group_members(group_id);
CREATE INDEX idx_study_group_members_user ON study_group_members(user_id);
CREATE INDEX idx_group_messages_group ON group_messages(group_id);
CREATE INDEX idx_group_messages_created ON group_messages(created_at DESC);
CREATE INDEX idx_private_messages_sender ON private_messages(sender_id);
CREATE INDEX idx_private_messages_receiver ON private_messages(receiver_id);
CREATE INDEX idx_private_messages_created ON private_messages(created_at DESC);
CREATE INDEX idx_social_activities_user ON social_activities(user_id);
CREATE INDEX idx_social_activities_created ON social_activities(created_at DESC);
CREATE INDEX idx_social_notifications_user ON social_notifications(user_id);
CREATE INDEX idx_social_notifications_unread ON social_notifications(user_id, is_read);
CREATE INDEX idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON user_follows(following_id);
CREATE INDEX idx_social_challenges_active ON social_challenges(is_active, start_date, end_date);
CREATE INDEX idx_challenge_participants_challenge ON challenge_participants(challenge_id);
CREATE INDEX idx_challenge_participants_user ON challenge_participants(user_id);
CREATE INDEX idx_social_leaderboard_period ON social_leaderboard(period, period_start);
CREATE INDEX idx_social_leaderboard_rank ON social_leaderboard(period, rank_position);

-- Triggers para atualizar contadores
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE social_posts 
        SET comments_count = comments_count + 1 
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE social_posts 
        SET comments_count = comments_count - 1 
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_comments_count
    AFTER INSERT OR DELETE ON social_comments
    FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE social_posts 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE social_posts 
        SET likes_count = likes_count - 1 
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_likes_count
    AFTER INSERT OR DELETE ON social_post_likes
    FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE social_comments 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.comment_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE social_comments 
        SET likes_count = likes_count - 1 
        WHERE id = OLD.comment_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comment_likes_count
    AFTER INSERT OR DELETE ON social_comment_likes
    FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count();

-- Função para gerar código de convite único
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar código de convite automaticamente
CREATE OR REPLACE FUNCTION set_invite_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invite_code IS NULL THEN
        NEW.invite_code := generate_invite_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_invite_code
    BEFORE INSERT ON study_groups
    FOR EACH ROW EXECUTE FUNCTION set_invite_code();
