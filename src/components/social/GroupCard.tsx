import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Lock, 
  Globe, 
  MessageCircle, 
  Calendar,
  BookOpen,
  Crown,
  Settings
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { StudyGroup } from '@/types/social';

interface GroupCardProps {
  group: StudyGroup;
  onJoin?: (groupId: string) => void;
  onLeave?: (groupId: string) => void;
  onOpenChat?: (groupId: string) => void;
  onManage?: (groupId: string) => void;
  showActions?: boolean;
}

export function GroupCard({ 
  group, 
  onJoin, 
  onLeave, 
  onOpenChat, 
  onManage,
  showActions = true 
}: GroupCardProps) {
  const getGroupTypeIcon = (type: string) => {
    switch (type) {
      case 'study_group':
        return <BookOpen className="h-4 w-4" />;
      case 'course_group':
        return <Users className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getGroupTypeLabel = (type: string) => {
    switch (type) {
      case 'study_group':
        return 'Grupo de Estudo';
      case 'course_group':
        return 'Grupo do Curso';
      case 'general':
        return 'Grupo Geral';
      default:
        return type;
    }
  };

  const getGroupTypeColor = (type: string) => {
    switch (type) {
      case 'study_group':
        return 'bg-blue-100 text-blue-800';
      case 'course_group':
        return 'bg-green-100 text-green-800';
      case 'general':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
              {group.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{group.name}</CardTitle>
                {group.is_private ? (
                  <Lock className="h-4 w-4 text-gray-500" />
                ) : (
                  <Globe className="h-4 w-4 text-green-500" />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Criado por {group.creator?.full_name}</span>
                <span>•</span>
                <span>
                  {formatDistanceToNow(new Date(group.created_at), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </span>
              </div>
            </div>
          </div>
          
          <Badge 
            variant="secondary" 
            className={getGroupTypeColor(group.group_type)}
          >
            <div className="flex items-center gap-1">
              {getGroupTypeIcon(group.group_type)}
              {getGroupTypeLabel(group.group_type)}
            </div>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Descrição */}
        {group.description && (
          <p className="text-gray-700 text-sm">{group.description}</p>
        )}

        {/* Curso relacionado */}
        {group.course && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <BookOpen className="h-4 w-4" />
            <span>{group.course.title}</span>
          </div>
        )}

        {/* Estatísticas */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-gray-600">
              <Users className="h-4 w-4" />
              <span>{group.members_count || 0}/{group.max_members} membros</span>
            </div>
            
            {group.recent_messages && group.recent_messages.length > 0 && (
              <div className="flex items-center gap-1 text-gray-600">
                <MessageCircle className="h-4 w-4" />
                <span>Ativo</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>
              {formatDistanceToNow(new Date(group.updated_at), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </span>
          </div>
        </div>

        {/* Membros recentes */}
        {group.recent_members && group.recent_members.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-2">Membros recentes:</p>
            <div className="flex -space-x-2">
              {group.recent_members.slice(0, 5).map((member, index) => (
                <Avatar key={index} className="h-8 w-8 border-2 border-white">
                  <AvatarImage src={member.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {member.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              ))}
              {group.members_count && group.members_count > 5 && (
                <div className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                  +{group.members_count - 5}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ações */}
        {showActions && (
          <div className="flex items-center gap-2 pt-2 border-t">
            {group.is_member ? (
              <>
                <Button
                  size="sm"
                  onClick={() => onOpenChat?.(group.id)}
                  className="flex-1"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Abrir Chat
                </Button>
                
                {group.is_admin && onManage && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onManage(group.id)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onLeave?.(group.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Sair
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => onJoin?.(group.id)}
                className="flex-1"
                disabled={group.members_count >= group.max_members}
              >
                <Users className="h-4 w-4 mr-2" />
                {group.members_count >= group.max_members ? 'Grupo Lotado' : 'Entrar no Grupo'}
              </Button>
            )}
          </div>
        )}

        {/* Código de convite para grupos privados */}
        {group.is_private && group.is_member && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Código de convite:</p>
            <code className="text-sm font-mono bg-white px-2 py-1 rounded border">
              {group.invite_code}
            </code>
          </div>
        )}
      </CardContent>
    </Card>
  );
}