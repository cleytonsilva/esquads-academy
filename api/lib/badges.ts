import { supabaseAdmin } from './supabase.js'

export async function ensureBadge(name: string, defaults?: Partial<{ description: string; icon_url: string; color: string; category: string; points_required: number }>) {
  const { data: existing } = await supabaseAdmin.from('badges').select('*').eq('name', name).limit(1)
  if (existing && existing.length) return existing[0]
  const payload = {
    name,
    description: defaults?.description || '',
    icon_url: defaults?.icon_url || '',
    color: defaults?.color || '#3B82F6',
    category: defaults?.category || 'achievement',
    points_required: defaults?.points_required ?? 0,
  }
  const { data, error } = await supabaseAdmin.from('badges').insert(payload).select('*').maybeSingle()
  if (error) throw error
  return data
}

export async function grantBadge(userId: string, badgeId: string) {
  // Check if already granted
  const { data: ub } = await supabaseAdmin
    .from('user_badges')
    .select('id')
    .eq('user_id', userId)
    .eq('badge_id', badgeId)
    .limit(1)
  if (ub && ub.length) return { granted: false }
  const { error } = await supabaseAdmin.from('user_badges').insert({ user_id: userId, badge_id: badgeId })
  if (error) throw error
  return { granted: true }
}

