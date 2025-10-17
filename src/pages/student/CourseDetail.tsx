import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft,
  Play,
  CheckCircle,
  Clock,
  BookOpen,
  Star,
  Users,
  Award,
  Target,
  FileText,
  Video,
  HelpCircle,
  Lock,
  Trophy
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchCourseDetail } from '@/services/coursesApi';

interface Lesson {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  duration_minutes: number;
  is_completed: boolean;
  is_locked: boolean;
  order: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  order: number;
}

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  instructor_name: string;
  instructor_bio?: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes: number;
  total_lessons: number;
  completed_lessons: number;
  progress_percentage: number;
  rating?: number;
  total_ratings: number;
  enrolled_at: string;
  is_completed: boolean;
  modules: Module[];
  learning_objectives: string[];
  prerequisites: string[];
}

const StudentCourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data para demonstraÃ§Ã£o
  const mockCourse: CourseDetail = {
    id: '1',
    title: 'Fundamentos de React',
    description: 'Aprenda os conceitos bÃ¡sicos do React e construa suas primeiras aplicaÃ§Ãµes. Este curso abrange desde os fundamentos atÃ© conceitos mais avanÃ§ados como hooks, context API e otimizaÃ§Ã£o de performance.',
    thumbnail_url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=React%20programming%20course%20thumbnail%20modern%20blue%20gradient&image_size=landscape_4_3',
    instructor_name: 'JoÃ£o Silva',
    instructor_bio: 'Desenvolvedor Full Stack com mais de 8 anos de experiÃªncia em React e JavaScript.',
    category: 'ProgramaÃ§Ã£o',
    level: 'beginner',
    duration_minutes: 480,
    total_lessons: 12,
    completed_lessons: 8,
    progress_percentage: 67,
    rating: 4.8,
    total_ratings: 156,
    enrolled_at: '2024-01-01',
    is_completed: false,
    learning_objectives: [
      'Entender os conceitos fundamentais do React',
      'Criar componentes funcionais e de classe',
      'Gerenciar estado com useState e useEffect',
      'Implementar roteamento com React Router',
      'Construir uma aplicaÃ§Ã£o completa'
    ],
    prerequisites: [
      'Conhecimento bÃ¡sico de HTML e CSS',
      'Fundamentos de JavaScript ES6+',
      'Familiaridade com NPM/Yarn'
    ],
    modules: [
      {
        id: '1',
        title: 'IntroduÃ§Ã£o ao React',
        description: 'Conceitos bÃ¡sicos e configuraÃ§Ã£o do ambiente',
        order: 1,
        lessons: [
          {
            id: '1',
            title: 'O que Ã© React?',
            description: 'IntroduÃ§Ã£o aos conceitos fundamentais do React',
            type: 'video',
            duration_minutes: 15,
            is_completed: true,
            is_locked: false,
            order: 1
          },
          {
            id: '2',
            title: 'Configurando o ambiente',
            description: 'InstalaÃ§Ã£o e configuraÃ§Ã£o das ferramentas necessÃ¡rias',
            type: 'video',
            duration_minutes: 20,
            is_completed: true,
            is_locked: false,
            order: 2
          },
          {
            id: '3',
            title: 'Primeiro componente',
            description: 'Criando seu primeiro componente React',
            type: 'video',
            duration_minutes: 25,
            is_completed: true,
            is_locked: false,
            order: 3
          }
        ]
      },
      {
        id: '2',
        title: 'Componentes e Props',
        description: 'Aprendendo sobre componentes e propriedades',
        order: 2,
        lessons: [
          {
            id: '4',
            title: 'Componentes Funcionais',
            description: 'Criando componentes com funÃ§Ãµes',
            type: 'video',
            duration_minutes: 30,
            is_completed: true,
            is_locked: false,
            order: 1
          },
          {
            id: '5',
            title: 'Props e PropTypes',
            description: 'Passando dados entre componentes',
            type: 'video',
            duration_minutes: 25,
            is_completed: true,
            is_locked: false,
            order: 2
          },
          {
            id: '6',
            title: 'ExercÃ­cio PrÃ¡tico',
            description: 'Construindo uma lista de tarefas',
            type: 'assignment',
            duration_minutes: 45,
            is_completed: false,
            is_locked: false,
            order: 3
          }
        ]
      },
      {
        id: '3',
        title: 'Estado e Hooks',
        description: 'Gerenciamento de estado com hooks',
        order: 3,
        lessons: [
          {
            id: '7',
            title: 'useState Hook',
            description: 'Gerenciando estado local dos componentes',
            type: 'video',
            duration_minutes: 35,
            is_completed: false,
            is_locked: false,
            order: 1
          },
          {
            id: '8',
            title: 'useEffect Hook',
            description: 'Efeitos colaterais e ciclo de vida',
            type: 'video',
            duration_minutes: 40,
            is_completed: false,
            is_locked: true,
            order: 2
          },
          {
            id: '9',
            title: 'Quiz: Hooks',
            description: 'Teste seus conhecimentos sobre hooks',
            type: 'quiz',
            duration_minutes: 15,
            is_completed: false,
            is_locked: true,
            order: 3
          }
        ]
      }
    ]
  };

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Implementar busca real no Supabase
      // Por enquanto, usar dados mock
      try {
        const r = await fetchCourseDetail(id!);
        const c = (r as any)?.course;
        const mods = (r as any)?.modules || [];
        if (c) {
          const mapped: any = {
            id: c.id,
            title: c.title,
            description: c.description || '',
            thumbnail_url: c.thumbnail_url || '',
            instructor_name: 'Equipe Esquads',
            instructor_bio: '',
            category: c.category || 'Geral',
            level: c.difficulty || 'beginner',
            duration_minutes: c.estimated_duration || 0,
            total_lessons: 0,
            completed_lessons: 0,
            progress_percentage: 0,
            rating: undefined,
            total_ratings: 0,
            enrolled_at: c.created_at,
            is_completed: false,
            learning_objectives: [],
            prerequisites: [],
            modules: (mods || []).map((m: any, i: number) => ({
              id: m.id,
              title: m.title,
              description: m.description || '',
              order: m.order_index ?? i,
              lessons: (m.lessons || []).map((l: any, j: number) => ({
                id: l.id,
                title: l.title,
                description: l.content ? 'Conteúdo disponível' : '',
                type: l.video_url ? 'video' : 'text',
                duration_minutes: l.duration || 0,
                is_completed: false,
                is_locked: false,
                order: l.order_index ?? j,
              }))
            }))
          };
          setCourse(mapped);
        } else {
          setCourse(mockCourse);
        }
      } catch (e) {
        setCourse(mockCourse);
      }
      
      setLoading(false);
      
    } catch (err) {
      console.error('Erro ao carregar curso:', err);
      setError('Erro ao carregar curso. Tente novamente.');
      setLoading(false);
    }
  };

  const handleStartLesson = (lessonId: string) => {
    navigate(`/student/courses/${id}/lessons/${lessonId}`);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return 'Iniciante';
      case 'intermediate': return 'IntermediÃ¡rio';
      case 'advanced': return 'AvanÃ§ado';
      default: return level;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'text': return FileText;
      case 'quiz': return HelpCircle;
      case 'assignment': return Target;
      default: return BookOpen;
    }
  };

  const getNextLesson = () => {
    for (const module of course?.modules || []) {
      for (const lesson of module.lessons) {
        if (!lesson.is_completed && !lesson.is_locked) {
          return lesson;
        }
      }
    }
    return null;
  };

  const nextLesson = getNextLesson();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/student/courses')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar aos Cursos
        </Button>
        <Alert>
          <AlertDescription>
            {error || 'Curso nÃ£o encontrado.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/student/courses')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar aos Cursos
        </Button>
      </div>

      {/* Course Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full aspect-video object-cover rounded-lg"
                  />
                </div>
                <div className="md:w-2/3 space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {course.title}
                    </h1>
                    <p className="text-gray-600 leading-relaxed">
                      {course.description}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className={getLevelColor(course.level)}>
                      {getLevelText(course.level)}
                    </Badge>
                    <Badge variant="outline">{course.category}</Badge>
                    {course.is_completed && (
                      <Badge className="bg-green-600 text-white">
                        <Trophy className="h-3 w-3 mr-1" />
                        ConcluÃ­do
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{formatDuration(course.duration_minutes)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-gray-500" />
                      <span>{course.total_lessons} liÃ§Ãµes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>{course.instructor_name}</span>
                    </div>
                    {course.rating && (
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{course.rating} ({course.total_ratings})</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Card */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Seu Progresso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progresso Geral</span>
                  <span>{course.progress_percentage}%</span>
                </div>
                <Progress value={course.progress_percentage} className="h-3" />
                <p className="text-xs text-gray-600 mt-1">
                  {course.completed_lessons} de {course.total_lessons} liÃ§Ãµes concluÃ­das
                </p>
              </div>

              {nextLesson && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">PrÃ³xima LiÃ§Ã£o:</p>
                  <p className="text-sm text-gray-600 mb-3">{nextLesson.title}</p>
                  <Button 
                    onClick={() => handleStartLesson(nextLesson.id)}
                    className="w-full"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Continuar
                  </Button>
                </div>
              )}

              {course.is_completed && (
                <div className="pt-4 border-t text-center">
                  <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-600">
                    ParabÃ©ns! Curso concluÃ­do!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Course Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">VisÃ£o Geral</TabsTrigger>
          <TabsTrigger value="content">ConteÃºdo</TabsTrigger>
          <TabsTrigger value="instructor">Instrutor</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Objetivos de Aprendizagem</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {course.learning_objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{objective}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>PrÃ©-requisitos</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {course.prerequisites.map((prerequisite, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{prerequisite}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <div className="space-y-4">
            {course.modules.map((module) => (
              <Card key={module.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {module.lessons.map((lesson) => {
                      const LessonIcon = getLessonIcon(lesson.type);
                      return (
                        <div
                          key={lesson.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            lesson.is_locked 
                              ? 'bg-gray-50 border-gray-200' 
                              : 'bg-white border-gray-200 hover:border-blue-300 cursor-pointer'
                          }`}
                          onClick={() => !lesson.is_locked && handleStartLesson(lesson.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${
                              lesson.is_completed 
                                ? 'bg-green-100' 
                                : lesson.is_locked 
                                ? 'bg-gray-100' 
                                : 'bg-blue-100'
                            }`}>
                              {lesson.is_completed ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : lesson.is_locked ? (
                                <Lock className="h-4 w-4 text-gray-400" />
                              ) : (
                                <LessonIcon className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                            <div>
                              <h4 className={`font-medium ${
                                lesson.is_locked ? 'text-gray-400' : 'text-gray-900'
                              }`}>
                                {lesson.title}
                              </h4>
                              <p className={`text-sm ${
                                lesson.is_locked ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {lesson.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm ${
                              lesson.is_locked ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {formatDuration(lesson.duration_minutes)}
                            </span>
                            {!lesson.is_locked && !lesson.is_completed && (
                              <Button size="sm" variant="outline">
                                <Play className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="instructor" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Sobre o Instrutor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{course.instructor_name}</h3>
                  <p className="text-gray-600 mt-1">{course.instructor_bio}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentCourseDetail;


