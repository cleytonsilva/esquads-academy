import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SocialPost, SocialActivity } from '@/types/social';
import { useAuth } from '@/contexts/AuthContext';

export function useSocialFeed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [activities, setActivities] = useState<SocialActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('social_posts')
        .select(`
          *,
          user:users(id, full_name, avatar_url),
          course:courses(id, title)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Processar os dados para incluir contadores e status de like
      const processedPosts = await Promise.all(
        (data || []).map(async (post) => {
          try {
            // Buscar contagem de likes com tratamento de erro
            const { count: likesCount, error: likesError } = await supabase
              .from('social_post_likes')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id);

            if (likesError) {
              console.warn('Erro ao buscar likes:', likesError);
            }

            // Buscar contagem de comentários com tratamento de erro
            const { count: commentsCount, error: commentsError } = await supabase
              .from('social_comments')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id);

            if (commentsError) {
              console.warn('Erro ao buscar comentários:', commentsError);
            }

            // Verificar se o usuário curtiu com tratamento de erro
            const { data: likeData, error: likeError } = await supabase
              .from('social_post_likes')
              .select('id')
              .eq('post_id', post.id)
              .eq('user_id', user?.id)
              .single();

            if (likeError && likeError.code !== 'PGRST116') {
              console.warn('Erro ao verificar like:', likeError);
            }

            return {
              ...post,
              likes_count: likesCount || 0,
              comments_count: commentsCount || 0,
              is_liked: !!likeData
            };
          } catch (postError) {
            console.warn('Erro ao processar post:', postError);
            return {
              ...post,
              likes_count: 0,
              comments_count: 0,
              is_liked: false
            };
          }
        })
      );

      setPosts(processedPosts);
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
      setError('Erro ao carregar posts');
    }
  };

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('social_activities')
        .select(`
          *,
          user:users(id, full_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
    }
  };

  const refreshFeed = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([fetchPosts(), fetchActivities()]);
    } catch (error) {
      console.error('Erro ao atualizar feed:', error);
      setError('Erro ao carregar feed');
    } finally {
      setLoading(false);
    }
  };

  const likePost = async (postId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('social_post_likes')
        .insert({
          post_id: postId,
          user_id: user.id
        });

      if (error) throw error;

      // Atualizar o estado local
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                likes_count: post.likes_count + 1,
                is_liked: true
              }
            : post
        )
      );
    } catch (error) {
      console.error('Erro ao curtir post:', error);
      throw error;
    }
  };

  const unlikePost = async (postId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('social_post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Atualizar o estado local
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                likes_count: Math.max(0, post.likes_count - 1),
                is_liked: false
              }
            : post
        )
      );
    } catch (error) {
      console.error('Erro ao descurtir post:', error);
      throw error;
    }
  };

  const createPost = async (postData: {
    title: string;
    content: string;
    post_type: string;
    course_id?: string;
    tags?: string[];
  }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('social_posts')
        .insert({
          ...postData,
          user_id: user.id
        })
        .select(`
          *,
          user:users(id, full_name, avatar_url),
          course:courses(id, title)
        `)
        .single();

      if (error) throw error;

      // Adicionar o novo post ao início da lista
      const newPost = {
        ...data,
        likes_count: 0,
        comments_count: 0,
        is_liked: false
      };

      setPosts(prevPosts => [newPost, ...prevPosts]);
      return newPost;
    } catch (error) {
      console.error('Erro ao criar post:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      refreshFeed();
    }
  }, [user]);

  // Configurar real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const postsSubscription = supabase
      .channel('social_posts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_posts'
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    const likesSubscription = supabase
      .channel('social_post_likes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_post_likes'
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    const activitiesSubscription = supabase
      .channel('social_activities_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'social_activities'
        },
        () => {
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsSubscription);
      supabase.removeChannel(likesSubscription);
      supabase.removeChannel(activitiesSubscription);
    };
  }, [user]);

  return {
    posts,
    activities,
    loading,
    error,
    refreshFeed,
    likePost,
    unlikePost,
    createPost
  };
}