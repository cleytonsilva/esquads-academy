// Esquads Academy - Controle de Qualidade IA

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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  ThumbsUp, 
  ThumbsDown,
  Settings,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  Clock,
  Users,
  FileText,
  MessageSquare,
  Star,
  Target,
  Zap,
  Brain,
  BookOpen,
  Award,
  RefreshCw,
  Download,
  Calendar,
  MoreHorizontal,
  Lightbulb
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  AIQualityMetrics, 
  AIQualityIssue, 
  AIQualityConfig,
  AIQualityStatus,
  AIContentType,
  AISystemStats
} from '@/types/ai';

const AIQuality: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<AIQualityStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<AIContentType | 'all'>('all');
  const [selectedMetrics, setSelectedMetrics] = useState<AIQualityMetrics | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);

  // Mock data para métricas de qualidade
  const [qualityMetrics, setQualityMetrics] = useState<AIQualityMetrics[]>([
    {
      id: '1',
      contentId: 'course_001',
      contentType: 'course',
      overallScore: 87.5,
      metrics: {
        clarity: 90,
        accuracy: 85,
        engagement: 88,
        pedagogicalValue: 92,
        grammarScore: 95,
        coherence: 82
      },
      issues: [
        {
          type: 'content',
          severity: 'medium',
          description: 'Alguns conceitos poderiam ser explicados com mais detalhes',
          location: 'Módulo 2, Lição 3',
          suggestion: 'Adicionar exemplos práticos para conceitos abstratos'
        }
      ],
      suggestions: [
        'Incluir mais exercícios práticos',
        'Adicionar glossário de termos técnicos'
      ],
      status: 'approved',
      autoApproved: false,
      reviewedBy: 'admin',
      reviewedAt: new Date('2024-01-20T10:30:00')
    },
    {
      id: '2',
      contentId: 'quiz_001',
      contentType: 'quiz',
      overallScore: 92.3,
      metrics: {
        clarity: 95,
        accuracy: 90,
        engagement: 88,
        pedagogicalValue: 94,
        grammarScore: 98,
        coherence: 90
      },
      issues: [],
      suggestions: [
        'Excelente qualidade geral',
        'Questões bem estruturadas'
      ],
      status: 'approved',
      autoApproved: true
    },
    {
      id: '3',
      contentId: 'lesson_001',
      contentType: 'lesson',
      overallScore: 76.2,
      metrics: {
        clarity: 75,
        accuracy: 80,
        engagement: 70,
        pedagogicalValue: 78,
        grammarScore: 85,
        coherence: 72
      },
      issues: [
        {
          type: 'engagement',
          severity: 'high',
          description: 'Conteúdo muito teórico, falta interatividade',
          location: 'Seção principal',
          suggestion: 'Adicionar elementos interativos e exemplos práticos'
        },
        {
          type: 'structure',
          severity: 'medium',
          description: 'Organização do conteúdo pode ser melhorada',
          location: 'Estrutura geral',
          suggestion: 'Reorganizar tópicos em ordem lógica'
        }
      ],
      suggestions: [
        'Incluir mais elementos visuais',
        'Adicionar exercícios práticos',
        'Melhorar a estrutura do conteúdo'
      ],
      status: 'needs_review'
    },
    {
      id: '4',
      contentId: 'exam_001',
      contentType: 'exam',
      overallScore: 68.5,
      metrics: {
        clarity: 70,
        accuracy: 75,
        engagement: 65,
        pedagogicalValue: 72,
        grammarScore: 80,
        coherence: 68
      },
      issues: [
        {
          type: 'accuracy',
          severity: 'critical',
          description: 'Algumas questões contêm informações incorretas',
          location: 'Questões 5, 8, 12',
          suggestion: 'Revisar e corrigir as informações técnicas'
        }
      ],
      suggestions: [
        'Revisar todas as questões para precisão técnica',
        'Melhorar clareza das perguntas'
      ],
      status: 'rejected'
    }
  ]);

  // Mock data para configurações de qualidade
  const [qualityConfig, setQualityConfig] = useState<AIQualityConfig>({
    id: '1',
    name: 'Configuração Padrão',
    minOverallScore: 75,
    autoApproveThreshold: 85,
    requiredMetrics: {
      clarity: 70,
      accuracy: 80,
      engagement: 65,
      pedagogicalValue: 70,
      grammarScore: 85,
      coherence: 65
    },
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  });

  // Mock data para estatísticas do sistema
  const [systemStats, setSystemStats] = useState<AISystemStats>({
    totalGenerations: 156,
    successfulGenerations: 142,
    failedGenerations: 14,
    averageGenerationTime: 8.5,
    averageQualityScore: 82.3,
    templatesCount: 12,
    activeTemplates: 10,
    pendingReviews: 8,
    autoApprovedContent: 89,
    manuallyApprovedContent: 45,
    rejectedContent: 8
  });

  // Filtrar métricas
  const filteredMetrics = qualityMetrics.filter(metric => {
    const matchesSearch = metric.contentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || metric.status === filterStatus;
    const matchesType = filterType === 'all' || metric.contentType === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Função para aprovar conteúdo
  const approveContent = (metricId: string) => {
    setQualityMetrics(prev => prev.map(metric => 
      metric.id === metricId 
        ? { 
            ...metric, 
            status: 'approved',
            reviewedBy: user?.email || 'admin',
            reviewedAt: new Date()
          }
        : metric
    ));
    toast.success('Conteúdo aprovado com sucesso!');
  };

  // Função para rejeitar conteúdo
  const rejectContent = (metricId: string) => {
    setQualityMetrics(prev => prev.map(metric => 
      metric.id === metricId 
        ? { 
            ...metric, 
            status: 'rejected',
            reviewedBy: user?.email || 'admin',
            reviewedAt: new Date()
          }
        : metric
    ));
    toast.success('Conteúdo rejeitado');
  };

  // Função para marcar como precisa revisão
  const markForReview = (metricId: string) => {
    setQualityMetrics(prev => prev.map(metric => 
      metric.id === metricId 
        ? { 
            ...metric, 
            status: 'needs_review',
            reviewedBy: user?.email || 'admin',
            reviewedAt: new Date()
          }
        : metric
    ));
    toast.info('Marcado para revisão');
  };

  // Função para obter cor do score
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Função para obter cor do badge de status
  const getStatusBadgeVariant = (status: AIQualityStatus) => {
    switch (status) {
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'needs_review': return 'secondary';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };

  // Função para obter texto do status
  const getStatusText = (status: AIQualityStatus) => {
    switch (status) {
      case 'approved': return 'Aprovado';
      case 'rejected': return 'Rejeitado';
      case 'needs_review': return 'Precisa Revisão';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Shield className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Controle de Qualidade IA</h1>
            <p className="text-gray-600">Dashboard de validação e métricas de qualidade</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600 border-green-200">
            {systemStats.pendingReviews} Pendentes
          </Badge>
          <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Configurações de Qualidade</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Score Mínimo Geral</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={qualityConfig.minOverallScore}
                      onChange={(e) => setQualityConfig(prev => ({
                        ...prev,
                        minOverallScore: parseInt(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Limite para Auto-aprovação</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={qualityConfig.autoApproveThreshold}
                      onChange={(e) => setQualityConfig(prev => ({
                        ...prev,
                        autoApproveThreshold: parseInt(e.target.value) || 0
                      }))}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label>Métricas Mínimas Requeridas</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(qualityConfig.requiredMetrics).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <Label className="capitalize">{key}</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={value}
                          onChange={(e) => setQualityConfig(prev => ({
                            ...prev,
                            requiredMetrics: {
                              ...prev.requiredMetrics,
                              [key]: parseInt(e.target.value) || 0
                            }
                          }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => {
                    setIsConfigDialogOpen(false);
                    toast.success('Configurações salvas!');
                  }}>
                    Salvar Configurações
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="reviews">Revisões</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Aba Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Estatísticas Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{systemStats.averageQualityScore.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Score Médio</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{systemStats.autoApprovedContent}</p>
                    <p className="text-sm text-gray-600">Auto-aprovados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">{systemStats.pendingReviews}</p>
                    <p className="text-sm text-gray-600">Pendentes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold">{systemStats.rejectedContent}</p>
                    <p className="text-sm text-gray-600">Rejeitados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo de Qualidade */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Distribuição de Scores</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Excelente (85-100)</span>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Bom (70-84)</span>
                    <span className="text-sm font-medium">35%</span>
                  </div>
                  <Progress value={35} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Regular (50-69)</span>
                    <span className="text-sm font-medium">15%</span>
                  </div>
                  <Progress value={15} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Ruim (&lt;50)</span>
                    <span className="text-sm font-medium">5%</span>
                  </div>
                  <Progress value={5} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Métricas por Categoria</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(qualityConfig.requiredMetrics).map(([key, threshold]) => {
                  const avgScore = Math.floor(Math.random() * 30) + 70; // Mock data
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm capitalize">{key}</span>
                        <span className={`text-sm font-medium ${getScoreColor(avgScore)}`}>
                          {avgScore}%
                        </span>
                      </div>
                      <Progress value={avgScore} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Itens Recentes Pendentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Itens Pendentes de Revisão</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {qualityMetrics
                  .filter(metric => metric.status === 'pending' || metric.status === 'needs_review')
                  .slice(0, 5)
                  .map((metric) => (
                    <div key={metric.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="capitalize">
                            {metric.contentType}
                          </Badge>
                          <span className="font-medium">{metric.contentId}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Score: {metric.overallScore.toFixed(1)}%</span>
                          <span>{metric.issues.length} problemas</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedMetrics(metric)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Revisar
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Revisões */}
        <TabsContent value="reviews" className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por ID do conteúdo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="approved">Aprovado</SelectItem>
                    <SelectItem value="rejected">Rejeitado</SelectItem>
                    <SelectItem value="needs_review">Precisa Revisão</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Tipo" />
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
              </div>
            </CardContent>
          </Card>

          {/* Lista de Revisões */}
          <div className="space-y-4">
            {filteredMetrics.map((metric) => (
              <Card key={metric.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="capitalize">
                          {metric.contentType}
                        </Badge>
                        <span className="font-medium">{metric.contentId}</span>
                        <Badge variant={getStatusBadgeVariant(metric.status)}>
                          {getStatusText(metric.status)}
                        </Badge>
                        {metric.autoApproved && (
                          <Badge variant="outline" className="text-blue-600 border-blue-200">
                            Auto-aprovado
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Score Geral:</span>
                          <div className={`font-medium ${getScoreColor(metric.overallScore)}`}>
                            {metric.overallScore.toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Clareza:</span>
                          <div className={`font-medium ${getScoreColor(metric.metrics.clarity)}`}>
                            {metric.metrics.clarity}%
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Precisão:</span>
                          <div className={`font-medium ${getScoreColor(metric.metrics.accuracy)}`}>
                            {metric.metrics.accuracy}%
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Engajamento:</span>
                          <div className={`font-medium ${getScoreColor(metric.metrics.engagement)}`}>
                            {metric.metrics.engagement}%
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Pedagógico:</span>
                          <div className={`font-medium ${getScoreColor(metric.metrics.pedagogicalValue)}`}>
                            {metric.metrics.pedagogicalValue}%
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Gramática:</span>
                          <div className={`font-medium ${getScoreColor(metric.metrics.grammarScore)}`}>
                            {metric.metrics.grammarScore}%
                          </div>
                        </div>
                      </div>

                      {metric.issues.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-gray-500">PROBLEMAS IDENTIFICADOS</Label>
                          {metric.issues.map((issue, index) => (
                            <div key={index} className="flex items-start space-x-2 p-2 bg-red-50 rounded-md">
                              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                              <div className="text-sm">
                                <div className="font-medium text-red-700">{issue.description}</div>
                                {issue.location && (
                                  <div className="text-red-600">Local: {issue.location}</div>
                                )}
                                {issue.suggestion && (
                                  <div className="text-red-600">Sugestão: {issue.suggestion}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {metric.reviewedBy && metric.reviewedAt && (
                        <div className="text-xs text-gray-500">
                          Revisado por {metric.reviewedBy} em {metric.reviewedAt.toLocaleString()}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedMetrics(metric)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Detalhes
                      </Button>
                      {metric.status === 'pending' || metric.status === 'needs_review' ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => approveContent(metric.id)}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => rejectContent(metric.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <ThumbsDown className="h-4 w-4 mr-1" />
                            Rejeitar
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markForReview(metric.id)}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Revisar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredMetrics.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum item encontrado</h3>
                <p className="text-gray-600">
                  {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                    ? 'Tente ajustar os filtros de busca'
                    : 'Não há itens para revisão no momento'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Aba Métricas */}
        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Atuais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Score Mínimo:</span>
                    <div className="font-medium">{qualityConfig.minOverallScore}%</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Auto-aprovação:</span>
                    <div className="font-medium">{qualityConfig.autoApproveThreshold}%</div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Limites por Métrica</Label>
                  {Object.entries(qualityConfig.requiredMetrics).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span className="capitalize text-gray-600">{key}:</span>
                      <span className="font-medium">{value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Taxa de Sucesso:</span>
                    <div className="font-medium text-green-600">
                      {((systemStats.successfulGenerations / systemStats.totalGenerations) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Tempo Médio:</span>
                    <div className="font-medium">{systemStats.averageGenerationTime}min</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Templates Ativos:</span>
                    <div className="font-medium">{systemStats.activeTemplates}/{systemStats.templatesCount}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Auto-aprovação:</span>
                    <div className="font-medium">
                      {((systemStats.autoApprovedContent / (systemStats.autoApprovedContent + systemStats.manuallyApprovedContent)) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Analytics Avançados</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Analytics avançados em desenvolvimento</p>
                <p className="text-sm">Em breve você terá acesso a relatórios detalhados e insights</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Detalhes */}
      {selectedMetrics && (
        <Dialog open={!!selectedMetrics} onOpenChange={() => setSelectedMetrics(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes da Qualidade - {selectedMetrics.contentId}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`text-2xl font-bold ${getScoreColor(selectedMetrics.overallScore)}`}>
                    {selectedMetrics.overallScore.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Score Geral</div>
                </div>
                {Object.entries(selectedMetrics.metrics).map(([key, value]) => (
                  <div key={key} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className={`text-xl font-bold ${getScoreColor(value)}`}>
                      {value}%
                    </div>
                    <div className="text-sm text-gray-600 capitalize">{key}</div>
                  </div>
                ))}
              </div>

              {selectedMetrics.issues.length > 0 && (
                <div className="space-y-3">
                  <Label className="font-medium">Problemas Identificados</Label>
                  {selectedMetrics.issues.map((issue, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant={issue.severity === 'critical' ? 'destructive' : 
                                      issue.severity === 'high' ? 'destructive' :
                                      issue.severity === 'medium' ? 'secondary' : 'outline'}>
                          {issue.severity}
                        </Badge>
                        <span className="font-medium">{issue.type}</span>
                      </div>
                      <p className="text-sm">{issue.description}</p>
                      {issue.location && (
                        <p className="text-sm text-gray-600">Local: {issue.location}</p>
                      )}
                      {issue.suggestion && (
                        <p className="text-sm text-blue-600">Sugestão: {issue.suggestion}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {selectedMetrics.suggestions.length > 0 && (
                <div className="space-y-3">
                  <Label className="font-medium">Sugestões de Melhoria</Label>
                  <ul className="space-y-2">
                    {selectedMetrics.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                        <span className="text-sm">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedMetrics(null)}>
                  Fechar
                </Button>
                {(selectedMetrics.status === 'pending' || selectedMetrics.status === 'needs_review') && (
                  <>
                    <Button
                      onClick={() => {
                        approveContent(selectedMetrics.id);
                        setSelectedMetrics(null);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Aprovar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        rejectContent(selectedMetrics.id);
                        setSelectedMetrics(null);
                      }}
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Rejeitar
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AIQuality;