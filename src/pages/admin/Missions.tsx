import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Edit, Trash2, Eye, Users, Trophy, Clock, Bot, Terminal, Monitor, MessageSquare, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useMissions } from '@/hooks'
import type { Mission } from '@/types/missions'

interface MissionForm {
  title: string
  description: string
  category: string
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado'
  duration_minutes: number
  xp_reward: number
  tools: string[]
  objectives: Array<{
    title: string
    description: string
    xpReward: number
    hint?: string
  }>
  course_id?: string
  mission_type: 'terminal' | 'web_interface' | 'chat_textual'
  ai_prompt?: string
  status: 'draft' | 'pending_review' | 'approved' | 'published'
  approval_notes?: string
}

export default function AdminMissions() {
  const { missions, isLoading: loading } = useMissions()
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([])
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<MissionForm>({
    title: '',
    description: '',
    category: '',
    difficulty: 'Iniciante',
    duration_minutes: 30,
    xp_reward: 100,
    tools: [],
    objectives: [],
    course_id: '',
    mission_type: 'terminal',
    ai_prompt: '',
    status: 'draft',
    approval_notes: ''
  })
  const [toolInput, setToolInput] = useState('')
  const [objectiveForm, setObjectiveForm] = useState({
    title: '',
    description: '',
    xpReward: 20,
    hint: ''
  })
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const [isGeneratingWithAI, setIsGeneratingWithAI] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    loadCourses()
  }, [])

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
      title: '',
      description: '',
      category: '',
      difficulty: 'Iniciante',
      duration_minutes: 30,
      xp_reward: 100,
      tools: [],
      objectives: [],
      course_id: '',
      mission_type: 'terminal',
      ai_prompt: '',
      status: 'draft',
      approval_notes: ''
    })
    setToolInput('')
    setObjectiveForm({
      title: '',
      description: '',
      xpReward: 20,
      hint: ''
    })
    setIsEditing(false)
    setSelectedMission(null)
    setSubmitError(null)
    setSubmitSuccess(null)
    setShowPreview(false)
  }

  const handleEdit = (mission: Mission) => {
    setSelectedMission(mission)
    setFormData({
      title: mission.title,
      description: mission.description,
      category: mission.category,
      difficulty: mission.difficulty as 'Iniciante' | 'Intermediário' | 'Avançado',
      duration_minutes: mission.duration_minutes,
      xp_reward: mission.xp_reward,
      tools: Array.isArray(mission.tools) ? mission.tools : [],
      objectives: Array.isArray(mission.objectives) ? mission.objectives : [],
      course_id: mission.course_id || ''
    })
    setIsEditing(true)
    setShowForm(true)
  }

  const addTool = () => {
    if (toolInput.trim() && !formData.tools.includes(toolInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tools: [...prev.tools, toolInput.trim()]
      }))
      setToolInput('')
    }
  }

  const removeTool = (tool: string) => {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.filter(t => t !== tool)
    }))
  }

  const addObjective = () => {
    if (objectiveForm.title.trim() && objectiveForm.description.trim()) {
      setFormData(prev => ({
        ...prev,
        objectives: [...prev.objectives, { ...objectiveForm }]
      }))
      setObjectiveForm({
        title: '',
        description: '',
        xpReward: 20,
        hint: ''
      })
    }
  }

  const generateWithAI = async () => {
    if (!formData.ai_prompt?.trim()) {
      setSubmitError('Digite um prompt para gerar a missão com IA')
      return
    }

    try {
      setIsGeneratingWithAI(true)
      setSubmitError(null)

      // Simular chamada para IA (substituir por chamada real)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Simular resposta da IA
      const aiResponse = {
        title: `Missão IA: ${formData.ai_prompt.split(' ').slice(0, 3).join(' ')}`,
        description: `Esta missão foi gerada automaticamente com base no prompt: "${formData.ai_prompt}". O objetivo é praticar conceitos de cibersegurança através de atividades práticas.`,
        objectives: [
          {
            title: 'Objetivo Principal',
            description: 'Completar todas as tarefas relacionadas ao prompt fornecido',
            xpReward: 50,
            hint: 'Use as ferramentas disponíveis para resolver o problema'
          }
        ],
        tools: ['terminal', 'nmap', 'wireshark']
      }

      setFormData(prev => ({
        ...prev,
        title: aiResponse.title,
        description: aiResponse.description,
        objectives: aiResponse.objectives,
        tools: aiResponse.tools,
        status: 'pending_review'
      }))

      setSubmitSuccess('Missão gerada com IA! Revise o conteúdo antes de aprovar.')
    } catch (err: any) {
      setSubmitError('Erro ao gerar missão com IA: ' + err.message)
    } finally {
      setIsGeneratingWithAI(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'pending_review': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'published': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit className="w-4 h-4" />
      case 'pending_review': return <AlertCircle className="w-4 h-4" />
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'published': return <Eye className="w-4 h-4" />
      default: return <Edit className="w-4 h-4" />
    }
  }

  const getMissionTypeIcon = (type: string) => {
    switch (type) {
      case 'terminal': return <Terminal className="w-4 h-4" />
      case 'web_interface': return <Monitor className="w-4 h-4" />
      case 'chat_textual': return <MessageSquare className="w-4 h-4" />
      default: return <Terminal className="w-4 h-4" />
    }
  }

  const handleSubmit = async () => {
    try {
      setSubmitLoading(true)
      setSubmitError(null)
      setSubmitSuccess(null)

      if (!formData.title.trim() || !formData.description.trim() || !formData.category.trim()) {
        throw new Error('Preencha todos os campos obrigatórios')
      }

      if (formData.objectives.length === 0) {
        throw new Error('Adicione pelo menos um objetivo')
      }

      const missionData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        difficulty: formData.difficulty,
        duration_minutes: formData.duration_minutes,
        xp_reward: formData.xp_reward,
        tools: formData.tools,
        objectives: formData.objectives,
        course_id: formData.course_id || null,
        mission_type: formData.mission_type,
        ai_prompt: formData.ai_prompt,
        status: formData.status,
        approval_notes: formData.approval_notes,
        is_active: formData.status === 'published'
      }

      if (isEditing && selectedMission) {
        const { error } = await supabase
          .from('missions')
          .update(missionData)
          .eq('id', selectedMission.id)
        
        if (error) throw error
        setSubmitSuccess('Missão atualizada com sucesso!')
      } else {
        const { error } = await supabase
          .from('missions')
          .insert([missionData])
        
        if (error) throw error
        setSubmitSuccess('Missão criada com sucesso!')
      }

      await loadMissions()
      setShowForm(false)
      resetForm()
    } catch (err: any) {
      setSubmitError(err.message || 'Erro ao salvar missão')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDelete = async (mission: Mission) => {
    if (!confirm(`Tem certeza que deseja excluir a missão "${mission.title}"?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('missions')
        .delete()
        .eq('id', mission.id)
      
      if (error) throw error
      await loadMissions()
    } catch (err: any) {
      console.error('Erro ao excluir missão:', err)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Iniciante': return 'bg-green-100 text-green-800'
      case 'Intermediário': return 'bg-yellow-100 text-yellow-800'
      case 'Avançado': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Missões</h1>
        <Button onClick={() => { resetForm(); setShowForm(true) }}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Missão
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">Lista de Missões</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {isEditing ? 'Editar Missão' : 'Nova Missão'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Análise de Malware Básica"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoria *</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="Ex: Cybersecurity, Network Security"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o que o estudante aprenderá nesta missão..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor="mission_type">Tipo de Missão</Label>
                    <Select value={formData.mission_type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, mission_type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="terminal">
                          <div className="flex items-center space-x-2">
                            <Terminal className="w-4 h-4" />
                            <span>Terminal CLI</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="web_interface">
                          <div className="flex items-center space-x-2">
                            <Monitor className="w-4 h-4" />
                            <span>Interface Web</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="chat_textual">
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="w-4 h-4" />
                            <span>Chat Textual</span>
                          </div>
                        </SelectItem>
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
                        <SelectItem value="Iniciante">Iniciante</SelectItem>
                        <SelectItem value="Intermediário">Intermediário</SelectItem>
                        <SelectItem value="Avançado">Avançado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="duration">Duração (min)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="xp">XP Recompensa</Label>
                    <Input
                      id="xp"
                      type="number"
                      value={formData.xp_reward}
                      onChange={(e) => setFormData(prev => ({ ...prev, xp_reward: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="course">Curso (opcional)</Label>
                    <Select value={formData.course_id} onValueChange={(value) => setFormData(prev => ({ ...prev, course_id: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar curso" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhum curso</SelectItem>
                        {courses.map(course => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Rascunho</SelectItem>
                        <SelectItem value="pending_review">Pendente Revisão</SelectItem>
                        <SelectItem value="approved">Aprovado</SelectItem>
                        <SelectItem value="published">Publicado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Ferramentas */}
                <div>
                  <Label>Ferramentas</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={toolInput}
                      onChange={(e) => setToolInput(e.target.value)}
                      placeholder="Ex: nmap, wireshark, metasploit"
                      onKeyPress={(e) => e.key === 'Enter' && addTool()}
                    />
                    <Button type="button" onClick={addTool}>Adicionar</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tools.map((tool, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTool(tool)}>
                        {tool} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Objetivos */}
                <div>
                  <Label>Objetivos da Missão</Label>
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        value={objectiveForm.title}
                        onChange={(e) => setObjectiveForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Título do objetivo"
                      />
                      <Input
                        type="number"
                        value={objectiveForm.xpReward}
                        onChange={(e) => setObjectiveForm(prev => ({ ...prev, xpReward: parseInt(e.target.value) || 0 }))}
                        placeholder="XP do objetivo"
                      />
                    </div>
                    <Input
                      value={objectiveForm.description}
                      onChange={(e) => setObjectiveForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição do objetivo"
                    />
                    <Input
                      value={objectiveForm.hint}
                      onChange={(e) => setObjectiveForm(prev => ({ ...prev, hint: e.target.value }))}
                      placeholder="Dica (opcional)"
                    />
                    <Button type="button" onClick={addObjective} size="sm">
                      Adicionar Objetivo
                    </Button>
                  </div>
                  
                  {formData.objectives.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {formData.objectives.map((objective, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <div className="font-medium">{objective.title}</div>
                            <div className="text-sm text-gray-600">{objective.description}</div>
                            <div className="text-xs text-gray-500">XP: {objective.xpReward}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeObjective(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Geração com IA */}
                <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex items-center space-x-2 mb-3">
                    <Bot className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-800">Gerador de Missões com IA</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="ai_prompt">Prompt para IA</Label>
                      <Textarea
                        id="ai_prompt"
                        value={formData.ai_prompt}
                        onChange={(e) => setFormData(prev => ({ ...prev, ai_prompt: e.target.value }))}
                        placeholder="Ex: Crie uma missão de análise de malware onde o aluno deve identificar e remover um trojan usando ferramentas de forense..."
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        onClick={generateWithAI}
                        disabled={isGeneratingWithAI || !formData.ai_prompt?.trim()}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isGeneratingWithAI ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Gerando...
                          </>
                        ) : (
                          <>
                            <Bot className="w-4 h-4 mr-2" />
                            Gerar com IA
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowPreview(!showPreview)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {showPreview ? 'Ocultar' : 'Mostrar'} Preview
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Preview em Tempo Real */}
                {showPreview && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="font-semibold mb-3">Preview da Missão</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {getMissionTypeIcon(formData.mission_type)}
                        <span className="font-medium">{formData.title || 'Título da missão'}</span>
                        <Badge className={getStatusColor(formData.status)}>
                          {formData.status === 'draft' ? 'Rascunho' :
                           formData.status === 'pending_review' ? 'Pendente' :
                           formData.status === 'approved' ? 'Aprovado' : 'Publicado'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{formData.description || 'Descrição da missão'}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{formData.difficulty}</span>
                        <span>{formData.duration_minutes} min</span>
                        <span>{formData.xp_reward} XP</span>
                        <span>{formData.objectives.length} objetivos</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notas de Aprovação */}
                {formData.status === 'pending_review' && (
                  <div>
                    <Label htmlFor="approval_notes">Notas de Aprovação</Label>
                    <Textarea
                      id="approval_notes"
                      value={formData.approval_notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, approval_notes: e.target.value }))}
                      placeholder="Adicione comentários sobre a missão para revisão..."
                      rows={2}
                    />
                  </div>
                )}

                {submitError && (
                  <div className="text-red-600 text-sm">{submitError}</div>
                )}
                {submitSuccess && (
                  <div className="text-green-600 text-sm">{submitSuccess}</div>
                )}

                <div className="flex gap-2">
                  <Button onClick={handleSubmit} disabled={submitLoading}>
                    {submitLoading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')} Missão
                  </Button>
                  <Button variant="outline" onClick={() => { setShowForm(false); resetForm() }}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Missões Cadastradas</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Carregando missões...</div>
              ) : !missions || missions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma missão cadastrada ainda.
                </div>
              ) : (
                <div className="space-y-4">
                  {missions.map((mission) => (
                    <div key={mission.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{mission.title}</h3>
                            <Badge className={getDifficultyColor(mission.difficulty)}>
                              {mission.difficulty}
                            </Badge>
                            <Badge variant="outline">{mission.category}</Badge>
                            <Badge className={getStatusColor(mission.status || 'draft')}>
                              {getStatusIcon(mission.status || 'draft')}
                              {mission.status === 'draft' ? 'Rascunho' :
                               mission.status === 'pending_review' ? 'Pendente' :
                               mission.status === 'approved' ? 'Aprovado' : 'Publicado'}
                            </Badge>
                            <Badge variant="secondary" className="flex items-center space-x-1">
                              {getMissionTypeIcon(mission.mission_type || 'terminal')}
                              <span>
                                {mission.mission_type === 'terminal' ? 'Terminal' :
                                 mission.mission_type === 'web_interface' ? 'Web' : 'Chat'}
                              </span>
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{mission.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {mission.duration_minutes} min
                            </div>
                            <div className="flex items-center gap-1">
                              <Trophy className="w-4 h-4" />
                              {mission.xp_reward} XP
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {Array.isArray(mission.objectives) ? mission.objectives.length : 0} objetivos
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(mission)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(mission)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{missions?.length || 0}</div>
                <p className="text-gray-600">Total de Missões</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {missions?.filter(m => m.difficulty === 'Iniciante').length || 0}
                </div>
                <p className="text-gray-600">Nível Iniciante</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {missions?.filter(m => m.difficulty === 'Avançado').length || 0}
                </div>
                <p className="text-gray-600">Nível Avançado</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

