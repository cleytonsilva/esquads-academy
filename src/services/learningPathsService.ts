import { supabase } from '@/integrations/supabase/client'

export interface LearningPath {
  id: string
  name: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimated_duration_hours: number
  tags: string[]
  is_published: boolean
  cover_image_url?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface LearningPathCourse {
  id: string
  path_id: string
  course_id: string
  order_index: number
  is_required: boolean
  created_at: string
}

export interface UserLearningPath {
  id: string
  user_id: string
  path_id: string
  enrolled_at: string
  completed_at?: string
  progress_percentage: number
  status: 'enrolled' | 'in_progress' | 'completed' | 'paused' | 'dropped'
  last_accessed_at: string
  created_at: string
  updated_at: string
}

export interface LearningPathWithCourses extends LearningPath {
  courses: Array<{
    id: string
    title: string
    description: string
    difficulty: string
    duration_hours: number
    order_index: number
    is_required: boolean
  }>
  user_progress?: UserLearningPath
}

class LearningPathsService {
  /**
   * Buscar todas as trilhas publicadas
   */
  async getPublishedPaths(): Promise<LearningPath[]> {
    const { data, error } = await supabase
      .from('learning_paths')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar trilhas:', error)
      throw new Error('Falha ao carregar trilhas')
    }

    return data || []
  }

  /**
   * Buscar trilha por ID com cursos associados
   */
  async getPathById(pathId: string): Promise<LearningPathWithCourses | null> {
    // Buscar dados da trilha
    const { data: path, error: pathError } = await supabase
      .from('learning_paths')
      .select('*')
      .eq('id', pathId)
      .single()

    if (pathError) {
      console.error('Erro ao buscar trilha:', pathError)
      return null
    }

    // Buscar cursos associados
    const { data: pathCourses, error: coursesError } = await supabase
      .from('learning_path_courses')
      .select(`
        course_id,
        order_index,
        is_required,
        courses (
          id,
          title,
          description,
          difficulty,
          duration_hours
        )
      `)
      .eq('path_id', pathId)
      .order('order_index', { ascending: true })

    if (coursesError) {
      console.error('Erro ao buscar cursos da trilha:', coursesError)
      return null
    }

    // Buscar progresso do usuário (se logado)
    const { data: userProgress } = await supabase
      .from('user_learning_paths')
      .select('*')
      .eq('path_id', pathId)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id || '')
      .single()

    return {
      ...path,
      courses: pathCourses?.map(pc => ({
        id: pc.courses.id,
        title: pc.courses.title,
        description: pc.courses.description,
        difficulty: pc.courses.difficulty,
        duration_hours: pc.courses.duration_hours,
        order_index: pc.order_index,
        is_required: pc.is_required
      })) || [],
      user_progress: userProgress || undefined
    }
  }

  /**
   * Inscrever usuário em uma trilha
   */
  async enrollInPath(pathId: string): Promise<UserLearningPath> {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      throw new Error('Usuário não autenticado')
    }

    const { data, error } = await supabase
      .from('user_learning_paths')
      .insert({
        user_id: user.user.id,
        path_id: pathId,
        status: 'enrolled'
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao se inscrever na trilha:', error)
      throw new Error('Falha ao se inscrever na trilha')
    }

    return data
  }

  /**
   * Atualizar progresso do usuário na trilha
   */
  async updateProgress(pathId: string, progressPercentage: number, status?: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      throw new Error('Usuário não autenticado')
    }

    const updateData: any = {
      progress_percentage: progressPercentage,
      last_accessed_at: new Date().toISOString()
    }

    if (status) {
      updateData.status = status
    }

    if (progressPercentage >= 100) {
      updateData.completed_at = new Date().toISOString()
      updateData.status = 'completed'
    }

    const { error } = await supabase
      .from('user_learning_paths')
      .update(updateData)
      .eq('user_id', user.user.id)
      .eq('path_id', pathId)

    if (error) {
      console.error('Erro ao atualizar progresso:', error)
      throw new Error('Falha ao atualizar progresso')
    }
  }

  /**
   * Buscar trilhas do usuário
   */
  async getUserPaths(): Promise<Array<LearningPathWithCourses>> {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return []
    }

    const { data, error } = await supabase
      .from('user_learning_paths')
      .select(`
        *,
        learning_paths (
          id,
          name,
          description,
          level,
          difficulty,
          estimated_duration_hours,
          tags,
          is_published,
          cover_image_url,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', user.user.id)
      .order('last_accessed_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar trilhas do usuário:', error)
      return []
    }

    return data?.map(item => ({
      ...item.learning_paths,
      user_progress: item
    })) || []
  }

  /**
   * Criar nova trilha (admin)
   */
  async createPath(pathData: Partial<LearningPath>, courseIds: string[] = []): Promise<LearningPath> {
    const { data, error } = await supabase
      .from('learning_paths')
      .insert({
        name: pathData.name,
        description: pathData.description,
        level: pathData.level || 'beginner',
        difficulty: pathData.difficulty || 'beginner',
        estimated_duration_hours: pathData.estimated_duration_hours || 0,
        tags: pathData.tags || [],
        is_published: pathData.is_published || false
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar trilha:', error)
      throw new Error('Falha ao criar trilha')
    }

    // Associar cursos se fornecidos
    if (courseIds.length > 0) {
      const courseAssociations = courseIds.map((courseId, index) => ({
        path_id: data.id,
        course_id: courseId,
        order_index: index,
        is_required: true
      }))

      const { error: associationError } = await supabase
        .from('learning_path_courses')
        .insert(courseAssociations)

      if (associationError) {
        console.error('Erro ao associar cursos:', associationError)
        // Não falha a criação da trilha por causa disso
      }
    }

    return data
  }

  /**
   * Atualizar trilha (admin)
   */
  async updatePath(pathId: string, pathData: Partial<LearningPath>): Promise<LearningPath> {
    const { data, error } = await supabase
      .from('learning_paths')
      .update({
        ...pathData,
        updated_at: new Date().toISOString()
      })
      .eq('id', pathId)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar trilha:', error)
      throw new Error('Falha ao atualizar trilha')
    }

    return data
  }

  /**
   * Deletar trilha (admin)
   */
  async deletePath(pathId: string): Promise<void> {
    const { error } = await supabase
      .from('learning_paths')
      .delete()
      .eq('id', pathId)

    if (error) {
      console.error('Erro ao deletar trilha:', error)
      throw new Error('Falha ao deletar trilha')
    }
  }

  /**
   * Buscar todas as trilhas (admin)
   */
  async getAllPaths(): Promise<LearningPath[]> {
    const { data, error } = await supabase
      .from('learning_paths')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar todas as trilhas:', error)
      throw new Error('Falha ao carregar trilhas')
    }

    return data || []
  }
}

export const learningPathsService = new LearningPathsService()
