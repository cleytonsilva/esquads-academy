/**
 * Certification Hub - Componente principal para exibição de certificações
 * Implementa o hub de simulados como provas de certificação das empresas
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { 
  Search, 
  Clock, 
  Trophy, 
  Target, 
  CheckCircle, 
  Play, 
  Terminal, 
  Shield, 
  Cloud, 
  Bug, 
  Network, 
  AlertTriangle, 
  Award, 
  Flag, 
  Users, 
  Eye,
  Star,
  TrendingUp,
  BookOpen,
  Certificate,
  Zap
} from 'lucide-react'
import { CERTIFICATION_PROVIDERS } from '@/utils/constants'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface Certification {
  id: string
  name: string
  provider: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number // em minutos
  questions: number
  passingScore: number
  topics: string[]
  icon: React.ReactNode
  color: string
  attempts: number
  bestScore?: number
  lastAttempt?: string
  status: 'available' | 'in_progress' | 'completed' | 'locked'
}

interface CertificationHubProps {
  className?: string
}

export const CertificationHub: React.FC<CertificationHubProps> = ({ className }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProvider, setSelectedProvider] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('available')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCertification, setSelectedCertification] = useState<Certification | null>(null)
  const [examConfig, setExamConfig] = useState({
    questionCount: 25,
    difficulty: 'mixed',
    timeLimit: 90,
    mode: 'timed'
  })
  const [attemptHistory, setAttemptHistory] = useState<any[]>([])

  // Mock data - será substituído por dados reais do Supabase
  useEffect(() => {
    const loadCertifications = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Simular carregamento de certificações
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const mockCertifications: Certification[] = [
          {
            id: 'aws-cloud-practitioner',
            name: 'AWS Cloud Practitioner',
            provider: 'AWS',
            description: 'Fundamentos da AWS e serviços de nuvem básicos',
            difficulty: 'beginner',
            duration: 90,
            questions: 65,
            passingScore: 70,
            topics: ['Cloud Concepts', 'Security', 'Technology', 'Billing'],
            icon: <Cloud className="w-6 h-6" />,
            color: 'bg-orange-100 text-orange-800',
            attempts: 0,
            status: 'available'
          },
          {
            id: 'aws-solutions-architect',
            name: 'AWS Solutions Architect',
            provider: 'AWS',
            description: 'Arquitetura de soluções escaláveis na AWS',
            difficulty: 'advanced',
            duration: 130,
            questions: 65,
            passingScore: 72,
            topics: ['Design Systems', 'Security', 'Reliability', 'Performance'],
            icon: <Cloud className="w-6 h-6" />,
            color: 'bg-orange-100 text-orange-800',
            attempts: 0,
            status: 'available'
          },
          {
            id: 'azure-fundamentals',
            name: 'Azure Fundamentals',
            provider: 'Azure',
            description: 'Conceitos fundamentais do Microsoft Azure',
            difficulty: 'beginner',
            duration: 85,
            questions: 60,
            passingScore: 70,
            topics: ['Cloud Concepts', 'Azure Services', 'Security', 'Pricing'],
            icon: <Shield className="w-6 h-6" />,
            color: 'bg-blue-100 text-blue-800',
            attempts: 0,
            status: 'available'
          },
          {
            id: 'comptia-security-plus',
            name: 'CompTIA Security+',
            provider: 'CompTIA',
            description: 'Fundamentos de segurança da informação',
            difficulty: 'intermediate',
            duration: 90,
            questions: 90,
            passingScore: 75,
            topics: ['Threats', 'Vulnerabilities', 'Architecture', 'Operations'],
            icon: <Shield className="w-6 h-6" />,
            color: 'bg-green-100 text-green-800',
            attempts: 0,
            status: 'available'
          },
          {
            id: 'cissp',
            name: 'CISSP',
            provider: 'ISC2',
            description: 'Certified Information Systems Security Professional',
            difficulty: 'advanced',
            duration: 180,
            questions: 100,
            passingScore: 70,
            topics: ['Security Architecture', 'Risk Management', 'Cryptography', 'Operations'],
            icon: <Shield className="w-6 h-6" />,
            color: 'bg-purple-100 text-purple-800',
            attempts: 0,
            status: 'locked'
          },
          {
            id: 'ceh',
            name: 'CEH',
            provider: 'EC-Council',
            description: 'Certified Ethical Hacker',
            difficulty: 'intermediate',
            duration: 240,
            questions: 125,
            passingScore: 70,
            topics: ['Ethical Hacking', 'Penetration Testing', 'Vulnerability Assessment'],
            icon: <Bug className="w-6 h-6" />,
            color: 'bg-red-100 text-red-800',
            attempts: 0,
            status: 'available'
          }
        ]
        
        setCertifications(mockCertifications)
        console.log('✅ Certificações carregadas:', mockCertifications.length)
        
      } catch (error) {
        console.error('❌ Erro ao carregar certificações:', error)
        setError('Erro ao carregar certificações. Tente novamente.')
        toast.error('Erro ao carregar certificações')
      } finally {
        setLoading(false)
      }
    }

    loadCertifications()
  }, [])

  // Filtros
  const providers = [
    { value: 'all', label: 'Todos os Provedores' },
    { value: 'AWS', label: 'AWS' },
    { value: 'Azure', label: 'Microsoft Azure' },
    { value: 'CompTIA', label: 'CompTIA' },
    { value: 'ISC2', label: 'ISC2' },
    { value: 'EC-Council', label: 'EC-Council' },
    { value: 'Cisco', label: 'Cisco' },
    { value: 'Oracle', label: 'Oracle' }
  ]

  const difficulties = [
    { value: 'all', label: 'Todas as Dificuldades' },
    { value: 'beginner', label: 'Iniciante' },
    { value: 'intermediate', label: 'Intermediário' },
    { value: 'advanced', label: 'Avançado' }
  ]

  // Filtrar certificações
  const filteredCertifications = certifications.filter(cert => {
    const matchesSearch = cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProvider = selectedProvider === 'all' || cert.provider === selectedProvider
    const matchesDifficulty = selectedDifficulty === 'all' || cert.difficulty === selectedDifficulty
    
    return matchesSearch && matchesProvider && matchesDifficulty
  })

  // Agrupar certificações por status
  const availableCertifications = filteredCertifications.filter(c => c.status === 'available')
  const inProgressCertifications = filteredCertifications.filter(c => c.status === 'in_progress')
  const completedCertifications = filteredCertifications.filter(c => c.status === 'completed')
  const lockedCertifications = filteredCertifications.filter(c => c.status === 'locked')

  // Estatísticas
  const stats = {
    total: certifications.length,
    available: availableCertifications.length,
    inProgress: inProgressCertifications.length,
    completed: completedCertifications.length,
    locked: lockedCertifications.length,
    totalAttempts: certifications.reduce((sum, c) => sum + c.attempts, 0)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'Iniciante'
      case 'intermediate':
        return 'Intermediário'
      case 'advanced':
        return 'Avançado'
      default:
        return 'Desconhecido'
    }
  }

  const handleStartCertification = async (certification: Certification) => {
    if (!user) return

    setSelectedCertification(certification)
    
    // Carregar histórico de tentativas para esta certificação
    await loadAttemptHistory(certification.id)
    
    // Resetar configuração padrão
    setExamConfig({
      questionCount: certification.questions,
      difficulty: 'mixed',
      timeLimit: certification.duration,
      mode: 'timed'
    })
  }

  const loadAttemptHistory = async (certificationId: string) => {
    // Mock data - será substituído por dados reais do Supabase
    const mockHistory = [
      {
        id: '1',
        date: '2025-01-20',
        score: 85,
        timeSpent: 75,
        status: 'completed',
        questionsAnswered: 25
      },
      {
        id: '2', 
        date: '2025-01-15',
        score: 72,
        timeSpent: 90,
        status: 'completed',
        questionsAnswered: 25
      }
    ]
    setAttemptHistory(mockHistory)
  }

  const handleStartExam = async () => {
    if (!selectedCertification) return

    setActionLoading(true)
    try {
      console.log('🚀 Iniciando exame com configuração:', examConfig)
      
      // Simular início do exame
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success(`Exame "${selectedCertification.name}" iniciado!`)
      
      // Navegar para a página de exame com configuração
      navigate(`/student/simulations/exam/${selectedCertification.id}`, {
        state: { config: examConfig }
      })
    } catch (error) {
      console.error('❌ Erro ao iniciar exame:', error)
      toast.error('Erro ao iniciar exame. Tente novamente.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleContinueCertification = (certification: Certification) => {
    navigate(`/student/simulations/${certification.id}/exam`)
  }

  const handleViewResults = (certification: Certification) => {
    navigate(`/student/simulations/${certification.id}/results`)
  }

  // Loading state
  if (loading) {
    return (
      <div className={`p-6 space-y-6 ${className || ''}`}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600">⏳</div>
            <p className="text-gray-600">Carregando certificações...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={`p-6 space-y-6 ${className || ''}`}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-600" />
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-6 space-y-6 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Simulados de Certificação</h1>
          <p className="text-gray-600">Pratique para certificações de empresas líderes em tecnologia</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            <Trophy className="w-3 h-3 mr-1" />
            {stats.totalAttempts} Tentativas
          </Badge>
          <Badge variant="outline" className="text-sm">
            <Award className="w-3 h-3 mr-1" />
            {stats.completed} Concluídas
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Disponíveis</p>
                <p className="text-xl font-bold">{stats.available}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Em Progresso</p>
                <p className="text-xl font-bold">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Concluídas</p>
                <p className="text-xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tentativas</p>
                <p className="text-xl font-bold">{stats.totalAttempts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar certificações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Provedor" />
              </SelectTrigger>
              <SelectContent>
                {providers.map(provider => (
                  <SelectItem key={provider.value} value={provider.value}>
                    {provider.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Dificuldade" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map(difficulty => (
                  <SelectItem key={difficulty.value} value={difficulty.value}>
                    {difficulty.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Certification Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">Disponíveis ({stats.available})</TabsTrigger>
          <TabsTrigger value="progress">Em Progresso ({stats.inProgress})</TabsTrigger>
          <TabsTrigger value="completed">Concluídas ({stats.completed})</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableCertifications.map(certification => (
              <Card key={certification.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={certification.color}>
                        {certification.icon}
                      </div>
                      <CardTitle className="text-lg">{certification.name}</CardTitle>
                    </div>
                    <Badge className={getDifficultyColor(certification.difficulty)}>
                      {getDifficultyLabel(certification.difficulty)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-2">{certification.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{certification.duration}min</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-gray-500" />
                        <span>{certification.questions} questões</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-gray-500" />
                        <span>{certification.passingScore}% para aprovar</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span>{certification.attempts} tentativas</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {certification.provider}
                    </Badge>
                    <Button 
                      size="sm" 
                      onClick={() => handleStartCertification(certification)}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <div className="w-4 h-4 animate-spin">⏳</div>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-1" />
                          Configurar
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {availableCertifications.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma certificação disponível encontrada</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgressCertifications.map(certification => (
              <Card key={certification.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={certification.color}>
                        {certification.icon}
                      </div>
                      <CardTitle className="text-lg">{certification.name}</CardTitle>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">
                      Em Progresso
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-2">{certification.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progresso</span>
                      <span>{certification.bestScore || 0}%</span>
                    </div>
                    <Progress value={certification.bestScore || 0} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {certification.provider}
                    </Badge>
                    <Button 
                      size="sm" 
                      onClick={() => handleContinueCertification(certification)}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Continuar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {inProgressCertifications.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma certificação em progresso</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedCertifications.map(certification => (
              <Card key={certification.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={certification.color}>
                        {certification.icon}
                      </div>
                      <CardTitle className="text-lg">{certification.name}</CardTitle>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Concluída
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-2">{certification.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span>Melhor Score: {certification.bestScore || 0}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Aprovado</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {certification.provider}
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewResults(certification)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver Resultados
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {completedCertifications.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma certificação concluída ainda</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de Configuração de Exame */}
      <Dialog open={!!selectedCertification} onOpenChange={() => setSelectedCertification(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configurar Exame - {selectedCertification?.name}</DialogTitle>
            <DialogDescription>
              Configure as opções do seu exame antes de iniciar
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Configurações do Exame */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Configurações do Exame</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="questionCount">Número de Questões</Label>
                  <Select 
                    value={examConfig.questionCount.toString()} 
                    onValueChange={(value) => setExamConfig(prev => ({ ...prev, questionCount: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 questões (15 min)</SelectItem>
                      <SelectItem value="25">25 questões (30 min)</SelectItem>
                      <SelectItem value="50">50 questões (60 min)</SelectItem>
                      <SelectItem value="100">100 questões (120 min)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Dificuldade</Label>
                  <Select 
                    value={examConfig.difficulty} 
                    onValueChange={(value) => setExamConfig(prev => ({ ...prev, difficulty: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Fácil</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="hard">Difícil</SelectItem>
                      <SelectItem value="mixed">Misto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Modo do Exame</Label>
                <RadioGroup 
                  value={examConfig.mode} 
                  onValueChange={(value) => setExamConfig(prev => ({ ...prev, mode: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="timed" id="timed" />
                    <Label htmlFor="timed">Com Timer ({examConfig.timeLimit} min)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="practice" id="practice" />
                    <Label htmlFor="practice">Modo Prática (sem timer)</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Histórico de Tentativas */}
            {attemptHistory.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Histórico de Tentativas</h3>
                <div className="space-y-2">
                  {attemptHistory.map((attempt, index) => (
                    <div key={attempt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{attempt.date}</p>
                          <p className="text-xs text-gray-500">{attempt.questionsAnswered} questões em {attempt.timeSpent}min</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600">{attempt.score}%</p>
                        <p className="text-xs text-gray-500">{attempt.status === 'completed' ? 'Concluído' : 'Incompleto'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setSelectedCertification(null)}>
                Cancelar
              </Button>
              <Button onClick={handleStartExam} disabled={actionLoading}>
                {actionLoading ? (
                  <div className="w-4 h-4 animate-spin mr-2">⏳</div>
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                Iniciar Exame
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CertificationHub
