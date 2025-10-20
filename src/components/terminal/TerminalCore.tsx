/**
 * Terminal Core Component
 * Componente principal do terminal interativo baseado no SimulatorTerminal
 * Integra com CommandProcessor para execução de comandos
 */

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Terminal, Zap, Maximize2, Minimize2 } from 'lucide-react'
import { CommandProcessor } from './CommandProcessor'
import { TerminalOutput } from '../missions/terminal/TerminalOutput'
import { TerminalSuggestions } from '../missions/terminal/TerminalSuggestions'
import { 
  SimulationCommand,
  TerminalTheme
} from '@/types/simulations'
import { 
  TerminalState, 
  TerminalOutputLine, 
  MissionCategory 
} from '@/types/gamification'

interface TerminalCoreProps {
  // Configuração básica
  title?: string
  category?: MissionCategory | string
  currentStep?: number
  totalSteps?: number
  
  // Estado e controle
  isLoading?: boolean
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
  
  // Callbacks
  onCommandExecute?: (command: string, isCorrect: boolean, output: string, points?: number) => void
  onProgressUpdate?: (progress: any) => void
  
  // Configuração avançada
  theme?: TerminalTheme
  environmentVariables?: Record<string, string>
  availableCommands?: string[]
  initialOutput?: TerminalOutputLine[]
  
  // Estilo
  className?: string
}

export const TerminalCore: React.FC<TerminalCoreProps> = ({
  title = 'Terminal Interativo',
  category = 'Network Security',
  currentStep = 1,
  totalSteps = 5,
  isLoading = false,
  isFullscreen = false,
  onToggleFullscreen,
  onCommandExecute,
  onProgressUpdate,
  theme = TerminalTheme.Dark,
  environmentVariables = {},
  availableCommands = [],
  initialOutput = [],
  className = '',
}) => {
  // Estados do terminal
  const [terminalState, setTerminalState] = useState<TerminalState>({
    commandHistory: [],
    output: [],
    isExecuting: false,
    prompt: 'esquads@terminal:~$',
    environmentVariables,
    theme,
  })

  const [currentCommand, setCurrentCommand] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Refs
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const commandProcessor = useRef(new CommandProcessor())



  // Configurar CommandProcessor
  useEffect(() => {
    commandProcessor.current.configure({
      category: category as MissionCategory,
      availableCommands,
      environmentVariables,
    })
  }, [category, availableCommands, environmentVariables])

  // Inicializar output apenas uma vez
  useEffect(() => {
    const output = initialOutput.length > 0 ? initialOutput : [
      {
        id: '1',
        type: 'system',
        content: `Esquads Terminal v3.0 - ${title}`,
        timestamp: new Date(),
      },
      {
        id: '2',
        type: 'system',
        content: `Categoria: ${category}`,
        timestamp: new Date(),
      },
      {
        id: '3',
        type: 'system',
        content: 'Sistema inicializado. Digite "help" para ver comandos disponíveis.',
        timestamp: new Date(),
      },
      {
        id: '4',
        type: 'prompt',
        content: terminalState.prompt,
        timestamp: new Date(),
      },
    ]
    setTerminalState(prev => ({
      ...prev,
      output,
    }))
  }, []) // Executar apenas uma vez

  // Auto-scroll quando houver nova saída
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [terminalState.output])

  // Focar no input ao montar
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Obter comandos disponíveis
  const getAvailableCommands = (): string[] => {
    if (availableCommands.length > 0) {
      return availableCommands
    }
    return commandProcessor.current.getAvailableCommands()
  }

  const handleCommandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCurrentCommand(value)

    // Mostrar sugestões
    if (value.length > 0) {
      const commands = getAvailableCommands()
      const filtered = commands.filter((cmd) => 
        cmd.toLowerCase().startsWith(value.toLowerCase())
      )
      setSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }

  const executeCommand = async (command: string = currentCommand) => {
    if (!command.trim()) return

    // Atualizar estado para execução
    setTerminalState(prev => ({ ...prev, isExecuting: true }))

    const commandEntry: TerminalOutputLine = {
      id: Date.now().toString(),
      type: 'command',
      content: `${terminalState.prompt} ${command}`,
      timestamp: new Date(),
    }

    // Executar comando através do CommandProcessor
    const result = await commandProcessor.current.executeCommand(command)

    const responseEntry: TerminalOutputLine = {
      id: (Date.now() + 1).toString(),
      type: result.success ? 'success' : result.error ? 'error' : 'output',
      content: result.output,
      timestamp: new Date(),
    }

    const promptEntry: TerminalOutputLine = {
      id: (Date.now() + 2).toString(),
      type: 'prompt',
      content: terminalState.prompt,
      timestamp: new Date(),
    }

    // Atualizar estado do terminal
    const newCommand: SimulationCommand = {
      id: Date.now().toString(),
      command,
      timestamp: new Date(),
      success: result.success,
      output: result.output,
      executionTime: result.executionTime || 0,
    }

    setTerminalState(prev => ({
      ...prev,
      commandHistory: [...prev.commandHistory, newCommand],
      output: [...prev.output, commandEntry, responseEntry, promptEntry],
      isExecuting: false,
    }))

    // Limpar input e sugestões
    setCurrentCommand('')
    setShowSuggestions(false)
    setHistoryIndex(-1)

    // Notificar parent component
    if (onCommandExecute) {
      onCommandExecute(command, result.success, result.output, result.points)
    }

    // Atualizar progresso se necessário
    if (onProgressUpdate && result.success) {
      onProgressUpdate({
        command,
        points: result.points,
        timestamp: new Date(),
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand()
    } else if (e.key === 'Tab') {
      e.preventDefault()
      if (suggestions.length > 0) {
        setCurrentCommand(suggestions[0])
        setShowSuggestions(false)
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (terminalState.commandHistory.length > 0) {
        const newIndex = historyIndex < terminalState.commandHistory.length - 1 ? historyIndex + 1 : historyIndex
        setHistoryIndex(newIndex)
        const command = terminalState.commandHistory[terminalState.commandHistory.length - 1 - newIndex]
        setCurrentCommand(command.command)
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        const command = terminalState.commandHistory[terminalState.commandHistory.length - 1 - newIndex]
        setCurrentCommand(command.command)
      } else {
        setHistoryIndex(-1)
        setCurrentCommand('')
      }
    }
  }

  const selectSuggestion = (suggestion: string) => {
    setCurrentCommand(suggestion)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const clearTerminal = () => {
    const output = initialOutput.length > 0 ? initialOutput : [
      {
        id: '1',
        type: 'system',
        content: `Esquads Terminal v3.0 - ${title}`,
        timestamp: new Date(),
      },
      {
        id: '2',
        type: 'system',
        content: `Categoria: ${category}`,
        timestamp: new Date(),
      },
      {
        id: '3',
        type: 'system',
        content: 'Sistema inicializado. Digite "help" para ver comandos disponíveis.',
        timestamp: new Date(),
      },
      {
        id: '4',
        type: 'prompt',
        content: terminalState.prompt,
        timestamp: new Date(),
      },
    ]
    setTerminalState(prev => ({
      ...prev,
      output,
    }))
  }

  const quickCommands = ['help', 'clear', 'ls', 'history']

  // Aplicar tema
  const themeClasses = {
    [TerminalTheme.Dark]: 'bg-gray-900 text-green-400',
    [TerminalTheme.Light]: 'bg-white text-gray-800',
    [TerminalTheme.Matrix]: 'bg-black text-green-300',
    [TerminalTheme.Hacker]: 'bg-gray-950 text-red-400',
  }

  return (
    <div className={`${themeClasses[theme]} font-mono text-sm rounded-lg overflow-hidden h-full flex flex-col ${className}`}>
      {/* Terminal Header */}
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="text-gray-300 text-xs">{title}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Terminal className="h-4 w-4 text-gray-400" />
          {totalSteps > 0 && (
            <span className="text-xs text-gray-400">
              Passo {currentStep}/{totalSteps}
            </span>
          )}
          <Zap className="h-3 w-3 text-yellow-400" />
          {onToggleFullscreen && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onToggleFullscreen}
              className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            >
              {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </Button>
          )}
        </div>
      </div>

      {/* Terminal Content */}
      <div
        ref={terminalRef}
        className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
      >
        <TerminalOutput output={terminalState.output} />
      </div>

      {/* Suggestions */}
      <TerminalSuggestions
        suggestions={suggestions}
        onSelect={selectSuggestion}
        className={showSuggestions ? 'block' : 'hidden'}
      />

      {/* Command Input */}
      <div className="bg-gray-800 px-4 py-3 border-t border-gray-700 flex items-center space-x-2">
        <span className="text-green-400">{terminalState.prompt}</span>
        <input
          ref={inputRef}
          type="text"
          value={currentCommand}
          onChange={handleCommandChange}
          onKeyDown={handleKeyPress}
          className="flex-1 bg-transparent text-white outline-none"
          placeholder="Digite um comando..."
          disabled={isLoading || terminalState.isExecuting}
        />
        {(isLoading || terminalState.isExecuting) && (
          <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
        )}
      </div>

      {/* Quick Commands */}
      <div className="bg-gray-800 px-4 py-2 border-t border-gray-700">
        <div className="flex flex-wrap gap-2">
          {quickCommands.map((cmd) => (
            <Button
              key={cmd}
              size="sm"
              variant="ghost"
              onClick={() => cmd === 'clear' ? clearTerminal() : executeCommand(cmd)}
              disabled={isLoading || terminalState.isExecuting}
              className="h-6 px-2 text-xs text-gray-300 hover:text-white hover:bg-gray-700"
            >
              {cmd}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}