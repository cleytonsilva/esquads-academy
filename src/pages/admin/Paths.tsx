import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Edit, Trash2, Eye, Route, Clock, Users, Star } from 'lucide-react'
import { learningPathsService, type LearningPath } from '@/services/learningPathsService'
import { supabase } from '@/integrations/supabase/client'

interface PathForm {
  name: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimated_duration_hours: number
  tags: string[]
  is_published: boolean
  course_ids: string[]
}

export default function AdminPaths() {
  const [paths, setPaths] = useState<LearningPath[]>([])
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([])
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<PathForm>({
    name: '',
    description: '',
    level: 'beginner',
    difficulty: 'beginner',
    estimated_duration_hours: 0,
    tags: [],
    is_published: false,
    course_ids: []
  })
  const [tagInput, setTagInput] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPaths()
    loadCourses()
  }, [])

  const loadPaths = async () => {
    try {
      setLoading(true)
      const allPaths = await learningPathsService.getAllPaths()
      setPaths(allPaths)
    } catch (err) {
      console.error('Erro ao carregar trilhas:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title')
        .order('title')
      
      if (error) throw error
      setCourses(data || [])
    } catch (err) {
      console.error('Erro ao carregar cursos:', err)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      level: 'beginner',
      difficulty: 'beginner',
      estimated_duration_hours: 0,
      tags: [],
      is_published: false,
      course_ids: []
    })
    setTagInput('')
    setIsEditing(false)
    setSelectedPath(null)
    setSubmitError(null)
    setSubmitSuccess(null)
  }

  const handleEdit = (path: LearningPath) => {
    setFormData({
      name: path.name,
      description: path.description,
      level: path.level,
      difficulty: path.difficulty,
      estimated_duration_hours: path.estimated_duration_hours,
      tags: path.tags,
      is_published: path.is_published,
      course_ids: [] // TODO: Carregar cursos associados
    })
    setSelectedPath(path)
    setIsEditing(true)
    setShowForm(true)
  }

  const handleDelete = async (pathId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta trilha?')) return
    
    try {
      await learningPathsService.deletePath(pathId)
      await loadPaths()
      setSubmitSuccess('Trilha deletada com sucesso!')
    } catch (err: any) {
      setSubmitError(err?.message || 'Erro ao deletar trilha')
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async () => {
    try {
      setSubmitLoading(true)
      setSubmitError(null)
      setSubmitSuccess(null)

      if (isEditing && selectedPath) {
        await learningPathsService.updatePath(selectedPath.id, formData)
        setSubmitSuccess('Trilha atualizada com sucesso!')
      } else {
        await learningPathsService.createPath(formData, formData.course_ids)
        setSubmitSuccess('Trilha criada com sucesso!')
      }

      await loadPaths()
      resetForm()
      setShowForm(false)
    } catch (err: any) {
      setSubmitError(err?.message || 'Erro ao salvar trilha')
    } finally {
      setSubmitLoading(false)
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Route className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Gerenciar Trilhas</h1>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Trilha
        </Button>
      </div>

      {/* Formulário */}
      {showForm && (
    <Card>
      <CardHeader>
            <CardTitle>{isEditing ? 'Editar Trilha' : 'Criar Nova Trilha'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
                <Label htmlFor="name">Nome da Trilha</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Fundamentos de Segurança"
                />
        </div>
        <div>
                <Label htmlFor="duration">Duração Estimada (horas)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.estimated_duration_hours}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration_hours: parseInt(e.target.value) || 0 }))}
                  placeholder="40"
                />
              </div>
        </div>

        <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o que os alunos aprenderão nesta trilha..."
                rows={3}
              />
        </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="level">Nível</Label>
                <Select value={formData.level} onValueChange={(value: any) => setFormData(prev => ({ ...prev, level: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Iniciante</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                  </SelectContent>
                </Select>
        </div>
        <div>
                <Label htmlFor="difficulty">Dificuldade</Label>
                <Select value={formData.difficulty} onValueChange={(value: any) => setFormData(prev => ({ ...prev, difficulty: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Iniciante</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label>Tags</Label>
              <div className="flex space-x-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Adicionar tag..."
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Adicionar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>

            {/* Status de publicação */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="published"
                checked={formData.is_published}
                onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
              />
              <Label htmlFor="published">Publicar trilha</Label>
            </div>

            {/* Mensagens de feedback */}
            {submitError && (
              <div className="text-red-600 text-sm">{submitError}</div>
            )}
            {submitSuccess && (
              <div className="text-green-600 text-sm">{submitSuccess}</div>
            )}

            {/* Botões de ação */}
            <div className="flex space-x-4">
              <Button onClick={handleSubmit} disabled={submitLoading}>
                {submitLoading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')}
              </Button>
              <Button variant="outline" onClick={() => { resetForm(); setShowForm(false) }}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Trilhas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paths.map((path) => (
          <Card key={path.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg line-clamp-2">{path.name}</CardTitle>
                <Badge className={getDifficultyColor(path.difficulty)}>
                  {getDifficultyLabel(path.difficulty)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
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
                  <Star className="h-4 w-4" />
                  <span>{path.level}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{path.is_published ? 'Publicada' : 'Rascunho'}</span>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(path)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(path.id)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Deletar
                </Button>
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
            <h3 className="text-xl font-semibold mb-2">Nenhuma trilha criada</h3>
            <p className="text-muted-foreground mb-4">
              Crie sua primeira trilha de aprendizado para organizar cursos de forma estruturada.
            </p>
            <Button onClick={() => { resetForm(); setShowForm(true) }}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Trilha
            </Button>
      </CardContent>
    </Card>
      )}
    </div>
  )
}

