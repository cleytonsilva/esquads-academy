/**
 * Componente de Comando do Terminal
 * Baseado em paineis/src/pages/mission-gameplay/components/SimulatorTerminal.jsx
 */

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Terminal, Zap } from 'lucide-react'
import { TerminalSuggestions } from './TerminalSuggestions'
import { TerminalOutput } from './TerminalOutput'
import { 
  TerminalOutputLine, 
  MissionCategory, 
  COMMANDS_BY_CATEGORY
} from '@/types/gamification'

interface TerminalCommandProps {
  missionCategory: MissionCategory
  onCommandExecute: (command: string, isCorrect: boolean, output: string, points: number) => void
  currentStep: number
  totalSteps: number
  isLoading?: boolean
  className?: string
}

export const TerminalCommand: React.FC<TerminalCommandProps> = ({
  missionCategory,
  onCommandExecute,
  currentStep,
  totalSteps,
  isLoading = false,
  className = '',
}) => {
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [currentCommand, setCurrentCommand] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [terminalOutput, setTerminalOutput] = useState<TerminalOutputLine[]>([])
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Output inicial do terminal
  const initialOutput: TerminalOutputLine[] = [
    {
      id: '1',
      type: 'system',
      content: `Esquads Terminal v3.0 - ${missionCategory.replace(/_/g, ' ')}`,
      timestamp: new Date(),
    },
    {
      id: '2',
      type: 'system',
      content: `Categoria: ${missionCategory}`,
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
      content: 'esquads@terminal:~$',
      timestamp: new Date(),
    },
  ]

  // Comandos disponíveis por categoria
  const getAvailableCommands = (): string[] => {
    const baseCommands = ['help', 'clear', 'ls', 'cat', 'pwd', 'whoami', 'history']
    const categoryCommands = COMMANDS_BY_CATEGORY[missionCategory] || []
    return [...baseCommands, ...categoryCommands]
  }

  const availableCommands = getAvailableCommands()

  // Auto-scroll quando houver nova saída
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [terminalOutput])

  // Inicializar output
  useEffect(() => {
    setTerminalOutput(initialOutput)
  }, [missionCategory])

  // Focar no input ao montar
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleCommandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCurrentCommand(value)

    // Mostrar sugestões
    if (value.length > 0) {
      const filtered = availableCommands.filter((cmd) => 
        cmd.toLowerCase().startsWith(value.toLowerCase())
      )
      setSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }

  const executeCommand = (command: string = currentCommand) => {
    if (!command.trim()) return

    const newEntry: TerminalOutputLine = {
      id: Date.now().toString(),
      type: 'command',
      content: `esquads@terminal:~$ ${command}`,
      timestamp: new Date(),
    }

    let response = ''
    let responseType: 'output' | 'success' | 'error' | 'warning' | 'info' = 'output'
    let isCorrect = false
    let points = 0

    // Comandos especiais
    if (command.toLowerCase() === 'help') {
      response = `Comandos disponíveis para ${missionCategory}:\n\n` +
        `Básicos: ${['help', 'clear', 'ls', 'cat', 'pwd', 'whoami', 'history'].join(', ')}\n\n` +
        `Específicos: ${(COMMANDS_BY_CATEGORY[missionCategory] || []).join(', ')}\n\n` +
        `Dica: Use os comandos específicos da categoria para completar os objetivos da missão.`
      responseType = 'info'
    } else if (command.toLowerCase() === 'clear') {
      setTerminalOutput([...initialOutput])
      setCurrentCommand('')
      return
    } else if (command.toLowerCase() === 'history') {
      response = commandHistory.length > 0 
        ? commandHistory.map((cmd, index) => `${index + 1}  ${cmd}`).join('\n')
        : 'Nenhum comando executado ainda.'
      responseType = 'info'
    } else if (availableCommands.includes(command.split(' ')[0].toLowerCase())) {
      // Verificar se é um comando específico da categoria
      const categoryCommands = COMMANDS_BY_CATEGORY[missionCategory] || []
      const isCategoryCommand = categoryCommands.includes(command.split(' ')[0].toLowerCase())
      
      if (isCategoryCommand) {
        response = generateCategoryCommandResponse(command, missionCategory)
        isCorrect = true
        points = 10
        responseType = 'success'
      } else {
        response = generateBasicCommandResponse(command)
        responseType = 'output'
      }
    } else {
      response = `bash: ${command}: comando não encontrado\nDica: Digite "help" para ver comandos disponíveis.`
      responseType = 'error'
    }

    const responseEntry: TerminalOutputLine = {
      id: (Date.now() + 1).toString(),
      type: responseType,
      content: response,
      timestamp: new Date(),
    }

    const promptEntry: TerminalOutputLine = {
      id: (Date.now() + 2).toString(),
      type: 'prompt',
      content: 'esquads@terminal:~$',
      timestamp: new Date(),
    }

    setTerminalOutput((prev) => [...prev, newEntry, responseEntry, promptEntry])
    setCommandHistory((prev) => [...prev, command])
    setCurrentCommand('')
    setShowSuggestions(false)
    setHistoryIndex(-1)

    // Notificar parent component
    onCommandExecute(command, isCorrect, response, points)
  }

  const generateCategoryCommandResponse = (command: string, category: MissionCategory): string => {
    const responses: Record<MissionCategory, Record<string, string>> = {
      [MissionCategory.Firewall]: {
        iptables: 'Chain INPUT (policy ACCEPT)\ntarget     prot opt source               destination\nACCEPT     tcp  --  anywhere             anywhere             tcp dpt:ssh\nACCEPT     tcp  --  anywhere             anywhere             tcp dpt:http',
        ufw: 'Status: active\n\nTo                         Action      From\n--                         ------      ----\n22/tcp                     ALLOW       Anywhere\n80/tcp                     ALLOW       Anywhere',
        netstat: 'Active Internet connections\nProto Recv-Q Send-Q Local Address           Foreign Address         State\ntcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN\ntcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN',
        nmap: 'Starting Nmap 7.91\nHost is up (0.001s latency).\nNot shown: 998 closed ports\nPORT   STATE SERVICE\n22/tcp open  ssh\n80/tcp open  http',
      },
      [MissionCategory.CloudSecurity]: {
        aws: 'AWS CLI 2.0.55\nUsage: aws [options] <command> <subcommand>\n\nAvailable commands:\n  s3, ec2, rds, lambda, iam',
        kubectl: 'Client Version: v1.21.0\nServer Version: v1.20.4\n\nAvailable commands:\n  get, create, delete, apply, describe',
        docker: 'Docker version 20.10.7\n\nAvailable commands:\n  run, build, push, pull, images, ps',
        terraform: 'Terraform v1.0.0\n\nAvailable commands:\n  init, plan, apply, destroy, validate',
      },
      [MissionCategory.Forensics]: {
        volatility: 'Volatility Foundation Volatility Framework 2.6\n\nAvailable plugins:\n  pslist, pstree, cmdline, filescan',
        autopsy: 'Autopsy 4.19.0\nDigital forensics platform initialized.',
        strings: 'Searching for ASCII strings...\nFound 1247 strings\n\nSample output:\n  /bin/bash\n  /usr/bin/python3\n  /etc/passwd',
        hexdump: '0000000 7f45 4c46 0201 0001 0000 0000 0000 0000\n0000010 0002 003e 0001 0000 0040 0000 0000 0000',
      },
      [MissionCategory.NetworkSecurity]: {
        wireshark: 'Wireshark 3.4.0\nCapturing on interface eth0\nPackets captured: 0',
        nmap: 'Starting Nmap 7.91\nHost is up (0.001s latency).\nNot shown: 998 closed ports\nPORT   STATE SERVICE\n22/tcp open  ssh\n80/tcp open  http',
        netcat: 'Netcat 1.10\nUsage: nc [options] hostname port',
        curl: 'curl 7.68.0\nUsage: curl [options] URL',
      },
      [MissionCategory.PenetrationTesting]: {
        metasploit: 'Metasploit Framework 6.0\n\nAvailable modules:\n  exploit, payload, auxiliary, post',
        nmap: 'Starting Nmap 7.91\nHost is up (0.001s latency).\nNot shown: 998 closed ports\nPORT   STATE SERVICE\n22/tcp open  ssh\n80/tcp open  http',
        burpsuite: 'Burp Suite Professional 2021.8\nProxy server started on 127.0.0.1:8080',
        sqlmap: 'sqlmap 1.6.2\nUsage: sqlmap [options] -u URL',
      },
      [MissionCategory.IncidentResponse]: {
        syslog: 'Syslog daemon started\nLogging to /var/log/syslog',
        journalctl: 'Journal daemon started\nLogging to /var/log/journal',
        ps: 'PID TTY          TIME CMD\n   1 ?        00:00:01 systemd\n   2 ?        00:00:00 kthreadd',
        netstat: 'Active Internet connections\nProto Recv-Q Send-Q Local Address           Foreign Address         State\ntcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN',
      },
      [MissionCategory.VulnerabilityAssessment]: {
        nessus: 'Nessus 8.15.0\nVulnerability scanner initialized',
        openvas: 'OpenVAS 20.08\nVulnerability scanner started',
        nmap: 'Starting Nmap 7.91\nHost is up (0.001s latency).\nNot shown: 998 closed ports\nPORT   STATE SERVICE\n22/tcp open  ssh\n80/tcp open  http',
        nikto: 'Nikto 2.1.6\nWeb vulnerability scanner',
      },
      [MissionCategory.WebSecurity]: {
        burpsuite: 'Burp Suite Professional 2021.8\nProxy server started on 127.0.0.1:8080',
        sqlmap: 'sqlmap 1.6.2\nUsage: sqlmap [options] -u URL',
        nikto: 'Nikto 2.1.6\nWeb vulnerability scanner',
        wpscan: 'WPScan 3.8.0\nWordPress vulnerability scanner',
      },
      [MissionCategory.Cryptography]: {
        openssl: 'OpenSSL 1.1.1f\nUsage: openssl [options] command',
        gpg: 'GnuPG 2.2.19\nUsage: gpg [options] command',
        hashcat: 'hashcat 6.1.1\nUsage: hashcat [options] hashfile',
        john: 'John the Ripper 1.9.0\nUsage: john [options] hashfile',
      },
    }

    const categoryResponses = responses[category] || {}
    const baseCommand = command.split(' ')[0].toLowerCase()
    
    return categoryResponses[baseCommand] || 
      `Executando: ${command}\n[Simulação] Comando executado com sucesso.\n+10 XP`
  }

  const generateBasicCommandResponse = (command: string): string => {
    const responses: Record<string, string> = {
      ls: 'bin  boot  dev  etc  home  lib  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var',
      cat: 'Usage: cat [file]\nExample: cat /etc/passwd',
      pwd: '/home/esquads',
      whoami: 'esquads',
    }

    const baseCommand = command.split(' ')[0].toLowerCase()
    return responses[baseCommand] || `Executando: ${command}\n[Simulação] Comando executado.`
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
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex
        setHistoryIndex(newIndex)
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex])
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

  const quickCommands = ['help', 'clear', 'ls', 'history']

  return (
    <div className={`bg-gray-900 text-green-400 font-mono text-sm rounded-lg overflow-hidden h-full flex flex-col ${className}`}>
      {/* Terminal Header */}
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="text-gray-300 text-xs">Terminal - {missionCategory.replace(/_/g, ' ')}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Terminal className="h-4 w-4 text-gray-400" />
          <span className="text-xs text-gray-400">
            Passo {currentStep}/{totalSteps}
          </span>
          <Zap className="h-3 w-3 text-yellow-400" />
        </div>
      </div>

      {/* Terminal Content */}
      <div
        ref={terminalRef}
        className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
      >
        <TerminalOutput output={terminalOutput} />
      </div>

      {/* Suggestions */}
      <TerminalSuggestions
        suggestions={suggestions}
        onSelect={selectSuggestion}
        className={showSuggestions ? 'block' : 'hidden'}
      />

      {/* Command Input */}
      <div className="bg-gray-800 px-4 py-3 border-t border-gray-700 flex items-center space-x-2">
        <span className="text-green-400">esquads@terminal:~$</span>
        <input
          ref={inputRef}
          type="text"
          value={currentCommand}
          onChange={handleCommandChange}
          onKeyDown={handleKeyPress}
          className="flex-1 bg-transparent text-white outline-none"
          placeholder="Digite um comando..."
          disabled={isLoading}
        />
        {isLoading && <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />}
      </div>

      {/* Quick Commands */}
      <div className="bg-gray-800 px-4 py-2 border-t border-gray-700">
        <div className="flex flex-wrap gap-2">
          {quickCommands.map((cmd) => (
            <Button
              key={cmd}
              size="sm"
              variant="ghost"
              onClick={() => executeCommand(cmd)}
              disabled={isLoading}
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
