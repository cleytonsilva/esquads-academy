import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Edit, Trash2, Terminal, Trophy, Clock, Target } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useSimulations } from '@/hooks'
import type { Simulation } from '@/types/simulations'

interface SimulationForm {
  title: string
  description: string
  type: 'terminal' | 'network' | 'forensics' | 'web'
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado'
  duration_minutes: number
  xp_reward: number
  environment: string
  scenario: string
  objectives: Array<{
    title: string
    description: string
    xpReward: number
    commands?: string[]
  }>
  course_id?: string
}

export default function AdminSimulations() {
  const { simulations, loading, error, loadSimulations } = useSimulations()
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([])
  const [selectedSimulation, setSelectedSimulation] = useState<Simulation | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<SimulationForm>({
    title: '',
    description: '',
    type: 'terminal',
    difficulty: 'Iniciante',
    duration_minutes: 45,
    xp_reward: 150,
    environment: '',
    scenario: '',
    objectives: [],
    course_id: ''
  })
  const [objectiveForm, setObjectiveForm] = useState({
    title: '',
    description: '',
    xpReward: 30,
    commands: [] as string[]
  })
  const [commandInput, setCommandInput] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadSimulations()
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
      type: 'terminal',
      difficulty: 'Iniciante',
      duration_minutes: 45,
      xp_reward: 150,
      environment: '',
      scenario: '',
      objectives: [],
      course_id: ''
    })
    setObjectiveForm({
      title: '',
      description: '',
      xpReward: 30,
      commands: []
    })
    setCommandInput('')
    setIsEditing(false)
    setSelectedSimulation(null)
    setSubmitError(null)
    setSubmitSuccess(null)
  }

  const handleEdit = (simulation: Simulation) => {
    setSelectedSimulation(simulation)
    setFormData({
      title: simulation.title,
      description: simulation.description,
      type: simulation.type as 'terminal' | 'network' | 'forensics' | 'web',
      difficulty: simulation.difficulty as 'Iniciante' | 'Intermediário' | 'Avançado',
      duration_minutes: simulation.duration_minutes,
      xp_reward: simulation.xp_reward,
      environment: simulation.environment || '',
      scenario: simulation.scenario || '',
      objectives: Array.isArray(simulation.objectives) ? simulation.objectives : [],
      course_id: simulation.course_id || ''
    })
    setIsEditing(true)
    setShowForm(true)
  }

  const addCommand = () => {
    if (commandInput.trim() && !objectiveForm.commands.includes(commandInput.trim())) {
      setObjectiveForm(prev => ({
        ...prev,
        commands: [...prev.commands, commandInput.trim()]
      }))
      setCommandInput('')
    }
  }

  const removeCommand = (command: string) => {
    setObjectiveForm(prev => ({
      ...prev,
      commands: prev.commands.filter(c => c !== command)
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
        xpReward: 30,
        commands: []
      })
    }
  }

  const removeObjective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async () => {
    try {
      setSubmitLoading(true)
      setSubmitError(null)
      setSubmitSuccess(null)

      if (!formData.title.trim() || !formData.description.trim() || !formData.environment.trim()) {
        throw new Error('Preencha todos os campos obrigatórios')
      }

      if (formData.objectives.length === 0) {
        throw new Error('Adicione pelo menos um objetivo')
      }

      const simulationData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        difficulty: formData.difficulty,
        duration_minutes: formData.duration_minutes,
        xp_reward: formData.xp_reward,
        environment: formData.environment,
        scenario: formData.scenario,
        objectives: formData.objectives,
        course_id: formData.course_id || null,
        is_active: true
      }

      if (isEditing && selectedSimulation) {
        const { error } = await supabase
          .from('simulations')
          .update(simulationData)
          .eq('id', selectedSimulation.id)
        
        if (error) throw error
        setSubmitSuccess('Simulação atualizada com sucesso!')
      } else {
        const { error } = await supabase
          .from('simulations')
          .insert([simulationData])
        
        if (error) throw error
        setSubmitSuccess('Simulação criada com sucesso!')
      }

      await loadSimulations()
      setShowForm(false)
      resetForm()
    } catch (err: any) {
      setSubmitError(err.message || 'Erro ao salvar simulação')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDelete = async (simulation: Simulation) => {
    if (!confirm(`Tem certeza que deseja excluir a simulação "${simulation.title}"?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('simulations')
        .delete()
        .eq('id', simulation.id)
      
      if (error) throw error
      await loadSimulations()
    } catch (err: any) {
      console.error('Erro ao excluir simulação:', err)
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'terminal': return 'bg-blue-100 text-blue-800'
      case 'network': return 'bg-purple-100 text-purple-800'
      case 'forensics': return 'bg-orange-100 text-orange-800'
      case 'web': return 'bg-cyan-100 text-cyan-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Simulações</h1>
        <Button onClick={() => { resetForm(); setShowForm(true) }}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Simulação
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
          <TabsTrigger value="list">Lista de Simulações</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {isEditing ? 'Editar Simulação' : 'Nova Simulação'}
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
                      placeholder="Ex: Análise de Tráfego de Rede"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Tipo de Simulação</Label>
                    <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="terminal">Terminal/CLI</SelectItem>
                        <SelectItem value="network">Análise de Rede</SelectItem>
                        <SelectItem value="forensics">Forense Digital</SelectItem>
                        <SelectItem value="web">Segurança Web</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o que o estudante fará nesta simulação..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                </div>

                <div>
                  <Label htmlFor="environment">Ambiente/Configuração *</Label>
                  <Textarea
                    id="environment"
                    value={formData.environment}
                    onChange={(e) => setFormData(prev => ({ ...prev, environment: e.target.value }))}
                    placeholder="Descreva o ambiente da simulação (ex: Ubuntu 20.04, Kali Linux, Windows Server...)"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="scenario">Cenário</Label>
                  <Textarea
                    id="scenario"
                    value={formData.scenario}
                    onChange={(e) => setFormData(prev => ({ ...prev, scenario: e.target.value }))}
                    placeholder="Descreva o cenário/contexto da simulação..."
                    rows={3}
                  />
                </div>

                {/* Objetivos */}
                <div>
                  <Label>Objetivos da Simulação</Label>
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
                    
                    {/* Comandos esperados */}
                    <div>
                      <Label className="text-sm">Comandos Esperados (opcional)</Label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={commandInput}
                          onChange={(e) => setCommandInput(e.target.value)}
                          placeholder="Ex: nmap -sS target.com"
                          onKeyPress={(e) => e.key === 'Enter' && addCommand()}
                        />
                        <Button type="button" onClick={addCommand} size="sm">
                          <Terminal className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {objectiveForm.commands.map((command, index) => (
                          <Badge key={index} variant="outline" className="cursor-pointer font-mono text-xs" onClick={() => removeCommand(command)}>
                            {command} ×
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Button type="button" onClick={addObjective} size="sm">
                      Adicionar Objetivo
                    </Button>
                  </div>
                  
                  {formData.objectives.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {formData.objectives.map((objective, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex-1">
                            <div className="font-medium">{objective.title}</div>
                            <div className="text-sm text-gray-600">{objective.description}</div>
                            <div className="text-xs text-gray-500">XP: {objective.xpReward}</div>
                            {objective.commands && objective.commands.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {objective.commands.map((cmd, cmdIndex) => (
                                  <Badge key={cmdIndex} variant="outline" className="text-xs font-mono">
                                    {cmd}
                                  </Badge>
                                ))}
                              </div>
                            )}
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

                {submitError && (
                  <div className="text-red-600 text-sm">{submitError}</div>
                )}
                {submitSuccess && (
                  <div className="text-green-600 text-sm">{submitSuccess}</div>
                )}

                <div className="flex gap-2">
                  <Button onClick={handleSubmit} disabled={submitLoading}>
                    {submitLoading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')} Simulação
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
              <CardTitle>Simulações Cadastradas</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Carregando simulações...</div>
              ) : simulations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma simulação cadastrada ainda.
                </div>
              ) : (
                <div className="space-y-4">
                  {simulations.map((simulation) => (
                    <div key={simulation.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{simulation.title}</h3>
                            <Badge className={getDifficultyColor(simulation.difficulty)}>
                              {simulation.difficulty}
                            </Badge>
                            <Badge className={getTypeColor(simulation.type)}>
                              {simulation.type}
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{simulation.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {simulation.duration_minutes} min
                            </div>
                            <div className="flex items-center gap-1">
                              <Trophy className="w-4 h-4" />
                              {simulation.xp_reward} XP
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="w-4 h-4" />
                              {Array.isArray(simulation.objectives) ? simulation.objectives.length : 0} objetivos
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(simulation)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(simulation)}>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{simulations.length}</div>
                <p className="text-gray-600">Total de Simulações</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {simulations.filter(s => s.type === 'terminal').length}
                </div>
                <p className="text-gray-600">Terminal/CLI</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {simulations.filter(s => s.type === 'network').length}
                </div>
                <p className="text-gray-600">Análise de Rede</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {simulations.filter(s => s.difficulty === 'Avançado').length}
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