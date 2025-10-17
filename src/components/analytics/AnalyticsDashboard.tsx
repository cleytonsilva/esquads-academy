import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import {
  Users,
  BookOpen,
  TrendingUp,
  Clock,
  Star,
  Award,
  Eye,
  Download,
  Calendar,
  Target,
  Activity,
  DollarSign
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AnalyticsData {
  overview: {
    totalStudents: number;
    totalCourses: number;
    totalRevenue: number;
    averageRating: number;
    completionRate: number;
    totalViews: number;
  };
  coursePerformance: Array<{
    id: string;
    title: string;
    students: number;
    completionRate: number;
    rating: number;
    revenue: number;
    views: number;
  }>;
  studentEngagement: Array<{
    date: string;
    activeStudents: number;
    newEnrollments: number;
    completions: number;
  }>;
  revenueData: Array<{
    month: string;
    revenue: number;
    enrollments: number;
  }>;
  topCourses: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('students');

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simular dados de analytics
      const mockData: AnalyticsData = {
        overview: {
          totalStudents: 1247,
          totalCourses: 8,
          totalRevenue: 15420.50,
          averageRating: 4.7,
          completionRate: 78,
          totalViews: 8934
        },
        coursePerformance: [
          {
            id: '1',
            title: 'React Avançado',
            students: 324,
            completionRate: 85,
            rating: 4.8,
            revenue: 6480.00,
            views: 2156
          },
          {
            id: '2',
            title: 'TypeScript Fundamentals',
            students: 298,
            completionRate: 92,
            rating: 4.9,
            revenue: 5960.00,
            views: 1987
          },
          {
            id: '3',
            title: 'Node.js Backend',
            students: 267,
            completionRate: 76,
            rating: 4.6,
            revenue: 5340.00,
            views: 1743
          },
          {
            id: '4',
            title: 'Design Patterns',
            students: 189,
            completionRate: 68,
            rating: 4.5,
            revenue: 3780.00,
            views: 1298
          }
        ],
        studentEngagement: [
          { date: '2024-01-01', activeStudents: 145, newEnrollments: 23, completions: 12 },
          { date: '2024-01-02', activeStudents: 167, newEnrollments: 31, completions: 18 },
          { date: '2024-01-03', activeStudents: 189, newEnrollments: 28, completions: 15 },
          { date: '2024-01-04', activeStudents: 203, newEnrollments: 35, completions: 22 },
          { date: '2024-01-05', activeStudents: 178, newEnrollments: 19, completions: 16 },
          { date: '2024-01-06', activeStudents: 156, newEnrollments: 24, completions: 14 },
          { date: '2024-01-07', activeStudents: 234, newEnrollments: 42, completions: 28 }
        ],
        revenueData: [
          { month: 'Jan', revenue: 2340, enrollments: 45 },
          { month: 'Fev', revenue: 3210, enrollments: 67 },
          { month: 'Mar', revenue: 2890, enrollments: 58 },
          { month: 'Abr', revenue: 4120, enrollments: 82 },
          { month: 'Mai', revenue: 3650, enrollments: 73 },
          { month: 'Jun', revenue: 4890, enrollments: 98 }
        ],
        topCourses: [
          { name: 'React Avançado', value: 324, color: COLORS[0] },
          { name: 'TypeScript', value: 298, color: COLORS[1] },
          { name: 'Node.js', value: 267, color: COLORS[2] },
          { name: 'Design Patterns', value: 189, color: COLORS[3] },
          { name: 'Outros', value: 169, color: COLORS[4] }
        ]
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Erro ao carregar dados de analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Acompanhe o desempenho dos seus cursos</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
              <SelectItem value="1y">1 ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Estudantes</p>
                <p className="text-2xl font-bold">{analyticsData.overview.totalStudents.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Cursos</p>
                <p className="text-2xl font-bold">{analyticsData.overview.totalCourses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Receita</p>
                <p className="text-2xl font-bold">R$ {analyticsData.overview.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Avaliação</p>
                <p className="text-2xl font-bold">{analyticsData.overview.averageRating}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Conclusão</p>
                <p className="text-2xl font-bold">{analyticsData.overview.completionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-sm text-gray-600">Visualizações</p>
                <p className="text-2xl font-bold">{analyticsData.overview.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="engagement" className="space-y-4">
        <TabsList>
          <TabsTrigger value="engagement">Engajamento</TabsTrigger>
          <TabsTrigger value="revenue">Receita</TabsTrigger>
          <TabsTrigger value="courses">Cursos</TabsTrigger>
          <TabsTrigger value="students">Estudantes</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Engajamento Diário</CardTitle>
                <CardDescription>Estudantes ativos, matrículas e conclusões</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.studentEngagement}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="activeStudents" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="newEnrollments" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                    <Area type="monotone" dataKey="completions" stackId="1" stroke="#ffc658" fill="#ffc658" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Estudantes</CardTitle>
                <CardDescription>Por curso mais popular</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.topCourses}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.topCourses.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Receita Mensal</CardTitle>
              <CardDescription>Receita e matrículas por mês</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analyticsData.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" />
                  <Bar yAxisId="right" dataKey="enrollments" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance dos Cursos</CardTitle>
              <CardDescription>Métricas detalhadas por curso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.coursePerformance.map((course) => (
                  <div key={course.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{course.title}</h4>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">{course.students} estudantes</Badge>
                          <Badge variant="outline">⭐ {course.rating}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">R$ {course.revenue.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{course.views} visualizações</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Taxa de Conclusão</span>
                        <span>{course.completionRate}%</span>
                      </div>
                      <Progress value={course.completionRate} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Crescimento de Estudantes</CardTitle>
                <CardDescription>Novos estudantes ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.studentEngagement}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="newEnrollments" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Retenção</CardTitle>
                <CardDescription>Indicadores de engajamento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Taxa de Conclusão Média</span>
                  <span className="font-semibold">{analyticsData.overview.completionRate}%</span>
                </div>
                <Progress value={analyticsData.overview.completionRate} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avaliação Média</span>
                  <span className="font-semibold">{analyticsData.overview.averageRating}/5.0</span>
                </div>
                <Progress value={(analyticsData.overview.averageRating / 5) * 100} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Estudantes Ativos</span>
                  <span className="font-semibold">89%</span>
                </div>
                <Progress value={89} className="h-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
