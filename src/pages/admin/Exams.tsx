import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Edit, Trash2, FileText, Clock, Trophy, Users, Search } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useExams } from '@/hooks'
import type { Exam, ExamQuestion } from '@/types/exams'

interface ExamForm {
  title: string
  description: string
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado'
  time_limit_minutes: number
  passing_score: number
  max_attempts: number
  course_id?: string
}

interface QuestionForm {
  question: string
  options: string[]
  correct_answer: number
  explanation?: string
  tags: string[]
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado'
}

export default function AdminExams() {
  const { exams, loading, error, loadExams } = useExams()
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([])
  const [questions, setQuestions] = useState<ExamQuestion[]>([])
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showExamForm, setShowExamForm] = useState(false)
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [examFormData, setExamFormData] = useState<ExamForm>({
    title: '',
    description: '',
    difficulty: 'Iniciante',
    time_limit_minutes: 60,
    passing_score: 70,
    max_attempts: 3,
    course_id: ''
  })
  const [questionFormData, setQuestionFormData] = useState<QuestionForm>({
    question: '',
    options: ['', '', '', ''],
    correct_answer: 0,
    explanation: '',
    tags: [],
    difficulty: 'Iniciante'
  })
  const [tagInput, setTagInput] = useState('')
  const [questionSearch, setQuestionSearch] = useState('')
  const [questionFilter, setQuestionFilter] = useState({
    difficulty: '',
    tag: ''
  })
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadExams()
    loadCourses()
    loadQuestions()
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

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('exam_questions')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setQuestions(data || [])
    } catch (err) {
      console.error('Erro ao carregar questões:', err)
    }
  }

  const resetExamForm = () => {
    setExamFormData({
      title: '',
      description: '',
      difficulty: 'Iniciante',
      time_limit_minutes: 60,
      passing_score: 70,
      max_attempts: 3,
      course_id: ''
    })
    setIsEditing(false)
    setSelectedExam(null)
    setSubmitError(null)
    setSubmitSuccess(null)
  }

  const resetQuestionForm = () => {
    setQuestionFormData({
      question: '',
      options: ['', '', '', ''],
      correct_answer: 0,
      explanation: '',
      tags: [],
      difficulty: 'Iniciante'
    })
    setTagInput('')
    setSubmitError(null)
    setSubmitSuccess(null)
  }

  const handleEditExam = (exam: Exam) => {
    setSelectedExam(exam)
    setExamFormData({
      title: exam.title,
      description: exam.description,
      difficulty: exam.difficulty as 'Iniciante' | 'Intermediário' | 'Avançado',
      time_limit_minutes: exam.time_limit_minutes,
      passing_score: exam.passing_score,
      max_attempts: exam.max_attempts,
      course_id: exam.course_id || ''
    })
    setIsEditing(true)
    setShowExamForm(true)
  }

  const addTag = () => {
    if (tagInput.trim() && !questionFormData.tags.includes(tagInput.trim())) {
      setQuestionFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setQuestionFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const updateOption = (index: number, value: string) => {
    setQuestionFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }))
  }

  const handleSubmitExam = async () => {
    try {
      setSubmitLoading(true)
      setSubmitError(null)
      setSubmitSuccess(null)

      if (!examFormData.title.trim() || !examFormData.description.trim()) {
        throw new Error('Preencha todos os campos obrigatórios')
      }

      const examData = {
        title: examFormData.title,
        description: examFormData.description,
        difficulty: examFormData.difficulty,
        time_limit_minutes: examFormData.time_limit_minutes,
        passing_score: examFormData.passing_score,
        max_attempts: examFormData.max_attempts,
        course_id: examFormData.course_id || null,
        is_active: true
      }

      if (isEditing && selectedExam) {
        const { error } = await supabase
          .from('exams')
          .update(examData)
          .eq('id', selectedExam.id)
        
        if (error) throw error
        setSubmitSuccess('Exame atualizado com sucesso!')
      } else {
        const { error } = await supabase
          .from('exams')
          .insert([examData])
        
        if (error) throw error
        setSubmitSuccess('Exame criado com sucesso!')
      }

      await loadExams()
      setShowExamForm(false)
      resetExamForm()
    } catch (err: any) {
      setSubmitError(err.message || 'Erro ao salvar exame')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleSubmitQuestion = async () => {
    try {
      setSubmitLoading(true)
      setSubmitError(null)
      setSubmitSuccess(null)

      if (!questionFormData.question.trim()) {
        throw new Error('Digite a pergunta')
      }

      if (questionFormData.options.some(opt => !opt.trim())) {
        throw new Error('Preencha todas as opções')
      }

      const questionData = {
        question: questionFormData.question,
        options: questionFormData.options,
        correct_answer: questionFormData.correct_answer,
        explanation: questionFormData.explanation || null,
        tags: questionFormData.tags,
        difficulty: questionFormData.difficulty
      }

      const { error } = await supabase
        .from('exam_questions')
        .insert([questionData])
      
      if (error) throw error
      setSubmitSuccess('Questão criada com sucesso!')

      await loadQuestions()
      setShowQuestionForm(false)
      resetQuestionForm()
    } catch (err: any) {
      setSubmitError(err.message || 'Erro ao salvar questão')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDeleteExam = async (exam: Exam) => {
    if (!confirm(`Tem certeza que deseja excluir o exame "${exam.title}"?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', exam.id)
      
      if (error) throw error
      await loadExams()
    } catch (err: any) {
      console.error('Erro ao excluir exame:', err)
    }
  }

  const handleDeleteQuestion = async (question: ExamQuestion) => {
    if (!confirm('Tem certeza que deseja excluir esta questão?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('exam_questions')
        .delete()
        .eq('id', question.id)
      
      if (error) throw error
      await loadQuestions()
    } catch (err: any) {
      console.error('Erro ao excluir questão:', err)
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

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(questionSearch.toLowerCase()) ||
                         question.tags.some(tag => tag.toLowerCase().includes(questionSearch.toLowerCase()))
    const matchesDifficulty = !questionFilter.difficulty || question.difficulty === questionFilter.difficulty
    const matchesTag = !questionFilter.tag || question.tags.includes(questionFilter.tag)
    
    return matchesSearch && matchesDifficulty && matchesTag
  })

  const allTags = Array.from(new Set(questions.flatMap(q => q.tags)))

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Exames</h1>
        <div className="flex gap-2">
          <Button onClick={() => { resetQuestionForm(); setShowQuestionForm(true) }}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Questão
          </Button>
          <Button onClick={() => { resetExamForm(); setShowExamForm(true) }}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Exame
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="exams" className="w-full">
        <TabsList>
          <TabsTrigger value="exams">Exames</TabsTrigger>
          <TabsTrigger value="questions">Banco de Questões</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="exams" className="space-y-4">
          {showExamForm && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {isEditing ? 'Editar Exame' : 'Novo Exame'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={examFormData.title}
                      onChange={(e) => setExamFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Exame Final - Cybersecurity"
                    />
                  </div>
                  <div>
                    <Label htmlFor="course">Curso (opcional)</Label>
                    <Select value={examFormData.course_id} onValueChange={(value) => setExamFormData(prev => ({ ...prev, course_id: value }))}>
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
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    value={examFormData.description}
                    onChange={(e) => setExamFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o conteúdo e objetivos do exame..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="difficulty">Dificuldade</Label>
                    <Select value={examFormData.difficulty} onValueChange={(value: any) => setExamFormData(prev => ({ ...prev, difficulty: value }))}>
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
                    <Label htmlFor="time_limit">Tempo Limite (min)</Label>
                    <Input
                      id="time_limit"
                      type="number"
                      value={examFormData.time_limit_minutes}
                      onChange={(e) => setExamFormData(prev => ({ ...prev, time_limit_minutes: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="passing_score">Nota Mínima (%)</Label>
                    <Input
                      id="passing_score"
                      type="number"
                      min="0"
                      max="100"
                      value={examFormData.passing_score}
                      onChange={(e) => setExamFormData(prev => ({ ...prev, passing_score: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_attempts">Máx. Tentativas</Label>
                    <Input
                      id="max_attempts"
                      type="number"
                      min="1"
                      value={examFormData.max_attempts}
                      onChange={(e) => setExamFormData(prev => ({ ...prev, max_attempts: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                </div>

                {submitError && (
                  <div className="text-red-600 text-sm">{submitError}</div>
                )}
                {submitSuccess && (
                  <div className="text-green-600 text-sm">{submitSuccess}</div>
                )}

                <div className="flex gap-2">
                  <Button onClick={handleSubmitExam} disabled={submitLoading}>
                    {submitLoading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')} Exame
                  </Button>
                  <Button variant="outline" onClick={() => { setShowExamForm(false); resetExamForm() }}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Exames Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Carregando exames...</div>
              ) : exams.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhum exame cadastrado ainda.
                </div>
              ) : (
                <div className="space-y-4">
                  {exams.map((exam) => (
                    <div key={exam.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{exam.title}</h3>
                            <Badge className={getDifficultyColor(exam.difficulty)}>
                              {exam.difficulty}
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{exam.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {exam.time_limit_minutes} min
                            </div>
                            <div className="flex items-center gap-1">
                              <Trophy className="w-4 h-4" />
                              {exam.passing_score}% para passar
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {exam.max_attempts} tentativas
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditExam(exam)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteExam(exam)}>
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

        <TabsContent value="questions" className="space-y-4">
          {showQuestionForm && (
            <Card>
              <CardHeader>
                <CardTitle>Nova Questão</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="question">Pergunta *</Label>
                  <Textarea
                    id="question"
                    value={questionFormData.question}
                    onChange={(e) => setQuestionFormData(prev => ({ ...prev, question: e.target.value }))}
                    placeholder="Digite a pergunta..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Opções de Resposta *</Label>
                  <div className="space-y-2">
                    {questionFormData.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correct_answer"
                          checked={questionFormData.correct_answer === index}
                          onChange={() => setQuestionFormData(prev => ({ ...prev, correct_answer: index }))}
                        />
                        <Input
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder={`Opção ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="explanation">Explicação (opcional)</Label>
                  <Textarea
                    id="explanation"
                    value={questionFormData.explanation}
                    onChange={(e) => setQuestionFormData(prev => ({ ...prev, explanation: e.target.value }))}
                    placeholder="Explique por que esta é a resposta correta..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="difficulty">Dificuldade</Label>
                    <Select value={questionFormData.difficulty} onValueChange={(value: any) => setQuestionFormData(prev => ({ ...prev, difficulty: value }))}>
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
                    <Label>Tags</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Ex: cybersecurity, network"
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      />
                      <Button type="button" onClick={addTag}>Adicionar</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {questionFormData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {submitError && (
                  <div className="text-red-600 text-sm">{submitError}</div>
                )}
                {submitSuccess && (
                  <div className="text-green-600 text-sm">{submitSuccess}</div>
                )}

                <div className="flex gap-2">
                  <Button onClick={handleSubmitQuestion} disabled={submitLoading}>
                    {submitLoading ? 'Salvando...' : 'Criar'} Questão
                  </Button>
                  <Button variant="outline" onClick={() => { setShowQuestionForm(false); resetQuestionForm() }}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Banco de Questões</CardTitle>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  <Input
                    placeholder="Buscar questões..."
                    value={questionSearch}
                    onChange={(e) => setQuestionSearch(e.target.value)}
                    className="w-64"
                  />
                </div>
                <Select value={questionFilter.difficulty} onValueChange={(value) => setQuestionFilter(prev => ({ ...prev, difficulty: value }))}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Dificuldade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
                    <SelectItem value="Iniciante">Iniciante</SelectItem>
                    <SelectItem value="Intermediário">Intermediário</SelectItem>
                    <SelectItem value="Avançado">Avançado</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={questionFilter.tag} onValueChange={(value) => setQuestionFilter(prev => ({ ...prev, tag: value }))}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
                    {allTags.map(tag => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredQuestions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma questão encontrada.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredQuestions.map((question) => (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getDifficultyColor(question.difficulty)}>
                              {question.difficulty}
                            </Badge>
                            {question.tags.map(tag => (
                              <Badge key={tag} variant="outline">{tag}</Badge>
                            ))}
                          </div>
                          <p className="font-medium mb-2">{question.question}</p>
                          <div className="space-y-1 text-sm">
                            {question.options.map((option, index) => (
                              <div key={index} className={`flex items-center gap-2 ${index === question.correct_answer ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                                <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs">
                                  {String.fromCharCode(65 + index)}
                                </span>
                                {option}
                                {index === question.correct_answer && <span className="text-green-600">✓</span>}
                              </div>
                            ))}
                          </div>
                          {question.explanation && (
                            <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                              <strong>Explicação:</strong> {question.explanation}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteQuestion(question)}>
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
                <div className="text-2xl font-bold">{exams.length}</div>
                <p className="text-gray-600">Total de Exames</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{questions.length}</div>
                <p className="text-gray-600">Total de Questões</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {questions.filter(q => q.difficulty === 'Iniciante').length}
                </div>
                <p className="text-gray-600">Questões Iniciante</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {questions.filter(q => q.difficulty === 'Avançado').length}
                </div>
                <p className="text-gray-600">Questões Avançado</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
