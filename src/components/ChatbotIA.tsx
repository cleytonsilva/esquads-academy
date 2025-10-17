import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Lightbulb, Code, HelpCircle, Minimize2, Maximize2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export interface ChatMessage {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
  metadata?: {
    missionId?: string
    stepId?: string
    codeSnippet?: string
    suggestions?: string[]
    helpType?: 'hint' | 'explanation' | 'example' | 'debug'
  }
}

interface ChatbotIAProps {
  missionId?: string
  currentStep?: number
  userCode?: string
  onCodeSuggestion?: (code: string) => void
  onHintRequest?: (type: string) => void
  className?: string
  isMinimized?: boolean
  onToggleMinimize?: () => void
  onClose?: () => void
}

export const ChatbotIA: React.FC<ChatbotIAProps> = ({
  missionId,
  currentStep,
  userCode,
  onCodeSuggestion,
  onHintRequest,
  className,
  isMinimized = false,
  onToggleMinimize,
  onClose
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Olá! Sou seu assistente IA para missões. Como posso ajudar você hoje?',
      timestamp: new Date(),
      metadata: { helpType: 'explanation' }
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Simular resposta do chatbot (em produção, seria uma chamada para API)
  const generateBotResponse = async (userMessage: string): Promise<ChatMessage> => {
    setIsTyping(true)
    
    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
    
    let response = ''
    let helpType: 'hint' | 'explanation' | 'example' | 'debug' = 'explanation'
    let suggestions: string[] = []
    
    const lowerMessage = userMessage.toLowerCase()
    
    if (lowerMessage.includes('erro') || lowerMessage.includes('bug') || lowerMessage.includes('não funciona')) {
      helpType = 'debug'
      response = 'Vejo que você está enfrentando um erro. Vamos debugar juntos! Primeiro, verifique se:\n\n1. A sintaxe está correta\n2. Todas as variáveis estão declaradas\n3. Os tipos de dados estão corretos\n\nPode me mostrar o código que está causando problema?'
      suggestions = ['Verificar sintaxe', 'Revisar variáveis', 'Testar passo a passo']
    } else if (lowerMessage.includes('dica') || lowerMessage.includes('ajuda') || lowerMessage.includes('como')) {
      helpType = 'hint'
      response = 'Aqui está uma dica para você avançar:\n\n💡 Lembre-se de que cada missão tem objetivos específicos. Foque em resolver um problema de cada vez.\n\n🔍 Se estiver travado, tente quebrar o problema em partes menores.\n\n📚 Consulte a documentação quando necessário!'
      suggestions = ['Ver exemplo', 'Explicar conceito', 'Próximo passo']
    } else if (lowerMessage.includes('exemplo') || lowerMessage.includes('código')) {
      helpType = 'example'
      response = 'Aqui está um exemplo que pode ajudar:\n\n```javascript\n// Exemplo básico\nfunction exemploFuncao() {\n  console.log("Olá, mundo!");\n  return true;\n}\n```\n\nEste é um padrão comum que você pode adaptar para sua missão!'
      suggestions = ['Adaptar código', 'Ver mais exemplos', 'Explicar linha por linha']
    } else if (lowerMessage.includes('explicar') || lowerMessage.includes('entender')) {
      helpType = 'explanation'
      response = 'Vou explicar o conceito para você:\n\n📖 Este tópico envolve entender como os dados fluem através do código.\n\n🔄 Pense nisso como uma sequência de transformações, onde cada etapa modifica ou processa a informação.\n\n✨ O importante é manter a lógica clara e organizada!'
      suggestions = ['Ver exemplo prático', 'Exercício guiado', 'Conceitos relacionados']
    } else {
      response = 'Entendi sua pergunta! Vou fazer o meu melhor para ajudar.\n\n🤖 Como assistente IA, posso:\n• Dar dicas e sugestões\n• Explicar conceitos\n• Ajudar com debugging\n• Fornecer exemplos de código\n\nO que você gostaria de explorar?'
      suggestions = ['Pedir dica', 'Ver exemplo', 'Explicar conceito', 'Ajuda com erro']
    }
    
    setIsTyping(false)
    
    return {
      id: Date.now().toString(),
      type: 'bot',
      content: response,
      timestamp: new Date(),
      metadata: {
        missionId,
        stepId: currentStep?.toString(),
        helpType,
        suggestions
      }
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
      metadata: {
        missionId,
        stepId: currentStep?.toString(),
        codeSnippet: userCode
      }
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const botResponse = await generateBotResponse(userMessage.content)
      setMessages(prev => [...prev, botResponse])
    } catch (error) {
      console.error('Erro ao gerar resposta do bot:', error)
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente!',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion)
    inputRef.current?.focus()
  }

  const quickActions = [
    { icon: Lightbulb, label: 'Pedir dica', message: 'Pode me dar uma dica para esta missão?' },
    { icon: Code, label: 'Ver exemplo', message: 'Pode mostrar um exemplo de código?' },
    { icon: HelpCircle, label: 'Explicar conceito', message: 'Pode explicar este conceito?' }
  ]

  if (isMinimized) {
    return (
      <Card className={`fixed bottom-4 right-4 w-80 shadow-lg ${className}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-sm">Assistente IA</CardTitle>
              {isTyping && (
                <Badge variant="secondary" className="text-xs">
                  Digitando...
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleMinimize}
                className="h-6 w-6 p-0"
              >
                <Maximize2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={`flex flex-col h-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-100 text-blue-600">
                <Bot className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">Assistente IA</CardTitle>
              <p className="text-sm text-gray-500">
                {missionId ? `Missão ${missionId} - Passo ${currentStep || 1}` : 'Pronto para ajudar'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onToggleMinimize && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleMinimize}
                className="h-8 w-8 p-0"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            )}
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 pt-0">
        {/* Ações rápidas */}
        <div className="flex gap-2 mb-4">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleSuggestionClick(action.message)}
              className="flex items-center gap-1 text-xs"
            >
              <action.icon className="h-3 w-3" />
              {action.label}
            </Button>
          ))}
        </div>

        <Separator className="mb-4" />

        {/* Área de mensagens */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'bot' && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`max-w-[80%] ${message.type === 'user' ? 'order-first' : ''}`}>
                  <div
                    className={`rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white ml-auto'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    
                    {message.metadata?.suggestions && message.metadata.suggestions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {message.metadata.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="secondary"
                            size="sm"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="text-xs h-6"
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-400 mt-1 px-1">
                    {message.timestamp.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                {message.type === 'user' && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-green-100 text-green-600">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input de mensagem */}
        <div className="mt-4 flex gap-2">
          <Input
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua pergunta..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default ChatbotIA