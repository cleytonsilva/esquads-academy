import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Pin,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SocialPost } from '@/types/social';
import { PostComments } from './PostComments';

interface PostCardProps {
  post: SocialPost;
  onLike: (post: SocialPost) => void;
  onShare?: (post: SocialPost) => void;
  showComments?: boolean;
  onToggleComments?: (postId: string) => void;
}

export function PostCard({ 
  post, 
  onLike, 
  onShare, 
  showComments = false,
  onToggleComments 
}: PostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'achievement': return 'bg-yellow-100 text-yellow-800';
      case 'question': return 'bg-blue-100 text-blue-800';
      case 'announcement': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case 'achievement': return 'Conquista';
      case 'question': return 'Pergunta';
      case 'announcement': return 'Anúncio';
      case 'discussion': return 'Discussão';
      default: return type;
    }
  };

  const shouldTruncateContent = post.content.length > 300;
  const displayContent = shouldTruncateContent && !isExpanded 
    ? post.content.substring(0, 300) + '...' 
    : post.content;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={post.user?.avatar_url} />
              <AvatarFallback>
                {post.user?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm">
                  {post.user?.full_name || 'Usuário'}
                </p>
                {post.is_pinned && (
                  <Pin className="h-3 w-3 text-blue-600" />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>
                  {formatDistanceToNow(new Date(post.created_at), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </span>
                {post.course && (
                  <>
                    <span>•</span>
                    <span>{post.course.title}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={getPostTypeColor(post.post_type)}
            >
              {getPostTypeLabel(post.post_type)}
            </Badge>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Título do Post */}
        <div>
          <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
          <div className="text-gray-700 whitespace-pre-wrap">
            {displayContent}
            {shouldTruncateContent && (
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto text-blue-600"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? ' Ver menos' : ' Ver mais'}
              </Button>
            )}
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Ações do Post */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(post)}
              className={`flex items-center gap-2 ${
                post.is_liked ? 'text-red-600' : 'text-gray-600'
              }`}
            >
              <Heart 
                className={`h-4 w-4 ${
                  post.is_liked ? 'fill-current' : ''
                }`} 
              />
              <span>{post.likes_count}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleComments?.(post.id)}
              className="flex items-center gap-2 text-gray-600"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{post.comments_count}</span>
            </Button>

            {onShare && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onShare(post)}
                className="flex items-center gap-2 text-gray-600"
              >
                <Share2 className="h-4 w-4" />
                <span>Compartilhar</span>
              </Button>
            )}
          </div>

          {post.is_moderated && (
            <Badge variant="outline" className="text-xs text-green-600">
              Moderado
            </Badge>
          )}
        </div>

        {/* Comentários */}
        {showComments && (
          <div className="pt-4 border-t">
            <PostComments postId={post.id} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}