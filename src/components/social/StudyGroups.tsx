import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Search, 
  Plus, 
  Lock, 
  Globe, 
  MessageCircle,
  Calendar,
  BookOpen,
  Crown,
  Settings,
  UserPlus
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { StudyGroup } from '@/types/social';
import { useStudyGroups } from '@/hooks/useStudyGroups';
import { CreateGroupDialog } from './CreateGroupDialog';
import { GroupChatDialog } from './GroupChatDialog';

interface StudyGroupsProps {
  searchQuery: string;
}

export function StudyGroups({ searchQuery }: StudyGroupsProps) {
  const { 
    groups, 
    myGroups, 
    loading, 
    error, 
    joinGroup, 
    leaveGroup, 
    refreshGroups 
  } = useStudyGroups();
  
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'my-groups'>('all');
  const [localSearch, setLocalSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'public' | 'private'>('all');

  useEffect(() => {
    refreshGroups();
  }, []);

  const handleJoinGroup = async (group: StudyGroup) => {
    try {
      await joinGroup(group.id);
    } catch (error) {
      console.error('Erro ao entrar no grupo:', error);
    }
  };

  const handleLeaveGroup = async (group: StudyGroup) => {
    try {
      await leaveGroup(group.id);
    } catch (error) {
      console.error('Erro ao sair do grupo:', error);
    }
  };

  const openGroupChat = (group: StudyGroup) => {
    setSelectedGroup(group);
    setShowChat(true);
  };

  const getGroupTypeIcon = (type: string) => {
    return type === 'private' ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />;
  };

  const getGroupTypeBadge = (type: string) => {
    return type === 'private' 
      ? <Badge variant="secondary" className="bg-red-100 text-red-800">Privado</Badge>
      : <Badge variant="secondary" className="bg-green-100 text-green-800">Público</Badge>;
  };

  const filteredGroups = (activeTab === 'my-groups' ? myGroups : groups).filter(group => {
    const query = (searchQuery || localSearch).toLowerCase();
    const matchesSearch = !query || 
      group.name.toLowerCase().includes(query) ||
      group.description?.toLowerCase().includes(query) ||
      group.subject?.toLowerCase().includes(query);
    
    const matchesType = filterType === 'all' || group.group_type === filterType;
    
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <div className="rounded-full bg-gray-300 h-12 w-12"></div>
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

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-600">Erro ao carregar grupos de estudo</p>
          <Button onClick={refreshGroups} className="mt-4">
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Tabs e Ações */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={activeTab === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('all')}
            >
              Todos os Grupos
            </Button>
            <Button
              variant={activeTab === 'my-groups' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('my-groups')}
            >
              Meus Grupos ({myGroups.length})
            </Button>
          </div>
        </div>
        
        <Button onClick={() => setShowCreateGroup(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Criar Grupo
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar grupos..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          {['all', 'public', 'private'].map((type) => (
            <Button
              key={type}
              variant={filterType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType(type as any)}
            >
              {type === 'all' ? 'Todos' : type === 'public' ? 'Públicos' : 'Privados'}
            </Button>
          ))}
        </div>
      </div>

      {/* Lista de Grupos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGroups.map((group) => (
          <Card key={group.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={group.avatar_url} />
                      <AvatarFallback>
                        <Users className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1">
                      {getGroupTypeIcon(group.group_type)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{group.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="h-3 w-3" />
                      <span>{group.member_count} membros</span>
                      {group.max_members && (
                        <span>/ {group.max_members}</span>
                      )}
                    </div>
                  </div>
                </div>
                {getGroupTypeBadge(group.group_type)}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <p className="text-gray-700 text-sm line-clamp-2">
                  {group.description}
                </p>
                
                {group.subject && (
                  <div className="flex items-center gap-1 mt-2">
                    <BookOpen className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-500">{group.subject}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {group.tags && group.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {group.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                  {group.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{group.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Membros Recentes */}
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {group.recent_members?.slice(0, 4).map((member, index) => (
                    <Avatar key={index} className="h-6 w-6 border-2 border-white">
                      <AvatarImage src={member.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {member.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {group.member_count > 4 && (
                    <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                      <span className="text-xs text-gray-600">+{group.member_count - 4}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {formatDistanceToNow(new Date(group.created_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </span>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2 pt-2 border-t">
                {group.is_member ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => openGroupChat(group)}
                      className="flex-1"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleLeaveGroup(group)}
                    >
                      Sair
                    </Button>
                    {group.is_admin && (
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4" />
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleJoinGroup(group)}
                    className="flex-1"
                    disabled={group.max_members && group.member_count >= group.max_members}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {group.group_type === 'private' ? 'Solicitar' : 'Entrar'}
                  </Button>
                )}
              </div>

              {/* Admin Badge */}
              {group.is_admin && (
                <div className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                  <Crown className="h-3 w-3" />
                  <span>Administrador</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estado Vazio */}
      {filteredGroups.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {activeTab === 'my-groups' 
                ? 'Você ainda não faz parte de nenhum grupo'
                : 'Nenhum grupo encontrado'
              }
            </h3>
            <p className="text-gray-600 mb-4">
              {activeTab === 'my-groups'
                ? 'Entre em grupos existentes ou crie seu próprio grupo de estudos'
                : searchQuery || localSearch
                  ? 'Tente ajustar sua busca ou criar um novo grupo'
                  : 'Seja o primeiro a criar um grupo de estudos!'
              }
            </p>
            <Button onClick={() => setShowCreateGroup(true)}>
              Criar Grupo
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <CreateGroupDialog 
        open={showCreateGroup} 
        onOpenChange={setShowCreateGroup}
        onGroupCreated={refreshGroups}
      />

      {selectedGroup && (
        <GroupChatDialog
          open={showChat}
          onOpenChange={setShowChat}
          group={selectedGroup}
        />
      )}
    </div>
  );
}