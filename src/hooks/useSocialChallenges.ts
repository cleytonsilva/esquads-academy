import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SocialChallenge, ChallengeParticipant } from '@/types/social';
import { toast } from 'sonner';

export function useSocialChallenges() {
  const { user } = useAuth();
  const [activeChallenges, setActiveChallenges] = useState<SocialChallenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<SocialChallenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<SocialChallenge[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all challenges
  const fetchChallenges = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchActiveChallenges(),
        fetchCompletedChallenges(),
        fetchUserChallenges()
      ]);
    } catch (error) {
      console.error('Erro ao buscar desafios:', error);
      toast.error('Erro ao carregar desafios');
    } finally {
      setLoading(false);
    }
  };

  // Fetch active challenges
  const fetchActiveChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('social_challenges')
        .select(`
          *,
          creator:users(id, full_name, avatar_url),
          participants:challenge_participants(
            *,
            user:users(id, full_name, avatar_url)
          )
        `)
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      setActiveChallenges(data || []);
    } catch (error) {
      console.error('Erro ao buscar desafios ativos:', error);
    }
  };

  // Fetch completed challenges
  const fetchCompletedChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('social_challenges')
        .select(`
          *,
          creator:users(id, full_name, avatar_url),
          participants:challenge_participants(
            *,
            user:users(id, full_name, avatar_url)
          )
        `)
        .eq('status', 'completed')
        .order('end_date', { ascending: false })
        .limit(10);

      if (error) throw error;

      setCompletedChallenges(data || []);
    } catch (error) {
      console.error('Erro ao buscar desafios concluídos:', error);
    }
  };

  // Fetch user's challenges
  const fetchUserChallenges = async () => {
    if (!user) return;

    try {
      // Primeiro buscar os IDs dos desafios do usuário
      const { data: participantData, error: participantError } = await supabase
        .from('challenge_participants')
        .select('challenge_id')
        .eq('user_id', user.id);

      if (participantError) throw participantError;

      const challengeIds = participantData?.map(p => p.challenge_id) || [];

      if (challengeIds.length === 0) {
        setUserChallenges([]);
        return;
      }

      // Depois buscar os desafios completos
      const { data, error } = await supabase
        .from('social_challenges')
        .select(`
          *,
          creator:users(id, full_name, avatar_url),
          participants:challenge_participants(
            *,
            user:users(id, full_name, avatar_url)
          )
        `)
        .in('id', challengeIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUserChallenges(data || []);
    } catch (error) {
      console.error('Erro ao buscar desafios do usuário:', error);
    }
  };

  // Create new challenge
  const createChallenge = async (challengeData: {
    title: string;
    description: string;
    challenge_type: string;
    target_value: number;
    end_date: string;
    reward_points: number;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('social_challenges')
        .insert({
          ...challengeData,
          creator_id: user.id,
          status: 'active'
        })
        .select(`
          *,
          creator:users(id, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      toast.success('Desafio criado com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao criar desafio:', error);
      toast.error('Erro ao criar desafio');
      throw error;
    }
  };

  // Join challenge
  const joinChallenge = async (challengeId: string) => {
    if (!user) return;

    try {
      // Check if user is already participating
      const { data: existingParticipation } = await supabase
        .from('challenge_participants')
        .select('id')
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id)
        .single();

      if (existingParticipation) {
        toast.info('Você já está participando deste desafio');
        return;
      }

      const { error } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          current_progress: 0,
          completed: false
        });

      if (error) throw error;

      toast.success('Você entrou no desafio!');
    } catch (error) {
      console.error('Erro ao participar do desafio:', error);
      toast.error('Erro ao participar do desafio');
      throw error;
    }
  };

  // Leave challenge
  const leaveChallenge = async (challengeId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('challenge_participants')
        .delete()
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Você saiu do desafio');
    } catch (error) {
      console.error('Erro ao sair do desafio:', error);
      toast.error('Erro ao sair do desafio');
      throw error;
    }
  };

  // Update challenge progress
  const updateChallengeProgress = async (challengeId: string, newProgress: number) => {
    if (!user) return;

    try {
      // Get challenge details
      const { data: challenge } = await supabase
        .from('social_challenges')
        .select('target_value, reward_points')
        .eq('id', challengeId)
        .single();

      if (!challenge) return;

      const isCompleted = newProgress >= challenge.target_value;

      const { error } = await supabase
        .from('challenge_participants')
        .update({
          current_progress: newProgress,
          completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null
        })
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id);

      if (error) throw error;

      // If challenge is completed, award points
      if (isCompleted && challenge.reward_points > 0) {
        await supabase.rpc('update_social_points', {
          p_user_id: user.id,
          p_points: challenge.reward_points,
          p_action_type: 'challenge_completed'
        });

        toast.success(`Desafio concluído! +${challenge.reward_points} pontos`);
      }
    } catch (error) {
      console.error('Erro ao atualizar progresso do desafio:', error);
    }
  };

  // Check and update user progress for all active challenges
  const checkUserProgress = async () => {
    if (!user) return;

    try {
      // Get user's active challenge participations
      const { data: participations } = await supabase
        .from('challenge_participants')
        .select(`
          *,
          challenge:social_challenges(*)
        `)
        .eq('user_id', user.id)
        .eq('completed', false);

      if (!participations) return;

      // Update progress for each challenge based on type
      for (const participation of participations) {
        const challenge = participation.challenge;
        let currentProgress = 0;

        switch (challenge.challenge_type) {
          case 'posts':
            // Count user's posts since challenge start
            const { count: postsCount } = await supabase
              .from('social_posts')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.id)
              .gte('created_at', challenge.created_at);
            currentProgress = postsCount || 0;
            break;

          case 'likes':
            // Count likes received since challenge start
            const { count: likesCount } = await supabase
              .from('social_likes')
              .select('*', { count: 'exact', head: true })
              .in('post_id', 
                supabase
                  .from('social_posts')
                  .select('id')
                  .eq('user_id', user.id)
              )
              .gte('created_at', challenge.created_at);
            currentProgress = likesCount || 0;
            break;

          case 'comments':
            // Count user's comments since challenge start
            const { count: commentsCount } = await supabase
              .from('social_comments')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.id)
              .gte('created_at', challenge.created_at);
            currentProgress = commentsCount || 0;
            break;

          case 'streak':
            // Calculate streak days (simplified)
            const daysSinceStart = Math.floor(
              (new Date().getTime() - new Date(challenge.created_at).getTime()) / 
              (1000 * 60 * 60 * 24)
            );
            currentProgress = Math.min(daysSinceStart, challenge.target_value);
            break;
        }

        // Update progress if it has changed
        if (currentProgress !== participation.current_progress) {
          await updateChallengeProgress(challenge.id, currentProgress);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar progresso dos desafios:', error);
    }
  };

  return {
    activeChallenges,
    completedChallenges,
    userChallenges,
    loading,
    fetchChallenges,
    fetchActiveChallenges,
    fetchCompletedChallenges,
    fetchUserChallenges,
    createChallenge,
    joinChallenge,
    leaveChallenge,
    updateChallengeProgress,
    checkUserProgress
  };
};