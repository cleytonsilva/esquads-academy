import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Award, 
  Download, 
  Share2, 
  Eye, 
  Calendar,
  User,
  BookOpen,
  Star
} from 'lucide-react';
import { CertificateData } from '@/services/certificateGenerator';

interface CertificateCardProps {
  certificate: CertificateData;
  onView?: (certificate: CertificateData) => void;
  onDownload?: (certificate: CertificateData) => void;
  onShare?: (certificate: CertificateData) => void;
  variant?: 'default' | 'compact';
}

const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate,
  onView,
  onDownload,
  onShare,
  variant = 'default'
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getGradeColor = (grade?: number) => {
    if (!grade) return 'bg-gray-100 text-gray-800';
    if (grade >= 90) return 'bg-green-100 text-green-800';
    if (grade >= 80) return 'bg-blue-100 text-blue-800';
    if (grade >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getGradeText = (grade?: number) => {
    if (!grade) return 'Concluído';
    if (grade >= 90) return 'Excelente';
    if (grade >= 80) return 'Muito Bom';
    if (grade >= 70) return 'Bom';
    return 'Satisfatório';
  };

  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">
                {certificate.course_title}
              </h3>
              <p className="text-sm text-gray-600">
                {formatDate(certificate.completion_date)}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {certificate.grade && (
                <Badge className={getGradeColor(certificate.grade)}>
                  {certificate.grade}%
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView?.(certificate)}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {certificate.course_title}
              </h3>
              <p className="text-sm text-gray-600">
                Certificado de Conclusão
              </p>
            </div>
          </div>
          {certificate.grade && (
            <Badge className={getGradeColor(certificate.grade)}>
              <Star className="w-3 h-3 mr-1" />
              {getGradeText(certificate.grade)} ({certificate.grade}%)
            </Badge>
          )}
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>Estudante: {certificate.student_name}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <BookOpen className="w-4 h-4" />
            <span>Instrutor: {certificate.instructor_name}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Concluído em: {formatDate(certificate.completion_date)}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Award className="w-4 h-4" />
            <span>Código: {certificate.verification_code}</span>
          </div>
        </div>

        {/* Skills */}
        {certificate.skills && certificate.skills.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Habilidades Desenvolvidas:
            </h4>
            <div className="flex flex-wrap gap-2">
              {certificate.skills.slice(0, 6).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {certificate.skills.length > 6 && (
                <Badge variant="secondary" className="text-xs">
                  +{certificate.skills.length - 6} mais
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Duration */}
        {certificate.duration_hours > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              <strong>Carga Horária:</strong> {certificate.duration_hours} horas
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
          <Button
            variant="default"
            size="sm"
            onClick={() => onView?.(certificate)}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            Visualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownload?.(certificate)}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onShare?.(certificate)}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
        </div>

        {/* Certificate URL Preview */}
        {certificate.certificate_url && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>URL do Certificado:</strong>
            </p>
            <p className="text-xs text-blue-600 truncate">
              {certificate.certificate_url}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { CertificateCard };
