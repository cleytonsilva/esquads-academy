import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Trophy,
  BookOpen,
  Clock,
  Pin,
  ThumbsUp
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SocialPost, SocialActivity } from '@/types/social';
import { useSocialFeed } from '@/hooks/useSocialFeed';
import { useSocialNotifications } from '@/hooks/useSocialNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { CreatePostDialog } from './CreatePostDialog';
import { PostComments } from './PostComments';

interface SocialFeedProps {
  searchQuery: string;
}

export function SocialFeed({ searchQuery }: SocialFeedProps) {
  const { user } = useAuth();
  const { 
    posts, 
    activities, 
    loading, 
    error, 
    likePost, 
    unlikePost, 
    refreshFeed 
  } = useSocialFeed();
  
  const { createNotification } = useSocialNotifications();
  
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [showComments, setShowComments] = useState<Set<string>>(new Set());

  useEffect(() => {
    refreshFeed();
  }, []);

  const toggleComments = (postId: string) => {
    const newShowComments = new Set(showComments);
    if (newShowComments.has(postId)) {
      newShowComments.delete(postId);
    } else {
      newShowComments.add(postId);
    }
    setShowComments(newShowComments);
  };

  const handleLike = async (post: SocialPost) => {
    try {
      if (post.is_liked) {
        await unlikePost(post.id);
      } else {
        await likePost(post.id);
        
        // Criar notificação para o autor do post (se não for o próprio usuário)
        if (post.user_id !== user?.id && post.user_id) {
          await createNotification(
            post.user_id,
            'like',
            `${user?.full_name || 'Alguém'} curtiu seu post`,
            post.title,
            post.id
          );
        }
      }
    } catch (error) {
      console.error('Erro ao curtir post:', error);
    }
  };

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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'course_completed': return <BookOpen className="h-4 w-4" />;
      case 'badge_earned': return <Trophy className="h-4 w-4" />;
      case 'achievement_unlocked': return <Trophy className="h-4 w-4" />;
      default: return <ThumbsUp className="h-4 w-4" />;
    }
  };

  const filteredPosts = posts.filter(post => 
    !searchQuery || 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.user?.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-gray-300 h-10 w-10"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-32"></div>
                  <div className="h-3 bg-gray-300 rounded w-24"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
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
          <p className="text-red-600">Erro ao carregar o feed social</p>
          <Button onClick={refreshFeed} className="mt-4">
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Feed Principal */}
      <div className="lg:col-span-2 space-y-6">
        {/* Criar Post */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>EU</AvatarFallback>
              </Avatar>
              <Button 
                variant="outline" 
                className="flex-1 justify-start text-gray-500"
                onClick={() => setShowCreatePost(true)}
              >
                Compartilhe algo interessante...
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Posts */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
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
                    <Badge className={getPostTypeColor(post.post_type)}>
                      {getPostTypeLabel(post.post_type)}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">{post.title}</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {post.content}
                  </p>

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Ações do Post */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post)}
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
                        onClick={() => toggleComments(post.id)}
                        className="flex items-center gap-2 text-gray-600"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comments_count}</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2 text-gray-600"
                      >
                        <Share2 className="h-4 w-4" />
                        Compartilhar
                      </Button>
                    </div>
                  </div>

                  {/* Comentários */}
                  {showComments.has(post.id) && (
                    <PostComments postId={post.id} />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredPosts.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum post encontrado
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery 
                    ? 'Tente ajustar sua busca ou criar um novo post'
                    : 'Seja o primeiro a compartilhar algo interessante!'
                  }
                </p>
                <Button onClick={() => setShowCreatePost(true)}>
                  Criar Post
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Sidebar - Atividades Recentes */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Atividades Recentes</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.activity_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.user?.full_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(activity.created_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Trending Topics */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Tópicos em Alta</h3>
          </CardHeader>
          <CardContent className="space-y-2">
            {['#ciberseguranca', '#python', '#hacking', '#redes', '#linux'].map((tag) => (
              <div key={tag} className="flex items-center justify-between">
                <Badge variant="secondary">{tag}</Badge>
                <span className="text-xs text-gray-500">24 posts</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Dialog para criar post */}
      <CreatePostDialog 
        open={showCreatePost} 
        onOpenChange={setShowCreatePost}
        onPostCreated={refreshFeed}
      />
    </div>
  );
}