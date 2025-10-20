/**
 * Chatbot Service with OpenAI Integration
 * Serviço de chatbot com integração OpenAI para assistência em missões
 */

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

export interface ChatbotContext {
  missionId?: string
  missionTitle?: string
  currentStep?: number
  totalSteps?: number
  userCode?: string
  lastError?: string
  objectives?: string[]
  difficulty?: string
  category?: string
}

export interface ChatbotResponse {
  message: string
  type: 'hint' | 'explanation' | 'example' | 'debug' | 'encouragement'
  suggestions?: string[]
  codeSnippet?: string
  nextSteps?: string[]
}

class ChatbotService {
  private conversationHistory: Array<{ role: 'user' | 'assistant', content: string }> = []

  /**
   * Gera resposta do chatbot usando OpenAI
   */
  async generateResponse(
    userMessage: string, 
    context: ChatbotContext = {}
  ): Promise<ChatbotResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt(context)
      const userPrompt = this.buildUserPrompt(userMessage, context)

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          ...this.conversationHistory.slice(-6), // Últimas 6 mensagens para contexto
          { role: "user", content: userPrompt }
        ],
        max_tokens: 500,
        temperature: 0.7,
      })

      const response = completion.choices[0]?.message?.content || 
        "Desculpe, não consegui processar sua mensagem. Tente novamente."

      // Adicionar à história da conversa
      this.conversationHistory.push(
        { role: "user", content: userMessage },
        { role: "assistant", content: response }
      )

      return this.parseResponse(response, userMessage, context)
    } catch (error) {
      console.error('Erro no chatbot:', error)
      return this.getFallbackResponse(userMessage, context)
    }
  }

  /**
   * Constrói o prompt do sistema baseado no contexto
   */
  private buildSystemPrompt(context: ChatbotContext): string {
    return `Você é um assistente IA especializado em cybersecurity e hacking ético, ajudando estudantes em missões práticas.

CONTEXTO DA MISSÃO:
${context.missionTitle ? `- Missão: ${context.missionTitle}` : ''}
${context.currentStep ? `- Passo atual: ${context.currentStep}/${context.totalSteps}` : ''}
${context.difficulty ? `- Dificuldade: ${context.difficulty}` : ''}
${context.category ? `- Categoria: ${context.category}` : ''}
${context.objectives ? `- Objetivos: ${context.objectives.join(', ')}` : ''}

DIRETRIZES:
1. Seja didático e encorajador
2. Forneça dicas práticas sem dar a resposta completa
3. Use linguagem técnica apropriada mas acessível
4. Foque em ensinar conceitos de segurança
5. Sugira próximos passos quando apropriado
6. Se houver código, analise e sugira melhorias
7. Mantenha respostas concisas (máximo 3 parágrafos)

TIPOS DE RESPOSTA:
- hint: Dicas para avançar
- explanation: Explicação de conceitos
- example: Exemplos práticos
- debug: Ajuda com erros
- encouragement: Motivação e encorajamento`
  }

  /**
   * Constrói o prompt do usuário com contexto adicional
   */
  private buildUserPrompt(userMessage: string, context: ChatbotContext): string {
    let prompt = `Pergunta do estudante: ${userMessage}`

    if (context.userCode) {
      prompt += `\n\nCódigo atual do estudante:\n\`\`\`\n${context.userCode}\n\`\`\``
    }

    if (context.lastError) {
      prompt += `\n\nÚltimo erro encontrado: ${context.lastError}`
    }

    return prompt
  }

  /**
   * Analisa a resposta da IA e categoriza
   */
  private parseResponse(response: string, userMessage: string, context: ChatbotContext): ChatbotResponse {
    const lowerMessage = userMessage.toLowerCase()
    const lowerResponse = response.toLowerCase()

    let type: ChatbotResponse['type'] = 'explanation'
    let suggestions: string[] = []
    let codeSnippet: string | undefined
    let nextSteps: string[] = []

    // Determinar tipo baseado na mensagem do usuário
    if (lowerMessage.includes('erro') || lowerMessage.includes('bug') || lowerMessage.includes('não funciona')) {
      type = 'debug'
      suggestions = ['Verificar sintaxe', 'Revisar lógica', 'Testar passo a passo']
    } else if (lowerMessage.includes('dica') || lowerMessage.includes('ajuda') || lowerMessage.includes('como')) {
      type = 'hint'
      suggestions = ['Ver exemplo', 'Próximo passo', 'Documentação']
    } else if (lowerMessage.includes('exemplo') || lowerMessage.includes('mostrar')) {
      type = 'example'
      suggestions = ['Adaptar código', 'Testar exemplo', 'Entender lógica']
    } else if (lowerMessage.includes('difícil') || lowerMessage.includes('complicado') || lowerMessage.includes('travado')) {
      type = 'encouragement'
      suggestions = ['Quebrar em partes', 'Revisar conceitos', 'Tentar novamente']
    }

    // Extrair código se presente
    const codeMatch = response.match(/```[\s\S]*?```/)
    if (codeMatch) {
      codeSnippet = codeMatch[0].replace(/```\w*\n?/g, '').replace(/```/g, '').trim()
    }

    // Extrair próximos passos
    const stepsMatch = response.match(/(?:próximos?\s+passos?|next\s+steps?):\s*([\s\S]*?)(?:\n\n|\n$|$)/i)
    if (stepsMatch) {
      nextSteps = stepsMatch[1]
        .split(/\n/)
        .map(step => step.replace(/^\d+\.\s*|-\s*/, '').trim())
        .filter(step => step.length > 0)
        .slice(0, 3)
    }

    return {
      message: response,
      type,
      suggestions,
      codeSnippet,
      nextSteps: nextSteps.length > 0 ? nextSteps : undefined
    }
  }

  /**
   * Resposta de fallback quando a IA falha
   */
  private getFallbackResponse(userMessage: string, context: ChatbotContext): ChatbotResponse {
    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes('erro') || lowerMessage.includes('bug')) {
      return {
        message: 'Vejo que você está enfrentando um erro. Vamos debugar juntos! Primeiro, verifique se a sintaxe está correta e se todas as variáveis estão declaradas. Pode me mostrar o código que está causando problema?',
        type: 'debug',
        suggestions: ['Verificar sintaxe', 'Revisar variáveis', 'Testar passo a passo']
      }
    }

    if (lowerMessage.includes('dica') || lowerMessage.includes('ajuda')) {
      return {
        message: 'Aqui está uma dica para você avançar: Lembre-se de que cada missão tem objetivos específicos. Foque em resolver um problema de cada vez e consulte a documentação quando necessário!',
        type: 'hint',
        suggestions: ['Ver exemplo', 'Explicar conceito', 'Próximo passo']
      }
    }

    return {
      message: 'Estou aqui para ajudar! Pode me contar mais detalhes sobre o que você está tentando fazer ou qual dificuldade está enfrentando?',
      type: 'explanation',
      suggestions: ['Descrever problema', 'Mostrar código', 'Explicar objetivo']
    }
  }

  /**
   * Limpa o histórico da conversa
   */
  clearHistory(): void {
    this.conversationHistory = []
  }

  /**
   * Inicia uma nova sessão de chat para uma missão
   */
  startMissionSession(context: ChatbotContext): void {
    this.clearHistory()
    
    // Mensagem de boas-vindas contextualizada
    const welcomeMessage = context.missionTitle 
      ? `Olá! Estou aqui para ajudar você na missão "${context.missionTitle}". Como posso ajudar você hoje?`
      : 'Olá! Sou seu assistente IA para missões de cybersecurity. Como posso ajudar você hoje?'

    this.conversationHistory.push({
      role: 'assistant',
      content: welcomeMessage
    })
  }
}

export const chatbotService = new ChatbotService()
export default chatbotService