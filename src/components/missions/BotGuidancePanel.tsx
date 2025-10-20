/**
 * Painel de Orientação com Bot IA
 * Baseado em paineis/src/pages/mission-gameplay/components/BotGuidancePanel.jsx
 */

import React, { useState, useEffect, useRef } from 'react'
import { Bot, Lightbulb, HelpCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Mission } from '@/types/gamification'

interface Message {
  id: string
  type: 'bot' | 'user'
  content: string
  timestamp: Date
  avatar: string
}

interface BotGuidancePanelProps {
  mission: Mission
  currentStep: number
  lastCommand?: string
  commandResult?: { isCorrect: boolean; output: string }
  userProgress: number
  onHintRequest: (step: number) => void
}

export const BotGuidancePanel: React.FC<BotGuidancePanelProps> = ({
  mission,
  currentStep,
  lastCommand,
  commandResult,
  userProgress,
  onHintRequest,
}) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [showHintButton, setShowHintButton] = useState(true)
  const [hintsUsed, setHintsUsed] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mensagem de boas-vindas inicial
  useEffect(() => {
    const welcomeMessage: Message = {
      id: '1',
      type: 'bot',
      content: `Olá! Sou o CyberBot, seu assistente nesta missão de ${mission.category.replace(
        /_/g,
        ' '
      )}.\n\nVou te ajudar a completar "${mission.title}" passo a passo. Quando precisar de ajuda, é só pedir!`,
      timestamp: new Date(),
      avatar: '🤖',
    }

    setMessages([welcomeMessage])
  }, [mission])

  // Auto-scroll para o final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Reagir aos comandos executados
  useEffect(() => {
    if (lastCommand && commandResult) {
      handleCommandFeedback(lastCommand, commandResult)
    }
  }, [lastCommand, commandResult])

  const handleCommandFeedback = (
    command: string,
    result: { isCorrect: boolean; output: string }
  ) => {
    setIsTyping(true)

    setTimeout(() => {
      let feedbackMessage = ''
      const avatar = result.isCorrect ? '🎯' : '💡'

      if (result.isCorrect) {
        const encouragements = [
          'Excelente! Comando executado corretamente! 🎉',
          'Perfeito! Você está no caminho certo! ⭐',
          'Muito bem! Continue assim! 🚀',
          'Ótimo trabalho! Próximo passo desbloqueado! 💪',
        ]
        feedbackMessage = encouragements[Math.floor(Math.random() * encouragements.length)]

        if (currentStep < mission.objectives.length) {
          const nextObjective = mission.objectives[currentStep]
          if (nextObjective) {
            feedbackMessage += `\n\nAgora vamos para o próximo objetivo:\n"${nextObjective.title}"\n${nextObjective.description}`
          }
        }
      } else {
        const hints = [
          `Hmm, "${command}" não funcionou como esperado. Tente verificar a sintaxe do comando.`,
          `Esse comando não está correto. Lembre-se: você pode usar "help" para ver os comandos disponíveis.`,
          `Não foi dessa vez! Dica: verifique se o comando está relacionado à categoria ${mission.category.replace(
            /_/g,
            ' '
          )}.`,
          `Comando inválido. Que tal tentar um comando mais específico para esta missão?`,
        ]
        feedbackMessage = hints[Math.floor(Math.random() * hints.length)]
      }

      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: feedbackMessage,
        timestamp: new Date(),
        avatar,
      }

      setMessages((prev) => [...prev, newMessage])
      setIsTyping(false)
    }, 1000)
  }

  const requestHint = () => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: 'Preciso de uma dica!',
      timestamp: new Date(),
      avatar: '👤',
    }

    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)
    setShowHintButton(false)
    setHintsUsed((prev) => prev + 1)

    setTimeout(() => {
      const currentObjective = mission.objectives[currentStep - 1]
      let hintContent = ''

      if (currentObjective && mission.terminalCommands.length > 0) {
        const relevantCommand = mission.terminalCommands.find((tc) =>
          currentObjective.description.toLowerCase().includes(tc.command.toLowerCase())
        )

        if (relevantCommand && relevantCommand.hints.length > 0) {
          const hintLevel = Math.min(hintsUsed, relevantCommand.hints.length - 1)
          hintContent = relevantCommand.hints[hintLevel]
        } else {
          hintContent = `Dica: Foque no objetivo atual - "${currentObjective.title}". Revise os comandos disponíveis e pense em qual deles se relaciona com essa tarefa.`
        }
      } else {
        hintContent =
          'Continue explorando os comandos disponíveis. Você está indo bem! Use "help" para ver a lista completa.'
      }

      const hintMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: hintContent,
        timestamp: new Date(),
        avatar: '💡',
      }

      setMessages((prev) => [...prev, hintMessage])
      setIsTyping(false)

      // Re-habilitar botão de dica após 30 segundos
      setTimeout(() => setShowHintButton(true), 30000)
    }, 1500)

    onHintRequest(currentStep)
  }

  const getProgressMessage = (): string => {
    if (userProgress < 25) return 'Você está começando bem! Continue explorando.'
    if (userProgress < 50) return 'Progresso sólido! Você está pegando o jeito.'
    if (userProgress < 75) return 'Excelente progresso! Quase lá!'
    return 'Incrível! Você está dominando esta missão!'
  }

  return (
    <div className="bg-card border rounded-lg h-full flex flex-col">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 py-3 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">CyberBot</h3>
              <p className="text-xs opacity-90">Assistente de Missão</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs">Online</span>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="px-4 py-3 bg-muted border-b">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>Progresso da Missão</span>
          <span>{Math.round(userProgress)}%</span>
        </div>
        <Progress value={userProgress} className="h-2" />
        <p className="text-xs text-muted-foreground mt-1">{getProgressMessage()}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex space-x-2 max-w-[85%] ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm flex-shrink-0">
                {message.avatar}
              </div>
              <div
                className={`px-3 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex space-x-2 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm">
                🤖
              </div>
              <div className="bg-muted text-foreground px-3 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t space-y-2">
        {showHintButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={requestHint}
            disabled={isTyping}
            className="w-full"
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            Solicitar Dica {hintsUsed > 0 && `(${hintsUsed} usadas)`}
          </Button>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button variant="ghost" size="sm" className="text-xs">
            <RotateCcw className="h-3 w-3 mr-1" />
            Reiniciar
          </Button>
          <Button variant="ghost" size="sm" className="text-xs">
            <HelpCircle className="h-3 w-3 mr-1" />
            Ajuda
          </Button>
        </div>
      </div>
    </div>
  )
}

