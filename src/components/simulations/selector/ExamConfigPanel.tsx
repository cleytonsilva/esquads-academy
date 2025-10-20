import React, { useState } from 'react';
import { Clock, FileText, Target, Settings, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface ExamConfig {
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  timeLimit: number; // in minutes
  mode: 'timed' | 'practice';
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  showExplanations: boolean;
}

interface ExamConfigPanelProps {
  certification: {
    id: string;
    name: string;
    provider: string;
    maxQuestions: number;
    defaultTimeLimit: number;
  };
  onStartExam: (config: ExamConfig) => void;
  previousAttempts?: Array<{
    score: number;
    completedAt: Date;
    config: ExamConfig;
  }>;
}

const ExamConfigPanel: React.FC<ExamConfigPanelProps> = ({ 
  certification, 
  onStartExam,
  previousAttempts = []
}) => {
  const [config, setConfig] = useState<ExamConfig>({
    questionCount: 25,
    difficulty: 'mixed',
    timeLimit: certification.defaultTimeLimit,
    mode: 'timed',
    shuffleQuestions: true,
    shuffleAnswers: true,
    showExplanations: true
  });

  const questionCountOptions = [
    { value: 10, label: '10 questões (15 min)' },
    { value: 25, label: '25 questões (30 min)' },
    { value: 50, label: '50 questões (60 min)' },
    { value: 100, label: '100 questões (120 min)' }
  ].filter(option => option.value <= certification.maxQuestions);

  const difficultyOptions = [
    { value: 'easy', label: 'Fácil' },
    { value: 'medium', label: 'Médio' },
    { value: 'hard', label: 'Difícil' },
    { value: 'mixed', label: 'Misto' }
  ];

  const timeLimitOptions = [
    { value: 15, label: '15 minutos' },
    { value: 30, label: '30 minutos' },
    { value: 60, label: '60 minutos' },
    { value: 90, label: '90 minutos' },
    { value: 120, label: '120 minutos' }
  ];

  const handleConfigChange = (key: keyof ExamConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getBestScore = () => {
    if (previousAttempts.length === 0) return null;
    return Math.max(...previousAttempts.map(attempt => attempt.score));
  };

  const getAverageScore = () => {
    if (previousAttempts.length === 0) return null;
    const sum = previousAttempts.reduce((acc, attempt) => acc + attempt.score, 0);
    return Math.round(sum / previousAttempts.length);
  };

  const getLastAttemptDate = () => {
    if (previousAttempts.length === 0) return null;
    return previousAttempts[previousAttempts.length - 1].completedAt;
  };

  const bestScore = getBestScore();
  const averageScore = getAverageScore();
  const lastAttempt = getLastAttemptDate();

  return (
    <div className="space-y-6">
      {/* Certification Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-primary" />
            <span>{certification.name}</span>
          </CardTitle>
          <CardDescription>{certification.provider}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-foreground">{certification.maxQuestions}</div>
              <div className="text-sm text-muted-foreground">Questões Disponíveis</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-500">{certification.defaultTimeLimit}</div>
              <div className="text-sm text-muted-foreground">Minutos Padrão</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">{previousAttempts.length}</div>
              <div className="text-sm text-muted-foreground">Tentativas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-500">
                {bestScore ? `${bestScore}%` : 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Melhor Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Previous Performance */}
      {previousAttempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Histórico de Tentativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Melhor pontuação:</span>
                <span className="font-semibold text-green-500">{bestScore}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Média geral:</span>
                <span className="font-semibold text-blue-500">{averageScore}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Última tentativa:</span>
                <span className="font-semibold text-foreground">
                  {lastAttempt?.toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-primary" />
            <span>Configuração do Exame</span>
          </CardTitle>
          <CardDescription>
            Personalize seu exame conforme suas necessidades
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question Count */}
          <div>
            <Label htmlFor="questionCount">Quantidade de Questões</Label>
            <Select 
              value={config.questionCount.toString()} 
              onValueChange={(value) => handleConfigChange('questionCount', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {questionCountOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty */}
          <div>
            <Label htmlFor="difficulty">Nível de Dificuldade</Label>
            <Select 
              value={config.difficulty} 
              onValueChange={(value) => handleConfigChange('difficulty', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {difficultyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Limit */}
          <div>
            <Label htmlFor="timeLimit">Limite de Tempo</Label>
            <Select 
              value={config.timeLimit.toString()} 
              onValueChange={(value) => handleConfigChange('timeLimit', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeLimitOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mode */}
          <div>
            <Label htmlFor="mode">Modo do Exame</Label>
            <Select 
              value={config.mode} 
              onValueChange={(value) => handleConfigChange('mode', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="timed">Cronometrado</SelectItem>
                <SelectItem value="practice">Prática</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Embaralhar Questões</Label>
                <p className="text-sm text-muted-foreground">
                  Questões aparecerão em ordem aleatória
                </p>
              </div>
              <Switch
                checked={config.shuffleQuestions}
                onCheckedChange={(checked) => handleConfigChange('shuffleQuestions', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Embaralhar Respostas</Label>
                <p className="text-sm text-muted-foreground">
                  Opções de resposta em ordem aleatória
                </p>
              </div>
              <Switch
                checked={config.shuffleAnswers}
                onCheckedChange={(checked) => handleConfigChange('shuffleAnswers', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mostrar Explicações</Label>
                <p className="text-sm text-muted-foreground">
                  Exibir explicações após cada questão
                </p>
              </div>
              <Switch
                checked={config.showExplanations}
                onCheckedChange={(checked) => handleConfigChange('showExplanations', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Start Button */}
      <Card>
        <CardContent className="pt-6">
          <Button 
            onClick={() => onStartExam(config)}
            className="w-full"
            size="lg"
          >
            <Play className="w-5 h-5 mr-2" />
            Iniciar Exame
          </Button>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Tempo estimado: {config.timeLimit} minutos
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamConfigPanel;
