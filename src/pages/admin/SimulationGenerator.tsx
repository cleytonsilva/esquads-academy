/**
 * Página de Administração - Gerador de Simulados
 * Implementa criação inteligente de simulados baseada em IA e configurações
 */

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { 
  Plus, 
  Search, 
  Filter, 
  Bot, 
  Check, 
  X, 
  Eye, 
  Play,
  Settings,
  BarChart3,
  Clock,
  Target,
  Brain,
  Loader2,
  AlertCircle,
  CheckCircle,
  Zap,
  BookOpen,
  Users,
  TrendingUp
} from 'lucide-react'
import { 
  SimulationConfig,
  GeneratedSimulation,
  CertificationProvider,
  QuestionDifficulty,
  CERTIFICATION_INFO
} from '@/types/certifications'
import { simulationService } from '@/services/simulationService'
import { certificationQuestionService } from '@/services/certificationQuestionService'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export default function SimulationGenerator() {
  const { user } = useAuth()
  const [configs, setConfigs] = useState<SimulationConfig[]>([])
  const [selectedConfig, setSelectedConfig] = useState<SimulationConfig | null>(null)
  const [customConfig, setCustomConfig] = useState<Partial<SimulationConfig>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedSimulation, setGeneratedSimulation] = useState<GeneratedSimulation | null>(null)
  const [questionStats, setQuestionStats] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('preset')

  // Carregar configurações e estatísticas
  useEffect(() => {
    loadConfigs()
    loadQuestionStats()
  }, [])

  const loadConfigs = async () => {
    try {
      const data = await simulationService.getSimulationConfigs()
      setConfigs(data)
    } catch (error) {
      toast.error('Erro ao carregar configurações')
      console.error(error)
    }
  }

  const loadQuestionStats = async () => {
    try {
      const stats = await certificationQuestionService.getQuestionStats()
      setQuestionStats(stats)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const generateSimulation = async () => {
    if (!user) return

    setIsGenerating(true)
    try {
      const config = activeTab === 'preset' ? selectedConfig : customConfig
      if (!config) {
        toast.error('Selecione uma configuração')
        return
      }

      const simulation = await simulationService.createSimulation(config as SimulationConfig, user.id)
      setGeneratedSimulation(simulation)
      toast.success('Simulado gerado com sucesso!')
    } catch (error) {
      toast.error('Erro ao gerar simulado')
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const previewSimulation = () => {
    // Implementar preview do simulado
    toast.info('Preview em desenvolvimento')
  }

  const publishSimulation = () => {
    // Implementar publicação do simulado
    toast.info('Publicação em desenvolvimento')
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerador de Simulados</h1>
          <p className="text-muted-foreground">
            Crie simulados personalizados usando IA e configurações inteligentes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            IA Ativa
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {questionStats?.total || 0} Questões
          </Badge>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      {questionStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Total de Questões</p>
                  <p className="text-2xl font-bold">{questionStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Aprovadas</p>
                  <p className="text-2xl font-bold">{questionStats.byStatus.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Pendentes</p>
                  <p className="text-2xl font-bold">{questionStats.byStatus.pending_review}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Taxa de Sucesso</p>
                  <p className="text-2xl font-bold">{Math.round(questionStats.averageSuccessRate)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuração */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuração do Simulado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="preset">Configurações Pré-definidas</TabsTrigger>
                <TabsTrigger value="custom">Configuração Personalizada</TabsTrigger>
              </TabsList>

              <TabsContent value="preset" className="space-y-4">
                <div>
                  <Label htmlFor="config-select">Selecionar Configuração</Label>
                  <Select value={selectedConfig?.id || ''} onValueChange={(value) => {
                    const config = configs.find(c => c.id === value)
                    setSelectedConfig(config || null)
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha uma configuração" />
                    </SelectTrigger>
                    <SelectContent>
                      {configs.map((config) => (
                        <SelectItem key={config.id} value={config.id}>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{config.certification}</Badge>
                            <span>{config.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedConfig && (
                  <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Certificação:</span>
                      <Badge>{selectedConfig.certification}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Questões:</span>
                      <span>{selectedConfig.question_count}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Tempo Limite:</span>
                      <span>{selectedConfig.time_limit || 'Sem limite'} min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Pontuação Mínima:</span>
                      <span>{selectedConfig.passing_score}%</span>
                    </div>
                    <div>
                      <span className="font-medium">Tópicos:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedConfig.topics.map((topic) => (
                          <Badge key={topic} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="custom" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="certification">Certificação</Label>
                    <Select value={customConfig.certification || ''} onValueChange={(value) => {
                      setCustomConfig(prev => ({ ...prev, certification: value as CertificationProvider }))
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CERTIFICATION_INFO).map(([key, info]) => (
                          <SelectItem key={key} value={key}>
                            {info.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="difficulty">Dificuldade</Label>
                    <Select value={customConfig.difficulty || ''} onValueChange={(value) => {
                      setCustomConfig(prev => ({ ...prev, difficulty: value as QuestionDifficulty }))
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Fácil</SelectItem>
                        <SelectItem value="medium">Médio</SelectItem>
                        <SelectItem value="hard">Difícil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="name">Nome do Simulado</Label>
                  <Input
                    value={customConfig.name || ''}
                    onChange={(e) => setCustomConfig(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: AWS Solutions Architect - Prática"
                  />
                </div>

                <div>
                  <Label htmlFor="question-count">Número de Questões</Label>
                  <Slider
                    value={[customConfig.question_count || 25]}
                    onValueChange={([value]) => setCustomConfig(prev => ({ ...prev, question_count: value }))}
                    min={10}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>10</span>
                    <span className="font-medium">{customConfig.question_count || 25}</span>
                    <span>100</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="time-limit">Tempo Limite (minutos)</Label>
                  <Input
                    type="number"
                    value={customConfig.time_limit || ''}
                    onChange={(e) => setCustomConfig(prev => ({ ...prev, time_limit: parseInt(e.target.value) || undefined }))}
                    placeholder="Ex: 90"
                  />
                </div>

                <div>
                  <Label htmlFor="passing-score">Pontuação Mínima (%)</Label>
                  <Slider
                    value={[customConfig.passing_score || 70]}
                    onValueChange={([value]) => setCustomConfig(prev => ({ ...prev, passing_score: value }))}
                    min={50}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>50%</span>
                    <span className="font-medium">{customConfig.passing_score || 70}%</span>
                    <span>100%</span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={generateSimulation} 
                disabled={isGenerating || (!selectedConfig && !customConfig.certification)}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4 mr-2" />
                    Gerar Simulado
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Simulado Gerado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {generatedSimulation ? (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Simulado gerado com sucesso! {generatedSimulation.question_count} questões selecionadas.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3 p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Certificação:</span>
                    <Badge variant="outline">{generatedSimulation.certification}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Dificuldade:</span>
                    <Badge variant="outline" className="capitalize">
                      {generatedSimulation.difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Questões:</span>
                    <span>{generatedSimulation.question_count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Expira em:</span>
                    <span>{new Date(generatedSimulation.expires_at!).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={previewSimulation} className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button onClick={publishSimulation} className="flex-1">
                    <Play className="h-4 w-4 mr-2" />
                    Publicar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum simulado gerado ainda</p>
                <p className="text-sm">Configure e gere seu primeiro simulado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Configurações Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {configs.map((config) => (
              <Card key={config.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{config.certification}</Badge>
                    <Badge variant={config.is_active ? "default" : "secondary"}>
                      {config.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <h3 className="font-medium mb-2">{config.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{config.description}</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Questões:</span>
                      <span>{config.question_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tempo:</span>
                      <span>{config.time_limit || 'Sem limite'} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mínimo:</span>
                      <span>{config.passing_score}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
