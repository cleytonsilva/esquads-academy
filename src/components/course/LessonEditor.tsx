// Esquads Academy - Editor de Lições

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FileUpload } from '@/components/ui/file-upload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Save, 
  Eye, 
  Video, 
  FileText, 
  CheckCircle, 
  Upload,
  AlertCircle,
  Clock,
  Lock,
  Unlock
} from 'lucide-react';

interface Lesson {
  id?: string;
  title: string;
  description: string;
  content_type: 'video' | 'text' | 'quiz' | 'assignment';
  content_url?: string;
  content_text?: string;
  duration: number;
  order_index: number;
  is_free: boolean;
  quiz_questions?: QuizQuestion[];
}

interface QuizQuestion {
  id?: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'text';
  options?: string[];
  correct_answer: string;
  explanation?: string;
}

interface LessonEditorProps {
  lesson?: Lesson;
  onSave: (lesson: Lesson) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const LessonEditor: React.FC<LessonEditorProps> = ({
  lesson,
  onSave,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState<Lesson>(lesson || {
    title: '',
    description: '',
    content_type: 'video',
    duration: 0,
    order_index: 0,
    is_free: false,
    quiz_questions: []
  });

  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic');

  const handleInputChange = (field: keyof Lesson, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = async (files: File[]) => {
    try {
      // Em produção, fazer upload para Supabase Storage
      const file = files[0];
      const mockUrl = `https://example.com/content/${file.name}`;
      
      handleInputChange('content_url', mockUrl);
      return [mockUrl];
    } catch (err) {
      setError('Erro ao fazer upload do arquivo');
      throw err;
    }
  };

  const addQuizQuestion = () => {
    const newQuestion: QuizQuestion = {
      question: '',
      type: 'multiple_choice',
      options: ['', '', '', ''],
      correct_answer: '',
      explanation: ''
    };

    setFormData(prev => ({
      ...prev,
      quiz_questions: [...(prev.quiz_questions || []), newQuestion]
    }));
  };

  const updateQuizQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    setFormData(prev => ({
      ...prev,
      quiz_questions: prev.quiz_questions?.map((question, i) => 
        i === index ? { ...question, [field]: value } : question
      ) || []
    }));
  };

  const removeQuizQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      quiz_questions: prev.quiz_questions?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = () => {
    // Validações básicas
    if (!formData.title.trim()) {
      setError('Título é obrigatório');
      return;
    }

    if (formData.content_type === 'video' && !formData.content_url) {
      setError('URL do vídeo é obrigatória');
      return;
    }

    if (formData.content_type === 'text' && !formData.content_text?.trim()) {
      setError('Conteúdo de texto é obrigatório');
      return;
    }

    if (formData.content_type === 'quiz' && (!formData.quiz_questions || formData.quiz_questions.length === 0)) {
      setError('Pelo menos uma questão é obrigatória para quizzes');
      return;
    }

    setError(null);
    onSave(formData);
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'text':
        return <FileText className="h-4 w-4" />;
      case 'quiz':
        return <CheckCircle className="h-4 w-4" />;
      case 'assignment':
        return <Upload className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {lesson ? 'Editar Lição' : 'Nova Lição'}
        </h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="w-full sm:w-auto">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto sm:h-10">
          <TabsTrigger value="basic" className="text-sm">Informações Básicas</TabsTrigger>
          <TabsTrigger value="content" className="text-sm">Conteúdo</TabsTrigger>
          <TabsTrigger value="settings" className="text-sm">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Lição</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título da Lição *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Introdução aos Hooks"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o que será abordado nesta lição..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="content_type">Tipo de Conteúdo</Label>
                  <Select 
                    value={formData.content_type} 
                    onValueChange={(value: any) => handleInputChange('content_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          Vídeo
                        </div>
                      </SelectItem>
                      <SelectItem value="text">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Texto/Artigo
                        </div>
                      </SelectItem>
                      <SelectItem value="quiz">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Quiz
                        </div>
                      </SelectItem>
                      <SelectItem value="assignment">
                        <div className="flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          Tarefa
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duração (minutos)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="0"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          {formData.content_type === 'video' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Conteúdo de Vídeo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="video_url">URL do Vídeo</Label>
                  <Input
                    id="video_url"
                    placeholder="https://youtube.com/watch?v=... ou upload de arquivo"
                    value={formData.content_url || ''}
                    onChange={(e) => handleInputChange('content_url', e.target.value)}
                  />
                </div>
                
                <div className="text-center text-gray-600">ou</div>
                
                <FileUpload
                  accept="video/*"
                  maxSize={500 * 1024 * 1024} // 500MB para vídeos
                  onFileSelect={(file) => {
                    handleFileUpload([file]);
                    return Promise.resolve([file.name]);
                  }}
                >
                  <Button variant="outline" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload de Vídeo
                  </Button>
                </FileUpload>
              </CardContent>
            </Card>
          )}

          {formData.content_type === 'text' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Conteúdo de Texto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Label htmlFor="content_text">Conte�do</Label>
                <RichTextEditor
                  value={formData.content_text || ''}
                  onChange={(html) => handleInputChange('content_text', html)}
                  placeholder="Escreva, insira imagens e v�deos..."
                />
              </CardContent>
            </Card>
          )}

          {formData.content_type === 'quiz' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Questões do Quiz
                  </CardTitle>
                  <Button onClick={addQuizQuestion} variant="outline" size="sm">
                    Adicionar Questão
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.quiz_questions?.map((question, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Questão {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuizQuestion(index)}
                          className="text-red-600"
                        >
                          Remover
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Pergunta</Label>
                        <Input
                          placeholder="Digite a pergunta..."
                          value={question.question}
                          onChange={(e) => updateQuizQuestion(index, 'question', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select
                          value={question.type}
                          onValueChange={(value: any) => updateQuizQuestion(index, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                            <SelectItem value="true_false">Verdadeiro/Falso</SelectItem>
                            <SelectItem value="text">Resposta Aberta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {question.type === 'multiple_choice' && (
                        <div className="space-y-2">
                          <Label>Opções</Label>
                          {question.options?.map((option, optionIndex) => (
                            <Input
                              key={optionIndex}
                              placeholder={`Opção ${optionIndex + 1}`}
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...(question.options || [])];
                                newOptions[optionIndex] = e.target.value;
                                updateQuizQuestion(index, 'options', newOptions);
                              }}
                            />
                          ))}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Resposta Correta</Label>
                        <Input
                          placeholder="Digite a resposta correta..."
                          value={question.correct_answer}
                          onChange={(e) => updateQuizQuestion(index, 'correct_answer', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Explicação (opcional)</Label>
                        <Textarea
                          placeholder="Explique por que esta é a resposta correta..."
                          value={question.explanation || ''}
                          onChange={(e) => updateQuizQuestion(index, 'explanation', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  </Card>
                ))}

                {(!formData.quiz_questions || formData.quiz_questions.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma questão adicionada ainda</p>
                    <Button onClick={addQuizQuestion} variant="outline" className="mt-2">
                      Adicionar Primeira Questão
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {formData.content_type === 'assignment' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Tarefa/Exercício
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="assignment_description">Descrição da Tarefa</Label>
                  <Textarea
                    id="assignment_description"
                    placeholder="Descreva o que o estudante deve fazer..."
                    value={formData.content_text || ''}
                    onChange={(e) => handleInputChange('content_text', e.target.value)}
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Arquivos de Apoio (opcional)</Label>
                  <FileUpload
                    accept="*/*"
                    multiple
                    maxSize={50 * 1024 * 1024}
                    onFileSelect={(file) => {
                      handleFileUpload([file]);
                      return Promise.resolve([file.name]);
                    }}
                  >
                    <Button variant="outline" className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload de Arquivo
                    </Button>
                  </FileUpload>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Lição</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {formData.is_free ? (
                    <Unlock className="h-5 w-5 text-green-600" />
                  ) : (
                    <Lock className="h-5 w-5 text-gray-600" />
                  )}
                  <div>
                    <Label htmlFor="is_free">Lição Gratuita</Label>
                    <p className="text-sm text-gray-600">
                      Permitir acesso sem inscrição no curso
                    </p>
                  </div>
                </div>
                <Switch
                  id="is_free"
                  checked={formData.is_free}
                  onCheckedChange={(checked) => handleInputChange('is_free', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order_index">Ordem na Lista</Label>
                <Input
                  id="order_index"
                  type="number"
                  min="0"
                  value={formData.order_index}
                  onChange={(e) => handleInputChange('order_index', parseInt(e.target.value) || 0)}
                />
                <p className="text-sm text-gray-600">
                  Define a posição desta lição no módulo
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

