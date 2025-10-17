import React, { useState, useEffect } from 'react';
import GlarePreview from '@/components/certificates/GlarePreview';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Download,
  Share2,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  Award,
  Calendar,
  Clock,
  User,
  BookOpen,
  Star,
  Shield,
  ExternalLink,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useCertificates } from '@/hooks/useCertificates';
import { Certificate } from '@/services/certificateService';

interface CertificateViewerProps {
  certificateId: string;
}

export const CertificateViewer: React.FC<CertificateViewerProps> = ({ certificateId }) => {
  const {
    getCertificateData,
    downloadCertificate,
    downloadCertificateHtml,
    openCertificateHtml,
    shareCertificate,
    verifyCertificate,
    loading,
    error,
    clearError
  } = useCertificates();

  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [certificateData, setCertificateData] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadCertificateData();
  }, [certificateId]);

  const loadCertificateData = async () => {
    try {
      const data = await getCertificateData(certificateId);
      setCertificateData(data);
      // Se data.certificateId existe, criar um objeto Certificate básico
      if (data.certificateId) {
        setCertificate({
          id: data.certificateId,
          user_id: '',
          course_id: '',
          verification_code: (data as any).verification_code || '',
          issued_at: data.completionDate,
          grade: data.grade,
          course_title: data.courseTitle,
          certificate_hash: data.certificateId,
          blockchain_verified: false,
          skills_acquired: data.skillsAcquired,
          hours_completed: data.hoursCompleted,
          student_name: data.studentName,
          skills_learned: data.skillsAcquired,
          is_verified: false
        } as any);
      }
    } catch (err) {
      console.error('Erro ao carregar certificado:', err);
    }
  };

  const handleVerify = async () => {
    if (!certificate) return;
    
    setIsVerifying(true);
    try {
      const result = await verifyCertificate((certificate as any).verification_code);
      setVerificationResult(result);
    } catch (err) {
      console.error('Erro na verificação:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyVerificationCode = () => {
    if ((certificate as any)?.verification_code) {
      navigator.clipboard.writeText((certificate as any).verification_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (grade >= 80) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (grade >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getGradeLabel = (grade: number) => {
    if (grade >= 95) return 'Excelente';
    if (grade >= 90) return 'Muito Bom';
    if (grade >= 80) return 'Bom';
    if (grade >= 70) return 'Satisfatório';
    return 'Aprovado';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-2">Carregando certificado...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button variant="outline" size="sm" onClick={() => { clearError(); loadCertificateData(); }} className="ml-2">
            <RefreshCw className="h-4 w-4 mr-1" />
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!certificate || !certificateData) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Certificado não encontrado.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Ações */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Visualizar Certificado</h1>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showDetails ? 'Ocultar' : 'Mostrar'} Detalhes
          </Button>
          
          <Button variant="outline" onClick={() => downloadCertificateHtml(certificate.id)}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="ghost" onClick={() => openCertificateHtml(certificate.id)}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir
          </Button>
          
          <Button onClick={() => shareCertificate(certificate.id, 'linkedin')}>
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
        </div>
      </div>

      {/* Certificado Visual */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <GlarePreview>
          <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 p-12 text-center relative">
            {/* Decoração */}
            <div className="absolute top-4 left-4 w-16 h-16 border-4 border-blue-200 rounded-full opacity-20" />
            <div className="absolute top-8 right-8 w-12 h-12 border-4 border-purple-200 rounded-full opacity-20" />
            <div className="absolute bottom-4 left-8 w-20 h-20 border-4 border-green-200 rounded-full opacity-20" />
            <div className="absolute bottom-8 right-4 w-14 h-14 border-4 border-yellow-200 rounded-full opacity-20" />

            {/* Header */}
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Award className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">CERTIFICADO DE CONCLUSÃO</h2>
              <p className="text-gray-600">Esquads Academy</p>
            </div>

            {/* Conteúdo Principal */}
            <div className="mb-8">
              <p className="text-lg text-gray-700 mb-4">Certificamos que</p>
              <h3 className="text-4xl font-bold text-gray-800 mb-6">{certificateData.studentName}</h3>
              <p className="text-lg text-gray-700 mb-2">concluiu com sucesso o curso</p>
              <h4 className="text-2xl font-semibold text-blue-600 mb-6">{certificate.course_title}</h4>
              <p className="text-gray-700 mb-4">ministrado por <strong>{certificate.instructor_name}</strong></p>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className={`inline-flex items-center px-4 py-2 rounded-full border ${getGradeColor(certificate.grade)}`}>
                  <Star className="h-5 w-5 mr-2" />
                  <span className="font-semibold">{certificate.grade}/100</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{getGradeLabel(certificate.grade)}</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center px-4 py-2 rounded-full border border-blue-200 bg-blue-50 text-blue-600">
                  <Clock className="h-5 w-5 mr-2" />
                  <span className="font-semibold">{certificate.hours_completed}h</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Horas de Estudo</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center px-4 py-2 rounded-full border border-green-200 bg-green-50 text-green-600">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span className="font-semibold">{formatDate(certificate.completion_date)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Data de Conclusão</p>
              </div>
            </div>

            {/* Habilidades */}
            {certificate.skills_acquired.length > 0 && (
              <div className="mb-8">
                <p className="text-gray-700 mb-4">Habilidades Adquiridas:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {certificate.skills_acquired.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Verificação */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Código de Verificação: 
                  <code className="ml-2 px-2 py-1 bg-gray-100 rounded font-mono">
                    {(certificate as any).verification_code}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyVerificationCode}
                    className="ml-2"
                  >
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                
                {certificate.blockchain_verified && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verificado por Blockchain
                  </div>
                )}
              </div>
            </div>
          </div>
          </GlarePreview>
        </CardContent>
      </Card>

      {/* Detalhes Expandidos */}
      {showDetails && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações do Curso */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Informações do Curso
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Título</label>
                  <p className="text-gray-900">{certificate.course_title}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Instrutor</label>
                  <p className="text-gray-900">{certificate.instructor_name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Duração</label>
                  <p className="text-gray-900">{certificate.hours_completed} horas</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Data de Conclusão</label>
                  <p className="text-gray-900">{formatDate(certificate.completion_date)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Nota Final</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 font-semibold">{certificate.grade}/100</span>
                    <Badge className={getGradeColor(certificate.grade)}>
                      {getGradeLabel(certificate.grade)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verificação e Segurança */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Verificação e Segurança
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Código de Verificação</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 px-3 py-2 bg-gray-100 rounded font-mono text-sm">
                      {(certificate as any).verification_code}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyVerificationCode}
                    >
                      {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Status da Verificação</label>
                  <div className="mt-1">
                    {certificate.blockchain_verified ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Verificado por Blockchain
                      </div>
                    ) : (
                      <div className="flex items-center text-yellow-600">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Verificação Pendente
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Button
                    variant="outline"
                    onClick={handleVerify}
                    disabled={isVerifying}
                    className="w-full"
                  >
                    {isVerifying ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Shield className="h-4 w-4 mr-2" />
                    )}
                    Verificar Autenticidade
                  </Button>
                </div>

                {verificationResult && (
                  <Alert className={verificationResult.valid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      {verificationResult.valid 
                        ? 'Certificado verificado com sucesso! Este certificado é autêntico.'
                        : 'Falha na verificação. Este certificado pode não ser autêntico.'
                      }
                    </AlertDescription>
                  </Alert>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500">URL de Verificação Pública</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={`https://esquads.academy/verify/${(certificate as any).verification_code}`}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://esquads.academy/verify/${(certificate as any).verification_code}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ações de Compartilhamento */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Compartilhar Certificado</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => shareCertificate(certificate.id, 'linkedin')}
              className="flex items-center justify-center"
            >
              <Share2 className="h-4 w-4 mr-2" />
              LinkedIn
            </Button>
            
            <Button
              variant="outline"
              onClick={() => shareCertificate(certificate.id, 'twitter')}
              className="flex items-center justify-center"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Twitter
            </Button>
            
            <Button
              variant="outline"
              onClick={() => shareCertificate(certificate.id, 'linkedin')}
              className="flex items-center justify-center"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Email
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
