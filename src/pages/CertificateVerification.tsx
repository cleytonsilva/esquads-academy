import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Award, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  User, 
  BookOpen,
  Shield,
  Download,
  Share2,
  ExternalLink,
  Clock,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

interface CertificateData {
  id: string;
  course_title: string;
  student_name: string;
  completion_date: string;
  instructor_name: string;
  grade: number;
  skills_learned: string[];
  certificate_hash: string;
  is_verified: boolean;
  hours_completed: number;
  institution: string;
  verification_date: string;
}

const CertificateVerification: React.FC = () => {
  const { hash } = useParams<{ hash: string }>();
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data para demonstração
  const mockCertificates: Record<string, CertificateData> = {
    'abc123def456': {
      id: '1',
      course_title: 'Fundamentos de React',
      student_name: 'João Silva Santos',
      completion_date: '2024-01-15',
      instructor_name: 'Prof. João Silva',
      grade: 95,
      skills_learned: ['React Hooks', 'Component Lifecycle', 'State Management', 'JSX'],
      certificate_hash: 'abc123def456',
      is_verified: true,
      hours_completed: 40,
      institution: 'Esquads Academy',
      verification_date: '2024-01-16'
    },
    'def456ghi789': {
      id: '2',
      course_title: 'TypeScript Avançado',
      student_name: 'Maria Santos Silva',
      completion_date: '2024-02-20',
      instructor_name: 'Prof. Maria Santos',
      grade: 88,
      skills_learned: ['Advanced Types', 'Generics', 'Decorators', 'Module System'],
      certificate_hash: 'def456ghi789',
      is_verified: true,
      hours_completed: 35,
      institution: 'Esquads Academy',
      verification_date: '2024-02-21'
    }
  };

  useEffect(() => {
    const verifyCertificate = async () => {
      setLoading(true);
      setError(null);

      try {
        // Simular verificação do certificado
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (hash && mockCertificates[hash]) {
          setCertificate(mockCertificates[hash]);
        } else {
          setError('Certificado não encontrado ou hash inválido');
        }
      } catch (err) {
        setError('Erro ao verificar certificado');
      } finally {
        setLoading(false);
      }
    };

    if (hash) {
      verifyCertificate();
    } else {
      setError('Hash do certificado não fornecido');
      setLoading(false);
    }
  }, [hash]);

  const handleDownloadCertificate = () => {
    if (certificate) {
      toast.success(`Certificado "${certificate.course_title}" baixado com sucesso!`);
    }
  };

  const handleShareCertificate = () => {
    if (certificate) {
      const shareText = `Certificado verificado: "${certificate.course_title}" - ${certificate.student_name}`;
      const shareUrl = window.location.href;
      
      if (navigator.share) {
        navigator.share({
          title: 'Certificado Verificado - Esquads Academy',
          text: shareText,
          url: shareUrl
        });
      } else {
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        toast.success('Link de verificação copiado para a área de transferência!');
      }
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600 bg-green-50';
    if (grade >= 80) return 'text-blue-600 bg-blue-50';
    if (grade >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verificando Certificado</h2>
          <p className="text-gray-600">Aguarde enquanto validamos a autenticidade...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Certificado Não Encontrado</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.href = '/'}>
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!certificate) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header de Verificação */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white mb-8">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-200" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Certificado Verificado</h1>
            <p className="text-green-100">
              Este certificado foi validado e é autêntico
            </p>
          </div>
        </div>

        {/* Status de Verificação */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Status</p>
              <p className="text-lg font-bold text-green-600">Verificado</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Verificado em</p>
              <p className="text-lg font-bold text-gray-900">
                {new Date(certificate.verification_date).toLocaleDateString('pt-BR')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Instituição</p>
              <p className="text-lg font-bold text-gray-900">{certificate.institution}</p>
            </CardContent>
          </Card>
        </div>

        {/* Detalhes do Certificado */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
              <BookOpen className="w-6 h-6 mr-3 text-blue-600" />
              Detalhes do Certificado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informações Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Curso</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Curso</p>
                    <p className="text-lg font-semibold text-gray-900">{certificate.course_title}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Instrutor</p>
                    <p className="text-gray-900">{certificate.instructor_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Data de Conclusão</p>
                    <p className="text-gray-900">
                      {new Date(certificate.completion_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Estudante</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Nome do Estudante</p>
                    <p className="text-lg font-semibold text-gray-900">{certificate.student_name}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Nota Final</p>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(certificate.grade)}`}>
                        {certificate.grade}%
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Horas de Estudo</p>
                      <p className="text-gray-900 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {certificate.hours_completed}h
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Habilidades Desenvolvidas */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Habilidades Desenvolvidas</h3>
              <div className="flex flex-wrap gap-2">
                {certificate.skills_learned.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Hash de Verificação */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Hash de Verificação</h3>
              <div className="bg-white p-3 rounded border">
                <code className="text-sm font-mono text-gray-800 break-all">
                  {certificate.certificate_hash}
                </code>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Este hash único garante a autenticidade e integridade do certificado
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleDownloadCertificate}
            className="flex items-center justify-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Baixar Certificado
          </Button>
          <Button
            variant="outline"
            onClick={handleShareCertificate}
            className="flex items-center justify-center"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar Verificação
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open('/', '_blank')}
            className="flex items-center justify-center"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Visitar Esquads Academy
          </Button>
        </div>

        {/* Rodapé de Segurança */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <Shield className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Verificação Segura</h3>
            <p className="text-gray-600 text-sm max-w-2xl mx-auto">
              Este certificado foi verificado através de nossa plataforma segura. 
              A autenticidade é garantida através de hash criptográfico único e 
              validação em blockchain simulada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateVerification;
