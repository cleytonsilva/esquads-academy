import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heart, MessageCircle, Trophy, Calendar, MoreVertical, Trash2 } from 'lucide-react';
import { useAchievementPosts, AchievementPost, AchievementPostComment } from '@/hooks/useAchievementPosts';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface AchievementPostCardProps {
  post: AchievementPost;
  onLike: (postId: string) => void;
  onUnlike: (postId: string) => void;
  onDelete?: (postId: string) => void;
}

function AchievementPostCard({ post, onLike, onUnlike, onDelete }: AchievementPostCardProps) {
  const [comments, setComments] = useState<AchievementPostComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const { user } = useAuth();
  const { fetchComments, addComment } = useAchievementPosts();

  const handleLike = () => {
    if (post.is_liked) {
      onUnlike(post.id);
    } else {
      onLike(post.id);
    }
  };

  const loadComments = async () => {
    if (!showComments) {
      setLoadingComments(true);
      const commentsData = await fetchComments(post.id);
      setComments(commentsData);
      setLoadingComments(false);
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const comment = await addComment(post.id, newComment);
    if (comment) {
      setComments(prev => [...prev, comment]);
      setNewComment('');
    }
  };

  const canDelete = user && user.id === post.user_id;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.user_profiles?.avatar_url} />
              <AvatarFallback>
                {post.user_profiles?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{post.user_profiles?.full_name}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </p>
            </div>
          </div>
          {canDelete && onDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => onDelete(post.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Achievement Badge */}
        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
          <div className="flex-shrink-0">
            {post.achievements?.icon_url ? (
              <img 
                src={post.achievements.icon_url} 
                alt={post.achievements.name}
                className="h-12 w-12 rounded-full"
              />
            ) : (
              <div className="h-12 w-12 bg-yellow-500 rounded-full flex items-center justify-center">
                <Trophy className="h-6 w-6 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-800">{post.achievements?.name}</h3>
            <p className="text-sm text-yellow-600">{post.achievements?.description}</p>
            <Badge variant="secondary" className="mt-1">
              {post.achievements?.points} XP
            </Badge>
          </div>
        </div>

        {/* Post Content */}
        <div>
          <h4 className="font-semibold mb-2">{post.title}</h4>
          {post.content && (
            <p className="text-muted-foreground">{post.content}</p>
          )}
        </div>

        {/* Post Image */}
        {post.image_url && (
          <div className="rounded-lg overflow-hidden">
            <img 
              src={post.image_url} 
              alt="Post image"
              className="w-full h-64 object-cover"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center space-x-2 ${
                post.is_liked ? 'text-red-500' : 'text-muted-foreground'
              }`}
            >
              <Heart className={`h-4 w-4 ${post.is_liked ? 'fill-current' : ''}`} />
              <span>{post.likes_count}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadComments}
              className="flex items-center space-x-2 text-muted-foreground"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{post.comments_count}</span>
            </Button>
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="space-y-3 pt-3 border-t">
            {loadingComments ? (
              <p className="text-sm text-muted-foreground">Carregando comentários...</p>
            ) : (
              <>
                {comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.user_profiles?.avatar_url} />
                      <AvatarFallback>
                        {comment.user_profiles?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted rounded-lg p-3">
                        <p className="font-semibold text-sm">{comment.user_profiles?.full_name}</p>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(comment.created_at), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Add Comment */}
                {user && (
                  <div className="flex space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback>
                        {user.user_metadata?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <Textarea
                        placeholder="Escreva um comentário..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[60px]"
                      />
                      <Button 
                        size="sm" 
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                      >
                        Comentar
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AchievementPosts() {
  const { posts, loading, error, likePost, unlikePost, deletePost } = useAchievementPosts();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="w-full">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-muted rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted rounded"></div>
                    <div className="h-3 w-24 bg-muted rounded"></div>
                  </div>
                </div>
                <div className="h-20 bg-muted rounded"></div>
                <div className="h-4 w-3/4 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Nenhuma conquista compartilhada</h3>
          <p className="text-muted-foreground">
            Seja o primeiro a compartilhar suas conquistas!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <AchievementPostCard
          key={post.id}
          post={post}
          onLike={likePost}
          onUnlike={unlikePost}
          onDelete={deletePost}
        />
      ))}
    </div>
  );
}