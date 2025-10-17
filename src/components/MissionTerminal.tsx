import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Terminal, 
  Play, 
  Square, 
  RotateCcw, 
  Save, 
  Upload, 
  Download,
  MessageCircle,
  Send,
  Bot,
  User,
  CheckCircle,
  AlertCircle,
  Info,
  Code,
  FileText,
  Settings,
  Maximize2,
  Minimize2,
  X,
  Lightbulb,
  Target,
  Clock,
  Trophy
} from 'lucide-react'

interface MissionTerminalProps {
  mission: any
  isOpen: boolean
  onClose: () => void
  onSubmitCode: (code: string) => Promise<any>
  onRunCode: (code: string) => Promise<any>
  onSendMessage: (message: string) => Promise<string>
}

interface ChatMessage {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
}

interface TerminalOutput {
  id: string
  type: 'output' | 'error' | 'info'
  content: string
  timestamp: Date
}

export default function MissionTerminal({ 
  mission, 
  isOpen, 
  onClose, 
  onSubmitCode, 
  onRunCode,
  onSendMessage 
}: MissionTerminalProps) {
  const [code, setCode] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [terminalOutput, setTerminalOutput] = useState<TerminalOutput[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('code')
  const [isMaximized, setIsMaximized] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  
  const terminalRef = useRef<HTMLDivElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  const codeEditorRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (mission) {
      // Inicializar com código template se disponível
      if (mission.template_code) {
        setCode(mission.template_code)
      }
      
      // Adicionar mensagem de boas-vindas do chatbot
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: `Olá! Eu sou seu assistente IA para a missão "${mission.title}". Estou aqui para ajudar você com dicas, explicações e resolver dúvidas. Como posso ajudar?`,
        timestamp: new Date()
      }
      setChatMessages([welcomeMessage])
    }
  }, [mission])

  useEffect(() => {
    // Auto-scroll do terminal
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [terminalOutput])

  useEffect(() => {
    // Auto-scroll do chat
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [chatMessages])

  const addTerminalOutput = (content: string, type: 'output' | 'error' | 'info' = 'output') => {
    const output: TerminalOutput = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    }
    setTerminalOutput(prev => [...prev, output])
  }

  const handleRunCode = async () => {
    if (!code.trim()) {
      addTerminalOutput('Erro: Nenhum código para executar', 'error')
      return
    }

    setIsRunning(true)
    addTerminalOutput(`> Executando código...`, 'info')

    try {
      const result = await onRunCode(code)
      
      if (result.success) {
        addTerminalOutput(result.output || 'Código executado com sucesso!', 'output')
        
        if (result.validation) {
          addTerminalOutput(`✓ Validação: ${result.validation.message}`, 'info')
          
          if (result.validation.passed) {
            setCurrentStep(prev => Math.min(prev + 1, mission.steps?.length || 0))
          }
        }
      } else {
        addTerminalOutput(`Erro: ${result.error}`, 'error')
      }
    } catch (error) {
      addTerminalOutput(`Erro inesperado: ${error}`, 'error')
    } finally {
      setIsRunning(false)
    }
  }

  const handleSubmitCode = async () => {
    if (!code.trim()) {
      addTerminalOutput('Erro: Nenhum código para submeter', 'error')
      return
    }

    setIsRunning(true)
    addTerminalOutput(`> Submetendo código para avaliação...`, 'info')

    try {
      const result = await onSubmitCode(code)
      
      if (result.success) {
        addTerminalOutput('✓ Código submetido com sucesso!', 'output')
        
        if (result.score !== undefined) {
          addTerminalOutput(`Pontuação: ${result.score}/${result.maxScore}`, 'info')
        }
        
        if (result.feedback) {
          addTerminalOutput(`Feedback: ${result.feedback}`, 'info')
        }
      } else {
        addTerminalOutput(`Erro na submissão: ${result.error}`, 'error')
      }
    } catch (error) {
      addTerminalOutput(`Erro inesperado: ${error}`, 'error')
    } finally {
      setIsRunning(false)
    }
  }

  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: chatInput,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setIsChatLoading(true)

    try {
      const response = await onSendMessage(chatInput)
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response,
        timestamp: new Date()
      }
      
      setChatMessages(prev => [...prev, botMessage])
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        timestamp: new Date()
      }
      
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setIsChatLoading(false)
    }
  }

  const clearTerminal = () => {
    setTerminalOutput([])
  }

  const resetCode = () => {
    setCode(mission?.template_code || '')
  }

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${mission?.title || 'mission'}_code.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed'
    if (stepIndex === currentStep) return 'current'
    return 'pending'
  }

  if (!isOpen || !mission) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`${isMaximized ? 'max-w-[95vw] h-[95vh]' : 'max-w-6xl h-[80vh]'} p-0`}
      >
        <DialogHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <Terminal className="w-5 h-5" />
              <span>{mission.title}</span>
              <Badge variant="outline">{mission.difficulty}</Badge>
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMaximized(!isMaximized)}
              >
                {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          {mission.steps && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progresso</span>
                <span>{currentStep}/{mission.steps.length} etapas</span>
              </div>
              <Progress value={(currentStep / mission.steps.length) * 100} className="h-2" />
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar com Steps */}
          {mission.steps && (
            <div className="w-64 border-r bg-gray-50 p-4 overflow-y-auto">
              <h3 className="font-semibold mb-3 flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Etapas
              </h3>
              <div className="space-y-2">
                {mission.steps.map((step: any, index: number) => {
                  const status = getStepStatus(index)
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        status === 'completed' ? 'bg-green-50 border-green-200' :
                        status === 'current' ? 'bg-blue-50 border-blue-200' :
                        'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {status === 'completed' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : status === 'current' ? (
                          <Clock className="w-4 h-4 text-blue-600" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                        )}
                        <span className="text-sm font-medium">Etapa {index + 1}</span>
                      </div>
                      <p className="text-xs text-gray-600">{step.description}</p>
                      {step.hint && status === 'current' && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                          <Lightbulb className="w-3 h-3 inline mr-1" />
                          {step.hint}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <div className="border-b px-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="code" className="flex items-center space-x-2">
                    <Code className="w-4 h-4" />
                    <span>Editor</span>
                  </TabsTrigger>
                  <TabsTrigger value="terminal" className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4" />
                    <span>Terminal</span>
                  </TabsTrigger>
                  <TabsTrigger value="chat" className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>IA Assistant</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="code" className="flex-1 flex flex-col p-4 space-y-4">
                {/* Code Editor Toolbar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button size="sm" onClick={handleRunCode} disabled={isRunning}>
                      <Play className="w-4 h-4 mr-2" />
                      Executar
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleSubmitCode} disabled={isRunning}>
                      <Upload className="w-4 h-4 mr-2" />
                      Submeter
                    </Button>
                    <Separator orientation="vertical" className="h-6" />
                    <Button size="sm" variant="outline" onClick={resetCode}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                    <Button size="sm" variant="outline" onClick={downloadCode}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                  <Badge variant={isRunning ? "destructive" : "secondary"}>
                    {isRunning ? 'Executando...' : 'Pronto'}
                  </Badge>
                </div>

                {/* Code Editor */}
                <div className="flex-1 border rounded-lg overflow-hidden">
                  <Textarea
                    ref={codeEditorRef}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Digite seu código aqui..."
                    className="w-full h-full resize-none border-0 font-mono text-sm"
                    style={{ minHeight: '400px' }}
                  />
                </div>

                {/* Mission Description */}
                {mission.description && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        Descrição da Missão
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-gray-600">
                      {mission.description}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="terminal" className="flex-1 flex flex-col p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center">
                    <Terminal className="w-4 h-4 mr-2" />
                    Terminal de Saída
                  </h3>
                  <Button size="sm" variant="outline" onClick={clearTerminal}>
                    Limpar
                  </Button>
                </div>
                
                <ScrollArea 
                  ref={terminalRef}
                  className="flex-1 border rounded-lg bg-black text-green-400 p-4 font-mono text-sm"
                >
                  {terminalOutput.length === 0 ? (
                    <div className="text-gray-500">Terminal pronto. Execute seu código para ver a saída...</div>
                  ) : (
                    <div className="space-y-1">
                      {terminalOutput.map((output) => (
                        <div key={output.id} className="flex">
                          <span className="text-gray-500 mr-2">
                            {output.timestamp.toLocaleTimeString()}
                          </span>
                          <span className={
                            output.type === 'error' ? 'text-red-400' :
                            output.type === 'info' ? 'text-blue-400' :
                            'text-green-400'
                          }>
                            {output.content}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="chat" className="flex-1 flex flex-col p-4">
                <div className="flex items-center mb-4">
                  <h3 className="font-semibold flex items-center">
                    <Bot className="w-4 h-4 mr-2" />
                    Assistente IA
                  </h3>
                </div>

                <ScrollArea 
                  ref={chatRef}
                  className="flex-1 border rounded-lg p-4 mb-4"
                  style={{ maxHeight: '400px' }}
                >
                  <div className="space-y-4">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.type === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            {message.type === 'user' ? (
                              <User className="w-4 h-4" />
                            ) : (
                              <Bot className="w-4 h-4" />
                            )}
                            <span className="text-xs opacity-75">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    ))}
                    
                    {isChatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Bot className="w-4 h-4" />
                            <span className="text-sm">Digitando...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <div className="flex space-x-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Digite sua pergunta..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendChatMessage()}
                    disabled={isChatLoading}
                  />
                  <Button 
                    onClick={handleSendChatMessage} 
                    disabled={!chatInput.trim() || isChatLoading}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}