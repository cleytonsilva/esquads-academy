import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { learningPathsService, type LearningPathWithCourses } from '@/services/learningPathsService'
import { 
  Route, 
  Clock, 
  BookOpen, 
  Star, 
  Play, 
  CheckCircle, 
  Lock, 
  ArrowLeft,
  Users,
  Calendar,
  Target
} from 'lucide-react'

export default function StudentPathDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [path, setPath] = useState<LearningPathWithCourses | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    if (id) {
      loadPath()
    }
  }, [id])

  const loadPath = async () => {
    if (!id) return
    
    try {
      setLoading(true)
      setError(null)
      const pathData = await learningPathsService.getPathById(id)
      setPath(pathData)
    } catch (e: any) {
      setError(e?.message || 'Erro ao carregar trilha')
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async () => {
    if (!id) return
    
    try {
      setEnrolling(true)
      await learningPathsService.enrollInPath(id)
      // Recarregar dados da trilha
      await loadPath()
    } catch (e: any) {
      setError(e?.message || 'Erro ao se inscrever na trilha')
    } finally {
      setEnrolling(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Iniciante'
      case 'intermediate': return 'Intermediário'
      case 'advanced': return 'Avançado'
      default: return difficulty
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Carregando trilha...</p>
      </div>
    </div>
  )

  if (error || !path) return (
    <div className="container mx-auto py-6">
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6 text-center">
          <p className="text-red-600 mb-4">{error || 'Trilha não encontrada'}</p>
          <Button onClick={() => navigate('/student/paths')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Trilhas
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  const isEnrolled = !!path.user_progress
  const progressPercentage = path.user_progress?.progress_percentage || 0

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="outline" onClick={() => navigate('/student/paths')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex items-center space-x-2">
          <Route className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">{path.name}</h1>
        </div>
      </div>

      {/* Informações Principais */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{path.name}</CardTitle>
              <p className="text-muted-foreground">{path.description}</p>
            </div>
            <Badge className={getDifficultyColor(path.difficulty)}>
              {getDifficultyLabel(path.difficulty)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{path.estimated_duration_hours}h</p>
                <p className="text-xs text-muted-foreground">Duração estimada</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{path.courses.length}</p>
                <p className="text-xs text-muted-foreground">Cursos</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{path.level}</p>
                <p className="text-xs text-muted-foreground">Nível</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Novo</p>
                <p className="text-xs text-muted-foreground">Trilha</p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {path.tags && path.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {path.tags.map((tag, index) => (
                <Badge key={index} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Progresso do usuário */}
          {isEnrolled && (
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Seu Progresso</h3>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Status: {path.user_progress?.status}</span>
                <span>
                  {path.user_progress?.completed_at 
                    ? `Concluído em ${new Date(path.user_progress.completed_at).toLocaleDateString('pt-BR')}`
                    : `Último acesso: ${new Date(path.user_progress?.last_accessed_at || '').toLocaleDateString('pt-BR')}`
                  }
                </span>
              </div>
            </div>
          )}

          {/* Botão de ação principal */}
          <div className="flex space-x-4">
            {isEnrolled ? (
              <Button size="lg" className="flex-1">
                <Play className="h-5 w-5 mr-2" />
                Continuar Trilha
              </Button>
            ) : (
              <Button 
                size="lg" 
                className="flex-1" 
                onClick={handleEnroll}
                disabled={enrolling}
              >
                <Route className="h-5 w-5 mr-2" />
                {enrolling ? 'Inscrevendo...' : 'Iniciar Trilha'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo da Trilha */}
      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="courses">Cursos ({path.courses.length})</TabsTrigger>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <div className="grid gap-4">
            {path.courses.map((course, index) => (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-semibold">
                          {index + 1}
                        </div>
                        <h3 className="text-lg font-semibold">{course.title}</h3>
                        {course.is_required && (
                          <Badge variant="secondary">Obrigatório</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-3">{course.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{course.duration_hours}h</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4" />
                          <span>{course.difficulty}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {index === 0 || (path.courses[index - 1] && true) ? (
                        <Button asChild>
                          <Link to={`/student/courses/${course.id}`}>
                            <Play className="h-4 w-4 mr-2" />
                            Iniciar
                          </Link>
                        </Button>
                      ) : (
                        <Button disabled>
                          <Lock className="h-4 w-4 mr-2" />
                          Bloqueado
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sobre esta Trilha</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Esta trilha foi projetada para fornecer uma experiência de aprendizado estruturada 
                e progressiva. Cada curso foi cuidadosamente selecionado e organizado para garantir 
                que você desenvolva as habilidades necessárias de forma eficiente.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">O que você aprenderá:</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>Conceitos fundamentais da área</li>
                    <li>Práticas profissionais</li>
                    <li>Ferramentas essenciais</li>
                    <li>Projetos práticos</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Pré-requisitos:</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>Conhecimento básico de informática</li>
                    <li>Motivação para aprender</li>
                    <li>Tempo disponível para estudo</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}