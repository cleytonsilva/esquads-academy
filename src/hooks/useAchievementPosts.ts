import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AchievementPost {
  id: string;
  user_id: string;
  achievement_id: string;
  title: string;
  content?: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  is_featured: boolean;
  visibility: 'public' | 'friends' | 'private';
  created_at: string;
  updated_at: string;
  user_profiles?: {
    full_name: string;
    avatar_url?: string;
  };
  achievements?: {
    name: string;
    description?: string;
    icon_url?: string;
    points: number;
  };
  is_liked?: boolean;
}

export interface AchievementPostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_profiles?: {
    full_name: string;
    avatar_url?: string;
  };
}

export interface CreateAchievementPostData {
  achievement_id: string;
  title: string;
  content?: string;
  image_url?: string;
  visibility?: 'public' | 'friends' | 'private';
}

export function useAchievementPosts() {
  const [posts, setPosts] = useState<AchievementPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('achievement_posts')
        .select(`
          *,
          user_profiles!inner(full_name, avatar_url),
          achievements!inner(name, description, icon_url, points)
        `)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Verificar quais posts o usuário curtiu
      let postsWithLikes = data || [];
      if (user) {
        const { data: likes } = await supabase
          .from('achievement_post_likes')
          .select('post_id')
          .eq('user_id', user.id);

        const likedPostIds = new Set(likes?.map(like => like.post_id) || []);
        postsWithLikes = (data || []).map(post => ({
          ...post,
          is_liked: likedPostIds.has(post.id)
        }));
      }

      setPosts(postsWithLikes);
    } catch (err) {
      console.error('Erro ao buscar posts de conquistas:', err);
      setError('Erro ao carregar posts de conquistas');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('achievement_posts')
        .select(`
          *,
          user_profiles!inner(full_name, avatar_url),
          achievements!inner(name, description, icon_url, points)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Verificar quais posts o usuário curtiu
      let postsWithLikes = data || [];
      if (user) {
        const { data: likes } = await supabase
          .from('achievement_post_likes')
          .select('post_id')
          .eq('user_id', user.id);

        const likedPostIds = new Set(likes?.map(like => like.post_id) || []);
        postsWithLikes = (data || []).map(post => ({
          ...post,
          is_liked: likedPostIds.has(post.id)
        }));
      }

      setPosts(postsWithLikes);
    } catch (err) {
      console.error('Erro ao buscar posts do usuário:', err);
      setError('Erro ao carregar posts do usuário');
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData: CreateAchievementPostData) => {
    if (!user) {
      setError('Usuário não autenticado');
      return null;
    }

    try {
      setError(null);

      const { data, error } = await supabase
        .from('achievement_posts')
        .insert({
          user_id: user.id,
          ...postData
        })
        .select(`
          *,
          user_profiles!inner(full_name, avatar_url),
          achievements!inner(name, description, icon_url, points)
        `)
        .single();

      if (error) throw error;

      const newPost = { ...data, is_liked: false };
      setPosts(prev => [newPost, ...prev]);
      return newPost;
    } catch (err) {
      console.error('Erro ao criar post:', err);
      setError('Erro ao criar post de conquista');
      return null;
    }
  };

  const likePost = async (postId: string) => {
    if (!user) {
      setError('Usuário não autenticado');
      return;
    }

    try {
      setError(null);

      const { error } = await supabase
        .from('achievement_post_likes')
        .insert({
          post_id: postId,
          user_id: user.id
        });

      if (error) throw error;

      // Atualizar estado local
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likes_count: post.likes_count + 1,
              is_liked: true 
            }
          : post
      ));
    } catch (err) {
      console.error('Erro ao curtir post:', err);
      setError('Erro ao curtir post');
    }
  };

  const unlikePost = async (postId: string) => {
    if (!user) {
      setError('Usuário não autenticado');
      return;
    }

    try {
      setError(null);

      const { error } = await supabase
        .from('achievement_post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Atualizar estado local
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likes_count: post.likes_count - 1,
              is_liked: false 
            }
          : post
      ));
    } catch (err) {
      console.error('Erro ao descurtir post:', err);
      setError('Erro ao descurtir post');
    }
  };

  const deletePost = async (postId: string) => {
    if (!user) {
      setError('Usuário não autenticado');
      return;
    }

    try {
      setError(null);

      const { error } = await supabase
        .from('achievement_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) throw error;

      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (err) {
      console.error('Erro ao deletar post:', err);
      setError('Erro ao deletar post');
    }
  };

  const fetchComments = async (postId: string): Promise<AchievementPostComment[]> => {
    try {
      const { data, error } = await supabase
        .from('achievement_post_comments')
        .select(`
          *,
          user_profiles!inner(full_name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar comentários:', err);
      return [];
    }
  };

  const addComment = async (postId: string, content: string) => {
    if (!user) {
      setError('Usuário não autenticado');
      return null;
    }

    try {
      setError(null);

      const { data, error } = await supabase
        .from('achievement_post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content
        })
        .select(`
          *,
          user_profiles!inner(full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      // Atualizar contador de comentários no post
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, comments_count: post.comments_count + 1 }
          : post
      ));

      return data;
    } catch (err) {
      console.error('Erro ao adicionar comentário:', err);
      setError('Erro ao adicionar comentário');
      return null;
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    error,
    fetchPosts,
    fetchUserPosts,
    createPost,
    likePost,
    unlikePost,
    deletePost,
    fetchComments,
    addComment
  };
}