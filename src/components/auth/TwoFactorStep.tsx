import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

type Props = {
  onVerify: (code: string, remember: boolean) => Promise<boolean>
  onResend?: () => Promise<boolean>
  error?: string | null
}

export default function TwoFactorStep({ onVerify, onResend, error }: Props) {
  const [code, setCode] = useState('')
  const [rememberDevice, setRememberDevice] = useState(true)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try { await onVerify(code.trim(), rememberDevice) } finally { setLoading(false) }
  }

  const handleResend = async () => {
    if (!onResend) return
    setResending(true)
    try { await onResend() } finally { setResending(false) }
  }

  return (
    <form onSubmit={handleVerify} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="otp">Código de Verificação</Label>
        <Input id="otp" value={code} onChange={(e) => setCode(e.target.value)} placeholder="000000" maxLength={6} />
      </div>
      {error && (
        <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
      )}
      <div className="flex items-center gap-2">
        <input id="rememberDevice" type="checkbox" checked={rememberDevice} onChange={(e) => setRememberDevice(e.target.checked)} />
        <Label htmlFor="rememberDevice">Lembrar este dispositivo por 30 dias</Label>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>{loading ? 'Verificando...' : 'Verificar'}</Button>
        {onResend && (
          <Button type="button" variant="outline" disabled={resending} onClick={handleResend}>
            {resending ? 'Reenviando...' : 'Reenviar código'}
          </Button>
        )}
      </div>
    </form>
  )
}

