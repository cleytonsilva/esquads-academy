export async function fetchCourses(status?: string) {
  const url = new URL(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/courses`)
  if (status) url.searchParams.set('status', status)
  const r = await fetch(url.toString())
  if (!r.ok) throw new Error('Failed to load courses')
  const j = await r.json()
  return j.courses || []
}

export async function fetchCourseDetail(id: string) {
  const r = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/courses/${id}`)
  if (!r.ok) throw new Error('Failed to load course')
  return await r.json()
}

