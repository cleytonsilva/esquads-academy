import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Clock, 
  Star, 
  Play, 
  CheckCircle, 
  Trophy,
  Target,
  Calendar,
  Users,
  Award
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchCourses } from '@/services/coursesApi';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  instructor_name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes: number;
  total_lessons: number;
  completed_lessons: number;
  progress_percentage: number;
  last_accessed?: string;
  is_completed: boolean;
  rating?: number;
  enrolled_at: string;
}

const StudentCourses: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');

  // Mock data para demonstraÃ§Ã£o
  const mockCourses: Course[] = [
    {
      id: '1',
      title: 'Fundamentos de React',
      description: 'Aprenda os conceitos bÃ¡sicos do React e construa suas primeiras aplicaÃ§Ãµes.',
      thumbnail_url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=React%20programming%20course%20thumbnail%20modern%20blue%20gradient&image_size=landscape_4_3',
      instructor_name: 'JoÃ£o Silva',
      category: 'ProgramaÃ§Ã£o',
      level: 'beginner',
      duration_minutes: 480,
      total_lessons: 12,
      completed_lessons: 8,
      progress_percentage: 67,
      last_accessed: '2024-01-15',
      is_completed: false,
      rating: 4.8,
      enrolled_at: '2024-01-01'
    },
    {
      id: '2',
      title: 'TypeScript AvanÃ§ado',
      description: 'Domine conceitos avanÃ§ados de TypeScript para desenvolvimento profissional.',
      thumbnail_url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=TypeScript%20advanced%20course%20thumbnail%20blue%20professional&image_size=landscape_4_3',
      instructor_name: 'Maria Santos',
      category: 'ProgramaÃ§Ã£o',
      level: 'advanced',
      duration_minutes: 720,
      total_lessons: 18,
      completed_lessons: 18,
      progress_percentage: 100,
      last_accessed: '2024-01-10',
      is_completed: true,
      rating: 4.9,
      enrolled_at: '2023-12-15'
    },
    {
      id: '3',
      title: 'Design UX/UI Moderno',
      description: 'Crie interfaces incrÃ­veis com as melhores prÃ¡ticas de UX/UI.',
      thumbnail_url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=UX%20UI%20design%20course%20thumbnail%20colorful%20modern&image_size=landscape_4_3',
      instructor_name: 'Ana Costa',
      category: 'Design',
      level: 'intermediate',
      duration_minutes: 600,
      total_lessons: 15,
      completed_lessons: 3,
      progress_percentage: 20,
      last_accessed: '2024-01-14',
      is_completed: false,
      rating: 4.7,
      enrolled_at: '2024-01-10'
    }
  ];

  useEffect(() => {
    loadCourses();
  }, [user]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Implementar busca real no Supabase
      // Por enquanto, usar dados mock
      try {
        const list = await fetchCourses('published');
        const mapped = (list || []).map((c: any) => ({
          id: c.id,
          title: c.title,
          description: c.description || '',
          thumbnail_url: c.thumbnail_url || '',
          instructor_name: 'Equipe Esquads',
          category: c.category || 'Geral',
          level: c.difficulty || 'beginner',
          duration_minutes: c.estimated_duration || 0,
          total_lessons: 0,
          completed_lessons: 0,
          progress_percentage: 0,
          is_completed: false,
          rating: undefined,
          enrolled_at: c.created_at,
        }));
        setCourses(mapped);
      } catch (e) {
        setCourses(mockCourses);
      }
      
      setLoading(false);
      
    } catch (err) {
      console.error('Erro ao carregar cursos:', err);
      setError('Erro ao carregar cursos. Tente novamente.');
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    
    let matchesTab = true;
    if (activeTab === 'in-progress') {
      matchesTab = !course.is_completed && course.progress_percentage > 0;
    } else if (activeTab === 'completed') {
      matchesTab = course.is_completed;
    } else if (activeTab === 'not-started') {
      matchesTab = course.progress_percentage === 0;
    }
    
    return matchesSearch && matchesCategory && matchesLevel && matchesTab;
  });

  const handleContinueCourse = (courseId: string) => {
    navigate(`/student/courses/${courseId}`);
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

  const getProgressStats = () => {
    const total = courses.length;
    const completed = courses.filter(c => c.is_completed).length;
    const inProgress = courses.filter(c => !c.is_completed && c.progress_percentage > 0).length;
    const notStarted = courses.filter(c => c.progress_percentage === 0).length;
    
    return { total, completed, inProgress, notStarted };
  };

  const stats = getProgressStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meus Cursos</h1>
          <p className="text-gray-600">Acompanhe seu progresso e continue aprendendo</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-3">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Total</p>
                <p className="text-lg font-semibold">{stats.total}</p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">ConcluÃ­dos</p>
                <p className="text-lg font-semibold">{stats.completed}</p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center space-x-2">
              <Play className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-xs text-gray-600">Em Progresso</p>
                <p className="text-lg font-semibold">{stats.inProgress}</p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-xs text-gray-600">NÃ£o Iniciados</p>
                <p className="text-lg font-semibold">{stats.notStarted}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar cursos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                <SelectItem value="ProgramaÃ§Ã£o">ProgramaÃ§Ã£o</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="NegÃ³cios">NegÃ³cios</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="NÃ­vel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os nÃ­veis</SelectItem>
                <SelectItem value="beginner">Iniciante</SelectItem>
                <SelectItem value="intermediate">IntermediÃ¡rio</SelectItem>
                <SelectItem value="advanced">AvanÃ§ado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="in-progress">Em Progresso</TabsTrigger>
          <TabsTrigger value="completed">ConcluÃ­dos</TabsTrigger>
          <TabsTrigger value="not-started">NÃ£o Iniciados</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {error && (
            <Alert className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {filteredCourses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum curso encontrado
                </h3>
                <p className="text-gray-600 text-center">
                  NÃ£o hÃ¡ cursos que correspondam aos filtros selecionados.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video relative">
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    {course.is_completed && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-green-600 text-white">
                          <Trophy className="h-3 w-3 mr-1" />
                          ConcluÃ­do
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {course.description}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getLevelColor(course.level)}>
                        {getLevelText(course.level)}
                      </Badge>
                      <Badge variant="outline">{course.category}</Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progresso</span>
                          <span>{course.progress_percentage}%</span>
                        </div>
                        <Progress value={course.progress_percentage} className="h-2" />
                        <p className="text-xs text-gray-600 mt-1">
                          {course.completed_lessons} de {course.total_lessons} liÃ§Ãµes
                        </p>
                      </div>

                      {/* Course Info */}
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatDuration(course.duration_minutes)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{course.instructor_name}</span>
                        </div>
                      </div>

                      {course.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{course.rating}</span>
                        </div>
                      )}

                      {/* Action Button */}
                      <Button 
                        onClick={() => handleContinueCourse(course.id)}
                        className="w-full"
                        variant={course.is_completed ? "outline" : "default"}
                      >
                        {course.is_completed ? (
                          <>
                            <Award className="h-4 w-4 mr-2" />
                            Revisar Curso
                          </>
                        ) : course.progress_percentage > 0 ? (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Continuar
                          </>
                        ) : (
                          <>
                            <BookOpen className="h-4 w-4 mr-2" />
                            ComeÃ§ar
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentCourses;



