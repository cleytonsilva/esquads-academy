import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  MessageCircle, 
  Eye, 
  Clock, 
  Pin, 
  TrendingUp,
  Filter,
  Plus
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SocialPost } from '@/types/social';
import { supabase } from '@/integrations/supabase/client';
import { CreatePostDialog } from './CreatePostDialog';

interface ForumDiscussionsProps {
  searchQuery: string;
}

export function ForumDiscussions({ searchQuery }: ForumDiscussionsProps) {
  const [discussions, setDiscussions] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [localSearch, setLocalSearch] = useState('');

  const categories = [
    { id: 'all', name: 'Todas', count: 0 },
    { id: 'ciberseguranca', name: 'Cibersegurança', count: 0 },
    { id: 'programacao', name: 'Programação', count: 0 },
    { id: 'redes', name: 'Redes', count: 0 },
    { id: 'linux', name: 'Linux', count: 0 },
    { id: 'hacking', name: 'Hacking Ético', count: 0 },
    { id: 'certificacoes', name: 'Certificações', count: 0 }
  ];

  useEffect(() => {
    fetchDiscussions();
  }, [selectedCategory, sortBy]);

  const fetchDiscussions = async () => {
    setLoading(true);
    
    try {
      let query = supabase
        .from('social_posts')
        .select(`
          *,
          user:users!social_posts_user_id_fkey(id, full_name, avatar_url),
          course:courses!social_posts_course_id_fkey(id, title)
        `)
        .in('post_type', ['discussion', 'question']);

      // Filtrar por categoria se não for 'all'
      if (selectedCategory !== 'all') {
        query = query.contains('tags', [selectedCategory]);
      }

      // Ordenação
      switch (sortBy) {
        case 'popular':
          // Ordenar por created_at por enquanto (likes_count não está disponível na tabela)
          query = query.order('created_at', { ascending: false });
          break;
        case 'trending':
          // Ordenar por atividade recente
          query = query.order('updated_at', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;

      // Processar os dados para incluir contadores
      const processedDiscussions = await Promise.all(
        (data || []).map(async (post) => {
          const { count: likesCount } = await supabase
            .from('social_likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);

          const { count: commentsCount } = await supabase
            .from('social_comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);

          return {
            ...post,
            likes_count: likesCount || 0,
            comments_count: commentsCount || 0
          };
        })
      );

      setDiscussions(processedDiscussions);
    } catch (error) {
      console.error('Erro ao buscar discussões:', error);
      // Falha silenciosa - não interrompe a UI
      setDiscussions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDiscussions = discussions.filter(discussion => {
    const query = (searchQuery || localSearch).toLowerCase();
    return !query || 
      discussion.title.toLowerCase().includes(query) ||
      discussion.content.toLowerCase().includes(query) ||
      discussion.user?.full_name.toLowerCase().includes(query) ||
      discussion.tags?.some(tag => tag.toLowerCase().includes(query));
  });

  const getDiscussionIcon = (post: SocialPost) => {
    if (post.is_pinned) return <Pin className="h-4 w-4 text-blue-600" />;
    if (post.post_type === 'question') return <MessageCircle className="h-4 w-4 text-green-600" />;
    return <MessageCircle className="h-4 w-4 text-gray-600" />;
  };

  const getDiscussionBadge = (post: SocialPost) => {
    if (post.post_type === 'question') {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Pergunta</Badge>;
    }
    return <Badge variant="secondary">Discussão</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <div className="rounded-full bg-gray-300 h-10 w-10"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar - Categorias */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Categorias</h3>
              <Button size="sm" onClick={() => setShowCreatePost(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
                {category.count > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {category.count}
                  </Badge>
                )}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold">Filtros</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ordenar por:</label>
              <div className="space-y-1">
                {[
                  { value: 'recent', label: 'Mais recentes', icon: Clock },
                  { value: 'popular', label: 'Mais populares', icon: TrendingUp },
                  { value: 'trending', label: 'Em alta', icon: TrendingUp }
                ].map(({ value, label, icon: Icon }) => (
                  <Button
                    key={value}
                    variant={sortBy === value ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setSortBy(value as any)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Discussões */}
      <div className="lg:col-span-3 space-y-4">
        {/* Busca Local */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar discussões..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Lista */}
        <div className="space-y-3">
          {filteredDiscussions.map((discussion) => (
            <Card key={discussion.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getDiscussionIcon(discussion)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg hover:text-blue-600 transition-colors">
                            {discussion.title}
                          </h3>
                          {getDiscussionBadge(discussion)}
                        </div>
                        
                        <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                          {discussion.content}
                        </p>

                        {discussion.tags && discussion.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {discussion.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                            {discussion.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{discussion.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={discussion.user?.avatar_url} />
                                <AvatarFallback className="text-xs">
                                  {discussion.user?.full_name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <span>{discussion.user?.full_name || 'Usuário'}</span>
                            </div>
                            
                            <span>•</span>
                            
                            <span>
                              {formatDistanceToNow(new Date(discussion.created_at), { 
                                addSuffix: true, 
                                locale: ptBR 
                              })}
                            </span>

                            {discussion.course && (
                              <>
                                <span>•</span>
                                <span>{discussion.course.title}</span>
                              </>
                            )}
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Eye className="h-4 w-4" />
                              <span>{discussion.views || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="h-4 w-4" />
                              <span>{discussion.comments_count}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredDiscussions.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhuma discussão encontrada
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || localSearch
                    ? 'Tente ajustar sua busca ou criar uma nova discussão'
                    : 'Seja o primeiro a iniciar uma discussão nesta categoria!'
                  }
                </p>
                <Button onClick={() => setShowCreatePost(true)}>
                  Criar Discussão
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialog para criar discussão */}
      <CreatePostDialog 
        open={showCreatePost} 
        onOpenChange={setShowCreatePost}
        onPostCreated={fetchDiscussions}
      />
    </div>
  );
}