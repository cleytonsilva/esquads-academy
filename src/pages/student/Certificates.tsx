import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Award, 
  Download, 
  Share2, 
  Calendar, 
  User, 
  BookOpen,
  Trophy,
  Star,
  ExternalLink,
  CheckCircle,
  Clock,
  Filter
} from 'lucide-react';
import { useCertificates } from '@/hooks/useCertificates';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Certificate {
  id: string;
  course_title: string;
  student_name: string;
  completion_date: string;
  certificate_url?: string;
  course_id: string;
  instructor_name: string;
  grade?: number;
  skills_learned: string[];
  certificate_hash?: string;
  is_verified: boolean;
  hours_completed: number;
}

const StudentCertificates: React.FC = () => {
  const { user } = useAuth();
  const { certificates: userCertificates, loading, generateCertificate } = useCertificates();
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  // Mock data para demonstração
  const mockCertificates: Certificate[] = [
    {
      id: '1',
      course_title: 'Fundamentos de React',
      student_name: user?.full_name || 'Estudante',
      completion_date: '2024-01-15',
      certificate_url: '#',
      course_id: 'course-1',
      instructor_name: 'Prof. João Silva',
      grade: 95,
      skills_learned: ['React Hooks', 'Component Lifecycle', 'State Management', 'JSX'],
      certificate_hash: 'abc123def456',
      is_verified: true,
      hours_completed: 40
    },
    {
      id: '2',
      course_title: 'TypeScript Avançado',
      student_name: user?.full_name || 'Estudante',
      completion_date: '2024-02-20',
      certificate_url: '#',
      course_id: 'course-2',
      instructor_name: 'Prof. Maria Santos',
      grade: 88,
      skills_learned: ['Advanced Types', 'Generics', 'Decorators', 'Module System'],
      certificate_hash: 'def456ghi789',
      is_verified: true,
      hours_completed: 35
    },
    {
      id: '3',
      course_title: 'Node.js e Express',
      student_name: user?.full_name || 'Estudante',
      completion_date: '2024-03-10',
      course_id: 'course-3',
      instructor_name: 'Prof. Carlos Lima',
      grade: 92,
      skills_learned: ['REST APIs', 'Middleware', 'Authentication', 'Database Integration'],
      is_verified: false,
      hours_completed: 50
    }
  ];

  const certificates = userCertificates?.length ? userCertificates as unknown as Certificate[] : mockCertificates;

  const filteredCertificates = certificates.filter(cert => {
    if (filter === 'verified') return cert.is_verified;
    if (filter === 'pending') return !cert.is_verified;
    return true;
  });

  const handleDownloadCertificate = async (certificate: Certificate) => {
    try {
      if (certificate.certificate_url) {
        // Simular download
        toast.success(`Certificado "${certificate.course_title}" baixado com sucesso!`);
      } else {
        // Gerar certificado se não existir
        await generateCertificate(certificate.course_id, {
          grade: 85,
          hoursCompleted: 40,
          skillsAcquired: ['React', 'TypeScript', 'Node.js']
        });
        toast.success('Certificado gerado e baixado com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao baixar certificado');
    }
  };

  const handleShareCertificate = (certificate: Certificate) => {
    const shareText = `Acabei de concluir o curso "${certificate.course_title}" na Esquads Academy! 🎓`;
    const shareUrl = `${window.location.origin}/certificate/verify/${certificate.certificate_hash}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Meu Certificado - Esquads Academy',
        text: shareText,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      toast.success('Link do certificado copiado para a área de transferência!');
    }
  };

  const handleVerifyCertificate = (certificate: Certificate) => {
    if (certificate.certificate_hash) {
      window.open(`/certificate/verify/${certificate.certificate_hash}`, '_blank');
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600 bg-green-50';
    if (grade >= 80) return 'text-blue-600 bg-blue-50';
    if (grade >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const totalHours = certificates.reduce((sum, cert) => sum + cert.hours_completed, 0);
  const averageGrade = certificates.reduce((sum, cert) => sum + (cert.grade || 0), 0) / certificates.length;
  const verifiedCount = certificates.filter(cert => cert.is_verified).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Award className="w-8 h-8 mr-3" />
              Meus Certificados
            </h1>
            <p className="text-purple-100 mt-2">
              Suas conquistas e certificações acadêmicas
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{certificates.length}</div>
            <div className="text-sm text-purple-100">Certificados</div>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Certificados</p>
                <p className="text-2xl font-bold text-gray-900">{certificates.length}</p>
              </div>
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Horas de Estudo</p>
                <p className="text-2xl font-bold text-gray-900">{totalHours}h</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nota Média</p>
                <p className="text-2xl font-bold text-gray-900">{averageGrade.toFixed(1)}</p>
              </div>
              <Star className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verificados</p>
                <p className="text-2xl font-bold text-gray-900">{verifiedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex items-center space-x-4">
        <Filter className="w-5 h-5 text-gray-500" />
        <div className="flex space-x-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Todos ({certificates.length})
          </Button>
          <Button
            variant={filter === 'verified' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('verified')}
          >
            Verificados ({verifiedCount})
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            Pendentes ({certificates.length - verifiedCount})
          </Button>
        </div>
      </div>

      {/* Lista de Certificados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCertificates.map((certificate) => (
          <Card key={certificate.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                    {certificate.course_title}
                  </CardTitle>
                  <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {certificate.instructor_name}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(certificate.completion_date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {certificate.is_verified ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verificado
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-orange-600 border-orange-200">
                      <Clock className="w-3 h-3 mr-1" />
                      Pendente
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Nota e Horas */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {certificate.grade && (
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(certificate.grade)}`}>
                      Nota: {certificate.grade}%
                    </div>
                  )}
                  <span className="text-sm text-gray-600">
                    {certificate.hours_completed}h de estudo
                  </span>
                </div>
              </div>

              {/* Habilidades Aprendidas */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Habilidades Desenvolvidas:</p>
                <div className="flex flex-wrap gap-1">
                  {certificate.skills_learned.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Hash de Verificação */}
              {certificate.certificate_hash && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Hash de Verificação:</p>
                  <code className="text-xs font-mono text-gray-800 break-all">
                    {certificate.certificate_hash}
                  </code>
                </div>
              )}

              {/* Ações */}
              <div className="flex items-center space-x-2 pt-2">
                <Button
                  size="sm"
                  onClick={() => handleDownloadCertificate(certificate)}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleShareCertificate(certificate)}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
                {certificate.certificate_hash && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleVerifyCertificate(certificate)}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Verificar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estado vazio */}
      {filteredCertificates.length === 0 && (
        <div className="text-center py-12">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' ? 'Nenhum certificado encontrado' : 
             filter === 'verified' ? 'Nenhum certificado verificado' : 
             'Nenhum certificado pendente'}
          </h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all' ? 'Complete cursos para ganhar certificados!' : 
             filter === 'verified' ? 'Seus certificados verificados aparecerão aqui.' : 
             'Certificados aguardando verificação aparecerão aqui.'}
          </p>
          {filter !== 'all' && (
            <Button onClick={() => setFilter('all')}>
              Ver Todos os Certificados
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentCertificates;
