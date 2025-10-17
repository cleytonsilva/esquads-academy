import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Trophy, Users, Clock, Star, Target, Zap, Award } from 'lucide-react';
import { useCompetitions, Competition, Tournament, GroupChallenge, CreateCompetitionData, CreateTournamentData } from '@/hooks/useCompetitions';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const CompetitionCard: React.FC<{ competition: Competition; onJoin: (id: string, teamName?: string) => void }> = ({ 
  competition, 
  onJoin 
}) => {
  const [teamName, setTeamName] = useState('');
  const [showJoinDialog, setShowJoinDialog] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'upcoming': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-yellow-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'weekly': return <Calendar className="h-4 w-4" />;
      case 'monthly': return <Calendar className="h-4 w-4" />;
      case 'tournament': return <Trophy className="h-4 w-4" />;
      case 'group_challenge': return <Users className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const handleJoin = () => {
    if (competition.type === 'group_challenge' && !teamName.trim()) {
      toast.error('Nome da equipe é obrigatório para desafios em grupo');
      return;
    }
    onJoin(competition.id, teamName.trim() || undefined);
    setShowJoinDialog(false);
    setTeamName('');
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getTypeIcon(competition.type)}
            <div>
              <CardTitle className="text-lg">{competition.title}</CardTitle>
              <CardDescription className="mt-1">
                {competition.description}
              </CardDescription>
            </div>
          </div>
          <Badge className={getStatusColor(competition.status)}>
            {competition.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{competition.participants_count || 0} participantes</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <span>{competition.prize_pool} XP</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(competition.start_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              <span>Taxa: {competition.entry_fee} XP</span>
            </div>
          </div>

          {competition.max_participants && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Vagas preenchidas</span>
                <span>{competition.participants_count}/{competition.max_participants}</span>
              </div>
              <Progress 
                value={(competition.participants_count || 0) / competition.max_participants * 100} 
                className="h-2"
              />
            </div>
          )}

          <div className="flex gap-2">
            {competition.user_participated ? (
              <Button disabled className="flex-1">
                Já Participando
              </Button>
            ) : competition.status === 'active' || competition.status === 'upcoming' ? (
              <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
                <DialogTrigger asChild>
                  <Button className="flex-1">
                    Participar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Participar da Competição</DialogTitle>
                    <DialogDescription>
                      {competition.title}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {competition.type === 'group_challenge' && (
                      <div className="space-y-2">
                        <Label htmlFor="teamName">Nome da Equipe</Label>
                        <Input
                          id="teamName"
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          placeholder="Digite o nome da sua equipe"
                        />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button onClick={handleJoin} className="flex-1">
                        Confirmar Participação
                      </Button>
                      <Button variant="outline" onClick={() => setShowJoinDialog(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Button disabled className="flex-1">
                Encerrada
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TournamentCard: React.FC<{ tournament: Tournament; onJoin: (id: string) => void }> = ({ 
  tournament, 
  onJoin 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'upcoming': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-yellow-500';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            <div>
              <CardTitle className="text-lg">{tournament.title}</CardTitle>
              <CardDescription className="mt-1">
                {tournament.description}
              </CardDescription>
            </div>
          </div>
          <Badge className={getStatusColor(tournament.status)}>
            {tournament.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{tournament.participants_count || 0}/{tournament.max_participants}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span>{tournament.tournament_type}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(tournament.tournament_start).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              <span>Taxa: {tournament.entry_fee} XP</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Vagas preenchidas</span>
              <span>{tournament.participants_count}/{tournament.max_participants}</span>
            </div>
            <Progress 
              value={(tournament.participants_count || 0) / tournament.max_participants * 100} 
              className="h-2"
            />
          </div>

          <div className="flex gap-2">
            {tournament.user_participated ? (
              <Button disabled className="flex-1">
                Já Participando
              </Button>
            ) : tournament.status === 'upcoming' ? (
              <Button onClick={() => onJoin(tournament.id)} className="flex-1">
                Participar
              </Button>
            ) : (
              <Button disabled className="flex-1">
                {tournament.status === 'active' ? 'Em Andamento' : 'Encerrado'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const GroupChallengeCard: React.FC<{ challenge: GroupChallenge }> = ({ challenge }) => {
  const progressPercentage = challenge.target_value 
    ? (challenge.progress?.current_value || 0) / challenge.target_value * 100 
    : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            <div>
              <CardTitle className="text-lg">{challenge.title}</CardTitle>
              <CardDescription className="mt-1">
                {challenge.description}
              </CardDescription>
            </div>
          </div>
          <Badge variant={challenge.progress?.completed ? 'default' : 'secondary'}>
            {challenge.progress?.completed ? 'Concluído' : challenge.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{challenge.group_name || 'Grupo Geral'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-muted-foreground" />
              <span>{challenge.reward_points} XP</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(challenge.end_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span>{challenge.challenge_type}</span>
            </div>
          </div>

          {challenge.target_value && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso</span>
                <span>{challenge.progress?.current_value || 0}/{challenge.target_value} {challenge.target_unit}</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const CreateCompetitionDialog: React.FC<{ onCreateCompetition: (data: CreateCompetitionData) => void }> = ({ 
  onCreateCompetition 
}) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateCompetitionData>({
    title: '',
    description: '',
    type: 'weekly',
    max_participants: 50,
    entry_fee: 0,
    prize_pool: 100,
    start_date: '',
    end_date: '',
    registration_deadline: '',
    rules: {},
    requirements: {}
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.start_date || !formData.end_date) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    onCreateCompetition(formData);
    setOpen(false);
    setFormData({
      title: '',
      description: '',
      type: 'weekly',
      max_participants: 50,
      entry_fee: 0,
      prize_pool: 100,
      start_date: '',
      end_date: '',
      registration_deadline: '',
      rules: {},
      requirements: {}
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Trophy className="h-4 w-4 mr-2" />
          Criar Competição
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Nova Competição</DialogTitle>
          <DialogDescription>
            Configure uma nova competição para a comunidade
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Nome da competição"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva a competição"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="tournament">Torneio</SelectItem>
                <SelectItem value="group_challenge">Desafio em Grupo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Máx. Participantes</Label>
              <Input
                id="maxParticipants"
                type="number"
                value={formData.max_participants}
                onChange={(e) => setFormData(prev => ({ ...prev, max_participants: parseInt(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prizePool">Prêmio (XP)</Label>
              <Input
                id="prizePool"
                type="number"
                value={formData.prize_pool}
                onChange={(e) => setFormData(prev => ({ ...prev, prize_pool: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início *</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Data de Fim *</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Criar Competição
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export function Competitions() {
  const { user } = useAuth();
  const {
    competitions,
    tournaments,
    groupChallenges,
    loading,
    error,
    createCompetition,
    joinCompetition,
    joinTournament
  } = useCompetitions();

  const handleCreateCompetition = async (competitionData: CreateCompetitionData) => {
    const result = await createCompetition(competitionData);
    if (result) {
      toast.success('Competição criada com sucesso!');
    }
  };

  const handleJoinCompetition = async (competitionId: string, teamName?: string) => {
    const success = await joinCompetition(competitionId, teamName);
    if (success) {
      toast.success('Participação confirmada!');
    }
  };

  const handleJoinTournament = async (tournamentId: string) => {
    const success = await joinTournament(tournamentId);
    if (success) {
      toast.success('Participação no torneio confirmada!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando competições...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Competições &amp; Torneios</h2>
          <p className="text-muted-foreground">
            Participe de desafios e compete com outros estudantes
          </p>
        </div>
        {user && <CreateCompetitionDialog onCreateCompetition={handleCreateCompetition} />}
      </div>

      <Tabs defaultValue="competitions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="competitions">Competições</TabsTrigger>
          <TabsTrigger value="tournaments">Torneios</TabsTrigger>
          <TabsTrigger value="challenges">Desafios em Grupo</TabsTrigger>
        </TabsList>

        <TabsContent value="competitions" className="space-y-4">
          {competitions.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma competição disponível no momento</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {competitions.map((competition) => (
                <CompetitionCard
                  key={competition.id}
                  competition={competition}
                  onJoin={handleJoinCompetition}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tournaments" className="space-y-4">
          {tournaments.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum torneio disponível no momento</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tournaments.map((tournament) => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  onJoin={handleJoinTournament}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          {groupChallenges.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum desafio em grupo disponível no momento</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {groupChallenges.map((challenge) => (
                <GroupChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}