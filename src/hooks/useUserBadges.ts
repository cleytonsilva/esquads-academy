// Esquads Academy - Hook para gerenciar badges do usuário

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import type { Badge, UserBadge } from '@/types/gamification';

interface UserBadgeWithDetails extends UserBadge {
  badge: Badge;
}

export const useUserBadges = () => {
  const { user } = useAuth();
  const { showReward } = useNotifications();
  const [userBadges, setUserBadges] = useState<UserBadgeWithDetails[]>([]);
  const [availableBadges, setAvailableBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserBadges();
      fetchAvailableBadges();
    }
  }, [user]);

  const fetchUserBadges = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge:badges(*)
        `)
        .eq('user_id', user?.id);

      if (error) throw error;

      setUserBadges(data as UserBadgeWithDetails[] || []);
    } catch (err) {
      console.error('Erro ao buscar badges do usuário:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableBadges = async () => {
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('points_required', { ascending: true });

      if (error) throw error;

      setAvailableBadges(data as Badge[] || []);
    } catch (err) {
      console.error('Erro ao buscar badges disponíveis:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };

  const awardBadge = async (badgeId: string) => {
    if (!user) return;

    try {
      // Verificar se o usuário já possui o badge
      const existingBadge = userBadges.find(ub => ub.badge_id === badgeId);
      if (existingBadge) {
        console.log('Usuário já possui este badge');
        return;
      }

      // Inserir novo badge para o usuário
      const { data, error } = await supabase
        .from('user_badges')
        .insert({
          user_id: user.id,
          badge_id: badgeId,
          earned_at: new Date().toISOString()
        })
        .select(`
          *,
          badge:badges(*)
        `)
        .single();

      if (error) throw error;

      // Atualizar estado local
      const newBadge = data as UserBadgeWithDetails;
      setUserBadges(prev => [...prev, newBadge]);

      // Mostrar notificação de recompensa
      if (newBadge.badge) {
        showReward({
          type: 'badge',
          title: 'Badge Conquistado!',
          badge: {
            id: newBadge.badge.id,
            name: newBadge.badge.name,
            icon: newBadge.badge.icon,
            rarity: newBadge.badge.rarity
          }
        });
      }

      return newBadge;
    } catch (err) {
      console.error('Erro ao conceder badge:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };

  const checkAndAwardBadges = async (userPoints: number, completedLessons: number, completedCourses: number) => {
    if (!user) return;

    try {
      // Buscar badges que o usuário pode conquistar
      const eligibleBadges = availableBadges.filter(badge => {
        // Verificar se o usuário já possui o badge
        const alreadyHas = userBadges.some(ub => ub.badge_id === badge.id);
        if (alreadyHas) return false;

        // Verificar critérios baseados em pontos
        if (badge.points_required && userPoints >= badge.points_required) {
          return true;
        }

        // Aqui você pode adicionar mais critérios baseados em outras métricas
        // Por exemplo, badges por número de lições ou cursos completados

        return false;
      });

      // Conceder badges elegíveis
      const newBadges: UserBadgeWithDetails[] = [];
      for (const badge of eligibleBadges) {
        const awardedBadge = await awardBadge(badge.id);
        if (awardedBadge) {
          newBadges.push(awardedBadge as UserBadgeWithDetails);
        }
      }

      return newBadges;
    } catch (err) {
      console.error('Erro ao verificar e conceder badges:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };

  const getBadgesByType = (type?: string) => {
    if (!type) return userBadges;
    return userBadges.filter(ub => ub.badge.type === type);
  };

  const getUnlockedBadges = () => {
    const unlockedIds = userBadges.map(ub => ub.badge_id);
    return availableBadges.filter(badge => !unlockedIds.includes(badge.id));
  };

  const getBadgeProgress = (badgeId: string, currentPoints: number) => {
    const badge = availableBadges.find(b => b.id === badgeId);
    if (!badge || !badge.points_required) return 0;

    return Math.min((currentPoints / badge.points_required) * 100, 100);
  };

  const getNextBadge = (currentPoints: number) => {
    const unlockedBadges = getUnlockedBadges();
    const nextBadges = unlockedBadges
      .filter(badge => badge.points_required && badge.points_required > currentPoints)
      .sort((a, b) => (a.points_required || 0) - (b.points_required || 0));

    return nextBadges[0] || null;
  };

  return {
    userBadges,
    availableBadges,
    loading,
    error,
    awardBadge,
    checkAndAwardBadges,
    getBadgesByType,
    getUnlockedBadges,
    getBadgeProgress,
    getNextBadge,
    refetch: fetchUserBadges
  };
};
