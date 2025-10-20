import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Loader2 } from 'lucide-react';

interface TerminalLine {
  type: 'system' | 'command' | 'output' | 'success' | 'error' | 'prompt';
  content: string;
  timestamp: Date;
}

interface SimulatorTerminalProps {
  missionData?: {
    title: string;
    category: string;
  };
  onCommandExecute?: (command: string, isCorrect: boolean, response: string) => void;
  onProgressUpdate?: (progress: number) => void;
  currentStep?: number;
  isLoading?: boolean;
}

const SimulatorTerminal: React.FC<SimulatorTerminalProps> = ({ 
  missionData, 
  onCommandExecute, 
  onProgressUpdate,
  currentStep = 1,
  isLoading = false 
}) => {
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock terminal output based on mission type
  const initialOutput: TerminalLine[] = [
    { type: 'system', content: `Esquads Simulator v2.1 - ${missionData?.category}`, timestamp: new Date() },
    { type: 'system', content: `Missão: ${missionData?.title}`, timestamp: new Date() },
    { type: 'system', content: 'Sistema inicializado. Digite "help" para ver comandos disponíveis.', timestamp: new Date() },
    { type: 'prompt', content: 'esquads@simulator:~$', timestamp: new Date() }
  ];

  const [terminalOutput, setTerminalOutput] = useState<TerminalLine[]>(initialOutput);

  // Available commands based on mission type
  const availableCommands: Record<string, string[]> = {
    'Firewall': ['iptables', 'ufw', 'netstat', 'ss', 'nmap', 'tcpdump', 'help', 'clear', 'ls', 'cat'],
    'Cloud Security': ['aws', 'kubectl', 'docker', 'terraform', 'helm', 'gcloud', 'help', 'clear', 'ls', 'cat'],
    'Forensics': ['volatility', 'autopsy', 'strings', 'hexdump', 'file', 'md5sum', 'help', 'clear', 'ls', 'cat'],
    'Network Security': ['wireshark', 'nmap', 'netcat', 'curl', 'ping', 'traceroute', 'help', 'clear', 'ls', 'cat']
  };

  const commands = availableCommands[missionData?.category || 'Network Security'] || availableCommands['Network Security'];

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleCommandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentCommand(value);

    // Show suggestions when typing
    if (value.length > 0) {
      const filtered = commands.filter(cmd => 
        cmd.toLowerCase().startsWith(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const executeCommand = (command: string = currentCommand) => {
    if (!command.trim()) return;

    const newEntry: TerminalLine = {
      type: 'command',
      content: `esquads@simulator:~$ ${command}`,
      timestamp: new Date()
    };

    // Simulate command execution
    let response = '';
    let responseType: TerminalLine['type'] = 'output';
    let isCorrect = false;

    if (command.toLowerCase() === 'help') {
      response = `Comandos disponíveis:\n${commands.join(', ')}\n\nDica: Use os comandos para completar os objetivos da missão.`;
    } else if (command.toLowerCase() === 'clear') {
      setTerminalOutput([...initialOutput]);
      setCurrentCommand('');
      return;
    } else if (commands.includes(command.split(' ')[0].toLowerCase())) {
      // Simulate successful command execution
      response = generateCommandResponse(command, missionData?.category);
      isCorrect = true;
      responseType = 'success';
    } else {
      response = `bash: ${command}: comando não encontrado\nDica: Digite "help" para ver comandos disponíveis.`;
      responseType = 'error';
    }

    const responseEntry: TerminalLine = {
      type: responseType,
      content: response,
      timestamp: new Date()
    };

    const promptEntry: TerminalLine = {
      type: 'prompt',
      content: 'esquads@simulator:~$',
      timestamp: new Date()
    };

    setTerminalOutput(prev => [...prev, newEntry, responseEntry, promptEntry]);
    setCommandHistory(prev => [...prev, command]);
    setCurrentCommand('');
    setShowSuggestions(false);

    // Notify parent component
    if (onCommandExecute) {
      onCommandExecute(command, isCorrect, response);
    }
  };

  const generateCommandResponse = (command: string, category?: string): string => {
    const responses: Record<string, Record<string, string>> = {
      'Firewall': {
        'iptables': 'Chain INPUT (policy ACCEPT)\ntarget     prot opt source               destination\nACCEPT     tcp  --  anywhere             anywhere             tcp dpt:ssh\nDROP       tcp  --  anywhere             anywhere             tcp dpt:telnet',
        'ufw': 'Status: active\n\nTo                         Action      From\n--                         ------      ----\n22/tcp                     ALLOW       Anywhere\n80/tcp                     ALLOW       Anywhere',
        'netstat': 'Active Internet connections (only servers)\nProto Recv-Q Send-Q Local Address           Foreign Address         State\ntcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN\ntcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN'
      },
      'Cloud Security': {
        'aws': 'AWS CLI 2.0.55\nUsage: aws [options] <command> <subcommand> [<subcommand> ...] [parameters]\nTo see help text, you can run:\n  aws help\n  aws <command> help',
        'kubectl': 'Client Version: version.Info{Major:"1", Minor:"21", GitVersion:"v1.21.0"}\nServer Version: version.Info{Major:"1", Minor:"20", GitVersion:"v1.20.4"}',
        'docker': 'Docker version 20.10.7, build f0df350\nDocker Engine - Community'
      },
      'Forensics': {
        'volatility': 'Volatility Foundation Volatility Framework 2.6.1\nUsage: Volatility - A memory forensics analysis platform.\n\nOptions:\n  -h, --help            show this help message and exit',
        'strings': 'Extracting strings from memory dump...\nFound 1247 readable strings\nAnalyzing for suspicious patterns...',
        'file': 'memory.dump: data'
      }
    };

    const categoryResponses = responses[category || 'Firewall'] || responses['Firewall'];
    const baseCommand = command.split(' ')[0].toLowerCase();
    
    return categoryResponses[baseCommand] || `Executando: ${command}\n[Simulação] Comando executado com sucesso.\n+10 XP`;
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setCurrentCommand(suggestions[0]);
        setShowSuggestions(false);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        setCurrentCommand(commandHistory[commandHistory.length - 1]);
      }
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setCurrentCommand(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'system': return 'text-cyan-400';
      case 'command': return 'text-white';
      case 'output': return 'text-gray-300';
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'prompt': return 'text-green-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="bg-gray-900 text-green-400 font-mono text-sm rounded-lg overflow-hidden h-full flex flex-col">
      {/* Terminal Header */}
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="text-gray-300 text-xs">Terminal - {missionData?.title}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-400">Passo {currentStep}/5</span>
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
      >
        {terminalOutput.map((line, index) => (
          <div key={index} className="mb-1">
            <div className={`${getLineColor(line.type)} ${line.type === 'output' || line.type === 'success' || line.type === 'error' ? 'whitespace-pre-line' : ''}`}>
              {line.content}
            </div>
          </div>
        ))}
      </div>

      {/* Command Input Area */}
      <div className="relative">
        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute bottom-full left-4 right-4 bg-gray-800 border border-gray-600 rounded-t-lg max-h-32 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => selectSuggestion(suggestion)}
                className="w-full text-left px-3 py-1 hover:bg-gray-700 text-green-400 text-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="bg-gray-800 px-4 py-3 border-t border-gray-700 flex items-center space-x-2">
          <span className="text-green-400">esquads@simulator:~$</span>
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
          {isLoading && (
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          )}
        </div>
      </div>

      {/* Quick Commands */}
      <div className="bg-gray-800 px-4 py-2 border-t border-gray-700">
        <div className="flex flex-wrap gap-2">
          {['help', 'clear', 'ls'].map((cmd) => (
            <button
              key={cmd}
              onClick={() => executeCommand(cmd)}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-xs text-gray-300 rounded transition-colors"
              disabled={isLoading}
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimulatorTerminal;