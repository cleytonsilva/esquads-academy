import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MoreHorizontal, Reply } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SocialComment } from '@/types/social';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PostCommentsProps {
  postId: string;
}

export function PostComments({ postId }: PostCommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<SocialComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
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
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || !user) return;

    setSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('social_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: newComment.trim()
        })
        .select(`
          *,
          user:users(id, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      const newCommentData = {
        ...data,
        likes_count: 0,
        is_liked: false
      };

      setComments(prev => [...prev, newCommentData]);
      setNewComment('');
      toast.success('Comentário adicionado!');
    } catch (error) {
      console.error('Erro ao criar comentário:', error);
      toast.error('Erro ao adicionar comentário');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || !user) return;

    setSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('social_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: replyContent.trim(),
          parent_id: parentId
        })
        .select(`
          *,
          user:users(id, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      const newReplyData = {
        ...data,
        likes_count: 0,
        is_liked: false
      };

      setComments(prev => [...prev, newReplyData]);
      setReplyContent('');
      setReplyingTo(null);
      toast.success('Resposta adicionada!');
    } catch (error) {
      console.error('Erro ao criar resposta:', error);
      toast.error('Erro ao adicionar resposta');
    } finally {
      setSubmitting(false);
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
    }
  };

  // Organizar comentários em hierarquia (pais e filhos)
  const organizeComments = (comments: SocialComment[]) => {
    const parentComments = comments.filter(comment => !comment.parent_id);
    const childComments = comments.filter(comment => comment.parent_id);

    return parentComments.map(parent => ({
      ...parent,
      replies: childComments.filter(child => child.parent_id === parent.id)
    }));
  };

  const organizedComments = organizeComments(comments);

  if (loading) {
    return (
      <div className="space-y-4 p-4 border-t">
        <div className="animate-pulse space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 border-t bg-gray-50">
      {/* Lista de Comentários */}
      <div className="space-y-4">
        {organizedComments.map((comment) => (
          <div key={comment.id} className="space-y-3">
            {/* Comentário Principal */}
            <div className="flex space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={comment.user?.avatar_url} />
                <AvatarFallback>
                  {comment.user?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">
                      {comment.user?.full_name || 'Usuário'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(comment.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
                
                {/* Ações do Comentário */}
                <div className="flex items-center space-x-4 text-xs">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => comment.is_liked ? unlikeComment(comment.id) : likeComment(comment.id)}
                    className={`flex items-center gap-1 h-6 px-2 ${
                      comment.is_liked ? 'text-red-600' : 'text-gray-600'
                    }`}
                  >
                    <Heart className={`h-3 w-3 ${comment.is_liked ? 'fill-current' : ''}`} />
                    <span>{comment.likes_count}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(comment.id)}
                    className="flex items-center gap-1 h-6 px-2 text-gray-600"
                  >
                    <Reply className="h-3 w-3" />
                    Responder
                  </Button>
                </div>

                {/* Formulário de Resposta */}
                {replyingTo === comment.id && (
                  <div className="mt-2">
                    <Textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Escreva sua resposta..."
                      rows={2}
                      className="text-sm"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyContent('');
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSubmitReply(comment.id)}
                        disabled={!replyContent.trim() || submitting}
                      >
                        Responder
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Respostas */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-11 space-y-3">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex space-x-3">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={reply.user?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {reply.user?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="bg-white rounded-lg p-2 shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-xs">
                            {reply.user?.full_name || 'Usuário'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(reply.created_at), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-700">{reply.content}</p>
                      </div>
                      
                      <div className="flex items-center space-x-3 mt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => reply.is_liked ? unlikeComment(reply.id) : likeComment(reply.id)}
                          className={`flex items-center gap-1 h-5 px-1 text-xs ${
                            reply.is_liked ? 'text-red-600' : 'text-gray-600'
                          }`}
                        >
                          <Heart className={`h-2 w-2 ${reply.is_liked ? 'fill-current' : ''}`} />
                          <span>{reply.likes_count}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Formulário para Novo Comentário */}
      <form onSubmit={handleSubmitComment} className="space-y-3">
        <div className="flex space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.avatar_url} />
            <AvatarFallback>
              {user?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escreva um comentário..."
              rows={3}
              className="resize-none"
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={!newComment.trim() || submitting}
            size="sm"
          >
            {submitting ? 'Enviando...' : 'Comentar'}
          </Button>
        </div>
      </form>
    </div>
  );
}