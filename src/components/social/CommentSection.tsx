import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  MessageCircle, 
  Reply, 
  MoreHorizontal,
  Send,
  Trash2,
  Edit3
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SocialComment } from '@/types/social';
import { useSocialComments } from '@/hooks/useSocialComments';
import { useAuth } from '@/contexts/AuthContext';

interface CommentSectionProps {
  postId: string;
  comments?: SocialComment[];
  onCommentAdded?: () => void;
  showReplies?: boolean;
  maxDepth?: number;
}

interface CommentItemProps {
  comment: SocialComment;
  depth?: number;
  maxDepth?: number;
  onReply?: (commentId: string, content: string) => void;
  onLike?: (commentId: string) => void;
  onUnlike?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  onEdit?: (commentId: string, content: string) => void;
  currentUserId?: string;
}

function CommentItem({ 
  comment, 
  depth = 0, 
  maxDepth = 3,
  onReply,
  onLike,
  onUnlike,
  onDelete,
  onEdit,
  currentUserId
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReply = async () => {
    if (!replyContent.trim() || !onReply) return;
    
    setIsSubmitting(true);
    try {
      await onReply(comment.id, replyContent);
      setReplyContent('');
      setShowReplyForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim() || !onEdit) return;
    
    setIsSubmitting(true);
    try {
      await onEdit(comment.id, editContent);
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = () => {
    if (comment.is_liked) {
      onUnlike?.(comment.id);
    } else {
      onLike?.(comment.id);
    }
  };

  const canShowReplies = depth < maxDepth;
  const isOwner = currentUserId === comment.user_id;

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''}`}>
      <div className="flex gap-3 py-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={comment.user?.avatar_url} />
          <AvatarFallback className="text-xs">
            {comment.user?.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{comment.user?.full_name}</span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(comment.created_at), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </span>
                {comment.updated_at !== comment.created_at && (
                  <span className="text-xs text-gray-400">(editado)</span>
                )}
              </div>

              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete?.(comment.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Editar comentário..."
                  className="min-h-[60px] resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleEdit}
                    disabled={!editContent.trim() || isSubmitting}
                  >
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(comment.content);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {comment.content}
              </p>
            )}
          </div>

          {/* Ações do comentário */}
          <div className="flex items-center gap-4 mt-2 text-sm">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 hover:text-red-500 transition-colors ${
                comment.is_liked ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              <Heart className={`h-4 w-4 ${comment.is_liked ? 'fill-current' : ''}`} />
              <span>{comment.likes_count || 0}</span>
            </button>

            {canShowReplies && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors"
              >
                <Reply className="h-4 w-4" />
                <span>Responder</span>
              </button>
            )}

            {comment.replies && comment.replies.length > 0 && (
              <span className="text-gray-500">
                {comment.replies.length} {comment.replies.length === 1 ? 'resposta' : 'respostas'}
              </span>
            )}
          </div>

          {/* Formulário de resposta */}
          {showReplyForm && canShowReplies && (
            <div className="mt-3 space-y-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Escreva uma resposta..."
                className="min-h-[60px] resize-none"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={!replyContent.trim() || isSubmitting}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Responder
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyContent('');
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Respostas */}
          {comment.replies && comment.replies.length > 0 && canShowReplies && (
            <div className="mt-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                  onReply={onReply}
                  onLike={onLike}
                  onUnlike={onUnlike}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CommentSection({ 
  postId, 
  comments: externalComments,
  onCommentAdded,
  showReplies = true,
  maxDepth = 3
}: CommentSectionProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    comments: hookComments,
    loading,
    createComment,
    likeComment,
    unlikeComment,
    deleteComment,
    updateComment
  } = useSocialComments(postId);

  // Usar comentários externos se fornecidos, senão usar do hook
  const comments = externalComments || hookComments;

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;

    setIsSubmitting(true);
    try {
      await createComment(newComment);
      setNewComment('');
      onCommentAdded?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    await createComment(content, parentId);
  };

  const handleEdit = async (commentId: string, content: string) => {
    await updateComment(commentId, content);
  };

  if (loading && !comments.length) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="bg-gray-200 rounded-lg p-3">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Formulário para novo comentário */}
      {user && (
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback className="text-xs">
              {user.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escreva um comentário..."
              className="min-h-[80px] resize-none"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
                size="sm"
              >
                <Send className="h-4 w-4 mr-2" />
                Comentar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de comentários */}
      <div className="space-y-2">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Nenhum comentário ainda.</p>
            <p className="text-sm">Seja o primeiro a comentar!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              depth={0}
              maxDepth={showReplies ? maxDepth : 0}
              onReply={showReplies ? handleReply : undefined}
              onLike={likeComment}
              onUnlike={unlikeComment}
              onDelete={deleteComment}
              onEdit={handleEdit}
              currentUserId={user?.id}
            />
          ))
        )}
      </div>
    </div>
  );
}