// Esquads Academy - Hook para Sistema de Simulações
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type {
  SimulationQuestion,
  SimulationSession,
  SessionAnswer,
  Certification,
  SimulationConfig,
  SimulationResult,
  UserSimulationStats,
  CertificationProgress,
  SimulationFilters,
  ActiveQuestion,
  UserAnswer,
  SessionStats,
  SIMULATION_CONSTANTS
} from '@/types/simulations';

export const useSimulations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar certificações disponíveis
  const {
    data: certifications = [],
    isLoading: certificationsLoading,
    error: certificationsError
  } = useQuery({
    queryKey: ['certifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('simulation_configs')
        .select('*')
        .order('certification');
      
      if (error) throw error;
      return data as Certification[];
    }
  });

  // Buscar sessões do usuário
  const {
    data: userSessions = [],
    isLoading: sessionsLoading,
    error: sessionsError
  } = useQuery({
    queryKey: ['simulation-sessions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('simulation_attempts')
        .select(`
          *,
          generated_simulations (*)
        `)
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Buscar estatísticas do usuário
  const {
    data: userStats,
    isLoading: statsLoading,
    error: statsError
  } = useQuery({
    queryKey: ['user-simulation-stats', user?.id],
    queryFn: async (): Promise<UserSimulationStats> => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Buscar todas as tentativas do usuário
      const { data: sessions, error: sessionsError } = await supabase
        .from('simulation_attempts')
        .select(`
          *,
          generated_simulations (certification, difficulty)
        `)
        .eq('user_id', user.id);
      
      if (sessionsError) throw sessionsError;
      
      const completedSessions = sessions?.filter(s => s.status === 'completed') || [];
      const totalSessions = sessions?.length || 0;
      
      // Calcular estatísticas
      const averageScore = completedSessions.length > 0
        ? completedSessions.reduce((sum, s) => sum + (s.score_percentage || 0), 0) / completedSessions.length
        : 0;
      
      const bestScore = completedSessions.length > 0
        ? Math.max(...completedSessions.map(s => s.score_percentage || 0))
        : 0;
      
      const totalTimeSpent = completedSessions.reduce((sum, s) => sum + (s.time_spent || 0), 0);
      
      // Performance por certificação
      const performanceByCertification: Record<string, any> = {};
      completedSessions.forEach(session => {
        const certName = session.certifications?.name || 'Unknown';
        if (!performanceByCertification[certName]) {
          performanceByCertification[certName] = {
            attempts: 0,
            best_score: 0,
            total_score: 0,
            passed: false,
            last_attempt: session.completed_at
          };
        }
        
        const cert = performanceByCertification[certName];
        cert.attempts++;
        cert.total_score += session.score_percentage || 0;
        cert.best_score = Math.max(cert.best_score, session.score_percentage || 0);
        cert.passed = cert.passed || (session.score_percentage || 0) >= 70;
        if (session.completed_at && session.completed_at > cert.last_attempt) {
          cert.last_attempt = session.completed_at;
        }
      });
      
      // Calcular média por certificação
      Object.keys(performanceByCertification).forEach(cert => {
        const data = performanceByCertification[cert];
        data.average_score = data.total_score / data.attempts;
        delete data.total_score;
      });
      
      // Sessões recentes
      const recentSessions = completedSessions
        .slice(0, 5)
        .map(session => ({
          session_id: session.id,
          certification_name: session.certifications?.name || 'Unknown',
          score: session.score_percentage || 0,
          passed: (session.score_percentage || 0) >= 70,
          completed_at: session.completed_at || ''
        }));
      
      return {
        total_sessions: totalSessions,
        completed_sessions: completedSessions.length,
        average_score: Math.round(averageScore),
        best_score: Math.round(bestScore),
        total_time_spent: totalTimeSpent,
        certifications_attempted: Object.keys(performanceByCertification).length,
        certifications_passed: Object.values(performanceByCertification).filter((cert: any) => cert.passed).length,
        current_streak: 0, // TODO: Implementar cálculo de streak
        longest_streak: 0, // TODO: Implementar cálculo de streak
        performance_by_certification: performanceByCertification,
        recent_sessions: recentSessions
      };
    },
    enabled: !!user?.id
  });

  // Buscar progresso em certificações
  const {
    data: certificationProgress = [],
    isLoading: progressLoading,
    error: progressError
  } = useQuery({
    queryKey: ['certification-progress', user?.id],
    queryFn: async (): Promise<CertificationProgress[]> => {
      if (!user?.id) return [];
      
      const { data: certifications, error: certsError } = await supabase
        .from('simulation_configs')
        .select('*');
      
      if (certsError) throw certsError;
      
      const progress: CertificationProgress[] = [];
      
      for (const cert of certifications || []) {
        // Buscar questões disponíveis para esta certificação
        const { data: questions, error: questionsError } = await supabase
          .from('certification_questions')
          .select('id, topic, difficulty')
          .eq('certification', cert.certification)
          .eq('status', 'approved');
        
        if (questionsError) continue;
        
        // Buscar sessões do usuário para esta certificação
        const { data: sessions, error: sessionsError } = await supabase
          .from('simulation_attempts')
          .select('*')
          .eq('user_id', user.id)
          .eq('simulation_id', cert.id)
          .eq('completed_at', null);
        
        if (sessionsError) continue;
        
        const totalQuestions = questions?.length || 0;
        const attempts = sessions?.length || 0;
        const averageScore = attempts > 0
          ? sessions!.reduce((sum, s) => sum + (s.score || 0), 0) / attempts
          : 0;
        const bestScore = attempts > 0
          ? Math.max(...sessions!.map(s => s.score || 0))
          : 0;
        const passed = bestScore >= 70;
        
        // Calcular nível de maestria
        let masteryLevel: 'novice' | 'apprentice' | 'practitioner' | 'expert' | 'master' = 'novice';
        if (bestScore >= 95) masteryLevel = 'master';
        else if (bestScore >= 80) masteryLevel = 'expert';
        else if (bestScore >= 60) masteryLevel = 'practitioner';
        else if (bestScore >= 40) masteryLevel = 'apprentice';
        
        // Progresso por tópicos (simplificado)
        const topicsProgress: Record<string, any> = {};
        questions?.forEach(q => {
          if (!topicsProgress[q.topic]) {
            topicsProgress[q.topic] = {
              total_questions: 0,
              practiced_questions: 0,
              average_score: 0,
              mastery_percentage: 0
            };
          }
          topicsProgress[q.topic].total_questions++;
        });
        
        progress.push({
          certification_id: cert.id,
          certification_name: cert.name,
          description: cert.description || '',
          total_questions_available: totalQuestions,
          questions_practiced: attempts * 65, // Estimativa baseada em questões por simulação
          average_score: Math.round(averageScore),
          best_score: Math.round(bestScore),
          attempts,
          passed,
          mastery_level: masteryLevel,
          topics_progress: topicsProgress,
          recommended_study_time: Math.max(10 - attempts, 0), // Horas recomendadas
          estimated_readiness: Math.min(bestScore + 10, 100), // Estimativa de prontidão
          weak_areas: [], // TODO: Implementar análise de áreas fracas
          strong_areas: [], // TODO: Implementar análise de áreas fortes
          next_milestone: {
            description: passed ? 'Manter maestria' : 'Atingir nota de aprovação',
            questions_needed: Math.max(100 - (attempts * 65), 0),
            score_needed: Math.max(70 - bestScore, 0)
          }
        });
      }
      
      return progress;
    },
    enabled: !!user?.id
  });

  // Iniciar nova simulação
  const startSimulationMutation = useMutation({
    mutationFn: async (config: SimulationConfig) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Buscar questões para a simulação
      const { data: allQuestions, error: questionsError } = await supabase
        .from('certification_questions')
        .select('*')
        .eq('certification', config.certification)
        .eq('status', 'approved');
      
      if (questionsError) throw questionsError;
      if (!allQuestions || allQuestions.length < config.total_questions) {
        throw new Error('Não há questões suficientes para esta simulação');
      }
      
      // Selecionar questões baseado na distribuição de dificuldade
      const questionsByDifficulty = {
        easy: allQuestions.filter(q => q.difficulty === 'easy'),
        medium: allQuestions.filter(q => q.difficulty === 'medium'),
        hard: allQuestions.filter(q => q.difficulty === 'hard')
      };
      
      const selectedQuestions: any[] = [];
      const distribution = config.difficulty_distribution;
      
      // Selecionar questões por dificuldade
      const easyCount = Math.floor(config.total_questions * distribution.easy / 100);
      const mediumCount = Math.floor(config.total_questions * distribution.medium / 100);
      const hardCount = config.total_questions - easyCount - mediumCount;
      
      // Embaralhar e selecionar questões
      const shuffleArray = (array: any[]) => array.sort(() => Math.random() - 0.5);
      
      selectedQuestions.push(...shuffleArray(questionsByDifficulty.easy).slice(0, easyCount));
      selectedQuestions.push(...shuffleArray(questionsByDifficulty.medium).slice(0, mediumCount));
      selectedQuestions.push(...shuffleArray(questionsByDifficulty.hard).slice(0, hardCount));
      
      if (config.randomize_questions) {
        shuffleArray(selectedQuestions);
      }
      
      // Criar sessão de simulação
      const { data: session, error: sessionError } = await supabase
        .from('simulation_sessions')
        .insert({
          user_id: user.id,
          certification_id: config.certification_id,
          total_questions: config.total_questions,
          time_limit: config.time_limit * 60, // converter para segundos
          status: 'active',
          questions_data: selectedQuestions.map(q => q.id)
        })
        .select()
        .single();
      
      if (sessionError) throw sessionError;
      
      return {
        session,
        questions: selectedQuestions.map(q => ({
          id: q.id,
          question_text: q.question_text,
          options: config.randomize_options ? shuffleArray([...q.options]) : q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          difficulty: q.difficulty,
          topic: q.topic,
          certification_id: q.certification_id,
          time_limit: q.time_limit
        })) as ActiveQuestion[]
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulation-sessions'] });
      toast.success('Simulação iniciada com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao iniciar simulação: ${error.message}`);
    }
  });

  // Responder questão
  const answerQuestionMutation = useMutation({
    mutationFn: async ({ sessionId, answer }: { sessionId: string; answer: UserAnswer }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('session_answers')
        .insert({
          session_id: sessionId,
          question_id: answer.question_id,
          selected_option: answer.selected_option,
          is_correct: answer.is_correct,
          time_spent: answer.time_spent
        });
      
      if (error) throw error;
      
      return answer;
    },
    onError: (error) => {
      toast.error(`Erro ao salvar resposta: ${error.message}`);
    }
  });

  // Finalizar simulação
  const finishSimulationMutation = useMutation({
    mutationFn: async (sessionId: string): Promise<SimulationResult> => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Buscar sessão e respostas
      const { data: session, error: sessionError } = await supabase
        .from('simulation_attempts')
        .select(`
          *,
          generated_simulations (certification, question_count)
        `)
        .eq('id', sessionId)
        .single();
      
      if (sessionError) throw sessionError;
      
      const { data: answers, error: answersError } = await supabase
        .from('simulation_attempts')
        .select('answers')
        .eq('id', sessionId)
        .single();
      
      if (answersError) throw answersError;
      
      // Calcular resultados
      const totalQuestions = session.generated_simulations?.question_count || 0;
      const correctAnswers = answers?.answers ? Object.keys(answers.answers).length : 0;
      const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);
      const passed = scorePercentage >= 70;
      const timeSpent = session.time_spent || 0;
      
      // Atualizar sessão
      const { error: updateError } = await supabase
        .from('simulation_attempts')
        .update({
          score: scorePercentage,
          time_spent: timeSpent,
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId);
      
      if (updateError) throw updateError;
      
      // Preparar resultado detalhado
      const detailedResults = {
        questions: session.generated_simulations?.questions || [],
        answers: answers?.answers || {},
        score: scorePercentage,
        passed,
        timeSpent,
        certification: session.generated_simulations?.certification || 'Unknown'
      };
      
      // Calcular performance por tópico e dificuldade
      const topicStats: Record<string, { total: number; correct: number }> = {};
      const difficultyStats = { easy: { total: 0, correct: 0 }, medium: { total: 0, correct: 0 }, hard: { total: 0, correct: 0 } };
      
      answers?.forEach(answer => {
        const topic = answer.simulation_questions?.topic || 'Unknown';
        const difficulty = answer.simulation_questions?.difficulty as 'easy' | 'medium' | 'hard' || 'easy';
        
        if (!topicStats[topic]) {
          topicStats[topic] = { total: 0, correct: 0 };
        }
        
        topicStats[topic].total++;
        difficultyStats[difficulty].total++;
        
        if (answer.is_correct) {
          topicStats[topic].correct++;
          difficultyStats[difficulty].correct++;
        }
      });
      
      // Converter para formato final
      detailedResults.performance_by_topic = Object.entries(topicStats).reduce((acc, [topic, stats]) => {
        acc[topic] = {
          total: stats.total,
          correct: stats.correct,
          percentage: Math.round((stats.correct / stats.total) * 100)
        };
        return acc;
      }, {} as Record<string, { total: number; correct: number; percentage: number }>);
      
      Object.entries(difficultyStats).forEach(([difficulty, stats]) => {
        const key = difficulty as keyof typeof detailedResults.performance_by_difficulty;
        detailedResults.performance_by_difficulty[key] = {
          total: stats.total,
          correct: stats.correct,
          percentage: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
        };
      });
      
      return {
        session_id: sessionId,
        certification_id: session.certification_id,
        certification_name: session.certifications?.name || 'Unknown',
        score_percentage: scorePercentage,
        passed,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        time_spent: timeSpent,
        completed_at: session.completed_at || new Date().toISOString(),
        detailed_results: detailedResults,
        recommendations: [], // TODO: Implementar recomendações baseadas em IA
        next_steps: [] // TODO: Implementar próximos passos
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['simulation-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['user-simulation-stats'] });
      queryClient.invalidateQueries({ queryKey: ['certification-progress'] });
      
      if (result.passed) {
        toast.success(`Parabéns! Você passou na simulação com ${result.score_percentage}%!`);
      } else {
        toast.info(`Simulação concluída. Pontuação: ${result.score_percentage}%`);
      }
    },
    onError: (error) => {
      toast.error(`Erro ao finalizar simulação: ${error.message}`);
    }
  });

  // Função utilitária para filtrar certificações
  const filterCertifications = (filters: SimulationFilters) => {
    return certifications.filter(cert => {
      if (filters.search && !cert.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      return true;
    });
  };

  // Função utilitária para obter sessão ativa
  const getActiveSession = () => {
    return userSessions.find(session => session.status === 'active');
  };

  return {
    // Dados
    certifications,
    userSessions,
    userStats,
    certificationProgress,
    
    // Estados de loading
    certificationsLoading,
    sessionsLoading,
    statsLoading,
    progressLoading,
    
    // Erros
    certificationsError,
    sessionsError,
    statsError,
    progressError,
    
    // Mutations
    startSimulation: startSimulationMutation.mutate,
    answerQuestion: answerQuestionMutation.mutate,
    finishSimulation: finishSimulationMutation.mutate,
    
    // Estados das mutations
    isStartingSimulation: startSimulationMutation.isPending,
    isAnsweringQuestion: answerQuestionMutation.isPending,
    isFinishingSimulation: finishSimulationMutation.isPending,
    
    // Funções utilitárias
    filterCertifications,
    getActiveSession,
    
    // Constantes
    SIMULATION_CONSTANTS
  };
};