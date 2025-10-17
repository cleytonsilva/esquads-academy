/**
 * Hook robusto para gerenciar certificados
 * Inclui cache inteligente, fallbacks e tratamento de erros
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCachedUserData, useCache } from '@/hooks/useCache';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TTL } from '@/services/cacheService';

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  course_title: string;
  instructor_name: string;
  completion_date: string;
  grade: number;
  certificate_url?: string;
  certificate_hash: string;
  skills: string[];
  hours_completed: number;
  is_verified: boolean;
  blockchain_hash?: string;
  template_id?: string;
  metadata?: {
    course_description?: string;
    achievements?: string[];
    final_project?: string;
  };
}

interface CertificateStats {
  total_certificates: number;
  average_grade: number;
  total_hours: number;
  top_skills: Array<{ skill: string; count: number }>;
  monthly_distribution: Array<{ month: string; count: number }>;
  verified_count: number;
}

interface UseCertificatesReturn {
  certificates: Certificate[];
  isLoading: boolean;
  error: Error | null;
  stats: CertificateStats | null;
  generateCertificate: (courseId: string, completionData: any) => Promise<Certificate>;
  verifyCertificate: (hash: string) => Promise<Certificate | null>;
  shareCertificate: (certificateId: string, platform: 'linkedin' | 'twitter' | 'facebook') => string;
  refreshCertificates: () => Promise<void>;
  isGenerating: boolean;
}

export function useCertificates(): UseCertificatesReturn {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);

  // Função para buscar certificados do usuário
  const fetchUserCertificates = useCallback(async (): Promise<Certificate[]> => {
    if (!user?.id) {
      return [];
    }

    try {
      // Tentar buscar certificados
      let { data: certificates, error } = await supabase
        .from('certificates')
        .select(`
          *,
          courses:course_id (
            title,
            instructor_name,
            description
          )
        `)
        .eq('user_id', user.id)
        .order('completion_date', { ascending: false });

      // Se tabela não existe, retornar array vazio
      if (error && error.message.includes('does not exist')) {
        console.warn('Tabela certificates não existe, retornando array vazio');
        return [];
      }

      if (error) {
        console.error('Erro ao buscar certificados:', error);
        return [];
      }

      // Validar e sanitizar dados dos certificados
      return (certificates || []).map(cert => ({
        id: cert.id || '',
        user_id: cert.user_id || user.id,
        course_id: cert.course_id || '',
        course_title: cert.course_title || cert.courses?.title || 'Curso Desconhecido',
        instructor_name: cert.instructor_name || cert.courses?.instructor_name || 'Instrutor Desconhecido',
        completion_date: cert.completion_date || new Date().toISOString(),
        grade: typeof cert.grade === 'number' ? cert.grade : 0,
        certificate_url: cert.certificate_url || '',
        certificate_hash: cert.certificate_hash || '',
        skills: Array.isArray(cert.skills) ? cert.skills : [],
        hours_completed: typeof cert.hours_completed === 'number' ? cert.hours_completed : 0,
        is_verified: Boolean(cert.is_verified),
        blockchain_hash: cert.blockchain_hash || '',
        template_id: cert.template_id || 'default',
        metadata: cert.metadata || {}
      })).filter(cert => cert.id && cert.course_id); // Filtrar certificados inválidos
    } catch (error) {
      console.error('Erro ao buscar certificados:', error);
      return [];
    }
  }, [user?.id]);

  // Usar cache para certificados
  const {
    data: certificates = [],
    isLoading,
    error,
    refresh: refreshCertificatesFunction,
    setData: setCachedCertificates
  } = useCachedUserData(
    user?.id || '',
    'certificates',
    fetchUserCertificates,
    {
      ttl: CACHE_TTL.CERTIFICATES,
      enabled: !!user?.id,
      staleWhileRevalidate: true,
      onError: (error) => {
        console.error('Erro no cache de certificados:', error);
      }
    }
  );

  // Garantir que certificates seja sempre um array
  const safeCertificates: Certificate[] = Array.isArray(certificates) ? certificates : [];

  // Função para buscar estatísticas dos certificados
  const fetchCertificateStats = useCallback(async (): Promise<CertificateStats> => {
    if (!safeCertificates.length) {
      return {
        total_certificates: 0,
        average_grade: 0,
        total_hours: 0,
        top_skills: [],
        monthly_distribution: [],
        verified_count: 0
      };
    }

    try {
      // Calcular estatísticas localmente
      const total_certificates = safeCertificates.length;
      const average_grade = safeCertificates.reduce((sum, cert) => sum + cert.grade, 0) / total_certificates;
      const total_hours = safeCertificates.reduce((sum, cert) => sum + cert.hours_completed, 0);
      const verified_count = safeCertificates.filter(cert => cert.is_verified).length;

      // Calcular top skills
      const skillsMap = new Map<string, number>();
      safeCertificates.forEach(cert => {
        cert.skills.forEach(skill => {
          skillsMap.set(skill, (skillsMap.get(skill) || 0) + 1);
        });
      });

      const top_skills = Array.from(skillsMap.entries())
        .map(([skill, count]) => ({ skill, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Calcular distribuição mensal
      const monthsMap = new Map<string, number>();
      safeCertificates.forEach(cert => {
        try {
          const date = new Date(cert.completion_date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthsMap.set(monthKey, (monthsMap.get(monthKey) || 0) + 1);
        } catch (error) {
          console.warn('Data inválida no certificado:', cert.completion_date);
        }
      });

      const monthly_distribution = Array.from(monthsMap.entries())
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-12); // Últimos 12 meses

      return {
        total_certificates,
        average_grade: Math.round(average_grade * 100) / 100,
        total_hours,
        top_skills,
        monthly_distribution,
        verified_count
      };
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      return {
        total_certificates: 0,
        average_grade: 0,
        total_hours: 0,
        top_skills: [],
        monthly_distribution: [],
        verified_count: 0
      };
    }
  }, [safeCertificates]);

  // Cache para estatísticas
  const {
    data: stats
  } = useCache(
    `user:${user?.id}:certificate-stats`,
    fetchCertificateStats,
    {
      ttl: CACHE_TTL.ANALYTICS,
      enabled: !!user?.id && safeCertificates.length > 0,
      staleWhileRevalidate: true
    }
  );

  // Função para gerar certificado
  const generateCertificate = useCallback(async (
    courseId: string, 
    completionData: any
  ): Promise<Certificate> => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }

    setIsGenerating(true);

    try {
      // Dados do certificado
      const certificateData = {
        user_id: user.id,
        course_id: courseId,
        completion_date: new Date().toISOString(),
        grade: completionData.grade || 0,
        skills: completionData.skills || [],
        hours_completed: completionData.hours_completed || 0,
        certificate_hash: generateCertificateHash(user.id, courseId),
        is_verified: false,
        template_id: 'default',
        metadata: completionData.metadata || {}
      };

      // Tentar inserir no banco
      let { data: certificate, error } = await supabase
        .from('certificates')
        .insert([certificateData])
        .select()
        .single();

      if (error) {
        console.warn('Erro ao inserir certificado no banco:', error);
        // Criar certificado local se falhar
        certificate = {
          id: `local_${Date.now()}`,
          ...certificateData,
          course_title: completionData.course_title || 'Curso',
          instructor_name: completionData.instructor_name || 'Instrutor',
          certificate_url: ''
        };
      }

      // Atualizar cache
      const updatedCertificates = [certificate, ...certificates];
      setCachedCertificates(updatedCertificates);

      return certificate;
    } catch (error) {
      console.error('Erro ao gerar certificado:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [user?.id, certificates, setCachedCertificates]);

  // Função para verificar certificado
  const verifyCertificate = useCallback(async (hash: string): Promise<Certificate | null> => {
    if (!hash || hash.trim().length === 0) {
      return null;
    }

    try {
      const { data: certificate, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('certificate_hash', hash)
        .single();

      if (error || !certificate) {
        return null;
      }

      return certificate;
    } catch (error) {
      console.error('Erro ao verificar certificado:', error);
      return null;
    }
  }, []);

  // Função para compartilhar certificado
  const shareCertificate = useCallback((
    certificateId: string, 
    platform: 'linkedin' | 'twitter' | 'facebook'
  ): string => {
    const certificate = certificates.find(cert => cert.id === certificateId);
    if (!certificate) {
      throw new Error('Certificado não encontrado');
    }

    const certificateUrl = certificate.certificate_url || 
      `${window.location.origin}/certificates/${certificate.id}`;
    
    const message = `Acabei de concluir o curso "${certificate.course_title}" e recebi meu certificado! 🎓`;

    const urls = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}&title=${encodeURIComponent(message)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(certificateUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(certificateUrl)}&quote=${encodeURIComponent(message)}`
    };

    return urls[platform];
  }, [certificates]);

  const refreshCertificates = useCallback(async (): Promise<void> => {
    await fetchUserCertificates();
  }, [fetchUserCertificates]);

  return {
    certificates,
    isLoading,
    error,
    stats: stats || null,
    generateCertificate,
    verifyCertificate,
    shareCertificate,
    refreshCertificates,
    isGenerating
  };
}

// Função auxiliar para gerar hash do certificado
function generateCertificateHash(userId: string, courseId: string): string {
  const timestamp = Date.now();
  const data = `${userId}-${courseId}-${timestamp}`;
  
  // Hash simples (em produção, usar crypto.subtle.digest)
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
}

// Hook para certificado específico
export function useCertificate(certificateId: string) {
  const { certificates, isLoading, error } = useCertificates();
  
  const certificate = certificates.find(cert => cert.id === certificateId);
  
  return {
    certificate: certificate || null,
    isLoading,
    error,
    exists: !!certificate
  };
}

// Hook para verificação de certificado público
export function useCertificateVerification(hash?: string) {
  const [isVerifying, setIsVerifying] = useState(false);
  
  const {
    data: certificate,
    isLoading,
    error,
    refresh: verify
  } = useCache(
    `certificate:verify:${hash}`,
    async () => {
      if (!hash) return null;
      
      setIsVerifying(true);
      try {
        const { data, error } = await supabase
          .from('certificates')
          .select('*')
          .eq('certificate_hash', hash)
          .single();
        
        if (error) return null;
        return data;
      } finally {
        setIsVerifying(false);
      }
    },
    {
      ttl: CACHE_TTL.CERTIFICATES,
      enabled: !!hash,
      staleWhileRevalidate: false
    }
  );

  return {
    certificate,
    isLoading: isLoading || isVerifying,
    error,
    verify,
    isValid: !!certificate
  };
}