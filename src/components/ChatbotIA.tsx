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
import { chatbotService, type ChatbotContext, type ChatbotResponse } from '@/services/chatbotService'

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
    helpType?: 'hint' | 'explanation' | 'example' | 'debug' | 'encouragement'
    nextSteps?: string[]
  }
}

interface ChatbotIAProps {
  missionId?: string
  missionTitle?: string
  currentStep?: number
  totalSteps?: number
  userCode?: string
  lastError?: string
  objectives?: string[]
  difficulty?: string
  category?: string
  onCodeSuggestion?: (code: string) => void
  onHintRequest?: (type: string) => void
  className?: string
  isMinimized?: boolean
  onToggleMinimize?: () => void
  onClose?: () => void
}

export const ChatbotIA: React.FC<ChatbotIAProps> = ({
  missionId,
  missionTitle,
  currentStep,
  totalSteps,
  userCode,
  lastError,
  objectives,
  difficulty,
  category,
  onCodeSuggestion,
  onHintRequest,
  className,
  isMinimized = false,
  onToggleMinimize,
  onClose
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Inicializar sessão do chatbot quando o componente monta
  useEffect(() => {
    const context: ChatbotContext = {
      missionId,
      missionTitle,
      currentStep,
      totalSteps,
      objectives,
      difficulty,
      category
    }
    
    chatbotService.startMissionSession(context)
    
    // Adicionar mensagem de boas-vindas
    const welcomeMessage: ChatMessage = {
      id: '1',
      type: 'bot',
      content: missionTitle 
        ? `Olá! Estou aqui para ajudar você na missão "${missionTitle}". Como posso ajudar você hoje?`
        : 'Olá! Sou seu assistente IA para missões de cybersecurity. Como posso ajudar você hoje?',
      timestamp: new Date(),
      metadata: { helpType: 'explanation' }
    }
    
    setMessages([welcomeMessage])
  }, [missionId, missionTitle])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Gerar resposta usando OpenAI
  const generateBotResponse = async (userMessage: string): Promise<ChatMessage> => {
    setIsTyping(true)
    
    try {
      const context: ChatbotContext = {
        missionId,
        missionTitle,
        currentStep,
        totalSteps,
        userCode,
        lastError,
        objectives,
        difficulty,
        category
      }

      const response: ChatbotResponse = await chatbotService.generateResponse(userMessage, context)
      
      setIsTyping(false)
      
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: response.message,
        timestamp: new Date(),
        metadata: {
          missionId,
          stepId: currentStep?.toString(),
          helpType: response.type,
          suggestions: response.suggestions,
          codeSnippet: response.codeSnippet,
          nextSteps: response.nextSteps
        }
      }
    } catch (error) {
      console.error('Erro ao gerar resposta do chatbot:', error)
      setIsTyping(false)
      
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente em alguns instantes.',
        timestamp: new Date(),
        metadata: {
          helpType: 'explanation'
        }
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
      console.error('Erro ao enviar mensagem:', error)
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

  const handleCodeSuggestion = (code: string) => {
    if (onCodeSuggestion) {
      onCodeSuggestion(code)
    }
  }

  const getHelpTypeIcon = (type?: string) => {
    switch (type) {
      case 'hint':
        return <Lightbulb className="h-4 w-4 text-yellow-500" />
      case 'example':
        return <Code className="h-4 w-4 text-blue-500" />
      case 'debug':
        return <HelpCircle className="h-4 w-4 text-red-500" />
      case 'encouragement':
        return <Bot className="h-4 w-4 text-green-500" />
      default:
        return <Bot className="h-4 w-4 text-gray-500" />
    }
  }

  const getHelpTypeBadge = (type?: string) => {
    switch (type) {
      case 'hint':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Dica</Badge>
      case 'example':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Exemplo</Badge>
      case 'debug':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Debug</Badge>
      case 'encouragement':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Motivação</Badge>
      default:
        return <Badge variant="secondary">Explicação</Badge>
    }
  }

  if (isMinimized) {
    return (
      <Card className={`fixed bottom-4 right-4 w-80 shadow-lg ${className}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Assistente IA
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleMinimize}
                className="h-6 w-6 p-0"
              >
                <Maximize2 className="h-3 w-3" />
              </Button>
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={`fixed bottom-4 right-4 w-96 h-[600px] shadow-lg flex flex-col ${className}`}>
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Assistente IA
            {missionTitle && (
              <Badge variant="outline" className="text-xs">
                {missionTitle}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMinimize}
              className="h-6 w-6 p-0"
            >
              <Minimize2 className="h-3 w-3" />
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        {currentStep && totalSteps && (
          <div className="text-xs text-muted-foreground">
            Passo {currentStep} de {totalSteps}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 pt-0">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.type === 'bot' && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-blue-100">
                      {getHelpTypeIcon(message.metadata?.helpType)}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white ml-auto'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.type === 'bot' && message.metadata?.helpType && (
                    <div className="mb-2">
                      {getHelpTypeBadge(message.metadata.helpType)}
                    </div>
                  )}
                  
                  <div className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </div>
                  
                  {message.metadata?.codeSnippet && (
                    <div className="mt-2 p-2 bg-gray-800 text-green-400 rounded text-xs font-mono overflow-x-auto">
                      <pre>{message.metadata.codeSnippet}</pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCodeSuggestion(message.metadata!.codeSnippet!)}
                        className="mt-1 h-6 text-xs text-green-400 hover:text-green-300"
                      >
                        Usar código
                      </Button>
                    </div>
                  )}
                  
                  {message.metadata?.suggestions && message.metadata.suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {message.metadata.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="h-6 text-xs"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}

                  {message.metadata?.nextSteps && message.metadata.nextSteps.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs font-medium mb-1">Próximos passos:</div>
                      <ul className="text-xs space-y-1">
                        {message.metadata.nextSteps.map((step, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <span className="text-blue-500">•</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                
                {message.type === 'user' && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-blue-500 text-white">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-blue-100">
                    <Bot className="h-4 w-4 text-gray-500" />
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
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        <Separator className="my-4" />

        <div className="flex gap-2">
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

        <div className="mt-2 flex flex-wrap gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSuggestionClick('Preciso de uma dica')}
            className="h-6 text-xs"
          >
            💡 Dica
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSuggestionClick('Pode me dar um exemplo?')}
            className="h-6 text-xs"
          >
            📝 Exemplo
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSuggestionClick('Estou com um erro')}
            className="h-6 text-xs"
          >
            🐛 Debug
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSuggestionClick('Explique este conceito')}
            className="h-6 text-xs"
          >
            📚 Explicar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default ChatbotIA