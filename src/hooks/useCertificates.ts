import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { CertificateService, Certificate, CertificateTemplate, CertificateData } from '@/services/certificateService';
import { certificateGenerator } from '@/services/certificateGenerator';
import { supabase } from '@/integrations/supabase/client';

interface CertificateStats {
  totalCertificates: number;
  certificatesThisMonth: number;
  averageGrade: number;
  totalHoursCompleted: number;
  topSkills: { skill: string; count: number }[];
  monthlyDistribution: { month: string; count: number }[];
}

export const useCertificates = () => {
  const { user } = useAuth();
  const { showReward } = useNotifications();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [stats, setStats] = useState<CertificateStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const certificateService = CertificateService.getInstance();

  // Carregar certificados do usuário
  const loadUserCertificates = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const userCertificates = await certificateService.getUserCertificates(user.id);
      setCertificates(userCertificates);
    } catch (err) {
      setError('Erro ao carregar certificados');
      console.error('Erro ao carregar certificados:', err);
    } finally {
      setLoading(false);
    }
  }, [user, certificateService]);

  // Carregar templates
  const loadTemplates = useCallback(async () => {
    try {
      const certificateTemplates = await certificateService.getCertificateTemplates();
      setTemplates(certificateTemplates);
    } catch (err) {
      console.error('Erro ao carregar templates:', err);
    }
  }, [certificateService]);

  // Carregar estatísticas
  const loadStats = useCallback(async () => {
    if (!user) return;

    try {
      const certificateStats = await certificateService.getCertificateStats(user.id);
      setStats(certificateStats);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  }, [user, certificateService]);

  // Gerar certificado
  const generateCertificate = useCallback(async (
    courseId: string,
    completionData: {
      grade: number;
      hoursCompleted: number;
      skillsAcquired: string[];
    }
  ): Promise<Certificate | null> => {
    if (!user) {
      setError('Usuário não autenticado');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const certificateData = await certificateGenerator.generateCertificate(
        user.id,
        courseId,
        {
          grade: completionData.grade,
          completedAt: new Date()
        }
      );

      if (certificateData) {
        // Converter CertificateData para Certificate
        const certificate: Certificate = {
          id: certificateData.id,
          user_id: certificateData.user_id,
          course_id: certificateData.course_id,
          certificate_url: certificateData.certificate_url,
          completion_date: certificateData.completion_date,
          verification_code: certificateData.verification_code
        } as any;

        // Atualizar lista de certificados
        setCertificates(prev => [certificate, ...prev]);
        
        // Atualizar estatísticas
        await loadStats();

        // Mostrar notificação de conquista
        showReward({
          type: 'badge',
          title: 'Certificado Conquistado!',
          badge: {
            id: `cert-${certificate.id}`,
            name: 'Certificado de Conclusão',
            icon: '🏆',
            rarity: completionData.grade >= 90 ? 'legendary' : 
                   completionData.grade >= 80 ? 'epic' : 
                   completionData.grade >= 70 ? 'rare' : 'common'
          }
        });

        return certificate;
      } else {
        setError('Erro ao gerar certificado');
        return null;
      }
    } catch (err) {
      setError('Erro ao gerar certificado');
      console.error('Erro ao gerar certificado:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, certificateService, loadStats, showReward]);

  // Verificar certificado
  const verifyCertificate = useCallback(async (hash: string): Promise<Certificate | null> => {
    setLoading(true);
    setError(null);

    try {
      const certificate = await certificateService.verifyCertificate(hash);
      
      if (!certificate) {
        setError('Certificado não encontrado ou inválido');
      }

      return certificate;
    } catch (err) {
      setError('Erro ao verificar certificado');
      console.error('Erro ao verificar certificado:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [certificateService]);

  // Validar certificado
  const validateCertificate = useCallback(async (verificationCode: string): Promise<Certificate | null> => {
    try {
      setLoading(true);
      const certificateData = await certificateGenerator.validateCertificate(verificationCode);
      
      if (certificateData) {
        // Converter CertificateData para Certificate
        const certificate: Certificate = {
          id: certificateData.id,
          user_id: certificateData.user_id,
          course_id: certificateData.course_id,
          certificate_url: certificateData.certificate_url,
          completion_date: certificateData.completion_date,
          verification_code: certificateData.verification_code
        } as any;
        return certificate;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao validar certificado:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obter dados do certificado para visualização
  const getCertificateData = useCallback(async (certificateId: string): Promise<CertificateData | null> => {
    setLoading(true);
    setError(null);

    try {
      const data = await certificateService.getCertificateData(certificateId);
      
      if (!data) {
        setError('Dados do certificado não encontrados');
      }

      return data;
    } catch (err) {
      setError('Erro ao carregar dados do certificado');
      console.error('Erro ao carregar dados do certificado:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [certificateService]);

  // Compartilhar certificado
  const shareCertificate = useCallback(async (
    certificateId: string, 
    platform: 'linkedin' | 'twitter' | 'facebook'
  ): Promise<void> => {
    try {
      const shareUrl = await certificateService.shareCertificate(certificateId, platform);
      window.open(shareUrl, '_blank', 'width=600,height=400');
    } catch (err) {
      setError('Erro ao compartilhar certificado');
      console.error('Erro ao compartilhar certificado:', err);
    }
  }, [certificateService]);

  // Baixar certificado (simulado)
  const downloadCertificate = useCallback(async (certificateId: string): Promise<void> => {
    try {
      const data = await getCertificateData(certificateId);
      
      if (!data) {
        throw new Error('Dados do certificado não encontrados');
      }

      // Simular download do PDF
      // Em uma implementação real, isso geraria um PDF usando uma biblioteca como jsPDF
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificado-${data.certificateId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showReward({
        type: 'points',
        title: 'Certificado Baixado!',
        points: 5
      });
    } catch (err) {
      setError('Erro ao baixar certificado');
      console.error('Erro ao baixar certificado:', err);
    }
  }, [getCertificateData, showReward]);

  // Baixar certificado como HTML (self-contained)
  const downloadCertificateHtml = useCallback(async (certificateId: string): Promise<void> => {
    try {
      const data = await getCertificateData(certificateId);
      if (!data) throw new Error('Dados do certificado não encontrados');

      // Buscar template com campos html/css/js se existir
      let code: any = null;
      try {
        const { data: tdata } = await (supabase as any)
          .from('certificate_templates')
          .select('html, css, js')
          .limit(1)
          .maybeSingle();
        if (tdata && (tdata.html || tdata.css || tdata.js)) code = tdata;
      } catch (_) { /* fallback */ }

      const { buildCertificateHtml } = await import('@/utils/certificateTemplate');
      const html = buildCertificateHtml({
        student_name: data.studentName,
        course_title: data.courseTitle,
        instructor_name: data.instructorName,
        completion_date: data.completionDate,
        grade: data.grade,
        hours_completed: data.hoursCompleted,
        skills_acquired: data.skillsAcquired,
        verification_code: data.verificationHash || 'N/A',
      }, code || {});

      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificado-${data.certificateId}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showReward({ type: 'points', title: 'Certificado Baixado!', points: 5 });
    } catch (err) {
      setError('Erro ao baixar certificado');
      console.error('Erro ao baixar certificado:', err);
    }
  }, [getCertificateData, showReward]);

  const openCertificateHtml = useCallback(async (certificateId: string): Promise<void> => {
    try {
      const data = await getCertificateData(certificateId);
      if (!data) throw new Error('Dados do certificado não encontrados');

      let code: any = null;
      try {
        const { data: tdata } = await (supabase as any)
          .from('certificate_templates')
          .select('html, css, js')
          .limit(1)
          .maybeSingle();
        if (tdata && (tdata.html || tdata.css || tdata.js)) code = tdata;
      } catch (_) { /* ignore */ }

      const { buildCertificateHtml } = await import('@/utils/certificateTemplate');
      const html = buildCertificateHtml({
        student_name: data.studentName,
        course_title: data.courseTitle,
        instructor_name: data.instructorName,
        completion_date: data.completionDate,
        grade: data.grade,
        hours_completed: data.hoursCompleted,
        skills_acquired: data.skillsAcquired,
        verification_code: data.verificationHash || 'N/A',
      }, code || {});

      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
      setError('Erro ao abrir certificado');
      console.error('Erro ao abrir certificado:', err);
    }
  }, [getCertificateData]);

  // Buscar certificados de um curso (para instrutores)
  const getCourseCertificates = useCallback(async (courseId: string): Promise<Certificate[]> => {
    setLoading(true);
    setError(null);

    try {
      const courseCertificates = await certificateService.getCourseCertificates(courseId);
      return courseCertificates;
    } catch (err) {
      setError('Erro ao carregar certificados do curso');
      console.error('Erro ao carregar certificados do curso:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [certificateService]);

  // Filtrar certificados
  const filterCertificates = useCallback((filters: {
    courseTitle?: string;
    minGrade?: number;
    maxGrade?: number;
    dateFrom?: string;
    dateTo?: string;
    skills?: string[];
  }) => {
    return certificates.filter(cert => {
      if (filters.courseTitle && !cert.course_title.toLowerCase().includes(filters.courseTitle.toLowerCase())) {
        return false;
      }
      
      if (filters.minGrade && cert.grade < filters.minGrade) {
        return false;
      }
      
      if (filters.maxGrade && cert.grade > filters.maxGrade) {
        return false;
      }
      
      if (filters.dateFrom && new Date(cert.completion_date) < new Date(filters.dateFrom)) {
        return false;
      }
      
      if (filters.dateTo && new Date(cert.completion_date) > new Date(filters.dateTo)) {
        return false;
      }
      
      if (filters.skills && filters.skills.length > 0) {
        const hasSkill = filters.skills.some(skill => 
          cert.skills_acquired.some(certSkill => 
            certSkill.toLowerCase().includes(skill.toLowerCase())
          )
        );
        if (!hasSkill) return false;
      }
      
      return true;
    });
  }, [certificates]);

  // Obter certificado por ID
  const getCertificateById = useCallback((id: string): Certificate | undefined => {
    return certificates.find(cert => cert.id === id);
  }, [certificates]);

  // Verificar se usuário tem certificado de um curso
  const hasCertificateForCourse = useCallback((courseId: string): boolean => {
    return certificates.some(cert => cert.course_id === courseId);
  }, [certificates]);

  // Obter certificados recentes
  const getRecentCertificates = useCallback((limit: number = 5): Certificate[] => {
    return certificates
      .sort((a, b) => new Date(b.completion_date).getTime() - new Date(a.completion_date).getTime())
      .slice(0, limit);
  }, [certificates]);

  // Limpar erros
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Atualizar dados
  const refresh = useCallback(async () => {
    await Promise.all([
      loadUserCertificates(),
      loadTemplates(),
      loadStats()
    ]);
  }, [loadUserCertificates, loadTemplates, loadStats]);

  // Carregar dados iniciais
  useEffect(() => {
    if (user) {
      loadUserCertificates();
      loadStats();
    }
    loadTemplates();
  }, [user, loadUserCertificates, loadStats, loadTemplates]);

  return {
    // Estado
    certificates,
    templates,
    stats,
    loading,
    error,

    // Ações principais
    generateCertificate,
    verifyCertificate,
    validateCertificate,
    getCertificateData,
    shareCertificate,
    downloadCertificate,
    downloadCertificateHtml,
    openCertificateHtml,
    getCourseCertificates,

    // Utilitários
    filterCertificates,
    getCertificateById,
    hasCertificateForCourse,
    getRecentCertificates,

    // Controle
    clearError,
    refresh
  };
};
