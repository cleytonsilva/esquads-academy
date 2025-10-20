/**
 * HintAgent - Agente IA para Dicas Progressivas
 * 
 * Fornece dicas em 3 níveis de progressão conforme PRD:
 * - Nível 1: Dica sutil (direcional)
 * - Nível 2: Dica direta (mais específica)
 * - Nível 3: Solução (quase completa)
 * 
 * Integra com GamificationService para penalizar uso excessivo de dicas
 */

import { supabase } from '@/integrations/supabase/client';
import { GamificationService } from './gamificationService';

export type HintLevel = 1 | 2 | 3;

export interface HintRequest {
  missionId: string;
  userId: string;
  currentCode?: string;
  errorMessage?: string;
  attemptNumber?: number;
  level: HintLevel;
}

export interface HintResponse {
  level: HintLevel;
  hint: string;
  example?: string;
  relatedConcepts?: string[];
  xpPenalty: number;
  nextLevelAvailable: boolean;
}

export interface MissionHints {
  level1: string[];
  level2: string[];
  level3: string[];
}

/**
 * Serviço de geração de dicas progressivas para missões
 */
export class HintAgent {
  private static instance: HintAgent;

  private constructor() {}

  public static getInstance(): HintAgent {
    if (!HintAgent.instance) {
      HintAgent.instance = new HintAgent();
    }
    return HintAgent.instance;
  }

  /**
   * Solicita uma dica para uma missão
   */
  async getHint(request: HintRequest): Promise<HintResponse> {
    try {
      // 1. Buscar missão e suas dicas pré-configuradas
      const { data: mission, error: missionError } = await supabase
        .from('missions')
        .select('title, description, hints, difficulty')
        .eq('id', request.missionId)
        .single();

      if (missionError || !mission) {
        throw new Error('Missão não encontrada');
      }

      // 2. Verificar quantas dicas o usuário já usou
      const { data: hintHistory } = await supabase
        .from('mission_hint_usage')
        .select('hint_level')
        .eq('user_id', request.userId)
        .eq('mission_id', request.missionId);

      const usedHints = new Set((hintHistory || []).map(h => h.hint_level));
      const hintsUsedCount = usedHints.size;

      // 3. Validar se o nível solicitado está disponível
      if (request.level > 1 && !usedHints.has(request.level - 1)) {
        return {
          level: request.level,
          hint: 'Você precisa usar a dica anterior antes de acessar esta.',
          xpPenalty: 0,
          nextLevelAvailable: false,
        };
      }

      // 4. Obter dica do nível solicitado
      const hints = this.parseMissionHints(mission.hints);
      const hint = this.selectHint(hints, request.level, request.attemptNumber || 0);

      // 5. Registrar uso da dica
      await supabase.from('mission_hint_usage').insert({
        user_id: request.userId,
        mission_id: request.missionId,
        hint_level: request.level,
        hint_text: hint.hint,
        created_at: new Date().toISOString(),
      });

      // 6. Aplicar penalidade de XP no GamificationService
      const xpPenalty = this.calculateXPPenalty(request.level, mission.difficulty);
      if (xpPenalty > 0) {
        await GamificationService.recordEvent(
          request.userId,
          'hint_used',
          {
            mission_id: request.missionId,
            hint_level: request.level,
            xp_penalty: xpPenalty,
          }
        );
      }

      // 7. Gerar exemplo de código se for nível 3
      const example = request.level === 3 ? this.generateCodeExample(mission) : undefined;

      // 8. Adicionar conceitos relacionados
      const relatedConcepts = this.extractRelatedConcepts(mission);

      return {
        level: request.level,
        hint: hint.hint,
        example,
        relatedConcepts,
        xpPenalty,
        nextLevelAvailable: request.level < 3,
      };
    } catch (error) {
      console.error('Erro ao gerar dica:', error);
      throw error;
    }
  }

  /**
   * Gera dicas contextuais baseadas no código atual do usuário
   */
  async generateContextualHint(
    missionId: string,
    userId: string,
    currentCode: string,
    errorMessage?: string
  ): Promise<string> {
    try {
      // Análise básica do código
      const codeAnalysis = this.analyzeCode(currentCode);
      
      // Buscar missão
      const { data: mission } = await supabase
        .from('missions')
        .select('title, description, validation_criteria')
        .eq('id', missionId)
        .single();

      if (!mission) {
        return 'Missão não encontrada. Por favor, recarregue a página.';
      }

      // Se houver erro, analisar o erro
      if (errorMessage) {
        return this.analyzeError(errorMessage, codeAnalysis);
      }

      // Se não houver código, dar dica inicial
      if (!currentCode.trim()) {
        return 'Comece escrevendo o código base. Lembre-se de seguir a estrutura descrita na missão.';
      }

      // Se o código está incompleto, dar dica de progressão
      if (codeAnalysis.linesOfCode < 5) {
        return 'Você está no caminho certo! Continue desenvolvendo sua solução.';
      }

      // Dica genérica baseada no progresso
      return 'Seu código está tomando forma. Verifique se atende a todos os critérios da missão.';
    } catch (error) {
      console.error('Erro ao gerar dica contextual:', error);
      return 'Não foi possível gerar uma dica contextual no momento.';
    }
  }

  /**
   * Obtém dicas pré-configuradas para uma missão
   */
  async getMissionHints(missionId: string): Promise<MissionHints> {
    const { data: mission } = await supabase
      .from('missions')
      .select('hints')
      .eq('id', missionId)
      .single();

    if (!mission || !mission.hints) {
      return this.getDefaultHints();
    }

    return this.parseMissionHints(mission.hints);
  }

  /**
   * Registra feedback do usuário sobre a dica
   */
  async ratehint(
    userId: string,
    missionId: string,
    hintLevel: HintLevel,
    wasHelpful: boolean
  ): Promise<void> {
    try {
      await supabase.from('hint_feedback').insert({
        user_id: userId,
        mission_id: missionId,
        hint_level: hintLevel,
        was_helpful: wasHelpful,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Erro ao registrar feedback da dica:', error);
    }
  }

  // ==================== MÉTODOS PRIVADOS ====================

  private parseMissionHints(hintsData: any): MissionHints {
    try {
      if (typeof hintsData === 'string') {
        hintsData = JSON.parse(hintsData);
      }

      return {
        level1: Array.isArray(hintsData.level1) ? hintsData.level1 : [hintsData.level1 || ''],
        level2: Array.isArray(hintsData.level2) ? hintsData.level2 : [hintsData.level2 || ''],
        level3: Array.isArray(hintsData.level3) ? hintsData.level3 : [hintsData.level3 || ''],
      };
    } catch (error) {
      return this.getDefaultHints();
    }
  }

  private selectHint(
    hints: MissionHints,
    level: HintLevel,
    attemptNumber: number
  ): { hint: string } {
    const levelHints = 
      level === 1 ? hints.level1 :
      level === 2 ? hints.level2 :
      hints.level3;

    if (levelHints.length === 0) {
      return { hint: this.getFallbackHint(level) };
    }

    // Rotacionar dicas se houver múltiplas
    const index = attemptNumber % levelHints.length;
    return { hint: levelHints[index] };
  }

  private calculateXPPenalty(level: HintLevel, difficulty?: string): number {
    const basePenalty = {
      1: 5,   // Dica sutil: -5 XP
      2: 10,  // Dica direta: -10 XP
      3: 20,  // Solução: -20 XP
    };

    const difficultyMultiplier = {
      easy: 0.5,
      medium: 1.0,
      hard: 1.5,
    };

    const multiplier = difficultyMultiplier[difficulty as keyof typeof difficultyMultiplier] || 1.0;
    return Math.floor(basePenalty[level] * multiplier);
  }

  private generateCodeExample(mission: any): string {
    // Aqui você pode integrar com uma IA real (OpenAI, etc)
    // Por ora, retornamos um exemplo genérico
    return `// Exemplo de estrutura para: ${mission.title}
// Adapte este código para sua solução

function solucionarMissao() {
  // 1. Inicialize as variáveis necessárias
  // 2. Implemente a lógica principal
  // 3. Retorne o resultado esperado
}

// Execute sua solução
solucionarMissao();`;
  }

  private extractRelatedConcepts(mission: any): string[] {
    // Análise simples de palavras-chave na descrição
    const keywords = [
      'variáveis', 'funções', 'loops', 'condicionais',
      'arrays', 'objetos', 'API', 'async', 'promises',
      'DOM', 'eventos', 'CSS', 'HTML', 'TypeScript'
    ];

    const description = (mission.description || '').toLowerCase();
    return keywords.filter(keyword => description.includes(keyword.toLowerCase()));
  }

  private analyzeCode(code: string): {
    linesOfCode: number;
    hasFunctions: boolean;
    hasLoops: boolean;
    hasConditionals: boolean;
  } {
    const lines = code.split('\n').filter(line => line.trim().length > 0);
    
    return {
      linesOfCode: lines.length,
      hasFunctions: /function|=>|const\s+\w+\s*=\s*\(/.test(code),
      hasLoops: /for|while|forEach|map/.test(code),
      hasConditionals: /if|else|switch|case|\?/.test(code),
    };
  }

  private analyzeError(errorMessage: string, codeAnalysis: any): string {
    const errorLower = errorMessage.toLowerCase();

    if (errorLower.includes('syntax')) {
      return 'Erro de sintaxe detectado. Verifique se você fechou todos os parênteses, chaves e colchetes corretamente.';
    }

    if (errorLower.includes('undefined') || errorLower.includes('is not defined')) {
      return 'Você está tentando usar uma variável ou função que não foi definida. Verifique a ortografia e se você declarou tudo corretamente.';
    }

    if (errorLower.includes('null') || errorLower.includes('cannot read property')) {
      return 'Você está tentando acessar uma propriedade de algo que é null ou undefined. Adicione uma verificação antes de acessar a propriedade.';
    }

    if (errorLower.includes('timeout')) {
      return 'Seu código está demorando muito para executar. Verifique se você não criou um loop infinito.';
    }

    return `Erro encontrado: ${errorMessage}. Revise a linha indicada e tente novamente.`;
  }

  private getDefaultHints(): MissionHints {
    return {
      level1: ['Comece pela estrutura básica e vá incrementando.'],
      level2: ['Implemente cada etapa por vez e teste frequentemente.'],
      level3: ['Use a estrutura fornecida como base e adapte para seu caso.'],
    };
  }

  private getFallbackHint(level: HintLevel): string {
    const fallbacks = {
      1: 'Pense no problema passo a passo. Qual seria o primeiro passo lógico?',
      2: 'Divida o problema em partes menores. Resolva cada parte separadamente.',
      3: 'Revise a documentação e exemplos similares. A solução está mais próxima do que você imagina.',
    };

    return fallbacks[level];
  }
}

// Export singleton instance
export const hintAgent = HintAgent.getInstance();
export default hintAgent;

