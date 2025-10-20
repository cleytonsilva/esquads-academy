import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  course_title: string;
  instructor_name: string;
  issued_at: string;
  certificate_hash: string;
  blockchain_verified: boolean;
  skills_acquired: string[];
  grade: number;
  hours_completed: number;
  certificate_url?: string;
  verification_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  design_type: 'modern' | 'classic' | 'elegant' | 'minimal';
  background_color: string;
  text_color: string;
  accent_color: string;
  logo_position: 'top' | 'center' | 'bottom';
  border_style: 'none' | 'simple' | 'decorative';
  font_family: string;
  is_default: boolean;
}

export interface CertificateData {
  studentName: string;
  courseTitle: string;
  instructorName: string;
  completionDate: string;
  grade: number;
  hoursCompleted: number;
  skillsAcquired: string[];
  certificateId: string;
  verificationHash: string;
}

export class CertificateService {
  private static instance: CertificateService;

  public static getInstance(): CertificateService {
    if (!CertificateService.instance) {
      CertificateService.instance = new CertificateService();
    }
    return CertificateService.instance;
  }

  /**
   * Gera um certificado para um usuÃ¡rio que completou um curso
   */
  async generateCertificate(
    userId: string,
    courseId: string,
    completionData: {
      grade: number;
      hoursCompleted: number;
      skillsAcquired: string[];
    }
  ): Promise<Certificate | null> {
    try {
      // Validar dados de entrada
      if (!userId || !courseId) {
        throw new Error('ID do usuÃ¡rio e do curso sÃ£o obrigatÃ³rios');
      }

      if (!completionData || typeof completionData.grade !== 'number') {
        throw new Error('Dados de conclusÃ£o invÃ¡lidos');
      }

      // Buscar dados do curso com fallback
      const course = await this.getCourseDataWithFallback(courseId);
      if (!course) {
        throw new Error('Curso nÃ£o encontrado');
      }

      // Buscar dados do usuÃ¡rio com fallback
      const user = await this.getUserDataWithFallback(userId);
      if (!user) {
        throw new Error('UsuÃ¡rio nÃ£o encontrado');
      }

      // Validar e sanitizar dados de conclusÃ£o
      const sanitizedCompletionData = {
        grade: Math.max(0, Math.min(100, completionData.grade)),
        hoursCompleted: Math.max(0, completionData.hoursCompleted || 0),
        skillsAcquired: Array.isArray(completionData.skillsAcquired) 
          ? completionData.skillsAcquired.filter(skill => skill && typeof skill === 'string')
          : []
      };

      // Gerar hash Ãºnico para o certificado
      const certificateHash = await this.generateCertificateHash(
        userId,
        courseId,
        sanitizedCompletionData.grade,
        new Date().toISOString()
      );

      // Simular verificaÃ§Ã£o blockchain
      const blockchainVerified = await this.simulateBlockchainVerification(certificateHash);

      // Regras: verificar missões obrigatórias concluídas
      const { data: requiredMissions } = await supabase
        .from('missions')
        .select('id')
        .eq('course_id', courseId)
        .eq('is_required', true)

      if ((requiredMissions || []).length > 0) {
        const ids = (requiredMissions || []).map((m: any) => m.id)
        const { data: progress } = await supabase
          .from('mission_attempts')
          .select('mission_id, status')
          .eq('user_id', userId)
          .in('mission_id', ids)

        const completedCount = (progress || []).filter((p: any) => p.status === 'completed').length
        if (completedCount < ids.length) {
          throw new Error('Missões obrigatórias não concluídas')
        }
      }

      // Calcular horas e aproveitamento (fallback caso não fornecido)
      let hoursCompleted = sanitizedCompletionData.hoursCompleted
      let grade = sanitizedCompletionData.grade
      if (!hoursCompleted || !grade) {
        const { data: lp } = await supabase
          .from('lesson_progress')
          .select('time_spent')
          .eq('user_id', userId)
        const totalMinutes = (lp || []).reduce((sum: number, r: any) => sum + (r.time_spent || 0), 0) / 60
        hoursCompleted = hoursCompleted || Math.round(totalMinutes / 60)
        grade = grade || 100
      }

      // Criar certificado no banco com fallback
      const certificateData = {
        user_id: userId,
        course_id: courseId,
        course_title: course.title,
        instructor_name: course.instructor_name,
        issued_at: new Date().toISOString(),
        certificate_hash: certificateHash,
        blockchain_verified: blockchainVerified,
        skills_acquired: sanitizedCompletionData.skillsAcquired,
        grade,
        hours_completed: hoursCompleted,
        verification_url: `${window.location.origin}/verify-certificate/${certificateHash}`
      };

      const certificate = await this.createCertificateWithFallback(certificateData);
      
      if (!certificate) {
        throw new Error('Erro ao criar certificado');
      }

      // Gerar URL do certificado
      const certificateUrl = await this.generateCertificateUrl(certificate.id);
      
      // Tentar atualizar com a URL (nÃ£o crÃ­tico se falhar)
      try {
        await this.updateCertificateUrl(certificate.id, certificateUrl);
      } catch (updateError) {
        console.warn('Erro ao atualizar URL do certificado:', updateError);
      }

      return { ...certificate, certificate_url: certificateUrl };
    } catch (error) {
      console.error('Erro ao gerar certificado:', error);
      return null;
    }
  }

  /**
   * Busca certificados de um usuÃ¡rio
   */
  async getUserCertificates(userId: string): Promise<Certificate[]> {
    try {
      if (!userId) {
        console.warn('ID do usuÃ¡rio nÃ£o fornecido');
        return [];
      }

      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', userId)
        .order('issued_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar certificados:', error);
        
        // Se a tabela nÃ£o existir, retornar array vazio
        if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
          console.warn('Tabela certificates nÃ£o existe, retornando array vazio');
          return [];
        }
        
        throw new Error('Erro ao buscar certificados');
      }

      // Validar e sanitizar dados retornados
      const validCertificates = (data || []).filter(cert => 
        cert && 
        cert.id && 
        cert.user_id === userId &&
        cert.course_title &&
        cert.issued_at
      );

      return validCertificates;
    } catch (error) {
      console.error('Erro ao buscar certificados:', error);
      return [];
    }
  }

  /**
   * Verifica um certificado pelo hash
   */
  async verifyCertificate(hash: string): Promise<Certificate | null> {
    try {
      if (!hash || typeof hash !== 'string') {
        console.warn('Hash do certificado invÃ¡lido');
        return null;
      }

      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('certificate_hash', hash)
        .single();

      if (error) {
        console.error('Erro ao verificar certificado:', error);
        
        // Se a tabela nÃ£o existir, retornar null
        if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
          console.warn('Tabela certificates nÃ£o existe');
          return null;
        }
        
        // Se nÃ£o encontrou o certificado, retornar null (nÃ£o Ã© erro)
        if (error.code === 'PGRST116') {
          return null;
        }
        
        return null;
      }

      if (!data) {
        return null;
      }

      // Validar dados do certificado
      if (!data.id || !data.user_id || !data.course_id || !data.certificate_hash) {
        console.warn('Dados do certificado invÃ¡lidos');
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao verificar certificado:', error);
      return null;
    }
  }

  /**
   * Busca certificados de um curso
   */
  async getCourseCertificates(courseId: string): Promise<Certificate[]> {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          profiles!user_id(full_name, avatar_url)
        `)
        .eq('course_id', courseId)
        .order('issued_at', { ascending: false });

      if (error) {
        throw new Error('Erro ao buscar certificados do curso');
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar certificados do curso:', error);
      return [];
    }
  }

  /**
   * Gera dados para o certificado em PDF/imagem
   */
  async getCertificateData(certificateId: string): Promise<CertificateData | null> {
    try {
      const { data: certificate, error } = await supabase
        .from('certificates')
        .select(`
          *,
          profiles!user_id(full_name)
        `)
        .eq('id', certificateId)
        .single();

      if (error || !certificate) {
        return null;
      }

      return {
        studentName: certificate.profiles?.full_name || 'Estudante',
        courseTitle: certificate.course_title,
        instructorName: certificate.instructor_name,
        completionDate: new Date(certificate.issued_at).toLocaleDateString('pt-BR'),
        grade: certificate.grade,
        hoursCompleted: certificate.hours_completed,
        skillsAcquired: certificate.skills_acquired,
        certificateId: certificate.id,
        verificationHash: certificate.certificate_hash
      };
    } catch (error) {
      console.error('Erro ao buscar dados do certificado:', error);
      return null;
    }
  }

  /**
   * Busca templates de certificado disponÃ­veis
   */
  async getCertificateTemplates(): Promise<CertificateTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('certificate_templates')
        .select('*')
        .order('is_default', { ascending: false });

      if (error) {
        // Se nÃ£o existir a tabela, retornar templates padrÃ£o
        return this.getDefaultTemplates();
      }

      return data || this.getDefaultTemplates();
    } catch (error) {
      console.error('Erro ao buscar templates:', error);
      return this.getDefaultTemplates();
    }
  }

  /**
   * Gera estatÃ­sticas de certificados
   */
  async getCertificateStats(userId?: string): Promise<{
    totalCertificates: number;
    certificatesThisMonth: number;
    averageGrade: number;
    totalHoursCompleted: number;
    topSkills: { skill: string; count: number }[];
    monthlyDistribution: { month: string; count: number }[];
  }> {
    try {
      let query = supabase.from('certificates').select('*');
      
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data: certificates, error } = await query;

      if (error) {
        console.error('Erro ao buscar estatÃ­sticas:', error);
        
        // Se a tabela nÃ£o existir, retornar estatÃ­sticas vazias
        if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
          console.warn('Tabela certificates nÃ£o existe, retornando estatÃ­sticas vazias');
          return this.getEmptyStats();
        }
        
        throw new Error('Erro ao buscar estatÃ­sticas');
      }

      // Validar e filtrar certificados vÃ¡lidos
      const validCertificates = (certificates || []).filter(cert => 
        cert && 
        cert.issued_at && 
        typeof cert.grade === 'number' &&
        typeof cert.hours_completed === 'number' &&
        Array.isArray(cert.skills_acquired)
      );

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const certificatesThisMonth = validCertificates.filter(cert => {
        try {
          return new Date(cert.issued_at) >= thisMonth;
        } catch {
          return false;
        }
      }).length;

      const averageGrade = validCertificates.length 
        ? validCertificates.reduce((sum, cert) => sum + (cert.grade || 0), 0) / validCertificates.length
        : 0;

      const totalHoursCompleted = validCertificates.reduce((sum, cert) => sum + (cert.hours_completed || 0), 0);

      // Contar skills mais comuns com validaÃ§Ã£o
      const skillCounts: { [key: string]: number } = {};
      validCertificates.forEach(cert => {
        if (Array.isArray(cert.skills_acquired)) {
          cert.skills_acquired.forEach((skill: string) => {
            if (skill && typeof skill === 'string') {
              skillCounts[skill] = (skillCounts[skill] || 0) + 1;
            }
          });
        }
      });

      const topSkills = Object.entries(skillCounts)
        .map(([skill, count]) => ({ skill, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // DistribuiÃ§Ã£o mensal
      const monthlyDistribution = this.getMonthlyDistribution(validCertificates);

      return {
        totalCertificates: validCertificates.length,
        certificatesThisMonth,
        averageGrade: Math.round(averageGrade * 100) / 100, // Arredondar para 2 casas decimais
        totalHoursCompleted,
        topSkills,
        monthlyDistribution
      };
    } catch (error) {
      console.error('Erro ao buscar estatÃ­sticas:', error);
      return this.getEmptyStats();
    }
  }

  private getEmptyStats() {
    return {
      totalCertificates: 0,
      certificatesThisMonth: 0,
      averageGrade: 0,
      totalHoursCompleted: 0,
      topSkills: [],
      monthlyDistribution: []
    };
  }

  /**
   * Compartilha certificado nas redes sociais
   */
  async shareCertificate(certificateId: string, platform: 'linkedin' | 'twitter' | 'facebook'): Promise<string> {
    const certificate = await this.getCertificateData(certificateId);
    
    if (!certificate) {
      throw new Error('Certificado nÃ£o encontrado');
    }

    const baseUrl = window.location.origin;
    const certificateUrl = `${baseUrl}/certificate/${certificateId}`;
    const verificationUrl = `${baseUrl}/verify-certificate/${certificate.verificationHash}`;

    const messages = {
      linkedin: `ðŸŽ“ Acabei de concluir o curso "${certificate.courseTitle}" com nota ${certificate.grade}! 
      
Adquiri ${certificate.skillsAcquired.length} novas habilidades em ${certificate.hoursCompleted} horas de estudo.

Certificado verificado: ${verificationUrl}

#educacao #aprendizado #certificacao #esquads`,

      twitter: `ðŸŽ“ ConcluÃ­ "${certificate.courseTitle}" com nota ${certificate.grade}! 

${certificate.hoursCompleted}h de estudo, ${certificate.skillsAcquired.length} novas skills.

Verificar: ${verificationUrl}

#educacao #certificacao`,

      facebook: `ðŸŽ“ Conquista desbloqueada! 

Acabei de concluir o curso "${certificate.courseTitle}" com nota ${certificate.grade}!

Durante ${certificate.hoursCompleted} horas de estudo, adquiri conhecimentos em:
${certificate.skillsAcquired.slice(0, 3).join(', ')}

Certificado verificado em: ${verificationUrl}`
    };

    const shareUrls = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}&summary=${encodeURIComponent(messages.linkedin)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(messages.twitter)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(certificateUrl)}&quote=${encodeURIComponent(messages.facebook)}`
    };

    return shareUrls[platform];
  }

  // MÃ©todos auxiliares com fallback

  private async getCourseDataWithFallback(courseId: string): Promise<{ title: string; instructor_name: string } | null> {
    try {
      // Tentar buscar na tabela courses
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('title, instructor_id, profiles!instructor_id(full_name)')
        .eq('id', courseId)
        .single();

      if (!courseError && course) {
        return {
          title: course.title || 'Curso sem tÃ­tulo',
          instructor_name: course.profiles?.full_name || 'Instrutor'
        };
      }

      // Fallback: buscar dados bÃ¡sicos
      console.warn('Erro ao buscar curso, usando dados padrÃ£o:', courseError);
      return {
        title: `Curso ${courseId}`,
        instructor_name: 'Instrutor'
      };
    } catch (error) {
      console.error('Erro ao buscar dados do curso:', error);
      return {
        title: `Curso ${courseId}`,
        instructor_name: 'Instrutor'
      };
    }
  }

  private async getUserDataWithFallback(userId: string): Promise<{ full_name: string } | null> {
    try {
      // Tentar buscar na tabela user_profiles primeiro
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('user_id', userId)
        .single();

      if (!profileError && userProfile) {
        return {
          full_name: userProfile.full_name || 'UsuÃ¡rio'
        };
      }

      // Fallback: tentar buscar na tabela profiles
      const { data: profile, error: profilesError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();

      if (!profilesError && profile) {
        return {
          full_name: profile.full_name || 'UsuÃ¡rio'
        };
      }

      // Fallback final: dados padrÃ£o
      console.warn('Erro ao buscar usuÃ¡rio, usando dados padrÃ£o');
      return {
        full_name: 'UsuÃ¡rio'
      };
    } catch (error) {
      console.error('Erro ao buscar dados do usuÃ¡rio:', error);
      return {
        full_name: 'UsuÃ¡rio'
      };
    }
  }

  private async createCertificateWithFallback(certificateData: any): Promise<Certificate | null> {
    try {
      const { data: certificate, error: certificateError } = await supabase
        .from('certificates')
        .insert(certificateData)
        .select()
        .single();

      if (certificateError) {
        console.error('Erro ao criar certificado:', certificateError);
        
        // Se a tabela nÃ£o existir, tentar criar um certificado local
        if (certificateError.message?.includes('relation') && certificateError.message?.includes('does not exist')) {
          console.warn('Tabela certificates nÃ£o existe, criando certificado local');
          return this.createLocalCertificate(certificateData);
        }
        
        return null;
      }

      return certificate;
    } catch (error) {
      console.error('Erro ao criar certificado:', error);
      return this.createLocalCertificate(certificateData);
    }
  }

  private createLocalCertificate(certificateData: any): Certificate {
    const now = new Date().toISOString();
    return {
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: certificateData.user_id,
      course_id: certificateData.course_id,
      course_title: certificateData.course_title,
      instructor_name: certificateData.instructor_name,
      issued_at: certificateData.issued_at,
      certificate_hash: certificateData.certificate_hash,
      blockchain_verified: certificateData.blockchain_verified,
      skills_acquired: certificateData.skills_acquired,
      grade: certificateData.grade,
      hours_completed: certificateData.hours_completed,
      certificate_url: certificateData.certificate_url,
      verification_url: certificateData.verification_url,
      created_at: now,
      updated_at: now
    };
  }

  private async updateCertificateUrl(certificateId: string, certificateUrl: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('certificates')
        .update({ certificate_url: certificateUrl })
        .eq('id', certificateId);

      if (error) {
        console.warn('Erro ao atualizar URL do certificado:', error);
      }
    } catch (error) {
      console.warn('Erro ao atualizar URL do certificado:', error);
    }
  }

  // MÃ©todos privados

  private async generateCertificateHash(
    userId: string,
    courseId: string,
    grade: number,
    completionDate: string
  ): Promise<string> {
    const data = `${userId}-${courseId}-${grade}-${completionDate}`;
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async simulateBlockchainVerification(hash: string): Promise<boolean> {
    // Simular delay de verificaÃ§Ã£o blockchain
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simular 95% de sucesso na verificaÃ§Ã£o
    return Math.random() > 0.05;
  }

  private async generateCertificateUrl(certificateId: string): Promise<string> {
    return `${window.location.origin}/certificate/${certificateId}`;
  }

  private getDefaultTemplates(): CertificateTemplate[] {
    return [
      {
        id: 'modern',
        name: 'Moderno',
        design_type: 'modern',
        background_color: '#ffffff',
        text_color: '#1f2937',
        accent_color: '#3b82f6',
        logo_position: 'top',
        border_style: 'simple',
        font_family: 'Inter',
        is_default: true
      },
      {
        id: 'classic',
        name: 'ClÃ¡ssico',
        design_type: 'classic',
        background_color: '#fef7cd',
        text_color: '#92400e',
        accent_color: '#d97706',
        logo_position: 'center',
        border_style: 'decorative',
        font_family: 'Georgia',
        is_default: false
      },
      {
        id: 'elegant',
        name: 'Elegante',
        design_type: 'elegant',
        background_color: '#f8fafc',
        text_color: '#334155',
        accent_color: '#8b5cf6',
        logo_position: 'top',
        border_style: 'simple',
        font_family: 'Playfair Display',
        is_default: false
      },
      {
        id: 'minimal',
        name: 'Minimalista',
        design_type: 'minimal',
        background_color: '#ffffff',
        text_color: '#000000',
        accent_color: '#6b7280',
        logo_position: 'bottom',
        border_style: 'none',
        font_family: 'Helvetica',
        is_default: false
      }
    ];
  }

  private getMonthlyDistribution(certificates: Certificate[]): { month: string; count: number }[] {
    const monthCounts: { [key: string]: number } = {};
    
    certificates.forEach(cert => {
      try {
        if (!cert.issued_at) return;
        
        const date = new Date(cert.issued_at);
        
        // Validar se a data Ã© vÃ¡lida
        if (isNaN(date.getTime())) return;
        
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
      } catch (error) {
        console.warn('Erro ao processar data do certificado:', cert.issued_at, error);
      }
    });

    return Object.entries(monthCounts)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Ãšltimos 12 meses apenas
  }
}

