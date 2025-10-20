import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const ExamConfigPanel = ({ 
  selectedCertification,
  config,
  onConfigChange,
  onStartExam,
  isLoading = false 
}) => {
  if (!selectedCertification) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Selecione uma Certificação
        </h3>
        <p className="text-muted-foreground">
          Escolha uma certificação para configurar seu exame simulado
        </p>
      </div>
    );
  }

  const difficultyOptions = [
    { value: 'iniciante', label: 'Iniciante', description: 'Questões básicas e conceituais' },
    { value: 'intermediario', label: 'Intermediário', description: 'Questões práticas e aplicadas' },
    { value: 'avancado', label: 'Avançado', description: 'Questões complexas e cenários reais' }
  ];

  const questionCountOptions = [
    { value: 25, label: '25 questões', description: 'Simulado rápido (30 min)' },
    { value: 50, label: '50 questões', description: 'Simulado médio (60 min)' },
    { value: 100, label: '100 questões', description: 'Simulado completo (120 min)' },
    { value: selectedCertification?.questionCount, label: `${selectedCertification?.questionCount} questões`, description: 'Simulado oficial completo' }
  ];

  const modeOptions = [
    { value: 'timed', label: 'Cronometrado', description: 'Simula condições reais de exame' },
    { value: 'practice', label: 'Prática', description: 'Sem limite de tempo, com explicações' }
  ];

  const topicOptions = selectedCertification?.topics?.map(topic => ({
    value: topic?.toLowerCase()?.replace(/\s+/g, '-'),
    label: topic,
    description: `Focar em questões de ${topic}`
  }));

  const handleConfigChange = (field, value) => {
    onConfigChange({
      ...config,
      [field]: value
    });
  };

  const getEstimatedDuration = () => {
    const baseTime = config?.questionCount * (config?.mode === 'timed' ? 1.2 : 2);
    return Math.round(baseTime);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
          <Icon name="Settings" size={20} color="white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Configuração do Exame
          </h3>
          <p className="text-sm text-muted-foreground">
            {selectedCertification?.name}
          </p>
        </div>
      </div>
      {/* Configuration Options */}
      <div className="space-y-6">
        {/* Difficulty Level */}
        <Select
          label="Nível de Dificuldade"
          description="Escolha o nível adequado ao seu conhecimento"
          options={difficultyOptions}
          value={config?.difficulty}
          onChange={(value) => handleConfigChange('difficulty', value)}
        />

        {/* Question Count */}
        <Select
          label="Quantidade de Questões"
          description="Defina o tamanho do seu simulado"
          options={questionCountOptions}
          value={config?.questionCount}
          onChange={(value) => handleConfigChange('questionCount', value)}
        />

        {/* Exam Mode */}
        <Select
          label="Modo do Exame"
          description="Escolha entre prática ou simulação real"
          options={modeOptions}
          value={config?.mode}
          onChange={(value) => handleConfigChange('mode', value)}
        />

        {/* Topic Focus */}
        <Select
          label="Foco em Tópicos (Opcional)"
          description="Concentre-se em áreas específicas"
          options={[
            { value: 'all', label: 'Todos os tópicos', description: 'Questões de todas as áreas' },
            ...topicOptions
          ]}
          value={config?.topicFocus}
          onChange={(value) => handleConfigChange('topicFocus', value)}
          searchable
        />
      </div>
      {/* Exam Preview */}
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h4 className="font-medium text-foreground mb-3">Resumo do Exame</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Icon name="Clock" size={16} className="text-muted-foreground" />
            <span className="text-muted-foreground">
              ~{getEstimatedDuration()} minutos
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="FileText" size={16} className="text-muted-foreground" />
            <span className="text-muted-foreground">
              {config?.questionCount} questões
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Target" size={16} className="text-muted-foreground" />
            <span className="text-muted-foreground">
              {config?.difficulty}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name={config?.mode === 'timed' ? 'Timer' : 'BookOpen'} size={16} className="text-muted-foreground" />
            <span className="text-muted-foreground">
              {config?.mode === 'timed' ? 'Cronometrado' : 'Prática'}
            </span>
          </div>
        </div>
      </div>
      {/* Start Button */}
      <div className="mt-6">
        <Button
          variant="default"
          size="lg"
          fullWidth
          loading={isLoading}
          iconName="Play"
          iconPosition="left"
          onClick={onStartExam}
        >
          Iniciar Exame Simulado
        </Button>
      </div>
      {/* Tips */}
      <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-lg">
        <div className="flex items-start space-x-2">
          <Icon name="Lightbulb" size={16} className="text-accent mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-foreground mb-1">Dica de Preparação</p>
            <p className="text-muted-foreground">
              {config?.mode === 'timed' ?'No modo cronometrado, gerencie bem seu tempo. Dedique no máximo 1-2 minutos por questão.' :'No modo prática, aproveite as explicações detalhadas para aprofundar seu conhecimento.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamConfigPanel;