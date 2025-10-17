import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge as UiBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type ApiBadge = {
  id: string
  name: string
  description?: string
  icon_url?: string
  color?: string
  points_required?: number
  created_at?: string
}

export default function AdminBadges() {
  const [badges, setBadges] = useState<ApiBadge[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<{ name: string; description: string; points_required: number; icon_url?: string }>({
    name: '',
    description: '',
    points_required: 0,
    icon_url: ''
  })

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim()
    if (!s) return badges
    return badges.filter(b => (b.name || '').toLowerCase().includes(s) || (b.description || '').toLowerCase().includes(s))
  }, [badges, search])

  const fetchBadges = async () => {
    setLoading(true)
    try {
      const resp = await fetch('/api/badges')
      const json = await resp.json()
      if (json?.success) setBadges(json.badges || [])
    } catch (e) {
      console.error('Erro ao buscar badges:', e)
    } finally {
      setLoading(false)
    }
  }

  const createBadge = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setCreating(true)
      const resp = await fetch('/api/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const json = await resp.json()
      if (json?.success) {
        setBadges([json.badge, ...badges])
        setForm({ name: '', description: '', points_required: 0, icon_url: '' })
      } else {
        alert(json?.error || 'Falha ao criar badge')
      }
    } catch (e) {
      console.error('Erro ao criar badge:', e)
      alert('Erro ao criar badge')
    } finally {
      setCreating(false)
    }
  }

  useEffect(() => { fetchBadges() }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Badges</h1>
          <p className="text-sm text-gray-600">Crie e gerencie badges para gamificar o aprendizado</p>
        </div>
        <div className="w-72">
          <Input placeholder="Buscar badges" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nova Badge</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createBadge} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <Label>Nome</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <Label>Descrição</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <Label>Pontos</Label>
              <Input type="number" value={form.points_required} onChange={(e) => setForm({ ...form, points_required: Number(e.target.value) || 0 })} />
            </div>
            <div>
              <Label>Ícone (URL)</Label>
              <Input value={form.icon_url} onChange={(e) => setForm({ ...form, icon_url: e.target.value })} />
            </div>
            <div className="md:col-span-4">
              <Button type="submit" disabled={creating}>{creating ? 'Criando…' : 'Criar Badge'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Badges</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-gray-500">Carregando…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma badge encontrada.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((b) => (
                <div key={b.id} className="border rounded-lg p-4 bg-white flex items-center gap-3">
                  {b.icon_url ? (
                    <img src={b.icon_url} alt={b.name} className="w-10 h-10 object-cover rounded" />
                  ) : (
                    <UiBadge variant="secondary">{b.points_required || 0} pts</UiBadge>
                  )}
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{b.name}</div>
                    <div className="text-sm text-gray-600 truncate">{b.description || '-'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}



