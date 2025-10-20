import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type CompetitionType = 'weekly' | 'monthly' | 'tournament' | 'group_challenge';
export type CompetitionStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';
export type TournamentType = 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';

export interface Competition {
  id: string;
  title: string;
  description?: string;
  type: CompetitionType;
  status: CompetitionStatus;
  max_participants?: number;
  entry_fee: number;
  prize_pool: number;
  start_date: string;
  end_date: string;
  registration_deadline?: string;
  rules?: any;
  requirements?: any;
  created_by?: string;
  created_at: string;
  updated_at: string;
  participants_count?: number;
  user_participated?: boolean;
}

export interface CompetitionParticipant {
  id: string;
  competition_id: string;
  user_id: string;
  team_name?: string;
  score: number;
  rank?: number;
  status: 'registered' | 'active' | 'completed' | 'disqualified';
  joined_at: string;
  completed_at?: string;
  user_profiles?: {
    full_name: string;
    avatar_url?: string;
  };
}

export interface Tournament {
  id: string;
  title: string;
  description?: string;
  tournament_type: TournamentType;
  max_participants: number;
  entry_fee: number;
  prize_distribution?: any;
  bracket?: any;
  current_round: number;
  total_rounds?: number;
  status: CompetitionStatus;
  registration_start: string;
  registration_end: string;
  tournament_start: string;
  tournament_end?: string;
  rules?: any;
  created_by: string;
  created_at: string;
  updated_at: string;
  participants_count?: number;
  user_participated?: boolean;
}

export interface GroupChallenge {
  id: string;
  title: string;
  description?: string;
  challenge_type: 'quiz' | 'project' | 'study_time' | 'course_completion' | 'custom';
  target_value?: number;
  target_unit?: string;
  group_id?: string;
  created_by: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'cancelled';
  reward_points: number;
  created_at: string;
  updated_at: string;
  progress?: {
    current_value: number;
    completed: boolean;
    completed_at?: string;
  };
  group_name?: string;
}

export interface CreateCompetitionData {
  title: string;
  description?: string;
  type: CompetitionType;
  max_participants?: number;
  entry_fee?: number;
  prize_pool?: number;
  start_date: string;
  end_date: string;
  registration_deadline?: string;
  rules?: any;
  requirements?: any;
}

export interface CreateTournamentData {
  title: string;
  description?: string;
  tournament_type: TournamentType;
  max_participants: number;
  entry_fee?: number;
  prize_distribution?: any;
  registration_start: string;
  registration_end: string;
  tournament_start: string;
  rules?: any;
}

export function useCompetitions() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [groupChallenges, setGroupChallenges] = useState<GroupChallenge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchCompetitions = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('competitions')
        .select(`
          *,
          competition_participants(count)
        `)
        .order('start_date', { ascending: false });

      if (error) throw error;

      // Verificar participações do usuário
      let competitionsWithParticipation = data || [];
      if (user) {
        const { data: userParticipations } = await supabase
          .from('competition_participants')
          .select('competition_id')
          .eq('user_id', user.id);

        const participatedIds = new Set(userParticipations?.map(p => p.competition_id) || []);
        
        competitionsWithParticipation = (data || []).map(comp => ({
          ...comp,
          participants_count: comp.competition_participants?.[0]?.count || 0,
          user_participated: participatedIds.has(comp.id)
        }));
      }

      setCompetitions(competitionsWithParticipation);
    } catch (err) {
      console.error('Erro ao buscar competições:', err);
      setError('Erro ao carregar competições');
    } finally {
      setLoading(false);
    }
  };

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('tournaments')
        .select(`
          *,
          tournament_participants(count)
        `)
        .order('tournament_start', { ascending: false });

      if (error) throw error;

      // Verificar participações do usuário
      let tournamentsWithParticipation = data || [];
      if (user) {
        const { data: userParticipations } = await supabase
          .from('tournament_participants')
          .select('tournament_id')
          .eq('user_id', user.id);

        const participatedIds = new Set(userParticipations?.map(p => p.tournament_id) || []);
        
        tournamentsWithParticipation = (data || []).map(tournament => ({
          ...tournament,
          participants_count: tournament.tournament_participants?.[0]?.count || 0,
          user_participated: participatedIds.has(tournament.id)
        }));
      }

      setTournaments(tournamentsWithParticipation);
    } catch (err) {
      console.error('Erro ao buscar torneios:', err);
      setError('Erro ao carregar torneios');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupChallenges = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('group_challenges')
        .select(`
          *,
          study_groups!group_challenges_group_id_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Buscar progress separadamente
      const challengesWithProgress = await Promise.all(
        (data || []).map(async (challenge) => {
          const { data: progressData } = await supabase
            .from('challenge_progress')
            .select('current_value, completed, completed_at')
            .eq('challenge_id', challenge.id)
            .eq('user_id', user?.id)
            .maybeSingle();
          
          return {
            ...challenge,
            group_name: challenge.study_groups?.name,
            progress: progressData || {
              current_value: 0,
              completed: false
            }
          };
        })
      );

      setGroupChallenges(challengesWithProgress);
    } catch (err) {
      console.error('Erro ao buscar desafios em grupo:', err);
      setError('Erro ao carregar desafios em grupo');
      // Falha silenciosa - não quebra a UI
      setGroupChallenges([]);
    } finally {
      setLoading(false);
    }
  };

  const createCompetition = async (competitionData: CreateCompetitionData) => {
    if (!user) {
      setError('Usuário não autenticado');
      return null;
    }

    try {
      setError(null);

      const { data, error } = await supabase
        .from('competitions')
        .insert({
          ...competitionData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setCompetitions(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Erro ao criar competição:', err);
      setError('Erro ao criar competição');
      return null;
    }
  };

  const createTournament = async (tournamentData: CreateTournamentData) => {
    if (!user) {
      setError('Usuário não autenticado');
      return null;
    }

    try {
      setError(null);

      const { data, error } = await supabase
        .from('tournaments')
        .insert({
          ...tournamentData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setTournaments(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Erro ao criar torneio:', err);
      setError('Erro ao criar torneio');
      return null;
    }
  };

  const joinCompetition = async (competitionId: string, teamName?: string) => {
    if (!user) {
      setError('Usuário não autenticado');
      return false;
    }

    try {
      setError(null);

      const { error } = await supabase
        .from('competition_participants')
        .insert({
          competition_id: competitionId,
          user_id: user.id,
          team_name: teamName
        });

      if (error) throw error;

      // Atualizar estado local
      setCompetitions(prev => prev.map(comp => 
        comp.id === competitionId 
          ? { 
              ...comp, 
              participants_count: (comp.participants_count || 0) + 1,
              user_participated: true 
            }
          : comp
      ));

      return true;
    } catch (err) {
      console.error('Erro ao participar da competição:', err);
      setError('Erro ao participar da competição');
      return false;
    }
  };

  const joinTournament = async (tournamentId: string) => {
    if (!user) {
      setError('Usuário não autenticado');
      return false;
    }

    try {
      setError(null);

      const { error } = await supabase
        .from('tournament_participants')
        .insert({
          tournament_id: tournamentId,
          user_id: user.id
        });

      if (error) throw error;

      // Atualizar estado local
      setTournaments(prev => prev.map(tournament => 
        tournament.id === tournamentId 
          ? { 
              ...tournament, 
              participants_count: (tournament.participants_count || 0) + 1,
              user_participated: true 
            }
          : tournament
      ));

      return true;
    } catch (err) {
      console.error('Erro ao participar do torneio:', err);
      setError('Erro ao participar do torneio');
      return false;
    }
  };

  const getCompetitionParticipants = async (competitionId: string): Promise<CompetitionParticipant[]> => {
    try {
      const { data, error } = await supabase
        .from('competition_participants')
        .select(`
          *,
          user_profiles!inner(full_name, avatar_url)
        `)
        .eq('competition_id', competitionId)
        .order('score', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar participantes:', err);
      return [];
    }
  };

  const updateChallengeProgress = async (challengeId: string, currentValue: number, evidence?: string) => {
    if (!user) {
      setError('Usuário não autenticado');
      return false;
    }

    try {
      setError(null);

      const { error } = await supabase
        .from('challenge_progress')
        .upsert({
          challenge_id: challengeId,
          user_id: user.id,
          current_value: currentValue,
          evidence_url: evidence,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Atualizar estado local
      setGroupChallenges(prev => prev.map(challenge => 
        challenge.id === challengeId 
          ? { 
              ...challenge, 
              progress: {
                ...challenge.progress,
                current_value: currentValue,
                completed: challenge.target_value ? currentValue >= challenge.target_value : false
              }
            }
          : challenge
      ));

      return true;
    } catch (err) {
      console.error('Erro ao atualizar progresso:', err);
      setError('Erro ao atualizar progresso');
      return false;
    }
  };

  useEffect(() => {
    fetchCompetitions();
    fetchTournaments();
    fetchGroupChallenges();
  }, []);

  return {
    competitions,
    tournaments,
    groupChallenges,
    loading,
    error,
    fetchCompetitions,
    fetchTournaments,
    fetchGroupChallenges,
    createCompetition,
    createTournament,
    joinCompetition,
    joinTournament,
    getCompetitionParticipants,
    updateChallengeProgress
  };
}