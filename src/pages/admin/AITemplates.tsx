// Esquads Academy - Templates de Conteúdo IA

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
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  Settings, 
  Search,
  Filter,
  MoreHorizontal,
  Code,
  Lightbulb,
  BookOpen,
  FileText,
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Calendar,
  Tag,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  AITemplate, 
  AITemplateVariable, 
  AIContentType,
  AITemplatePerformance
} from '@/types/ai';

const AITemplates: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('templates');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<AIContentType | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AITemplate | null>(null);

  // Estado para novo template
  const [newTemplate, setNewTemplate] = useState<Partial<AITemplate>>({
    name: '',
    description: '',
    type: 'course',
    prompt: '',
    variables: [],
    isActive: true,
    category: '',
    tags: []
  });

  // Mock data para templates
  const [templates, setTemplates] = useState<AITemplate[]>([
    {
      id: '1',
      name: 'Curso Técnico Básico',
      description: 'Template para criação de cursos técnicos de nível básico',
      type: 'course',
      prompt: 'Crie um curso sobre {topic} para {target_audience} com nível {difficulty}. O curso deve ter {module_count} módulos e duração de {duration} horas. Inclua: {learning_objectives}',
      variables: [
        { name: 'topic', type: 'text', label: 'Tópico', required: true },
        { name: 'target_audience', type: 'text', label: 'Público-alvo', required: true },
        { name: 'difficulty', type: 'select', label: 'Dificuldade', required: true, options: ['básico', 'intermediário', 'avançado'] },
        { name: 'module_count', type: 'number', label: 'Número de módulos', required: true, validation: { min: 1, max: 20 } },
        { name: 'duration', type: 'number', label: 'Duração (horas)', required: true, validation: { min: 1, max: 100 } },
        { name: 'learning_objectives', type: 'text', label: 'Objetivos de aprendizagem', required: false }
      ],
      isActive: true,
      createdBy: 'admin',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      usageCount: 45,
      category: 'Educação',
      tags: ['curso', 'básico', 'técnico']
    },
    {
      id: '2',
      name: 'Quiz Interativo',
      description: 'Template para criação de quizzes com múltiplas escolhas',
      type: 'quiz',
      prompt: 'Crie um quiz sobre {topic} com {question_count} questões de múltipla escolha. Nível de dificuldade: {difficulty}. Cada questão deve ter 4 alternativas com apenas uma correta.',
      variables: [
        { name: 'topic', type: 'text', label: 'Tópico', required: true },
        { name: 'question_count', type: 'number', label: 'Número de questões', required: true, validation: { min: 5, max: 50 } },
        { name: 'difficulty', type: 'select', label: 'Dificuldade', required: true, options: ['fácil', 'médio', 'difícil'] }
      ],
      isActive: true,
      createdBy: 'admin',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-18'),
      usageCount: 78,
      category: 'Avaliação',
      tags: ['quiz', 'avaliação', 'múltipla escolha']
    },
    {
      id: '3',
      name: 'Lição Prática',
      description: 'Template para lições com exercícios práticos',
      type: 'lesson',
      prompt: 'Crie uma lição prática sobre {topic} para {target_audience}. Inclua: explicação teórica, exemplos práticos, exercícios hands-on e resumo. Duração: {duration} minutos.',
      variables: [
        { name: 'topic', type: 'text', label: 'Tópico', required: true },
        { name: 'target_audience', type: 'text', label: 'Público-alvo', required: true },
        { name: 'duration', type: 'number', label: 'Duração (minutos)', required: true, validation: { min: 15, max: 120 } }
      ],
      isActive: false,
      createdBy: 'instructor1',
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-15'),
      usageCount: 23,
      category: 'Conteúdo',
      tags: ['lição', 'prática', 'hands-on']
    }
  ]);

  // Mock data para performance
  const [templatePerformance, setTemplatePerformance] = useState<AITemplatePerformance[]>([
    {
      templateId: '1',
      usageCount: 45,
      averageQualityScore: 87.5,
      averageUserRating: 4.3,
      successRate: 94.2,
      averageGenerationTime: 8.5,
      lastUsed: new Date('2024-01-20'),
      topIssues: []
    },
    {
      templateId: '2',
      usageCount: 78,
      averageQualityScore: 91.2,
      averageUserRating: 4.6,
      successRate: 97.4,
      averageGenerationTime: 5.2,
      lastUsed: new Date('2024-01-19'),
      topIssues: []
    }
  ]);

  // Categorias disponíveis
  const categories = ['Educação', 'Avaliação', 'Conteúdo', 'Exercícios', 'Projetos'];

  // Filtrar templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || template.type === filterType;
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  // Função para adicionar variável
  const addVariable = () => {
    const newVariable: AITemplateVariable = {
      name: '',
      type: 'text',
      label: '',
      required: false
    };
    setNewTemplate(prev => ({
      ...prev,
      variables: [...(prev.variables || []), newVariable]
    }));
  };

  // Função para remover variável
  const removeVariable = (index: number) => {
    setNewTemplate(prev => ({
      ...prev,
      variables: prev.variables?.filter((_, i) => i !== index) || []
    }));
  };

  // Função para atualizar variável
  const updateVariable = (index: number, field: keyof AITemplateVariable, value: any) => {
    setNewTemplate(prev => ({
      ...prev,
      variables: prev.variables?.map((variable, i) => 
        i === index ? { ...variable, [field]: value } : variable
      ) || []
    }));
  };

  // Função para criar template
  const createTemplate = () => {
    if (!newTemplate.name || !newTemplate.prompt) {
      toast.error('Nome e prompt são obrigatórios');
      return;
    }

    const template: AITemplate = {
      id: Date.now().toString(),
      name: newTemplate.name,
      description: newTemplate.description || '',
      type: newTemplate.type as AIContentType,
      prompt: newTemplate.prompt,
      variables: newTemplate.variables || [],
      isActive: newTemplate.isActive || true,
      createdBy: user?.id || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
      category: newTemplate.category || '',
      tags: newTemplate.tags || []
    };

    setTemplates(prev => [template, ...prev]);
    setIsCreateDialogOpen(false);
    setNewTemplate({
      name: '',
      description: '',
      type: 'course',
      prompt: '',
      variables: [],
      isActive: true,
      category: '',
      tags: []
    });
    toast.success('Template criado com sucesso!');
  };

  // Função para duplicar template
  const duplicateTemplate = (template: AITemplate) => {
    const duplicated: AITemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Cópia)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0
    };
    setTemplates(prev => [duplicated, ...prev]);
    toast.success('Template duplicado com sucesso!');
  };

  // Função para deletar template
  const deleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
    toast.success('Template removido com sucesso!');
  };

  // Função para alternar status ativo
  const toggleTemplateStatus = (templateId: string) => {
    setTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? { ...template, isActive: !template.isActive, updatedAt: new Date() }
        : template
    ));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <FileText className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Templates de Conteúdo IA</h1>
            <p className="text-gray-600">Gerencie modelos e prompts personalizados</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            {templates.length} Templates
          </Badge>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Informações Básicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Template *</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Curso Técnico Avançado"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de Conteúdo *</Label>
                    <Select
                      value={newTemplate.type}
                      onValueChange={(value: AIContentType) => 
                        setNewTemplate(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="course">Curso</SelectItem>
                        <SelectItem value="lesson">Lição</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                        <SelectItem value="exam">Exame</SelectItem>
                        <SelectItem value="assignment">Exercício</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva o propósito e uso deste template..."
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select
                      value={newTemplate.category}
                      onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="isActive"
                      checked={newTemplate.isActive}
                      onCheckedChange={(checked) => 
                        setNewTemplate(prev => ({ ...prev, isActive: checked }))
                      }
                    />
                    <Label htmlFor="isActive">Template ativo</Label>
                  </div>
                </div>

                <Separator />

                {/* Prompt */}
                <div className="space-y-2">
                  <Label htmlFor="prompt">Prompt do Template *</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Escreva o prompt usando variáveis como {variavel}..."
                    value={newTemplate.prompt}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, prompt: e.target.value }))}
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    Use &#123;nome_da_variavel&#125; para inserir variáveis no prompt
                  </p>
                </div>

                <Separator />

                {/* Variáveis */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Variáveis do Template</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addVariable}>
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar Variável
                    </Button>
                  </div>

                  {newTemplate.variables?.map((variable, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Nome da Variável</Label>
                          <Input
                            placeholder="Ex: topic"
                            value={variable.name}
                            onChange={(e) => updateVariable(index, 'name', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Rótulo</Label>
                          <Input
                            placeholder="Ex: Tópico"
                            value={variable.label}
                            onChange={(e) => updateVariable(index, 'label', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tipo</Label>
                          <Select
                            value={variable.type}
                            onValueChange={(value) => updateVariable(index, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Texto</SelectItem>
                              <SelectItem value="number">Número</SelectItem>
                              <SelectItem value="select">Seleção</SelectItem>
                              <SelectItem value="multiselect">Múltipla Seleção</SelectItem>
                              <SelectItem value="boolean">Verdadeiro/Falso</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-end space-x-2">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={variable.required}
                              onCheckedChange={(checked) => updateVariable(index, 'required', checked)}
                            />
                            <Label className="text-xs">Obrigatório</Label>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeVariable(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {(variable.type === 'select' || variable.type === 'multiselect') && (
                        <div className="mt-4 space-y-2">
                          <Label>Opções (uma por linha)</Label>
                          <Textarea
                            placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
                            value={variable.options?.join('\n') || ''}
                            onChange={(e) => updateVariable(index, 'options', e.target.value.split('\n').filter(Boolean))}
                            rows={3}
                          />
                        </div>
                      )}
                    </Card>
                  ))}
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={createTemplate}>
                    Criar Template
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="library">Biblioteca</TabsTrigger>
        </TabsList>

        {/* Aba Templates */}
        <TabsContent value="templates" className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar templates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Tipo de conteúdo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="course">Curso</SelectItem>
                    <SelectItem value="lesson">Lição</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="exam">Exame</SelectItem>
                    <SelectItem value="assignment">Exercício</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Templates */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={template.isActive ? 'default' : 'secondary'}>
                        {template.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <FileText className="h-4 w-4" />
                      <span className="capitalize">{template.type}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Tag className="h-4 w-4" />
                      <span>{template.category}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>{template.usageCount} usos</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-500">PROMPT</Label>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <code className="text-xs text-gray-700 line-clamp-3">
                        {template.prompt}
                      </code>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-500">VARIÁVEIS ({template.variables.length})</Label>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.slice(0, 5).map((variable, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          &#123;{variable.name}&#125;
                        </Badge>
                      ))}
                      {template.variables.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.variables.length - 5} mais
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-xs text-gray-500">
                      Atualizado em {template.updatedAt.toLocaleDateString()}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => duplicateTemplate(template)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum template encontrado</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterType !== 'all' || filterCategory !== 'all'
                    ? 'Tente ajustar os filtros de busca'
                    : 'Crie seu primeiro template para começar'
                  }
                </p>
                {!searchTerm && filterType === 'all' && filterCategory === 'all' && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Template
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Aba Performance */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">146</p>
                    <p className="text-sm text-gray-600">Total de Usos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">95.8%</p>
                    <p className="text-sm text-gray-600">Taxa de Sucesso</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">6.8min</p>
                    <p className="text-sm text-gray-600">Tempo Médio</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">4.5</p>
                    <p className="text-sm text-gray-600">Avaliação Média</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance por Template</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templatePerformance.map((perf) => {
                  const template = templates.find(t => t.id === perf.templateId);
                  if (!template) return null;

                  return (
                    <div key={perf.templateId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">{template.name}</h3>
                        <Badge variant="outline">
                          {perf.usageCount} usos
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Qualidade:</span>
                          <div className="font-medium">{perf.averageQualityScore.toFixed(1)}%</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Avaliação:</span>
                          <div className="font-medium">{perf.averageUserRating.toFixed(1)}/5</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Sucesso:</span>
                          <div className="font-medium">{perf.successRate.toFixed(1)}%</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Tempo:</span>
                          <div className="font-medium">{perf.averageGenerationTime.toFixed(1)}min</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Biblioteca */}
        <TabsContent value="library" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Biblioteca de Conteúdo</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Biblioteca de conteúdo em desenvolvimento</p>
                <p className="text-sm">Em breve você poderá gerenciar bibliotecas de conteúdo reutilizável</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AITemplates;