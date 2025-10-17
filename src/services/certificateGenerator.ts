import { supabase } from '@/integrations/supabase/client';

export interface CertificateData {
  id: string;
  user_id: string;
  course_id: string;
  course_title: string;
  student_name: string;
  instructor_name: string;
  completion_date: string;
  certificate_url?: string;
  verification_code: string;
  skills: string[];
  duration_hours: number;
  grade?: number;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  template_url: string;
  is_default: boolean;
}

class CertificateGenerator {
  /**
   * Gera um certificado automaticamente quando um curso é completado
   */
  async generateCertificate(
    userId: string,
    courseId: string,
    completionData: {
      grade?: number;
      completedAt: Date;
    }
  ): Promise<CertificateData | null> {
    try {
      // Buscar dados do curso
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          instructor_id,
          duration_hours,
          skills,
          users!instructor_id (
            full_name
          )
        `)
        .eq('id', courseId)
        .single();

      if (courseError || !course) {
        throw new Error('Curso não encontrado');
      }

      // Buscar dados do estudante
      const { data: student, error: studentError } = await supabase
        .from('users')
        .select('full_name, email')
        .eq('id', userId)
        .single();

      if (studentError || !student) {
        throw new Error('Estudante não encontrado');
      }

      // Gerar código de verificação único
      const verificationCode = this.generateVerificationCode();

      // Criar dados do certificado
      const certificateData: Omit<CertificateData, 'id'> = {
        user_id: userId,
        course_id: courseId,
        course_title: course.title,
        student_name: student.full_name,
        instructor_name: course.users?.full_name || 'Instrutor',
        completion_date: completionData.completedAt.toISOString(),
        verification_code: verificationCode,
        skills: course.skills || [],
        duration_hours: course.duration_hours || 0,
        grade: completionData.grade
      };

      // Salvar certificado no banco
      const { data: certificate, error: certificateError } = await supabase
        .from('certificates')
        .insert(certificateData)
        .select()
        .single();

      if (certificateError) {
        throw new Error('Erro ao salvar certificado');
      }

      // Gerar URL do certificado (simulado)
      const certificateUrl = await this.generateCertificateUrl(certificate);

      // Atualizar com a URL
      const { data: updatedCertificate, error: updateError } = await supabase
        .from('certificates')
        .update({ certificate_url: certificateUrl })
        .eq('id', certificate.id)
        .select()
        .single();

      if (updateError) {
        console.error('Erro ao atualizar URL do certificado:', updateError);
      }

      return updatedCertificate || certificate;
    } catch (error) {
      console.error('Erro ao gerar certificado:', error);
      return null;
    }
  }

  /**
   * Gera um código de verificação único para o certificado
   */
  private generateVerificationCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Gera a URL do certificado (simulado - em produção seria um PDF real)
   */
  private async generateCertificateUrl(certificate: CertificateData): Promise<string> {
    // Em um ambiente real, aqui seria gerado um PDF usando bibliotecas como jsPDF ou PDFKit
    // Por enquanto, retornamos uma URL simulada
    const baseUrl = window.location.origin;
    return `${baseUrl}/certificates/${certificate.id}/view`;
  }

  /**
   * Valida um certificado usando o código de verificação
   */
  async validateCertificate(verificationCode: string): Promise<CertificateData | null> {
    try {
      const { data: certificate, error } = await supabase
        .from('certificates')
        .select(`
          *,
          users!user_id (
            full_name,
            email
          ),
          courses!course_id (
            title,
            instructor_id
          )
        `)
        .eq('verification_code', verificationCode)
        .single();

      if (error || !certificate) {
        return null;
      }

      return certificate;
    } catch (error) {
      console.error('Erro ao validar certificado:', error);
      return null;
    }
  }

  /**
   * Busca todos os certificados de um usuário
   */
  async getUserCertificates(userId: string): Promise<CertificateData[]> {
    try {
      const { data: certificates, error } = await supabase
        .from('certificates')
        .select(`
          *,
          courses!course_id (
            title,
            instructor_id
          )
        `)
        .eq('user_id', userId)
        .order('completion_date', { ascending: false });

      if (error) {
        throw new Error('Erro ao buscar certificados');
      }

      return certificates || [];
    } catch (error) {
      console.error('Erro ao buscar certificados do usuário:', error);
      return [];
    }
  }

  /**
   * Verifica se um usuário já possui certificado para um curso
   */
  async hasCertificate(userId: string, courseId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Gera estatísticas de certificados para um instrutor
   */
  async getInstructorCertificateStats(instructorId: string): Promise<{
    totalCertificates: number;
    thisMonthCertificates: number;
    averageGrade: number;
    topCourses: Array<{ course_title: string; certificate_count: number }>;
  }> {
    try {
      // Buscar todos os certificados dos cursos do instrutor
      const { data: certificates, error } = await supabase
        .from('certificates')
        .select(`
          *,
          courses!course_id (
            instructor_id,
            title
          )
        `)
        .eq('courses.instructor_id', instructorId);

      if (error) {
        throw new Error('Erro ao buscar estatísticas de certificados');
      }

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const totalCertificates = certificates?.length || 0;
      const thisMonthCertificates = certificates?.filter(cert => 
        new Date(cert.completion_date) >= thisMonth
      ).length || 0;

      const gradesSum = certificates?.reduce((sum, cert) => sum + (cert.grade || 0), 0) || 0;
      const averageGrade = totalCertificates > 0 ? gradesSum / totalCertificates : 0;

      // Agrupar por curso
      const courseStats = certificates?.reduce((acc, cert) => {
        const courseTitle = cert.courses?.title || 'Curso Desconhecido';
        acc[courseTitle] = (acc[courseTitle] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const topCourses = Object.entries(courseStats)
        .map(([course_title, certificate_count]) => ({ 
          course_title, 
          certificate_count: Number(certificate_count) || 0 
        }))
        .sort((a, b) => b.certificate_count - a.certificate_count)
        .slice(0, 5);

      return {
        totalCertificates,
        thisMonthCertificates,
        averageGrade,
        topCourses
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de certificados:', error);
      return {
        totalCertificates: 0,
        thisMonthCertificates: 0,
        averageGrade: 0,
        topCourses: []
      };
    }
  }
}

export const certificateGenerator = new CertificateGenerator()
