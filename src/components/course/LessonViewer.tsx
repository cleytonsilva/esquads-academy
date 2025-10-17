// Esquads Academy - Visualizador de Lições

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QuizPlayer } from './QuizPlayer';
import { FileUpload } from '@/components/ui/file-upload';
import {
  Play,
  Pause,
  CheckCircle,
  Clock,
  FileText,
  Video,
  Upload,
  Download,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Trophy,
  Star
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  content_type: 'video' | 'text' | 'quiz' | 'assignment';
  content_url?: string;
  content_text?: string;
  duration: number;
  order_index: number;
  is_free: boolean;
  quiz_questions?: QuizQuestion[];
  assignment_files?: string[];
}

interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'text';
  options?: string[];
  correct_answer: string;
  explanation?: string;
  points: number;
}

interface LessonProgress {
  lessonId: string;
  completed: boolean;
  progress: number;
  timeSpent: number;
  quizScore?: number;
  assignmentSubmitted?: boolean;
}

interface LessonViewerProps {
  lesson: Lesson;
  progress?: LessonProgress;
  onComplete: (lessonId: string, data?: any) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onExit?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export const LessonViewer: React.FC<LessonViewerProps> = ({
  lesson,
  progress,
  onComplete,
  onNext,
  onPrevious,
  onExit,
  hasNext = false,
  hasPrevious = false
}) => {
  const [currentView, setCurrentView] = useState<'content' | 'quiz'>('content');
  const [videoProgress, setVideoProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeSpent, setTimeSpent] = useState(progress?.timeSpent || 0);
  const [assignmentFiles, setAssignmentFiles] = useState<File[]>([]);
  const [assignmentSubmitted, setAssignmentSubmitted] = useState(progress?.assignmentSubmitted || false);

  // Timer para rastrear tempo gasto na lição
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleVideoProgress = (currentTime: number, duration: number) => {
    const progressPercent = (currentTime / duration) * 100;
    setVideoProgress(progressPercent);

    // Marcar como completa se assistiu 80% do vídeo
    if (progressPercent >= 80 && !progress?.completed) {
      handleLessonComplete();
    }
  };

  const handleLessonComplete = (data?: any) => {
    onComplete(lesson.id, {
      timeSpent,
      progress: 100,
      ...data
    });
  };

  const handleQuizComplete = (attempts: any[], score: number, totalPoints: number) => {
    const percentage = Math.round((score / totalPoints) * 100);
    handleLessonComplete({
      quizScore: percentage,
      quizAttempts: attempts
    });
  };

  const handleAssignmentSubmit = async () => {
    try {
      // Em produção, fazer upload dos arquivos para Supabase Storage
      const uploadedFiles = assignmentFiles.map(file => ({
        name: file.name,
        url: `https://example.com/assignments/${file.name}`,
        size: file.size
      }));

      setAssignmentSubmitted(true);
      handleLessonComplete({
        assignmentSubmitted: true,
        assignmentFiles: uploadedFiles
      });
    } catch (error) {
      console.error('Erro ao enviar tarefa:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'text':
        return <FileText className="h-5 w-5" />;
      case 'quiz':
        return <CheckCircle className="h-5 w-5" />;
      case 'assignment':
        return <Upload className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-blue-100 text-blue-800';
      case 'text':
        return 'bg-green-100 text-green-800';
      case 'quiz':
        return 'bg-purple-100 text-purple-800';
      case 'assignment':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (currentView === 'quiz' && lesson.content_type === 'quiz' && lesson.quiz_questions) {
    return (
      <QuizPlayer
        questions={lesson.quiz_questions}
        title={lesson.title}
        description={lesson.description}
        onComplete={handleQuizComplete}
        onExit={() => setCurrentView('content')}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Header da Lição */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {getContentTypeIcon(lesson.content_type)}
              <div className="min-w-0 flex-1">
                <CardTitle className="truncate">{lesson.title}</CardTitle>
                {lesson.description && (
                  <p className="text-gray-600 mt-1 text-sm line-clamp-2">{lesson.description}</p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className={`${getContentTypeColor(lesson.content_type)} text-xs`}
              >
                {lesson.content_type}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                <Clock className="h-3 w-3" />
                {lesson.duration}min
              </Badge>
              {progress?.completed && (
                <Badge variant="default" className="bg-green-600 flex items-center gap-1 text-xs">
                  <CheckCircle className="h-3 w-3" />
                  Concluída
                </Badge>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          {lesson.content_type === 'video' && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Progresso do vídeo</span>
                <span>{Math.round(videoProgress)}%</span>
              </div>
              <Progress value={videoProgress} />
            </div>
          )}
          
          {/* Time Spent */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Tempo gasto: {formatTime(timeSpent)}</span>
            </div>
            {progress?.quizScore && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                <span>Pontuação: {progress.quizScore}%</span>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Conteúdo da Lição */}
      <Card>
        <CardContent className="p-6">
          {lesson.content_type === 'video' && (
            <div className="space-y-4">
              {lesson.content_url ? (
                <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                  {/* Em produção, usar um player de vídeo real */}
                  <div className="text-white text-center">
                    <Video className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-lg">Player de Vídeo</p>
                    <p className="text-sm opacity-75">{lesson.content_url}</p>
                    <div className="flex items-center justify-center gap-4 mt-4">
                      <Button
                        variant="secondary"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4 mr-2" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        {isPlaying ? 'Pausar' : 'Reproduzir'}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    Vídeo não disponível. Entre em contato com o instrutor.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {lesson.content_type === 'text' && (
            <div className="prose max-w-none">
              {lesson.content_text ? (
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {lesson.content_text}
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    Conteúdo de texto não disponível.
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Auto-complete para lições de texto após 30 segundos */}
              {timeSpent >= 30 && !progress?.completed && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-green-800 font-medium">
                        Lição concluída!
                      </span>
                    </div>
                    <Button onClick={() => handleLessonComplete()}>
                      Marcar como Concluída
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {lesson.content_type === 'quiz' && (
            <div className="text-center space-y-4">
              <div className="p-8">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-purple-600" />
                <h3 className="text-xl font-semibold mb-2">Quiz Disponível</h3>
                <p className="text-gray-600 mb-4">
                  {lesson.quiz_questions?.length} questões disponíveis
                </p>
                {progress?.quizScore !== undefined && (
                  <div className="mb-4">
                    <Badge variant="default" className="text-lg px-4 py-2">
                      <Trophy className="h-4 w-4 mr-2" />
                      Pontuação: {progress.quizScore}%
                    </Badge>
                  </div>
                )}
                <Button
                  onClick={() => setCurrentView('quiz')}
                  size="lg"
                  className="px-8"
                >
                  {progress?.quizScore !== undefined ? 'Refazer Quiz' : 'Iniciar Quiz'}
                </Button>
              </div>
            </div>
          )}

          {lesson.content_type === 'assignment' && (
            <div className="space-y-6">
              <div className="prose max-w-none">
                <h3>Descrição da Tarefa</h3>
                {lesson.content_text ? (
                  <div className="whitespace-pre-wrap text-gray-800">
                    {lesson.content_text}
                  </div>
                ) : (
                  <p>Descrição da tarefa não disponível.</p>
                )}
              </div>

              {/* Arquivos de apoio */}
              {lesson.assignment_files && lesson.assignment_files.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Arquivos de Apoio</h4>
                  <div className="space-y-2">
                    {lesson.assignment_files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">{file}</span>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Baixar
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload de arquivos */}
              {!assignmentSubmitted && (
                <div className="space-y-4">
                  <h4 className="font-medium">Enviar Tarefa</h4>
                  <FileUpload
                    accept="*/*"
                    multiple
                    maxSize={50 * 1024 * 1024}
                    onFileSelect={(file) => {
                      setAssignmentFiles([file]);
                      return Promise.resolve([file.name]);
                    }}
                  >
                    <Button variant="outline" className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload de Arquivo
                    </Button>
                  </FileUpload>
                  
                  {assignmentFiles.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Arquivos Selecionados:</h5>
                      {assignmentFiles.map((file, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          • {file.name} ({Math.round(file.size / 1024)}KB)
                        </div>
                      ))}
                      <Button onClick={handleAssignmentSubmit} className="mt-4">
                        <Upload className="h-4 w-4 mr-2" />
                        Enviar Tarefa
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {assignmentSubmitted && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Tarefa enviada com sucesso! Aguarde a avaliação do instrutor.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas da Sessão */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Tempo na lição: {formatTime(timeSpent)}
              </span>
              {progress?.completed && (
                <span className="flex items-center gap-1 text-green-600">
                  <Star className="h-4 w-4" />
                  Lição concluída
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navegação */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={!hasPrevious}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Lição Anterior
        </Button>

        <div className="flex gap-2">
          {onExit && (
            <Button variant="ghost" onClick={onExit}>
              <BookOpen className="h-4 w-4 mr-2" />
              Voltar ao Curso
            </Button>
          )}
          
          <Button
            onClick={onNext}
            disabled={!hasNext}
          >
            Próxima Lição
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};
