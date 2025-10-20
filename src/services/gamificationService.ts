import { supabase } from '@/integrations/supabase/client';
import { 
  Achievement, 
  XPGain, 
  GAMIFICATION_CONSTANTS,
  AchievementType 
} from '@/types/gamification';

export class GamificationService {
  // Calcular XP baseado na dificuldade e tipo de atividade
  static calculateXP(
    baseXP: number, 
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    activityType: 'mission' | 'simulation'
  ): number {
    const difficultyMultiplier = GAMIFICATION_CONSTANTS.DIFFICULTY_MULTIPLIERS[difficulty];
    const typeMultiplier = activityType === 'mission' ? 1.0 : 0.5; // Simulações dão menos XP
    
    return Math.floor(baseXP * difficultyMultiplier * typeMultiplier);
  }

  // Verificar e conceder conquistas automáticas
  static async checkAndGrantAchievements(userId: string): Promise<Achievement[]> {
    const newAchievements: Achievement[] = [];

    try {
      // Buscar dados do usuário
      const { data: userData } = await supabase
        .from('users')
        .select('total_xp, created_at')
        .eq('id', userId)
        .single();

      if (!userData) return newAchievements;

      // Buscar conquistas existentes
      const { data: existingAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_type')
        .eq('user_id', userId);

      const existingTypes = new Set(existingAchievements?.map(a => a.achievement_type) || []);

      // Buscar estatísticas de missões
      const { data: missionStats } = await supabase
        .from('mission_attempts')
        .select('status, score, mission_id')
        .eq('user_id', userId);

      // Buscar estatísticas de simulações
      const { data: simulationStats } = await supabase
        .from('simulation_sessions')
        .select('status, score')
        .eq('user_id', userId);

      // Verificar conquista de primeira missão
      if (!existingTypes.has('first_mission') && missionStats && missionStats.length > 0) {
        const achievement = await this.grantAchievement(userId, {
          achievement_type: 'first_mission',
          achievement_name: 'Primeira Missão',
          description: 'Completou sua primeira missão!',
          metadata: { rarity: 'common' }
        });
        if (achievement) newAchievements.push(achievement);
      }

      // Verificar conquista de XP milestone
      const xpMilestones = [1000, 5000, 10000, 25000, 50000, 100000];
      for (const milestone of xpMilestones) {
        const achievementType = `xp_${milestone}`;
        if (!existingTypes.has(achievementType) && userData.total_xp >= milestone) {
          const achievement = await this.grantAchievement(userId, {
            achievement_type: achievementType,
            achievement_name: `${milestone} XP`,
            description: `Alcançou ${milestone} pontos de experiência!`,
            metadata: { 
              rarity: milestone >= 50000 ? 'legendary' : milestone >= 10000 ? 'epic' : 'rare',
              milestone 
            }
          });
          if (achievement) newAchievements.push(achievement);
        }
      }

      // Verificar conquista de pontuação perfeita
      if (!existingTypes.has('perfect_score') && missionStats) {
        const perfectScores = missionStats.filter(m => m.score === 100);
        if (perfectScores.length >= 5) {
          const achievement = await this.grantAchievement(userId, {
            achievement_type: 'perfect_score',
            achievement_name: 'Perfeccionista',
            description: 'Obteve pontuação perfeita em 5 missões!',
            metadata: { rarity: 'epic', perfect_count: perfectScores.length }
          });
          if (achievement) newAchievements.push(achievement);
        }
      }

      // Verificar conquista de mestre em simulações
      if (!existingTypes.has('simulation_master') && simulationStats) {
        const completedSimulations = simulationStats.filter(s => s.status === 'completed');
        if (completedSimulations.length >= 10) {
          const achievement = await this.grantAchievement(userId, {
            achievement_type: 'simulation_master',
            achievement_name: 'Mestre das Simulações',
            description: 'Completou 10 simulações!',
            metadata: { rarity: 'rare', simulation_count: completedSimulations.length }
          });
          if (achievement) newAchievements.push(achievement);
        }
      }

      return newAchievements;
    } catch (error) {
      console.error('Erro ao verificar conquistas:', error);
      return newAchievements;
    }
  }

  // Conceder uma conquista específica
  static async grantAchievement(
    userId: string, 
    achievementData: Omit<Achievement, 'id' | 'user_id' | 'earned_at'>
  ): Promise<Achievement | null> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          ...achievementData,
          earned_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao conceder conquista:', error);
        return null;
      }

      return data as Achievement;
    } catch (error) {
      console.error('Erro ao conceder conquista:', error);
      return null;
    }
  }

  // Processar ganho de XP e verificar conquistas
  static async processXPGain(userId: string, xpGain: XPGain): Promise<{
    newTotalXP: number;
    levelUp: boolean;
    newLevel: number;
    newAchievements: Achievement[];
  }> {
    try {
      // Buscar XP atual
      const { data: userData } = await supabase
        .from('users')
        .select('total_xp')
        .eq('id', userId)
        .single();

      if (!userData) throw new Error('Usuário não encontrado');

      const oldTotalXP = userData.total_xp;
      const newTotalXP = oldTotalXP + xpGain.amount;
      
      // Calcular níveis
      const oldLevel = Math.floor(oldTotalXP / GAMIFICATION_CONSTANTS.XP_PER_LEVEL) + 1;
      const newLevel = Math.floor(newTotalXP / GAMIFICATION_CONSTANTS.XP_PER_LEVEL) + 1;
      const levelUp = newLevel > oldLevel;

      // Atualizar XP no banco
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          total_xp: newTotalXP,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Verificar novas conquistas
      const newAchievements = await this.checkAndGrantAchievements(userId);

      // Adicionar conquista de level up se necessário
      if (levelUp) {
        const levelAchievement = await this.grantAchievement(userId, {
          achievement_type: 'level_up',
          achievement_name: `Nível ${newLevel}`,
          description: `Alcançou o nível ${newLevel}!`,
          metadata: { 
            rarity: newLevel >= 50 ? 'legendary' : newLevel >= 25 ? 'epic' : 'common',
            level: newLevel,
            previous_level: oldLevel
          }
        });
        
        if (levelAchievement) {
          newAchievements.push(levelAchievement);
        }
      }

      return {
        newTotalXP,
        levelUp,
        newLevel,
        newAchievements
      };
    } catch (error) {
      console.error('Erro ao processar ganho de XP:', error);
      throw error;
    }
  }

  // Usar uma vida
  static async useLife(userId: string): Promise<number> {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('lives_remaining, subscription_type')
        .eq('id', userId)
        .single();

      if (!userData) throw new Error('Usuário não encontrado');

      if (userData.lives_remaining <= 0) {
        throw new Error('Sem vidas disponíveis');
      }

      const newLives = userData.lives_remaining - 1;

      const { error } = await supabase
        .from('users')
        .update({ 
          lives_remaining: newLives,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      return newLives;
    } catch (error) {
      console.error('Erro ao usar vida:', error);
      throw error;
    }
  }

  // Regenerar vida
  static async regenerateLife(userId: string): Promise<number> {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('lives_remaining, subscription_type')
        .eq('id', userId)
        .single();

      if (!userData) throw new Error('Usuário não encontrado');

      const maxLives = userData.subscription_type === 'premium' 
        ? GAMIFICATION_CONSTANTS.MAX_LIVES_PREMIUM 
        : GAMIFICATION_CONSTANTS.MAX_LIVES_FREE;

      if (userData.lives_remaining >= maxLives) {
        throw new Error('Vidas já estão no máximo');
      }

      const newLives = Math.min(userData.lives_remaining + 1, maxLives);

      const { error } = await supabase
        .from('users')
        .update({ 
          lives_remaining: newLives,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      return newLives;
    } catch (error) {
      console.error('Erro ao regenerar vida:', error);
      throw error;
    }
  }

  // Atualizar progresso do usuário
  static async updateUserProgress(
    userId: string, 
    certificationId: string, 
    progressData: {
      topicScores?: Record<string, number>;
      missionsCompleted?: number;
      simulationsTaken?: number;
      masteryLevel?: number;
    }
  ): Promise<void> {
    try {
      const { data: existingProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('certification_id', certificationId)
        .single();

      if (existingProgress) {
        // Atualizar progresso existente
        const updatedData = {
          topic_scores: progressData.topicScores || existingProgress.topic_scores,
          total_missions_completed: progressData.missionsCompleted !== undefined 
            ? existingProgress.total_missions_completed + progressData.missionsCompleted
            : existingProgress.total_missions_completed,
          total_simulations_taken: progressData.simulationsTaken !== undefined
            ? existingProgress.total_simulations_taken + progressData.simulationsTaken
            : existingProgress.total_simulations_taken,
          mastery_level: progressData.masteryLevel || existingProgress.mastery_level,
          last_activity: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('user_progress')
          .update(updatedData)
          .eq('user_id', userId)
          .eq('certification_id', certificationId);

        if (error) throw error;
      } else {
        // Criar novo progresso
        const { error } = await supabase
          .from('user_progress')
          .insert({
            user_id: userId,
            certification_id: certificationId,
            topic_scores: progressData.topicScores || {},
            total_missions_completed: progressData.missionsCompleted || 0,
            total_simulations_taken: progressData.simulationsTaken || 0,
            mastery_level: progressData.masteryLevel || 0,
            last_activity: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      throw error;
    }
  }

  // Registrar evento de gamificação
  static async recordEvent(
    userId: string,
    eventType: string,
    eventData: Record<string, any>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('gamification_events')
        .insert({
          user_id: userId,
          event_type: eventType,
          event_data: eventData,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao registrar evento de gamificação:', error);
      throw error;
    }
  }
}

// Exportar função recordEvent para compatibilidade
export const recordEvent = GamificationService.recordEvent;