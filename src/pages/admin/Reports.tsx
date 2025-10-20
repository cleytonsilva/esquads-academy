import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/contexts/AuthContext'

type Failure = {
  id: string
  user_id?: string | null
  course_id?: string | null
  stage: string
  error_message: string
  error_code?: string
  created_at: string
}

type Grant = {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
  users?: { full_name?: string | null }
  badges?: { name?: string | null; icon_url?: string | null; category?: string | null; color?: string | null }
}

export default function AdminReports() {
  const { session } = useAuth()
  const [failures, setFailures] = useState<Failure[]>([])
  const [grants, setGrants] = useState<Grant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => { void loadAll() }, [])

  const loadAll = async () => {
    try {
      setLoading(true); setError(null); setSuccess(null)
      const token = session?.access_token
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      const rf = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/certificates/failures`, { headers })
      const jf = await rf.json()
      if (rf.ok) setFailures(jf.failures || [])

      const rg = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/badges/grants?limit=100`, { headers })
      const jg = await rg.json()
      if (rg.ok) setGrants(jg.grants || [])
    } catch (e: any) { setError(e?.message || 'Erro ao carregar relatórios') }
    finally { setLoading(false) }
  }

  const retryFailure = async (id: string) => {
    try {
      setLoading(true); setError(null); setSuccess(null)
      const token = session?.access_token
      const headers = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
      const r = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/certificates/failures/${id}/retry`, { method: 'POST', headers })
      const j = await r.json()
      if (!r.ok) throw new Error(j?.error || 'Falha ao reprocessar')
      setSuccess('Reprocessado com sucesso')
      await loadAll()
    } catch (e: any) { setError(e?.message || 'Erro no reprocessamento') }
    finally { setLoading(false) }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <Button variant="outline" onClick={() => void loadAll()} disabled={loading}>Atualizar</Button>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}
      {success && <div className="text-sm text-green-600">{success}</div>}

      <Card>
        <CardHeader>
          <CardTitle>Falhas de Certificado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Etapa</TableHead>
                  <TableHead>Erro</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {failures.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-sm text-gray-600">Nenhuma falha registrada.</TableCell>
                  </TableRow>
                ) : (
                  failures.map(f => (
                    <TableRow key={f.id}>
                      <TableCell>{new Date(f.created_at).toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="font-mono text-xs">{f.user_id || '-'}</TableCell>
                      <TableCell className="font-mono text-xs">{f.course_id || '-'}</TableCell>
                      <TableCell>{f.stage}</TableCell>
                      <TableCell className="text-xs">{f.error_message}</TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => void retryFailure(f.id)} disabled={loading}>Reprocessar</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Badges Concedidas Recentemente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Badge</TableHead>
                  <TableHead>Categoria</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-sm text-gray-600">Nenhuma concessão recente.</TableCell>
                  </TableRow>
                ) : (
                  grants.map(g => (
                    <TableRow key={g.id}>
                      <TableCell>{new Date(g.earned_at).toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="truncate max-w-[200px]">{g.users?.full_name || g.user_id}</TableCell>
                      <TableCell className="truncate max-w-[240px]">{g.badges?.name || g.badge_id}</TableCell>
                      <TableCell>{g.badges?.category || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

