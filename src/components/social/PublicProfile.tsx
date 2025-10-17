import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Trophy, 
  BookOpen, 
  Clock, 
  Star, 
  MessageCircle,
  Users,
  Target,
  Calendar,
  Award
} from 'lucide-react';
import { useUserProfile, PublicUserProfile } from '@/hooks/useUserProfile';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PublicProfileProps {
  userId: string;
  onClose?: () => void;
}

export function PublicProfile({ userId, onClose }: PublicProfileProps) {
  const { fetchPublicProfile, calculateLevel, getXpForNextLevel } = useUserProfile();
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      const data = await fetchPublicProfile(userId);
      setProfile(data);
      setLoading(false);
    };

    loadProfile();
  }, [userId, fetchPublicProfile]);

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Perfil não encontrado</p>
        </CardContent>
      </Card>
    );
  }

  const currentLevel = calculateLevel(profile.stats.total_xp);
  const nextLevelXp = getXpForNextLevel(profile.stats.total_xp);
  const currentLevelXp = (currentLevel - 1) * 1000;
  const progressToNextLevel = ((profile.stats.total_xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;

  const getSkillLevel = (skill: string) => {
    return profile.stats.skill_xp?.[skill] || 0;
  };

  const formatStudyTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header do Perfil */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.avatar_url || ''} />
                <AvatarFallback className="text-2xl">
                  {profile.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                <div>
                  <h1 className="text-3xl font-bold">{profile.full_name || 'Usuário'}</h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="secondary">
                      Nível {currentLevel}
                    </Badge>
                    <Badge variant="outline">
                      {profile.skill_level === 'beginner' && 'Iniciante'}
                      {profile.skill_level === 'intermediate' && 'Intermediário'}
                      {profile.skill_level === 'advanced' && 'Avançado'}
                    </Badge>
                  </div>
                </div>
                
                {profile.bio && (
                  <p className="text-gray-600 max-w-md">{profile.bio}</p>
                )}
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Membro desde {formatDistanceToNow(new Date(profile.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
            )}
          </div>
          
          {/* Barra de Progresso do Nível */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Progresso para o Nível {currentLevel + 1}</span>
              <span>{profile.stats.total_xp} / {nextLevelXp} XP</span>
            </div>
            <Progress value={progressToNextLevel} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{profile.stats.total_xp}</div>
            <div className="text-sm text-gray-500">XP Total</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{profile.stats.courses_completed}</div>
            <div className="text-sm text-gray-500">Cursos Concluídos</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{formatStudyTime(profile.stats.total_study_time)}</div>
            <div className="text-sm text-gray-500">Tempo de Estudo</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{profile.stats.social_points}</div>
            <div className="text-sm text-gray-500">Pontos Sociais</div>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo em Abas */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          <TabsTrigger value="courses">Cursos</TabsTrigger>
          <TabsTrigger value="skills">Habilidades</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Atividade Social */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>Atividade Social</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Posts Criados</span>
                  <span className="font-semibold">{profile.stats.posts_count}</span>
                </div>
                <div className="flex justify-between">
                  <span>Comentários</span>
                  <span className="font-semibold">{profile.stats.comments_count}</span>
                </div>
                <div className="flex justify-between">
                  <span>Curtidas Recebidas</span>
                  <span className="font-semibold">{profile.stats.likes_received}</span>
                </div>
                <div className="flex justify-between">
                  <span>Grupos Participando</span>
                  <span className="font-semibold">{profile.stats.groups_joined}</span>
                </div>
              </CardContent>
            </Card>

            {/* Objetivos de Aprendizado */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Objetivos de Aprendizado</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.learning_goals && profile.learning_goals.length > 0 ? (
                  <div className="space-y-2">
                    {profile.learning_goals.map((goal, index) => (
                      <Badge key={index} variant="outline" className="mr-2 mb-2">
                        {goal}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhum objetivo definido</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Conquistas Recentes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.achievements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.achievements.map((achievement: any) => (
                    <div key={achievement.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="text-2xl">{achievement.achievements?.icon || '🏆'}</div>
                      <div>
                        <h4 className="font-semibold">{achievement.achievements?.title}</h4>
                        <p className="text-sm text-gray-500">{achievement.achievements?.description}</p>
                        <p className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(achievement.earned_at), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Nenhuma conquista ainda</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cursos Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.recent_courses.length > 0 ? (
                <div className="space-y-4">
                  {profile.recent_courses.map((course: any) => (
                    <div key={course.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <img 
                        src={course.courses?.thumbnail_url || '/placeholder-course.jpg'} 
                        alt={course.courses?.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{course.courses?.title}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{course.courses?.difficulty_level}</Badge>
                          <span className="text-sm text-gray-500">
                            {course.progress_percentage}% concluído
                          </span>
                        </div>
                        <Progress value={course.progress_percentage} className="mt-2 h-1" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Nenhum curso iniciado ainda</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Habilidades em Cibersegurança</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { key: 'cybersecurity', name: 'Cibersegurança Geral' },
                  { key: 'networking', name: 'Redes' },
                  { key: 'programming', name: 'Programação' },
                  { key: 'threat_intelligence', name: 'Inteligência de Ameaças' },
                  { key: 'incident_response', name: 'Resposta a Incidentes' },
                  { key: 'penetration_testing', name: 'Testes de Penetração' }
                ].map((skill) => {
                  const skillXp = getSkillLevel(skill.key);
                  const skillLevel = Math.floor(skillXp / 100) + 1;
                  const progressInLevel = (skillXp % 100);
                  
                  return (
                    <div key={skill.key}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{skill.name}</span>
                        <span className="text-sm text-gray-500">Nível {skillLevel} ({skillXp} XP)</span>
                      </div>
                      <Progress value={progressInLevel} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}