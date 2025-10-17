import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SocialComment, CreateCommentData } from '@/types/social';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useSocialComments(postId: string) {
  const { user } = useAuth();
  const [comments, setComments] = useState<SocialComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('social_comments')
        .select(`
          *,
          user:users(id, full_name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Processar os dados para incluir contadores e status de like
      const processedComments = await Promise.all(
        (data || []).map(async (comment) => {
          // Buscar contagem de likes
          const { count: likesCount } = await supabase
            .from('social_comment_likes')
            .select('*', { count: 'exact', head: true })
            .eq('comment_id', comment.id);

          // Verificar se o usuário curtiu
          const { data: likeData } = await supabase
            .from('social_comment_likes')
            .select('id')
            .eq('comment_id', comment.id)
            .eq('user_id', user?.id)
            .single();

          return {
            ...comment,
            likes_count: likesCount || 0,
            is_liked: !!likeData
          };
        })
      );

      setComments(processedComments);
      setError(null);
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
      setError('Erro ao carregar comentários');
    } finally {
      setLoading(false);
    }
  };

  const createComment = async (commentData: CreateCommentData) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('social_comments')
        .insert({
          ...commentData,
          user_id: user.id
        })
        .select(`
          *,
          user:users(id, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      const newComment = {
        ...data,
        likes_count: 0,
        is_liked: false
      };

      setComments(prev => [...prev, newComment]);
      toast.success('Comentário adicionado!');
      return newComment;
    } catch (error) {
      console.error('Erro ao criar comentário:', error);
      toast.error('Erro ao adicionar comentário');
      throw error;
    }
  };

  const likeComment = async (commentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('social_comment_likes')
        .insert({
          comment_id: commentId,
          user_id: user.id
        });

      if (error) throw error;

      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId
            ? {
                ...comment,
                likes_count: comment.likes_count + 1,
                is_liked: true
              }
            : comment
        )
      );
    } catch (error) {
      console.error('Erro ao curtir comentário:', error);
      throw error;
    }
  };

  const unlikeComment = async (commentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('social_comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId
            ? {
                ...comment,
                likes_count: Math.max(0, comment.likes_count - 1),
                is_liked: false
              }
            : comment
        )
      );
    } catch (error) {
      console.error('Erro ao descurtir comentário:', error);
      throw error;
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('social_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      setComments(prev => prev.filter(comment => comment.id !== commentId));
      toast.success('Comentário removido');
    } catch (error) {
      console.error('Erro ao deletar comentário:', error);
      toast.error('Erro ao remover comentário');
      throw error;
    }
  };

  // Organizar comentários em hierarquia (pais e filhos)
  const organizeComments = (comments: SocialComment[]) => {
    const parentComments = comments.filter(c => !c.parent_comment_id);
    const childComments = comments.filter(c => c.parent_comment_id);

    return parentComments.map(parent => ({
      ...parent,
      replies: childComments.filter(child => child.parent_comment_id === parent.id)
    }));
  };

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId, user]);

  // Configurar real-time subscriptions
  useEffect(() => {
    if (!user || !postId) return;

    const commentsSubscription = supabase
      .channel(`comments_${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_comments',
          filter: `post_id=eq.${postId}`
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    const likesSubscription = supabase
      .channel(`comment_likes_${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_comment_likes'
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(commentsSubscription);
      supabase.removeChannel(likesSubscription);
    };
  }, [user, postId]);

  return {
    comments,
    loading,
    error,
    createComment,
    likeComment,
    unlikeComment,
    deleteComment,
    organizeComments,
    refreshComments: fetchComments
  };
}