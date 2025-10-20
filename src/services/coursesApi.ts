import { supabase } from '@/integrations/supabase/client'

export async function fetchCourses(status?: string) {
  try {
    let query = supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })

    if (status === 'published') {
      query = query.eq('is_published', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching courses:', error)
      throw new Error('Failed to load courses')
    }

    return data || []
  } catch (error) {
    console.error('Error in fetchCourses:', error)
    throw new Error('Failed to load courses')
  }
}

export async function fetchCourseDetail(id: string) {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching course detail:', error)
      throw new Error('Failed to load course')
    }

    return data
  } catch (error) {
    console.error('Error in fetchCourseDetail:', error)
    throw new Error('Failed to load course')
  }
}

