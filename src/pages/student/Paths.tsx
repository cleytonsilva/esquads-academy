import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/utils/constants'
import { learningPathsService, type LearningPathWithCourses } from '@/services/learningPathsService'
import { Route, Clock, Users, Star, BookOpen, Play } from 'lucide-react'

export default function StudentPaths() {
  const [paths, setPaths] = useState<LearningPathWithCourses[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPaths()
  }, [])

  const loadPaths = async () => {
    try {
      setLoading(true)
      setError(null)
      const publishedPaths = await learningPathsService.getPublishedPaths()
      const userPaths = await learningPathsService.getUserPaths()
      
      // Combinar trilhas publicadas com progresso do usuário
      const pathsWithProgress = publishedPaths.map(path => {
        const userProgress = userPaths.find(up => up.id === path.id)?.user_progress
        return {
          ...path,
          user_progress: userProgress
        }
      })
      
      setPaths(pathsWithProgress)
    } catch (e: any) {
      setError(e?.message || 'Erro ao carregar trilhas')
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async (pathId: string) => {
    try {
      await learningPathsService.enrollInPath(pathId)
      // Recarregar trilhas para mostrar o novo progresso
      loadPaths()
    } catch (e: any) {
      setError(e?.message || 'Erro ao se inscrever na trilha')
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
        <p className="text-muted-foreground">Carregando trilhas...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="p-4">
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-600">{error}</p>
          <Button onClick={loadPaths} className="mt-4">
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Route className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Trilhas de Aprendizado</h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Siga trilhas estruturadas para dominar diferentes áreas da tecnologia. 
          Cada trilha combina cursos, missões e simulados para uma experiência completa.
        </p>
      </div>

      {/* Trilhas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paths.map((path) => (
          <Card key={path.id} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <CardTitle className="text-xl line-clamp-2">{path.name}</CardTitle>
                <Badge className={getDifficultyColor(path.difficulty)}>
                  {getDifficultyLabel(path.difficulty)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {path.description}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Tags */}
              {path.tags && path.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {path.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {path.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{path.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Estatísticas */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{path.estimated_duration_hours}h</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{path.courses?.length || 0} cursos</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4" />
                  <span>{path.level}</span>
                </div>
              </div>

              {/* Progresso do usuário */}
              {path.user_progress && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Seu Progresso</span>
                    <span className="text-muted-foreground">
                      {Math.round(path.user_progress.progress_percentage)}%
                    </span>
                  </div>
                  <Progress 
                    value={path.user_progress.progress_percentage} 
                    className="h-2"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Status: {path.user_progress.status}</span>
                    <span>
                      {path.user_progress.completed_at 
                        ? `Concluído em ${new Date(path.user_progress.completed_at).toLocaleDateString('pt-BR')}`
                        : `Último acesso: ${new Date(path.user_progress.last_accessed_at).toLocaleDateString('pt-BR')}`
                      }
                    </span>
                  </div>
                </div>
              )}

              {/* Botão de ação */}
              <div className="pt-2">
                {path.user_progress ? (
                  <Button asChild className="w-full">
                    <Link to={`/student/paths/${path.id}`}>
                      <Play className="h-4 w-4 mr-2" />
                      Continuar Trilha
                    </Link>
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleEnroll(path.id)}
                    className="w-full"
                  >
                    <Route className="h-4 w-4 mr-2" />
                    Iniciar Trilha
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mensagem se não houver trilhas */}
      {paths.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Route className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma trilha disponível</h3>
            <p className="text-muted-foreground">
              Novas trilhas serão adicionadas em breve. Fique atento!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

