/**
 * Página de Administração - Banco de Questões de Certificação
 * Implementa CRUD, upload em massa e workflow de aprovação
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
import { 
  Plus, 
  Search, 
  Filter, 
  Upload, 
  Check, 
  X, 
  Edit, 
  Trash2, 
  Eye,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Archive,
  TrendingUp,
  BarChart3,
  Download,
  Bot,
  Loader2
} from 'lucide-react'
import { 
  CertificationQuestion, 
  QuestionFormData, 
  QuestionFilter, 
  QuestionStats,
  QuestionUploadResult,
  CertificationProvider,
  QuestionDifficulty,
  QuestionStatus,
  CERTIFICATION_INFO
} from '@/types/certifications'
import { certificationQuestionService } from '@/services/certificationQuestionService'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export const AdminQuestionBank: React.FC = () => {
  const { user } = useAuth()
  
  const [questions, setQuestions] = useState<CertificationQuestion[]>([])
  const [stats, setStats] = useState<QuestionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('list')
  
  // Filtros
  const [filter, setFilter] = useState<QuestionFilter>({})
  const [searchTerm, setSearchTerm] = useState('')
  
  // Formulário de questão
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<CertificationQuestion | null>(null)
  const [questionForm, setQuestionForm] = useState<QuestionFormData>({
    certification: 'AWS',
    topic: '',
    difficulty: 'easy',
    questionText: '',
    options: [
      { id: 'a', text: '', isCorrect: false },
      { id: 'b', text: '', isCorrect: false },
      { id: 'c', text: '', isCorrect: false },
      { id: 'd', text: '', isCorrect: false }
    ],
    correctAnswerId: '',
    explanation: '',
    status: 'draft'
  })
  
  // Upload em massa
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadResult, setUploadResult] = useState<QuestionUploadResult | null>(null)

  // Carregar dados iniciais
  useEffect(() => {
    loadQuestions()
    loadStats()
  }, [])

  // Carregar questões
  const loadQuestions = async () => {
    try {
      setLoading(true)
      const questionsData = await certificationQuestionService.getQuestions(filter)
      setQuestions(questionsData)
    } catch (error) {
      console.error('Erro ao carregar questões:', error)
      toast.error('Erro ao carregar questões')
    } finally {
      setLoading(false)
    }
  }

  // Carregar estatísticas
  const loadStats = async () => {
    try {
      const statsData = await certificationQuestionService.getQuestionStats()
      setStats(statsData)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  // Aplicar filtros
  useEffect(() => {
    const newFilter: QuestionFilter = {
      ...filter,
      searchTerm: searchTerm || undefined
    }
    setFilter(newFilter)
    loadQuestions()
  }, [searchTerm, filter.certification, filter.difficulty, filter.status])

  // Salvar questão
  const handleSaveQuestion = async () => {
    if (!user) return

    try {
      setActionLoading(true)
      
      if (editingQuestion) {
        await certificationQuestionService.updateQuestion(editingQuestion.id, questionForm, user.id)
        toast.success('Questão atualizada com sucesso!')
      } else {
        await certificationQuestionService.createQuestion(questionForm, user.id)
        toast.success('Questão criada com sucesso!')
      }
      
      setShowQuestionForm(false)
      setEditingQuestion(null)
      resetForm()
      loadQuestions()
      loadStats()
    } catch (error) {
      console.error('Erro ao salvar questão:', error)
      toast.error('Erro ao salvar questão')
    } finally {
      setActionLoading(false)
    }
  }

  // Aprovar questão
  const handleApproveQuestion = async (question: CertificationQuestion) => {
    if (!user) return

    try {
      setActionLoading(true)
      await certificationQuestionService.approveQuestion(question.id, user.id)
      toast.success('Questão aprovada!')
      loadQuestions()
      loadStats()
    } catch (error) {
      console.error('Erro ao aprovar questão:', error)
      toast.error('Erro ao aprovar questão')
    } finally {
      setActionLoading(false)
    }
  }

  // Rejeitar questão
  const handleRejectQuestion = async (question: CertificationQuestion) => {
    if (!user) return

    try {
      setActionLoading(true)
      await certificationQuestionService.rejectQuestion(question.id, user.id, 'Rejeitada pelo administrador')
      toast.success('Questão rejeitada!')
      loadQuestions()
      loadStats()
    } catch (error) {
      console.error('Erro ao rejeitar questão:', error)
      toast.error('Erro ao rejeitar questão')
    } finally {
      setActionLoading(false)
    }
  }

  // Deletar questão
  const handleDeleteQuestion = async (question: CertificationQuestion) => {
    if (!confirm('Tem certeza que deseja deletar esta questão?')) return

    try {
      setActionLoading(true)
      await certificationQuestionService.deleteQuestion(question.id)
      toast.success('Questão deletada!')
      loadQuestions()
      loadStats()
    } catch (error) {
      console.error('Erro ao deletar questão:', error)
      toast.error('Erro ao deletar questão')
    } finally {
      setActionLoading(false)
    }
  }

  // Editar questão
  const handleEditQuestion = (question: CertificationQuestion) => {
    setEditingQuestion(question)
    setQuestionForm({
      certification: question.certification,
      topic: question.topic,
      difficulty: question.difficulty,
      questionText: question.questionText,
      options: question.options,
      correctAnswerId: question.correctAnswerId,
      explanation: question.explanation,
      status: question.status
    })
    setShowQuestionForm(true)
  }

  // Resetar formulário
  const resetForm = () => {
    setQuestionForm({
      certification: 'AWS',
      topic: '',
      difficulty: 'easy',
      questionText: '',
      options: [
        { id: 'a', text: '', isCorrect: false },
        { id: 'b', text: '', isCorrect: false },
        { id: 'c', text: '', isCorrect: false },
        { id: 'd', text: '', isCorrect: false }
      ],
      correctAnswerId: '',
      explanation: '',
      status: 'draft'
    })
  }

  // Adicionar opção
  const addOption = () => {
    const newId = String.fromCharCode(97 + questionForm.options.length) // a, b, c, d, e...
    setQuestionForm(prev => ({
      ...prev,
      options: [...prev.options, { id: newId, text: '', isCorrect: false }]
    }))
  }

  // Remover opção
  const removeOption = (index: number) => {
    if (questionForm.options.length <= 2) return
    
    setQuestionForm(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }))
  }

  // Atualizar opção
  const updateOption = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    setQuestionForm(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => 
        i === index ? { ...opt, [field]: value } : opt
      )
    }))
  }

  // Obter cor do status
  const getStatusColor = (status: QuestionStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'pending_review': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'archived': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Obter ícone do status
  const getStatusIcon = (status: QuestionStatus) => {
    switch (status) {
      case 'draft': return <FileText className="w-4 h-4" />
      case 'pending_review': return <Clock className="w-4 h-4" />
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'archived': return <Archive className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  // Obter cor da dificuldade
  const getDifficultyColor = (difficulty: QuestionDifficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Banco de Questões</h1>
          <p className="text-gray-600">Gerencie questões de certificação empresarial</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowQuestionForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Questão
          </Button>
          <Button variant="outline" onClick={() => setShowUploadDialog(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload em Massa
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Aprovadas</p>
                  <p className="text-xl font-bold">{stats.byStatus.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendentes</p>
                  <p className="text-xl font-bold">{stats.byStatus.pending_review}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Taxa de Sucesso</p>
                  <p className="text-xl font-bold">{stats.averageSuccessRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar questões..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filter.certification || 'all'} onValueChange={(value) => 
              setFilter(prev => ({ ...prev, certification: value === 'all' ? undefined : value as CertificationProvider }))
            }>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Certificação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {Object.keys(CERTIFICATION_INFO).map(cert => (
                  <SelectItem key={cert} value={cert}>{cert}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filter.difficulty || 'all'} onValueChange={(value) => 
              setFilter(prev => ({ ...prev, difficulty: value === 'all' ? undefined : value as QuestionDifficulty }))
            }>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Dificuldade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="easy">Fácil</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="hard">Difícil</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filter.status || 'all'} onValueChange={(value) => 
              setFilter(prev => ({ ...prev, status: value === 'all' ? undefined : value as QuestionStatus }))
            }>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="pending_review">Pendente</SelectItem>
                <SelectItem value="approved">Aprovada</SelectItem>
                <SelectItem value="archived">Arquivada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Questões */}
      <Card>
        <CardHeader>
          <CardTitle>Questões ({questions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma questão encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map(question => (
                <div key={question.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getStatusColor(question.status)}>
                          {getStatusIcon(question.status)}
                          <span className="ml-1">{question.status}</span>
                        </Badge>
                        <Badge className={getDifficultyColor(question.difficulty)}>
                          {question.difficulty}
                        </Badge>
                        <Badge variant="outline">
                          {question.certification}
                        </Badge>
                        <Badge variant="outline">
                          {question.topic}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{question.questionText}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Usos: {question.usageCount}</span>
                        <span>Sucesso: {question.successRate.toFixed(1)}%</span>
                        <span>Criada: {new Date(question.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {question.status === 'pending_review' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleApproveQuestion(question)}
                            disabled={actionLoading}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleRejectQuestion(question)}
                            disabled={actionLoading}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditQuestion(question)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteQuestion(question)}
                      >
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

      {/* Dialog de Formulário de Questão */}
      <Dialog open={showQuestionForm} onOpenChange={setShowQuestionForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? 'Editar Questão' : 'Nova Questão'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={questionForm.certification} onValueChange={(value) => 
                setQuestionForm(prev => ({ ...prev, certification: value as CertificationProvider }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Certificação" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(CERTIFICATION_INFO).map(cert => (
                    <SelectItem key={cert} value={cert}>{cert}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                placeholder="Tópico"
                value={questionForm.topic}
                onChange={(e) => setQuestionForm(prev => ({ ...prev, topic: e.target.value }))}
              />
              
              <Select value={questionForm.difficulty} onValueChange={(value) => 
                setQuestionForm(prev => ({ ...prev, difficulty: value as QuestionDifficulty }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Dificuldade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Fácil</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="hard">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Texto da Questão */}
            <Textarea
              placeholder="Digite a questão..."
              value={questionForm.questionText}
              onChange={(e) => setQuestionForm(prev => ({ ...prev, questionText: e.target.value }))}
              rows={3}
            />

            {/* Opções */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Opções de Resposta</label>
              {questionForm.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    placeholder={`Opção ${option.id.toUpperCase()}`}
                    value={option.text}
                    onChange={(e) => updateOption(index, 'text', e.target.value)}
                  />
                  <Button
                    variant={option.isCorrect ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      // Desmarcar outras opções
                      const newOptions = questionForm.options.map((opt, i) => ({
                        ...opt,
                        isCorrect: i === index ? !opt.isCorrect : false
                      }))
                      setQuestionForm(prev => ({ ...prev, options: newOptions }))
                    }}
                  >
                    {option.isCorrect ? 'Correta' : 'Marcar'}
                  </Button>
                  {questionForm.options.length > 2 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" onClick={addOption}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Opção
              </Button>
            </div>

            {/* Explicação */}
            <Textarea
              placeholder="Explicação da resposta correta..."
              value={questionForm.explanation}
              onChange={(e) => setQuestionForm(prev => ({ ...prev, explanation: e.target.value }))}
              rows={3}
            />

            {/* Status */}
            <Select value={questionForm.status} onValueChange={(value) => 
              setQuestionForm(prev => ({ ...prev, status: value as QuestionStatus }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="pending_review">Pendente Revisão</SelectItem>
                <SelectItem value="approved">Aprovada</SelectItem>
              </SelectContent>
            </Select>

            {/* Botões */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowQuestionForm(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveQuestion} disabled={actionLoading}>
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Upload em Massa */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload em Massa</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Funcionalidade em desenvolvimento. Em breve você poderá fazer upload de arquivos PDF/TXT 
                para importar questões automaticamente.
              </AlertDescription>
            </Alert>
            
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminQuestionBank
