// Esquads Academy - Gerador de Cursos IA

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Bot, 
  Sparkles, 
  Settings, 
  Play, 
  Pause, 
  Square, 
  RefreshCw,
  Clock,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Users,
  Target,
  Lightbulb,
  FileText,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  Minus
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  AICourseGenerationParams, 
  AIGenerationProgress, 
  AIGenerationHistory,
  AIDifficulty,
  AILanguage,
  AIGenerationStatus
} from '@/types/ai';

const AIGenerator: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('generator');
  const [isGenerating, setIsGenerating] = useState(false);

  // Estado para parâmetros de geração
  const [generationParams, setGenerationParams] = useState<AICourseGenerationParams>({
    topic: '',
    description: '',
    difficulty: 'intermediate',
    targetAudience: '',
    duration: 8,
    language: 'pt-BR',
    includeQuizzes: true,
    includeFinalExam: true,
    moduleCount: 4,
    learningObjectives: [''],
    prerequisites: [''],
    tags: ['']
  });

  // Estado para progresso de geração
  const [currentGeneration, setCurrentGeneration] = useState<AIGenerationProgress | null>(null);

  // Estado para histórico
  const [generationHistory, setGenerationHistory] = useState<AIGenerationHistory[]>([
    {
      id: '1',
      userId: user?.id || '',
      params: {
        topic: 'Desenvolvimento Web com React',
        difficulty: 'intermediate',
        targetAudience: 'Desenvolvedores iniciantes',
        duration: 12,
        language: 'pt-BR',
        includeQuizzes: true,
        includeFinalExam: true,
        moduleCount: 6,
        learningObjectives: ['Criar aplicações React', 'Gerenciar estado'],
        prerequisites: ['JavaScript básico'],
        tags: ['react', 'javascript', 'frontend']
      },
      progress: {
        id: '1',
        status: 'completed',
        progress: 100,
        currentStep: 'Finalizado',
        startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      templateUsed: 'Curso Técnico Avançado'
    }
  ]);

  // Funções para manipular arrays
  const addArrayItem = (field: 'learningObjectives' | 'prerequisites' | 'tags') => {
    setGenerationParams(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'learningObjectives' | 'prerequisites' | 'tags', index: number) => {
    setGenerationParams(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateArrayItem = (field: 'learningObjectives' | 'prerequisites' | 'tags', index: number, value: string) => {
    setGenerationParams(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  // Função para iniciar geração
  const startGeneration = async () => {
    if (!generationParams.topic.trim()) {
      toast.error('Por favor, informe o tópico do curso');
      return;
    }

    if (!generationParams.targetAudience.trim()) {
      toast.error('Por favor, informe o público-alvo');
      return;
    }

    setIsGenerating(true);
    
    const newGeneration: AIGenerationProgress = {
      id: Date.now().toString(),
      status: 'generating',
      progress: 0,
      currentStep: 'Iniciando geração...',
      startedAt: new Date()
    };

    setCurrentGeneration(newGeneration);

    // Simular progresso de geração
    const steps = [
      'Analisando tópico e requisitos...',
      'Gerando estrutura do curso...',
      'Criando módulos e lições...',
      'Desenvolvendo conteúdo...',
      'Criando exercícios e quizzes...',
      'Gerando exame final...',
      'Finalizando e validando...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCurrentGeneration(prev => prev ? {
        ...prev,
        progress: Math.round(((i + 1) / steps.length) * 100),
        currentStep: steps[i]
      } : null);
    }

    // Finalizar geração
    setCurrentGeneration(prev => prev ? {
      ...prev,
      status: 'completed',
      progress: 100,
      currentStep: 'Curso gerado com sucesso!',
      completedAt: new Date()
    } : null);

    // Adicionar ao histórico
    const newHistoryItem: AIGenerationHistory = {
      id: Date.now().toString(),
      userId: user?.id || '',
      params: { ...generationParams },
      progress: {
        ...newGeneration,
        status: 'completed',
        progress: 100,
        currentStep: 'Finalizado',
        completedAt: new Date()
      },
      createdAt: new Date()
    };

    setGenerationHistory(prev => [newHistoryItem, ...prev]);
    setIsGenerating(false);
    toast.success('Curso gerado com sucesso!');
  };

  // Função para cancelar geração
  const cancelGeneration = () => {
    if (currentGeneration) {
      setCurrentGeneration({
        ...currentGeneration,
        status: 'cancelled',
        currentStep: 'Geração cancelada'
      });
    }
    setIsGenerating(false);
    toast.info('Geração cancelada');
  };

  // Função para limpar formulário
  const clearForm = () => {
    setGenerationParams({
      topic: '',
      description: '',
      difficulty: 'intermediate',
      targetAudience: '',
      duration: 8,
      language: 'pt-BR',
      includeQuizzes: true,
      includeFinalExam: true,
      moduleCount: 4,
      learningObjectives: [''],
      prerequisites: [''],
      tags: ['']
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Bot className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerador de Cursos IA</h1>
            <p className="text-gray-600">Crie cursos automaticamente com inteligência artificial</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-purple-600 border-purple-200">
            <Sparkles className="h-3 w-3 mr-1" />
            IA Ativa
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generator">Gerador</TabsTrigger>
          <TabsTrigger value="progress">Progresso</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        {/* Aba Gerador */}
        <TabsContent value="generator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulário de Parâmetros */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Parâmetros do Curso</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Informações Básicas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="topic">Tópico do Curso *</Label>
                      <Input
                        id="topic"
                        placeholder="Ex: Desenvolvimento Web com React"
                        value={generationParams.topic}
                        onChange={(e) => setGenerationParams(prev => ({ ...prev, topic: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="targetAudience">Público-Alvo *</Label>
                      <Input
                        id="targetAudience"
                        placeholder="Ex: Desenvolvedores iniciantes"
                        value={generationParams.targetAudience}
                        onChange={(e) => setGenerationParams(prev => ({ ...prev, targetAudience: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição (Opcional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Descreva brevemente o que o curso deve abordar..."
                      value={generationParams.description}
                      onChange={(e) => setGenerationParams(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  {/* Configurações */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Dificuldade</Label>
                      <Select
                        value={generationParams.difficulty}
                        onValueChange={(value: AIDifficulty) => 
                          setGenerationParams(prev => ({ ...prev, difficulty: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Iniciante</SelectItem>
                          <SelectItem value="intermediate">Intermediário</SelectItem>
                          <SelectItem value="advanced">Avançado</SelectItem>
                          <SelectItem value="expert">Especialista</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Idioma</Label>
                      <Select
                        value={generationParams.language}
                        onValueChange={(value: AILanguage) => 
                          setGenerationParams(prev => ({ ...prev, language: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pt-BR">Português (BR)</SelectItem>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="es-ES">Español (ES)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duração (horas)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        max="100"
                        value={generationParams.duration}
                        onChange={(e) => setGenerationParams(prev => ({ 
                          ...prev, 
                          duration: parseInt(e.target.value) || 1 
                        }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="moduleCount">Número de Módulos</Label>
                      <Input
                        id="moduleCount"
                        type="number"
                        min="1"
                        max="20"
                        value={generationParams.moduleCount}
                        onChange={(e) => setGenerationParams(prev => ({ 
                          ...prev, 
                          moduleCount: parseInt(e.target.value) || 1 
                        }))}
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="includeQuizzes"
                          checked={generationParams.includeQuizzes}
                          onCheckedChange={(checked) => 
                            setGenerationParams(prev => ({ ...prev, includeQuizzes: checked }))
                          }
                        />
                        <Label htmlFor="includeQuizzes">Incluir Quizzes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="includeFinalExam"
                          checked={generationParams.includeFinalExam}
                          onCheckedChange={(checked) => 
                            setGenerationParams(prev => ({ ...prev, includeFinalExam: checked }))
                          }
                        />
                        <Label htmlFor="includeFinalExam">Incluir Exame Final</Label>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Objetivos de Aprendizagem */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Objetivos de Aprendizagem</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addArrayItem('learningObjectives')}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                    {generationParams.learningObjectives.map((objective, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          placeholder="Ex: Criar aplicações React funcionais"
                          value={objective}
                          onChange={(e) => updateArrayItem('learningObjectives', index, e.target.value)}
                        />
                        {generationParams.learningObjectives.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeArrayItem('learningObjectives', index)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pré-requisitos */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Pré-requisitos</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addArrayItem('prerequisites')}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                    {generationParams.prerequisites.map((prerequisite, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          placeholder="Ex: Conhecimento básico de JavaScript"
                          value={prerequisite}
                          onChange={(e) => updateArrayItem('prerequisites', index, e.target.value)}
                        />
                        {generationParams.prerequisites.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeArrayItem('prerequisites', index)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Tags */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Tags</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addArrayItem('tags')}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                    {generationParams.tags.map((tag, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          placeholder="Ex: react, javascript, frontend"
                          value={tag}
                          onChange={(e) => updateArrayItem('tags', index, e.target.value)}
                        />
                        {generationParams.tags.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeArrayItem('tags', index)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Painel de Controle */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Play className="h-5 w-5" />
                    <span>Controles</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={startGeneration}
                    disabled={isGenerating}
                    className="w-full"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Gerar Curso
                      </>
                    )}
                  </Button>

                  {isGenerating && (
                    <Button
                      onClick={cancelGeneration}
                      variant="outline"
                      className="w-full"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  )}

                  <Button
                    onClick={clearForm}
                    variant="outline"
                    className="w-full"
                    disabled={isGenerating}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Limpar Formulário
                  </Button>
                </CardContent>
              </Card>

              {/* Estatísticas Rápidas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Estatísticas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Cursos Gerados</span>
                    <span className="font-medium">{generationHistory.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Taxa de Sucesso</span>
                    <span className="font-medium text-green-600">95%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tempo Médio</span>
                    <span className="font-medium">12 min</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Aba Progresso */}
        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Progresso da Geração</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentGeneration ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {currentGeneration.currentStep}
                    </span>
                    <Badge 
                      variant={
                        currentGeneration.status === 'completed' ? 'default' :
                        currentGeneration.status === 'error' ? 'destructive' :
                        currentGeneration.status === 'cancelled' ? 'secondary' :
                        'outline'
                      }
                    >
                      {currentGeneration.status === 'generating' && 'Gerando'}
                      {currentGeneration.status === 'completed' && 'Concluído'}
                      {currentGeneration.status === 'error' && 'Erro'}
                      {currentGeneration.status === 'cancelled' && 'Cancelado'}
                    </Badge>
                  </div>
                  
                  <Progress value={currentGeneration.progress} className="w-full" />
                  
                  <div className="text-sm text-gray-600">
                    {currentGeneration.progress}% concluído
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Iniciado em:</span>
                      <div className="font-medium">
                        {currentGeneration.startedAt.toLocaleString()}
                      </div>
                    </div>
                    {currentGeneration.completedAt && (
                      <div>
                        <span className="text-gray-600">Concluído em:</span>
                        <div className="font-medium">
                          {currentGeneration.completedAt.toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma geração em andamento</p>
                  <p className="text-sm">Inicie uma nova geração na aba "Gerador"</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Histórico */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Histórico de Gerações</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {generationHistory.length > 0 ? (
                <div className="space-y-4">
                  {generationHistory.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{item.params.topic}</h3>
                        <Badge 
                          variant={
                            item.progress.status === 'completed' ? 'default' :
                            item.progress.status === 'error' ? 'destructive' :
                            'secondary'
                          }
                        >
                          {item.progress.status === 'completed' && 'Concluído'}
                          {item.progress.status === 'error' && 'Erro'}
                          {item.progress.status === 'cancelled' && 'Cancelado'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Dificuldade:</span>
                          <div className="font-medium capitalize">{item.params.difficulty}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Duração:</span>
                          <div className="font-medium">{item.params.duration}h</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Módulos:</span>
                          <div className="font-medium">{item.params.moduleCount}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Criado em:</span>
                          <div className="font-medium">
                            {item.createdAt.toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Visualizar
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Baixar
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum curso gerado ainda</p>
                  <p className="text-sm">Seus cursos gerados aparecerão aqui</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIGenerator;