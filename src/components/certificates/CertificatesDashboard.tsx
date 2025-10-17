import React, { useState } from 'react';
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
  Award,
  Download,
  Share2,
  Search,
  Filter,
  Calendar,
  Star,
  Clock,
  TrendingUp,
  Users,
  BookOpen,
  Target,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Trophy,
  Medal,
  Crown
} from 'lucide-react';
import { useCertificates } from '@/hooks/useCertificates';
import { CertificateViewer } from './CertificateViewer';
import { Certificate } from '@/services/certificateService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

export const CertificatesDashboard: React.FC = () => {
  const {
    certificates,
    stats,
    loading,
    error,
    filterCertificates,
    getRecentCertificates,
    downloadCertificate,
    shareCertificate,
    refresh,
    clearError
  } = useCertificates();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGradeRange, setSelectedGradeRange] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filtrar certificados
  const filteredCertificates = filterCertificates({
    courseTitle: searchTerm,
    minGrade: selectedGradeRange === '90-100' ? 90 : 
              selectedGradeRange === '80-89' ? 80 :
              selectedGradeRange === '70-79' ? 70 : undefined,
    maxGrade: selectedGradeRange === '90-100' ? 100 : 
              selectedGradeRange === '80-89' ? 89 :
              selectedGradeRange === '70-79' ? 79 : undefined,
    dateFrom: selectedDateRange === '30d' ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() :
              selectedDateRange === '90d' ? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() :
              selectedDateRange === '1y' ? new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString() : undefined
  });

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (grade >= 80) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (grade >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getGradeIcon = (grade: number) => {
    if (grade >= 95) return <Crown className="h-4 w-4" />;
    if (grade >= 90) return <Trophy className="h-4 w-4" />;
    if (grade >= 80) return <Medal className="h-4 w-4" />;
    return <Award className="h-4 w-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (selectedCertificate) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setSelectedCertificate(null)}>
            ← Voltar aos Certificados
          </Button>
        </div>
        <CertificateViewer certificateId={selectedCertificate} />
      </div>
    );
  }

  if (loading && certificates.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-2">Carregando certificados...</span>
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
          <h1 className="text-3xl font-bold">Meus Certificados</h1>
          <p className="text-gray-600 mt-1">
            Gerencie e compartilhe seus certificados de conclusão
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Certificados</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCertificates}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.certificatesThisMonth} este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nota Média</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageGrade.toFixed(1)}</div>
              <Progress value={stats.averageGrade} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Horas Totais</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalHoursCompleted}h</div>
              <p className="text-xs text-muted-foreground">
                de estudo certificado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skills Adquiridas</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.topSkills.length}</div>
              <p className="text-xs text-muted-foreground">
                habilidades diferentes
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="certificates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="certificates">Certificados</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="skills">Habilidades</TabsTrigger>
        </TabsList>

        <TabsContent value="certificates" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por curso..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={selectedGradeRange} onValueChange={setSelectedGradeRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por nota" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as notas</SelectItem>
                    <SelectItem value="90-100">90-100 (Excelente)</SelectItem>
                    <SelectItem value="80-89">80-89 (Muito Bom)</SelectItem>
                    <SelectItem value="70-79">70-79 (Bom)</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os períodos</SelectItem>
                    <SelectItem value="30d">Últimos 30 dias</SelectItem>
                    <SelectItem value="90d">Últimos 90 dias</SelectItem>
                    <SelectItem value="1y">Último ano</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    Grid
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    Lista
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Certificados */}
          {filteredCertificates.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {certificates.length === 0 ? 'Nenhum certificado ainda' : 'Nenhum certificado encontrado'}
                </h3>
                <p className="text-gray-500">
                  {certificates.length === 0 
                    ? 'Complete um curso para ganhar seu primeiro certificado!'
                    : 'Tente ajustar os filtros para encontrar seus certificados.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredCertificates.map((certificate) => (
                <Card key={certificate.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        {getGradeIcon(certificate.grade)}
                      </div>
                      <Badge className={`${getGradeColor(certificate.grade)} border`}>
                        {certificate.grade}/100
                      </Badge>
                    </div>

                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {certificate.course_title}
                    </h3>

                    <p className="text-sm text-gray-600 mb-3">
                      por {certificate.instructor_name}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        Concluído em {formatDate(certificate.completion_date)}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-2" />
                        {certificate.hours_completed} horas de estudo
                      </div>
                      {certificate.blockchain_verified && (
                        <div className="flex items-center text-sm text-green-600">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Verificado por Blockchain
                        </div>
                      )}
                    </div>

                    {certificate.skills_acquired.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">Habilidades:</p>
                        <div className="flex flex-wrap gap-1">
                          {certificate.skills_acquired.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {certificate.skills_acquired.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{certificate.skills_acquired.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setSelectedCertificate(certificate.id)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadCertificate(certificate.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => shareCertificate(certificate.id, 'linkedin')}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Distribuição Mensal */}
              <Card>
                <CardHeader>
                  <CardTitle>Certificados por Mês</CardTitle>
                  <CardDescription>Distribuição de certificados ao longo do tempo</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.monthlyDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Skills */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Habilidades</CardTitle>
                  <CardDescription>Habilidades mais adquiridas</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.topSkills.slice(0, 8)} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="skill" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Distribuição de Notas */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Notas</CardTitle>
                  <CardDescription>Performance geral nos cursos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { range: '90-100', label: 'Excelente', color: 'bg-green-500', count: certificates.filter(c => c.grade >= 90).length },
                      { range: '80-89', label: 'Muito Bom', color: 'bg-blue-500', count: certificates.filter(c => c.grade >= 80 && c.grade < 90).length },
                      { range: '70-79', label: 'Bom', color: 'bg-yellow-500', count: certificates.filter(c => c.grade >= 70 && c.grade < 80).length },
                      { range: '60-69', label: 'Satisfatório', color: 'bg-gray-500', count: certificates.filter(c => c.grade < 70).length }
                    ].map((item) => (
                      <div key={item.range} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded ${item.color}`} />
                          <span className="text-sm font-medium">{item.label} ({item.range})</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{item.count}</span>
                          <div className="w-20">
                            <Progress 
                              value={certificates.length > 0 ? (item.count / certificates.length) * 100 : 0} 
                              className="h-2"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Métricas Gerais */}
              <Card>
                <CardHeader>
                  <CardTitle>Resumo Geral</CardTitle>
                  <CardDescription>Suas conquistas em números</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.totalCertificates}</div>
                      <p className="text-sm text-blue-600">Certificados</p>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stats.averageGrade.toFixed(1)}</div>
                      <p className="text-sm text-green-600">Nota Média</p>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{stats.totalHoursCompleted}h</div>
                      <p className="text-sm text-purple-600">Horas Estudadas</p>
                    </div>
                    
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{stats.topSkills.length}</div>
                      <p className="text-sm text-orange-600">Skills Únicas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          {stats && stats.topSkills.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lista de Skills */}
              <Card>
                <CardHeader>
                  <CardTitle>Todas as Habilidades</CardTitle>
                  <CardDescription>Habilidades adquiridas através dos certificados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.topSkills.map((skill, index) => (
                      <div key={skill.skill} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                          </div>
                          <span className="font-medium">{skill.skill}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{skill.count} certificados</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Gráfico de Skills */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Habilidades</CardTitle>
                  <CardDescription>Frequência das habilidades mais comuns</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={stats.topSkills.slice(0, 8)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ skill, percent }) => `${skill} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {stats.topSkills.slice(0, 8).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma habilidade registrada
                </h3>
                <p className="text-gray-500">
                  Complete cursos para começar a adquirir habilidades certificadas!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
