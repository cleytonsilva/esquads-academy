import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Sparkles,
  TrendingUp,
  Star,
  Clock,
  Users,
  BookOpen,
  Target,
  Filter,
  Search,
  RefreshCw,
  AlertCircle,
  Heart,
  Share2,
  Play,
  Award,
  Zap,
  Brain,
  Compass,
  Lightbulb,
  Route,
  Settings
} from 'lucide-react';
import { useRecommendations } from '@/hooks/useRecommendations';
import { CourseRecommendation, RecommendationFilters } from '@/services/recommendationService';
import { ProfileSetupModal } from './ProfileSetupModal';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

export const RecommendationsDashboard: React.FC = () => {
  const {
    personalizedRecommendations,
    popularCourses,
    learningPaths,
    trendingCourses,
    userProfile,
    loading,
    error,
    filters,
    loadPersonalizedRecommendations,
    generateLearningPaths,
    getRecommendationsByCategory,
    getBeginnerRecommendations,
    getQuickRecommendations,
    applyFilters,
    clearFilters,
    getRecommendationStats,
    refresh,
    clearError
  } = useRecommendations();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [maxDuration, setMaxDuration] = useState<number | undefined>();
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [activeTab, setActiveTab] = useState('personalized');
  const [categoryRecommendations, setCategoryRecommendations] = useState<Record<string, CourseRecommendation[]>>({});

  // Carregar recomendações por categoria
  useEffect(() => {
    const loadCategoryRecommendations = async () => {
      const categories = ['Programação', 'Design', 'Marketing', 'Negócios'];
      const recommendations: Record<string, CourseRecommendation[]> = {};
      
      for (const category of categories) {
        const recs = await getRecommendationsByCategory(category, 3);
        recommendations[category] = recs;
      }
      
      setCategoryRecommendations(recommendations);
    };

    loadCategoryRecommendations();
  }, [getRecommendationsByCategory]);

  // Aplicar filtros
  const handleApplyFilters = () => {
    const newFilters: RecommendationFilters = {};
    
    if (selectedCategory !== 'all') {
      newFilters.categories = [selectedCategory];
    }
    
    if (selectedDifficulty !== 'all') {
      newFilters.difficulty_levels = [selectedDifficulty];
    }
    
    if (maxPrice) {
      newFilters.max_price = maxPrice;
    }
    
    if (maxDuration) {
      newFilters.max_duration = maxDuration;
    }

    applyFilters(newFilters);
  };

  // Filtrar recomendações por busca
  const filteredRecommendations = personalizedRecommendations.filter(rec =>
    rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = getRecommendationStats();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (percentage >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  if (loading && personalizedRecommendations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-2">Carregando recomendações...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button variant="outline" size="sm" onClick={() => { clearError(); refresh(); }} className="ml-2">
            <RefreshCw className="h-4 w-4 mr-1" />
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Sparkles className="h-8 w-8 mr-3 text-blue-600" />
            Recomendações Inteligentes
          </h1>
          <p className="text-gray-600 mt-1">
            Cursos personalizados baseados no seu perfil e objetivos
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowProfileSetup(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Configurar Perfil
          </Button>
          <Button variant="outline" onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      {stats.totalRecommendations > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recomendações</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRecommendations}</div>
              <p className="text-xs text-muted-foreground">
                {stats.highScoreRecommendations} com alta compatibilidade
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compatibilidade Média</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageMatchPercentage.toFixed(0)}%</div>
              <Progress value={stats.averageMatchPercentage} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Score Médio</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats.averageScore * 100).toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">
                de 100 pontos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorias</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.topCategories.length}</div>
              <p className="text-xs text-muted-foreground">
                diferentes áreas
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personalized">Personalizadas</TabsTrigger>
          <TabsTrigger value="trending">Em Alta</TabsTrigger>
          <TabsTrigger value="paths">Trilhas</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="personalized" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar cursos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    <SelectItem value="Programação">Programação</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Negócios">Negócios</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Dificuldade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os níveis</SelectItem>
                    <SelectItem value="beginner">Iniciante</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  placeholder="Preço máximo"
                  value={maxPrice || ''}
                  onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                />

                <div className="flex gap-2">
                  <Button onClick={handleApplyFilters} className="flex-1">
                    Aplicar
                  </Button>
                  <Button variant="outline" onClick={clearFilters}>
                    Limpar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recomendações Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => getBeginnerRecommendations(5)}
            >
              <Lightbulb className="h-6 w-6 text-blue-600" />
              <span className="font-medium">Para Iniciantes</span>
              <span className="text-sm text-gray-500">Cursos básicos</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => getQuickRecommendations(5)}
            >
              <Zap className="h-6 w-6 text-yellow-600" />
              <span className="font-medium">Cursos Rápidos</span>
              <span className="text-sm text-gray-500">Menos de 5 horas</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => generateLearningPaths('JavaScript', 3)}
            >
              <Route className="h-6 w-6 text-green-600" />
              <span className="font-medium">Trilhas de Aprendizado</span>
              <span className="text-sm text-gray-500">Jornadas completas</span>
            </Button>
          </div>

          {/* Lista de Recomendações */}
          {filteredRecommendations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Compass className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {personalizedRecommendations.length === 0 ? 'Configure seu perfil' : 'Nenhum curso encontrado'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {personalizedRecommendations.length === 0 
                    ? 'Configure seu perfil para receber recomendações personalizadas!'
                    : 'Tente ajustar os filtros para encontrar cursos adequados.'
                  }
                </p>
                {personalizedRecommendations.length === 0 && (
                  <Button onClick={() => setShowProfileSetup(true)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar Perfil
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecommendations.map((recommendation) => (
                <Card key={recommendation.course_id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <Badge className={`${getMatchColor(recommendation.match_percentage)} border`}>
                        {recommendation.match_percentage}% match
                      </Badge>
                    </div>

                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {recommendation.title}
                    </h3>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {recommendation.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-2" />
                        por {recommendation.instructor_name}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-2" />
                        {recommendation.duration_hours}h • {recommendation.estimated_completion_time}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Star className="h-4 w-4 mr-2" />
                        {recommendation.rating}/5 ({recommendation.student_count} estudantes)
                      </div>
                    </div>

                    {recommendation.skills.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">Habilidades:</p>
                        <div className="flex flex-wrap gap-1">
                          {recommendation.skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {recommendation.skills.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{recommendation.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {recommendation.recommendation_reasons.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">Por que recomendamos:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {recommendation.recommendation_reasons.slice(0, 2).map((reason, index) => (
                            <li key={index} className="flex items-start">
                              <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-bold text-green-600">
                        {formatPrice(recommendation.price)}
                      </span>
                      <Badge variant="outline" className={`${getMatchColor(recommendation.match_percentage)}`}>
                        {recommendation.difficulty_level}
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1">
                        <Play className="h-4 w-4 mr-1" />
                        Ver Curso
                      </Button>
                      <Button variant="outline" size="sm">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Cursos em Alta
              </CardTitle>
              <CardDescription>
                Cursos com maior crescimento de matrículas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trendingCourses.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Carregando tendências...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {trendingCourses.map((course, index) => (
                    <div key={course.course_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">#{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-medium">{course.title}</h4>
                          <p className="text-sm text-gray-500">{course.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">
                          +{course.enrollment_growth.toFixed(0)}% matrículas
                        </div>
                        <div className="text-xs text-gray-500">
                          {course.completion_rate.toFixed(0)}% conclusão
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paths" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Route className="h-5 w-5 mr-2" />
                Trilhas de Aprendizado
              </CardTitle>
              <CardDescription>
                Jornadas estruturadas para dominar habilidades específicas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {learningPaths.length === 0 ? (
                <div className="text-center py-8">
                  <Route className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Nenhuma trilha disponível</p>
                  <Button onClick={() => generateLearningPaths('JavaScript', 3)}>
                    Gerar Trilhas
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {learningPaths.map((path) => (
                    <Card key={path.id} className="border-2 border-dashed border-blue-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{path.title}</h3>
                            <p className="text-gray-600">{path.description}</p>
                          </div>
                          <Badge className="bg-blue-50 text-blue-600 border-blue-200">
                            {path.courses.length} cursos
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <Clock className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                            <div className="text-sm font-medium">{path.total_duration}h</div>
                            <div className="text-xs text-gray-500">Duração total</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <Target className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                            <div className="text-sm font-medium">{path.skills_acquired.length}</div>
                            <div className="text-xs text-gray-500">Habilidades</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <Award className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                            <div className="text-sm font-medium">{path.estimated_completion}</div>
                            <div className="text-xs text-gray-500">Conclusão</div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {path.courses.map((course, index) => (
                            <div key={course.course_id} className="flex items-center space-x-3 p-3 border rounded-lg">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-medium text-sm">{index + 1}</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium">{course.title}</h4>
                                <p className="text-sm text-gray-500">
                                  {course.duration_hours}h • {course.difficulty_level}
                                </p>
                              </div>
                              <Badge variant="outline">
                                {course.difficulty_level}
                              </Badge>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <Button className="w-full">
                            <Play className="h-4 w-4 mr-2" />
                            Iniciar Trilha
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(categoryRecommendations).map(([category, recommendations]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-lg">{category}</CardTitle>
                  <CardDescription>
                    Recomendações personalizadas para {category.toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recommendations.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Nenhuma recomendação disponível</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recommendations.map((rec) => (
                        <div key={rec.course_id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{rec.title}</h4>
                            <p className="text-xs text-gray-500">
                              {rec.duration_hours}h • {rec.instructor_name}
                            </p>
                          </div>
                          <Badge className={`${getMatchColor(rec.match_percentage)} text-xs`}>
                            {rec.match_percentage}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {stats.totalRecommendations > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Distribuição por Categoria */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Categoria</CardTitle>
                  <CardDescription>Suas recomendações por área de interesse</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.topCategories}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, count }) => `${category} (${count})`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {stats.topCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Scores de Compatibilidade */}
              <Card>
                <CardHeader>
                  <CardTitle>Scores de Compatibilidade</CardTitle>
                  <CardDescription>Distribuição dos scores de recomendação</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { range: '80-100%', label: 'Excelente Match', color: 'bg-green-500', count: personalizedRecommendations.filter(r => r.match_percentage >= 80).length },
                      { range: '60-79%', label: 'Bom Match', color: 'bg-blue-500', count: personalizedRecommendations.filter(r => r.match_percentage >= 60 && r.match_percentage < 80).length },
                      { range: '40-59%', label: 'Match Moderado', color: 'bg-yellow-500', count: personalizedRecommendations.filter(r => r.match_percentage >= 40 && r.match_percentage < 60).length },
                      { range: '0-39%', label: 'Match Baixo', color: 'bg-gray-500', count: personalizedRecommendations.filter(r => r.match_percentage < 40).length }
                    ].map((item) => (
                      <div key={item.range} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded ${item.color}`} />
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{item.count}</span>
                          <div className="w-20">
                            <Progress 
                              value={personalizedRecommendations.length > 0 ? (item.count / personalizedRecommendations.length) * 100 : 0} 
                              className="h-2"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de Configuração de Perfil */}
      {showProfileSetup && (
        <ProfileSetupModal
          isOpen={showProfileSetup}
          onClose={() => setShowProfileSetup(false)}
          userProfile={userProfile}
        />
      )}
    </div>
  );
};
