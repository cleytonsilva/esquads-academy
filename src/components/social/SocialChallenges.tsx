import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Target, 
  Users, 
  Calendar, 
  Clock, 
  Star,
  Zap,
  Award,
  Plus,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SocialChallenge, ChallengeParticipant } from '@/types/social';
import { useSocialChallenges } from '@/hooks/useSocialChallenges';
import { useAuth } from '@/contexts/AuthContext';
import { CreateChallengeDialog } from './CreateChallengeDialog';

export function SocialChallenges() {
  const { user } = useAuth();
  const {
    activeChallenges,
    completedChallenges,
    userChallenges,
    loading,
    fetchChallenges,
    joinChallenge,
    leaveChallenge
  } = useSocialChallenges();

  const [activeTab, setActiveTab] = useState('active');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const getChallengeStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      case 'expired':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'posts':
        return <Star className="h-5 w-5" />;
      case 'likes':
        return <Trophy className="h-5 w-5" />;
      case 'comments':
        return <Users className="h-5 w-5" />;
      case 'streak':
        return <Zap className="h-5 w-5" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  const formatChallengeDescription = (challenge: SocialChallenge) => {
    const typeDescriptions = {
      posts: 'Criar posts',
      likes: 'Receber curtidas',
      comments: 'Fazer comentários',
      streak: 'Manter sequência de dias ativos'
    };

    return `${typeDescriptions[challenge.challenge_type] || 'Completar desafio'}: ${challenge.target_value}`;
  };

  const calculateProgress = (challenge: SocialChallenge, participant?: ChallengeParticipant) => {
    if (!participant) return 0;
    return Math.min((participant.current_progress / challenge.target_value) * 100, 100);
  };

  const isUserParticipating = (challenge: SocialChallenge) => {
    return challenge.participants?.some(p => p.user_id === user?.id);
  };

  const getUserParticipation = (challenge: SocialChallenge) => {
    return challenge.participants?.find(p => p.user_id === user?.id);
  };

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      await joinChallenge(challengeId);
      await fetchChallenges();
    } catch (error) {
      console.error('Erro ao participar do desafio:', error);
    }
  };

  const handleLeaveChallenge = async (challengeId: string) => {
    try {
      await leaveChallenge(challengeId);
      await fetchChallenges();
    } catch (error) {
      console.error('Erro ao sair do desafio:', error);
    }
  };

  const ChallengeCard = ({ challenge }: { challenge: SocialChallenge }) => {
    const isParticipating = isUserParticipating(challenge);
    const userParticipation = getUserParticipation(challenge);
    const progress = calculateProgress(challenge, userParticipation);
    const isExpired = new Date(challenge.end_date) < new Date();
    const isCompleted = userParticipation?.completed || false;

    return (
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getChallengeStatusColor(challenge.status)} text-white`}>
                {getChallengeIcon(challenge.challenge_type)}
              </div>
              <div>
                <CardTitle className="text-lg">{challenge.title}</CardTitle>
                <p className="text-sm text-gray-600">{challenge.description}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant={challenge.status === 'active' ? 'default' : 'secondary'}>
                {challenge.status === 'active' ? 'Ativo' : 'Finalizado'}
              </Badge>
              {challenge.reward_points > 0 && (
                <Badge variant="outline" className="text-yellow-600">
                  <Star className="h-3 w-3 mr-1" />
                  {challenge.reward_points} pts
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Challenge Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-gray-500" />
                <span>{formatChallengeDescription(challenge)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span>{challenge.participants?.length || 0} participantes</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>Até {new Date(challenge.end_date).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>
                  {isExpired 
                    ? 'Expirado' 
                    : formatDistanceToNow(new Date(challenge.end_date), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })
                  }
                </span>
              </div>
            </div>

            {/* User Progress */}
            {isParticipating && userParticipation && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Seu progresso</span>
                  <span className="font-medium">
                    {userParticipation.current_progress} / {challenge.target_value}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
                {isCompleted && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    <span>Desafio concluído!</span>
                  </div>
                )}
              </div>
            )}

            {/* Top Participants */}
            {challenge.participants && challenge.participants.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Top Participantes</h4>
                <div className="space-y-2">
                  {challenge.participants
                    .sort((a, b) => b.current_progress - a.current_progress)
                    .slice(0, 3)
                    .map((participant, index) => (
                      <div key={participant.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={participant.user?.avatar_url} />
                            <AvatarFallback className="text-xs">
                              {participant.user?.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span>{participant.user?.full_name || 'Usuário'}</span>
                          {participant.completed && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <span className="font-medium">
                          {participant.current_progress}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              {!isExpired && challenge.status === 'active' && (
                <div className="flex space-x-2">
                  {isParticipating ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleLeaveChallenge(challenge.id)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Sair do Desafio
                    </Button>
                  ) : (
                    <Button 
                      size="sm"
                      onClick={() => handleJoinChallenge(challenge.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Participar
                    </Button>
                  )}
                </div>
              )}
              
              {isCompleted && (
                <Badge variant="default" className="bg-green-500">
                  <Award className="h-3 w-3 mr-1" />
                  Concluído
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Desafios Sociais</h2>
          <p className="text-gray-600">Participe de desafios e ganhe pontos!</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Criar Desafio
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">
            Ativos ({activeChallenges.length})
          </TabsTrigger>
          <TabsTrigger value="my">
            Meus Desafios ({userChallenges.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Concluídos ({completedChallenges.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeChallenges.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-32 text-gray-500">
                <Target className="h-8 w-8 mb-2" />
                <p>Nenhum desafio ativo no momento</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeChallenges.map(challenge => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my" className="space-y-4">
          {userChallenges.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-32 text-gray-500">
                <Users className="h-8 w-8 mb-2" />
                <p>Você ainda não está participando de nenhum desafio</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {userChallenges.map(challenge => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedChallenges.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-32 text-gray-500">
                <Trophy className="h-8 w-8 mb-2" />
                <p>Nenhum desafio concluído ainda</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {completedChallenges.map(challenge => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Challenge Dialog */}
      <CreateChallengeDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onChallengeCreated={() => {
          fetchChallenges();
          setShowCreateDialog(false);
        }}
      />
    </div>
  );
}