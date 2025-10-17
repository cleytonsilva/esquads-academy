import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  preferences: any;
  learning_goals: string[] | null;
  skill_level: 'beginner' | 'intermediate' | 'advanced';
  role: 'admin' | 'moderator' | 'instructor' | 'student';
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  id: string;
  user_id: string;
  total_xp: number;
  level: number;
  streak_days: number;
  total_study_time: number;
  courses_completed: number;
  lessons_completed: number;
  achievements_count: number;
  social_points: number;
  posts_count: number;
  comments_count: number;
  likes_received: number;
  groups_joined: number;
  skill_xp: any;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export interface PublicUserProfile extends UserProfile {
  stats: UserStats;
  achievements: any[];
  recent_courses: any[];
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar perfil do usuário atual
  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (statsError) throw statsError;

      setProfile(profileData);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Buscar perfil público de outro usuário
  const fetchPublicProfile = async (userId: string): Promise<PublicUserProfile | null> => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;

      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (statsError) throw statsError;

      // Buscar conquistas do usuário
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievements (
            id,
            title,
            description,
            icon,
            badge_color
          )
        `)
        .eq('user_id', userId)
        .order('earned_at', { ascending: false })
        .limit(10);

      if (achievementsError) throw achievementsError;

      // Buscar cursos recentes
      const { data: recentCoursesData, error: coursesError } = await supabase
        .from('user_progress')
        .select(`
          *,
          courses (
            id,
            title,
            thumbnail_url,
            difficulty_level
          )
        `)
        .eq('user_id', userId)
        .not('course_id', 'is', null)
        .order('last_accessed_at', { ascending: false })
        .limit(5);

      if (coursesError) throw coursesError;

      return {
        ...profileData,
        stats: statsData,
        achievements: achievementsData || [],
        recent_courses: recentCoursesData || []
      };
    } catch (err: any) {
      console.error('Erro ao buscar perfil público:', err);
      return null;
    }
  };

  // Atualizar perfil
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return false;

    try {
      setError(null);

      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      // Atualizar estado local
      if (profile) {
        setProfile({ ...profile, ...updates });
      }

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  // Atualizar estatísticas
  const updateStats = async (updates: Partial<UserStats>) => {
    if (!user) return false;

    try {
      setError(null);

      const { error } = await supabase
        .from('user_stats')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      // Atualizar estado local
      if (stats) {
        setStats({ ...stats, ...updates });
      }

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  // Calcular nível baseado no XP
  const calculateLevel = (xp: number): number => {
    return Math.floor(xp / 1000) + 1;
  };

  // Calcular XP necessário para o próximo nível
  const getXpForNextLevel = (currentXp: number): number => {
    const currentLevel = calculateLevel(currentXp);
    return currentLevel * 1000;
  };

  // Buscar usuários para o diretório social
  const searchUsers = async (query: string, limit: number = 20) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          user_stats (
            total_xp,
            level,
            social_points,
            courses_completed
          )
        `)
        .or(`full_name.ilike.%${query}%, bio.ilike.%${query}%`)
        .eq('role', 'student')
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (err: any) {
      console.error('Erro ao buscar usuários:', err);
      return [];
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    stats,
    loading,
    error,
    fetchProfile,
    fetchPublicProfile,
    updateProfile,
    updateStats,
    calculateLevel,
    getXpForNextLevel,
    searchUsers
  };
}