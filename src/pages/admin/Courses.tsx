// Esquads Academy - Gestão de Cursos (Admin)

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/utils/constants';
import { formatDate, formatCurrency } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Users,
  Star,
  Clock,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

import { supabase } from '@/integrations/supabase/client';

interface Course {
  id: string;
  title: string;
  description?: string;
  instructor?: {
    id: string;
    name?: string;
    avatar?: string;
  } | null;
  category?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'published' | 'archived';
  price?: number;
  students_count?: number;
  rating?: number;
  duration_hours?: number;
  created_at?: string;
  updated_at?: string;
  thumbnail?: string;
}

const AdminCourses: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

    // Carregar do Supabase com fallback em caso de indisponibilidade
  useEffect(() => {
  let cancelled = false;
  const load = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('id,title,description,thumbnail_url,instructor_id,status,difficulty,estimated_duration,price,is_free,created_at,updated_at,tags')
        .order('updated_at', { ascending: false })
        .limit(50);
      if (!error && data && !cancelled) {
        const mapped = (data as any[]).map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description || '',
          instructor: c.instructor_id ? { id: c.instructor_id } : null,
          category: (c.tags && c.tags[0]) || 'Geral',
          level: c.difficulty || 'beginner',
          status: c.status || 'draft',
          price: c.is_free ? 0 : (c.price || 0),
          students_count: 0,
          rating: 0,
          duration_hours: c.estimated_duration || 0,
          created_at: c.created_at,
          updated_at: c.updated_at,
          thumbnail: c.thumbnail_url || undefined,
        })) as Course[];
        setCourses(mapped);
        setFilteredCourses(mapped);
        setIsLoading(false);
        return;
      }
    } catch (e) {
      console.warn('Falha ao carregar cursos do Supabase, usando fallback:', e);
    }
    if (!cancelled) {
      const fallback: Course[] = [
        { id: 'demo-1', title: 'Curso Exemplo', description: 'Exemplo de curso', instructor: { id: 'inst' } as any, category: 'Geral', level: 'beginner', status: 'draft', price: 0, students_count: 0, rating: 0, duration_hours: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ];
      setCourses(fallback);
      setFilteredCourses(fallback);
      setIsLoading(false);
    }
  };
  load();
  return () => { cancelled = true };
}, []);

  // Filter courses based on search and filters
  useEffect(() => {
    let filtered = courses;

    // Search filter
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      filtered = filtered.filter(course =>
        (course.title || '').toLowerCase().includes(s) ||
        ((course.instructor?.name || '').toLowerCase().includes(s)) ||
        ((course.category || '').toLowerCase().includes(s))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(course => course.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(course => course.category === categoryFilter);
    }

    setFilteredCourses(filtered);
  }, [courses, searchTerm, statusFilter, categoryFilter]);

  const getStatusBadge = (status: Course['status']) => {
    const variants = {
      published: { variant: 'default' as const, label: 'Publicado', icon: CheckCircle },
      draft: { variant: 'secondary' as const, label: 'Rascunho', icon: Clock },
      archived: { variant: 'destructive' as const, label: 'Arquivado', icon: AlertTriangle }
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getLevelBadge = (level: Course['level']) => {
    const variants = {
      beginner: { variant: 'outline' as const, label: 'Iniciante' },
      intermediate: { variant: 'secondary' as const, label: 'Intermediário' },
      advanced: { variant: 'destructive' as const, label: 'Avançado' }
    };

    const config = variants[level];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleDeleteCourse = (courseId: string) => {
    if (confirm('Tem certeza que deseja excluir este curso?')) {
      setCourses(prev => prev.filter(course => course.id !== courseId));
    }
  };

  const stats = {
    total: courses.length,
    published: courses.filter(c => c.status === 'published').length,
    draft: courses.filter(c => c.status === 'draft').length,
    totalStudents: courses.reduce((sum, c) => sum + c.students_count, 0),
    totalRevenue: courses.reduce((sum, c) => sum + (c.price * c.students_count), 0)
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Cursos</h1>
          <p className="text-gray-600 mt-1">
            Gerencie todos os cursos da plataforma
          </p>
        </div>
        
        <Button asChild className="flex items-center gap-2">
          <Link to="/admin/courses/wizard">
            <Plus className="w-4 h-4" />
            Novo Curso
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Cursos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Publicados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.published}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rascunhos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Estudantes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar cursos</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Buscar por título, instrutor ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="w-full md:w-48">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="archived">Arquivado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-48">
              <Label>Categoria</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  <SelectItem value="Programação">Programação</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Backend">Backend</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Cursos ({filteredCourses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum curso encontrado
              </h3>
              <p className="text-gray-600">
                Tente ajustar os filtros ou criar um novo curso.
              </p>
              <div className="mt-4">
                <Button asChild>
                  <Link to="/admin/courses/wizard" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Criar Curso
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {/* Course Thumbnail */}
                  <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Course Info */}
                  <div className="ml-4 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{course.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{course.students_count} estudantes</span>
                          </div>
                          {course.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span>{course.rating}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{course.duration_hours}h</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span>{formatCurrency(course.price)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {getStatusBadge(course.status)}
                        {getLevelBadge(course.level)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={course.instructor.avatar}
                          alt={course.instructor.name}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm text-gray-600">
                          por {course.instructor.name}
                        </span>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-600">
                          {course.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteCourse(course.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export { AdminCourses };



