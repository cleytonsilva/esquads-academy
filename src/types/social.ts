// Tipos para o sistema social
export type PostType = 'text' | 'image' | 'video' | 'link' | 'poll';

// Tipos para notificações sociais
export type NotificationType = 'like' | 'comment' | 'message' | 'group_invite' | 'achievement' | 'mention';
export type GroupType = 'study_group' | 'course_group' | 'general';
export type MessageStatus = 'sent' | 'delivered' | 'read';
export type ActivityType = 'course_completed' | 'badge_earned' | 'post_created' | 'comment_added' | 'group_joined' | 'achievement_unlocked';
export type NotificationType = 'like' | 'comment' | 'message' | 'group_invite' | 'achievement' | 'mention';

export interface SocialPost {
  id: string;
  user_id: string;
  course_id?: string;
  title: string;
  content: string;
  post_type: PostType;
  tags?: string[];
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  is_moderated: boolean;
  created_at: string;
  updated_at: string;
  // Dados relacionados
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  course?: {
    id: string;
    title: string;
  };
  is_liked?: boolean;
}

export interface SocialComment {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id?: string;
  content: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  // Dados relacionados
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  replies?: SocialComment[];
  is_liked?: boolean;
}

export interface SocialPostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface SocialCommentLike {
  id: string;
  comment_id: string;
  user_id: string;
  created_at: string;
}

export interface StudyGroup {
  id: string;
  name: string;
  description?: string;
  course_id?: string;
  creator_id: string;
  group_type: GroupType;
  max_members: number;
  is_private: boolean;
  invite_code: string;
  created_at: string;
  updated_at: string;
  // Dados relacionados
  creator?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  course?: {
    id: string;
    title: string;
  };
  members_count?: number;
  is_member?: boolean;
  recent_messages?: GroupMessage[];
}

export interface StudyGroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  // Dados relacionados
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface GroupMessage {
  id: string;
  group_id: string;
  user_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  attachment_url?: string;
  created_at: string;
  // Dados relacionados
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface PrivateMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  status: MessageStatus;
  read_at?: string;
  created_at: string;
  // Dados relacionados
  sender?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  receiver?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface PrivateConversation {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message_id?: string;
  last_message_at: string;
  created_at: string;
  // Dados relacionados
  other_user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  last_message?: PrivateMessage;
  unread_count?: number;
}

export interface SocialActivity {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  is_public: boolean;
  created_at: string;
  // Dados relacionados
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface SocialNotification {
  id: string;
  user_id: string;
  sender_id?: string;
  notification_type: NotificationType;
  title: string;
  content?: string;
  related_id?: string;
  is_read: boolean;
  created_at: string;
  // Dados relacionados
  sender?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface UserFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  // Dados relacionados
  follower?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  following?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface SocialChallenge {
  id: string;
  title: string;
  description?: string;
  course_id?: string;
  creator_id: string;
  start_date: string;
  end_date: string;
  max_participants?: number;
  prize_description?: string;
  rules?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  // Dados relacionados
  creator?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  course?: {
    id: string;
    title: string;
  };
  participants_count?: number;
  is_participant?: boolean;
}

export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  score: number;
  progress?: Record<string, any>;
  joined_at: string;
  // Dados relacionados
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface SocialLeaderboard {
  id: string;
  user_id: string;
  period: 'weekly' | 'monthly' | 'all_time';
  social_points: number;
  posts_count: number;
  comments_count: number;
  likes_received: number;
  groups_joined: number;
  streak_days: number;
  rank_position?: number;
  period_start?: string;
  period_end?: string;
  created_at: string;
  updated_at: string;
  // Dados relacionados
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

// Tipos para formulários e criação
export interface CreatePostData {
  title: string;
  content: string;
  post_type: PostType;
  course_id?: string;
  tags?: string[];
}

export interface CreateCommentData {
  post_id: string;
  content: string;
  parent_comment_id?: string;
}

export interface CreateGroupData {
  name: string;
  description?: string;
  course_id?: string;
  group_type: GroupType;
  max_members: number;
  is_private: boolean;
}

export interface CreateMessageData {
  content: string;
  message_type?: 'text' | 'image' | 'file';
  attachment_url?: string;
}

export interface CreateChallengeData {
  title: string;
  description?: string;
  course_id?: string;
  start_date: string;
  end_date: string;
  max_participants?: number;
  prize_description?: string;
  rules?: Record<string, any>;
}

// Tipos para filtros e busca
export interface PostFilters {
  post_type?: PostType;
  course_id?: string;
  tags?: string[];
  user_id?: string;
  search?: string;
}

export interface GroupFilters {
  group_type?: GroupType;
  course_id?: string;
  is_private?: boolean;
  search?: string;
}

export interface ActivityFilters {
  activity_type?: ActivityType;
  user_id?: string;
  is_public?: boolean;
}

// Tipos para estatísticas
export interface SocialStats {
  total_posts: number;
  total_comments: number;
  total_likes_given: number;
  total_likes_received: number;
  total_groups: number;
  total_followers: number;
  total_following: number;
  social_points: number;
  rank_position?: number;
}

// Tipos para respostas da API
export interface PostsResponse {
  posts: SocialPost[];
  total: number;
  page: number;
  limit: number;
}

export interface CommentsResponse {
  comments: SocialComment[];
  total: number;
}

export interface GroupsResponse {
  groups: StudyGroup[];
  total: number;
  page: number;
  limit: number;
}

export interface ActivitiesResponse {
  activities: SocialActivity[];
  total: number;
  page: number;
  limit: number;
}