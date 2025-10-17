import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Users, 
  Trophy, 
  BookOpen, 
  MessageCircle,
  Star,
  Filter
} from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { PublicProfile } from './PublicProfile';

interface UserDirectoryProps {
  className?: string;
}

interface UserCard {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  skill_level: 'beginner' | 'intermediate' | 'advanced';
  user_stats: {
    total_xp: number;
    level: number;
    social_points: number;
    courses_completed: number;
  } | null;
}

export function UserDirectory({ className }: UserDirectoryProps) {
  const { searchUsers, calculateLevel } = useUserProfile();
  const [users, setUsers] = useState<UserCard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>('all');

  // Buscar usuários iniciais
  useEffect(() => {
    const loadInitialUsers = async () => {
      setLoading(true);
      const results = await searchUsers('', 20);
      setUsers(results);
      setLoading(false);
    };

    loadInitialUsers();
  }, [searchUsers]);

  // Buscar usuários com base na query
  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) return;
    
    setLoading(true);
    const results = await searchUsers(searchQuery, 20);
    setUsers(results);
    setLoading(false);
  };

  // Filtrar usuários por nível
  const filteredUsers = users.filter(user => {
    if (filterLevel === 'all') return true;
    return user.skill_level === filterLevel;
  });

  const getSkillLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner': return 'Iniciante';
      case 'intermediate': return 'Intermediário';
      case 'advanced': return 'Avançado';
      default: return level;
    }
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Diretório de Estudantes</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barra de Pesquisa e Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar estudantes por nome ou bio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              Buscar
            </Button>
          </div>

          {/* Filtros */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500">Filtrar por nível:</span>
            <div className="flex space-x-2">
              {[
                { value: 'all', label: 'Todos' },
                { value: 'beginner', label: 'Iniciante' },
                { value: 'intermediate', label: 'Intermediário' },
                { value: 'advanced', label: 'Avançado' }
              ].map((filter) => (
                <Button
                  key={filter.value}
                  variant={filterLevel === filter.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterLevel(filter.value)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Lista de Usuários */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <Dialog key={user.id}>
                  <DialogTrigger asChild>
                    <div className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.avatar_url || ''} />
                        <AvatarFallback>
                          {user.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold truncate">
                            {user.full_name || 'Usuário'}
                          </h3>
                          <Badge 
                            variant="secondary" 
                            className={getSkillLevelColor(user.skill_level)}
                          >
                            {getSkillLevelLabel(user.skill_level)}
                          </Badge>
                          {user.user_stats && (
                            <Badge variant="outline">
                              Nível {calculateLevel(user.user_stats.total_xp)}
                            </Badge>
                          )}
                        </div>
                        
                        {user.bio && (
                          <p className="text-sm text-gray-600 truncate mb-2">
                            {user.bio}
                          </p>
                        )}
                        
                        {user.user_stats && (
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Trophy className="w-3 h-3" />
                              <span>{user.user_stats.total_xp} XP</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <BookOpen className="w-3 h-3" />
                              <span>{user.user_stats.courses_completed} cursos</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3" />
                              <span>{user.user_stats.social_points} pontos sociais</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <Button variant="outline" size="sm">
                        Ver Perfil
                      </Button>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <PublicProfile 
                      userId={user.user_id} 
                      onClose={() => setSelectedUser(null)}
                    />
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchQuery ? 'Nenhum usuário encontrado' : 'Nenhum usuário disponível'}
              </p>
              {searchQuery && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('');
                    setFilterLevel('all');
                  }}
                  className="mt-2"
                >
                  Limpar Filtros
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}