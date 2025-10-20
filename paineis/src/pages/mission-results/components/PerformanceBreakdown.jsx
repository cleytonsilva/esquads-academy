import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const PerformanceBreakdown = ({ 
  accuracy = 92,
  completionTime = "4:32",
  hintsUsed = 2,
  commandsExecuted = 15,
  correctCommands = 14,
  timeBonus = 50,
  accuracyBonus = 100,
  baseXP = 100
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const mockStepAnalysis = [
    {
      step: 1,
      title: "Configuração Inicial do Firewall",
      command: "iptables -F",
      status: "success",
      time: "0:23",
      feedback: "Comando executado corretamente. Limpeza das regras realizada com sucesso."
    },
    {
      step: 2,
      title: "Definir Política Padrão",
      command: "iptables -P INPUT DROP",
      status: "success",
      time: "0:45",
      feedback: "Política padrão configurada adequadamente para máxima segurança."
    },
    {
      step: 3,
      title: "Permitir Tráfego Local",
      command: "iptables -A INPUT -i lo -j ACCEPT",
      status: "success",
      time: "1:12",
      feedback: "Regra para interface loopback aplicada corretamente."
    },
    {
      step: 4,
      title: "Configurar Porta SSH",
      command: "iptables -A INPUT -p tcp --dport 22 -j ACCEPT",
      status: "error",
      time: "2:34",
      feedback: "Comando incorreto. Deveria especificar o estado da conexão para maior segurança.",
      suggestion: "iptables -A INPUT -p tcp --dport 22 -m state --state NEW,ESTABLISHED -j ACCEPT"
    },
    {
      step: 5,
      title: "Permitir Tráfego HTTP/HTTPS",
      command: "iptables -A INPUT -p tcp --dport 80,443 -j ACCEPT",
      status: "success",
      time: "3:21",
      feedback: "Regras para tráfego web configuradas corretamente."
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: 'BarChart3' },
    { id: 'steps', label: 'Análise por Etapas', icon: 'List' },
    { id: 'recommendations', label: 'Recomendações', icon: 'Lightbulb' }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return { name: 'CheckCircle', color: 'var(--color-success)' };
      case 'error':
        return { name: 'XCircle', color: 'var(--color-error)' };
      case 'warning':
        return { name: 'AlertCircle', color: 'var(--color-warning)' };
      default:
        return { name: 'Circle', color: 'var(--color-muted-foreground)' };
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-muted rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-foreground mb-1">{accuracy}%</div>
          <div className="text-sm text-muted-foreground">Precisão</div>
        </div>
        <div className="bg-muted rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-foreground mb-1">{completionTime}</div>
          <div className="text-sm text-muted-foreground">Tempo</div>
        </div>
        <div className="bg-muted rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-foreground mb-1">{hintsUsed}</div>
          <div className="text-sm text-muted-foreground">Dicas Usadas</div>
        </div>
        <div className="bg-muted rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-foreground mb-1">{correctCommands}/{commandsExecuted}</div>
          <div className="text-sm text-muted-foreground">Comandos</div>
        </div>
      </div>

      {/* XP Breakdown */}
      <div className="bg-muted rounded-lg p-4">
        <h3 className="font-semibold text-foreground mb-4">Distribuição de XP</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">XP Base</span>
            <span className="font-medium text-foreground">+{baseXP}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Bônus de Precisão ({accuracy}%)</span>
            <span className="font-medium text-success">+{accuracyBonus}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Bônus de Tempo</span>
            <span className="font-medium text-success">+{timeBonus}</span>
          </div>
          <div className="border-t border-border pt-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-bold text-accent">+{baseXP + accuracyBonus + timeBonus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Skill Assessment */}
      <div className="bg-muted rounded-lg p-4">
        <h3 className="font-semibold text-foreground mb-4">Avaliação de Habilidades</h3>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-foreground">Configuração de Firewall</span>
              <span className="text-sm font-medium text-success">Excelente</span>
            </div>
            <div className="w-full bg-background rounded-full h-2">
              <div className="h-2 bg-success rounded-full" style={{ width: '92%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-foreground">Sintaxe de Comandos</span>
              <span className="text-sm font-medium text-primary">Bom</span>
            </div>
            <div className="w-full bg-background rounded-full h-2">
              <div className="h-2 bg-primary rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-foreground">Velocidade de Execução</span>
              <span className="text-sm font-medium text-accent">Muito Bom</span>
            </div>
            <div className="w-full bg-background rounded-full h-2">
              <div className="h-2 bg-accent rounded-full" style={{ width: '88%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepAnalysis = () => (
    <div className="space-y-4">
      {mockStepAnalysis?.map((step) => {
        const statusIcon = getStatusIcon(step?.status);
        return (
          <div key={step?.step} className="bg-muted rounded-lg p-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Icon name={statusIcon?.name} size={20} color={statusIcon?.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-foreground">
                    Etapa {step?.step}: {step?.title}
                  </h4>
                  <span className="text-sm text-muted-foreground">{step?.time}</span>
                </div>
                <div className="bg-background rounded p-2 mb-2 font-mono text-sm">
                  {step?.command}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {step?.feedback}
                </p>
                {step?.suggestion && (
                  <div className="bg-warning/10 border border-warning/20 rounded p-2">
                    <p className="text-sm text-warning-foreground mb-1">
                      <strong>Sugestão:</strong>
                    </p>
                    <code className="text-xs bg-background rounded px-2 py-1">
                      {step?.suggestion}
                    </code>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderRecommendations = () => (
    <div className="space-y-4">
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Target" size={20} color="var(--color-primary)" />
          <div>
            <h4 className="font-semibold text-foreground mb-2">Próximas Missões Recomendadas</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Configuração Avançada de Firewall - Regras Complexas</li>
              <li>• Segurança de Rede - Detecção de Intrusão</li>
              <li>• Análise de Logs de Segurança</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="BookOpen" size={20} color="var(--color-accent)" />
          <div>
            <h4 className="font-semibold text-foreground mb-2">Áreas para Estudo</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Estados de conexão em iptables (NEW, ESTABLISHED, RELATED)</li>
              <li>• Configuração de NAT e port forwarding</li>
              <li>• Logs e monitoramento de firewall</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-success/10 border border-success/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="TrendingUp" size={20} color="var(--color-success)" />
          <div>
            <h4 className="font-semibold text-foreground mb-2">Pontos Fortes Identificados</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Excelente compreensão de políticas padrão</li>
              <li>• Boa velocidade de execução de comandos</li>
              <li>• Conhecimento sólido de regras básicas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Icon name="BarChart3" size={24} color="var(--color-primary)" />
        <h2 className="text-xl font-heading font-bold text-foreground">
          Análise de Performance
        </h2>
      </div>
      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-muted rounded-lg p-1">
        {tabs?.map((tab) => (
          <button
            key={tab?.id}
            onClick={() => setActiveTab(tab?.id)}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${activeTab === tab?.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
              }
            `}
          >
            <Icon name={tab?.icon} size={16} />
            <span>{tab?.label}</span>
          </button>
        ))}
      </div>
      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'steps' && renderStepAnalysis()}
        {activeTab === 'recommendations' && renderRecommendations()}
      </div>
    </div>
  );
};

export default PerformanceBreakdown;