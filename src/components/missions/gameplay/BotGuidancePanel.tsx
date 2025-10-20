import React, { useState, useEffect, useRef } from 'react';
import { Bot, Lightbulb, RotateCcw, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface Message {
  id: number;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
  avatar: string;
}

interface BotGuidancePanelProps {
  missionData?: {
    title: string;
    category: string;
  };
  currentStep?: number;
  lastCommand?: string;
  commandResult?: {
    isCorrect: boolean;
    response: string;
  };
  onHintRequest?: (step: number) => void;
  userProgress?: number;
}

const BotGuidancePanel: React.FC<BotGuidancePanelProps> = ({ 
  missionData, 
  currentStep = 1, 
  lastCommand, 
  commandResult,
  onHintRequest,
  userProgress = 0 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showHintButton, setShowHintButton] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 1,
      type: 'bot',
      content: `Olá! Sou o CyberBot, seu assistente nesta missão de ${missionData?.category}. \n\nVou te ajudar a completar "${missionData?.title}" passo a passo. Quando precisar de ajuda, é só pedir!`,
      timestamp: new Date(),
      avatar: '🤖'
    };

    setMessages([welcomeMessage]);
  }, [missionData]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // React to command execution
  useEffect(() => {
    if (lastCommand && commandResult) {
      handleCommandFeedback(lastCommand, commandResult);
    }
  }, [lastCommand, commandResult]);

  const handleCommandFeedback = (command: string, result: { isCorrect: boolean; response: string }) => {
    setIsTyping(true);
    
    setTimeout(() => {
      let feedbackMessage = '';
      let messageType: 'bot' | 'user' = 'bot';

      if (result.isCorrect) {
        const encouragements = [
          'Excelente! Comando executado corretamente! 🎉',
          'Perfeito! Você está no caminho certo! ⭐',
          'Muito bem! Continue assim! 🚀',
          'Ótimo trabalho! Próximo passo desbloqueado! 💪'
        ];
        feedbackMessage = encouragements[Math.floor(Math.random() * encouragements.length)];
        
        if (currentStep < 5) {
          feedbackMessage += `\n\nAgora vamos para o passo ${currentStep + 1}. ${getStepGuidance(currentStep + 1)}`;
        }
      } else {
        const hints = [
          `Hmm, "${command}" não funcionou como esperado. Tente verificar a sintaxe do comando.`,
          `Esse comando não está correto. Lembre-se: você pode usar "help" para ver os comandos disponíveis.`,
          `Não foi dessa vez! Dica: verifique se o comando está relacionado à categoria ${missionData?.category}.`,
          `Comando inválido. Que tal tentar um comando mais específico para esta missão?`
        ];
        feedbackMessage = hints[Math.floor(Math.random() * hints.length)];
      }

      const newMessage: Message = {
        id: Date.now(),
        type: messageType,
        content: feedbackMessage,
        timestamp: new Date(),
        avatar: result.isCorrect ? '🎯' : '💡'
      };

      setMessages(prev => [...prev, newMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const getStepGuidance = (step: number): string => {
    const guidanceMap: Record<number, string> = {
      1: 'Primeiro, vamos verificar o status atual do sistema. Tente usar um comando de listagem.',
      2: 'Agora precisamos analisar as configurações. Use um comando de análise.',
      3: 'Hora de implementar as correções necessárias. Execute o comando apropriado.',
      4: 'Vamos validar as mudanças feitas. Verifique se tudo está funcionando.',
      5: 'Último passo! Finalize a configuração e documente o resultado.'
    };

    return guidanceMap[step] || 'Continue seguindo os objetivos da missão.';
  };

  const requestHint = () => {
    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: 'Preciso de uma dica!',
      timestamp: new Date(),
      avatar: '👤'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setShowHintButton(false);

    setTimeout(() => {
      const hints: Record<number, string> = {
        1: 'Dica: Comece com comandos básicos como "ls" ou "help" para se familiarizar com o ambiente.',
        2: 'Dica: Use comandos de status como "netstat" ou "ps" para ver o que está rodando no sistema.',
        3: 'Dica: Agora é hora de usar comandos específicos da categoria. Para Firewall, tente "iptables" ou "ufw".',
        4: 'Dica: Verifique se suas configurações foram aplicadas corretamente com comandos de validação.',
        5: 'Dica: Finalize com comandos de documentação ou backup das configurações.'
      };

      const hintMessage: Message = {
        id: Date.now() + 1,
        type: 'bot',
        content: hints[currentStep] || 'Continue explorando os comandos disponíveis. Você está indo bem!',
        timestamp: new Date(),
        avatar: '💡'
      };

      setMessages(prev => [...prev, hintMessage]);
      setIsTyping(false);
      
      // Re-enable hint button after 30 seconds
      setTimeout(() => setShowHintButton(true), 30000);
    }, 1500);

    if (onHintRequest) {
      onHintRequest(currentStep);
    }
  };

  const getProgressMessage = (): string => {
    if (userProgress < 25) return 'Você está começando bem! Continue explorando.';
    if (userProgress < 50) return 'Progresso sólido! Você está pegando o jeito.';
    if (userProgress < 75) return 'Excelente progresso! Quase lá!';
    return 'Incrível! Você está dominando esta missão!';
  };

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 py-3 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4" />
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
      <div className="px-4 py-2 bg-muted border-b">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>Progresso da Missão</span>
          <span>{Math.round(userProgress)}%</span>
        </div>
        <Progress value={userProgress} className="h-1.5" />
        <p className="text-xs text-muted-foreground mt-1">{getProgressMessage()}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex space-x-2 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm flex-shrink-0">
                {message.avatar}
              </div>
              <div
                className={`px-3 py-2 rounded-lg ${
                  message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
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
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
            <Lightbulb className="w-4 h-4 mr-2" />
            Solicitar Dica
          </Button>
        )}
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reiniciar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            <HelpCircle className="w-3 h-3 mr-1" />
            Ajuda
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default BotGuidancePanel;