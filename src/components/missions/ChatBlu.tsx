import React, { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

type Msg = { role: 'user' | 'assistant'; content: string }

export default function ChatBlu({ context }: { context?: any }) {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const send = async () => {
    if (!input.trim()) return
    const next = [...messages, { role: 'user', content: input }]
    setMessages(next as Msg[]); setInput(''); setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('mission_chat_blu', {
        body: { messages: next, context, provider: 'openai' }
      })
      if (!error && (data as any)?.reply) {
        const flagged = (data as any).flagged
        const text = (data as any).reply
        setMessages(m => m.concat({ role: 'assistant', content: text + (flagged ? '\n[Nota: conteúdo sensível filtrado]' : '') }))
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="border rounded-md p-3 h-full flex flex-col">
      <div className="font-semibold mb-2">BLU</div>
      <div className="flex-1 overflow-auto space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <div className={`inline-block px-2 py-1 rounded ${m.role==='user'?'bg-blue-600 text-white':'bg-gray-100'}`}>{m.content}</div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input className="border rounded px-2 py-1 flex-1" value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter') send() }} placeholder="Pergunte ao BLU..." />
        <button className="border rounded px-3" onClick={send} disabled={loading}>{loading?'...':'Enviar'}</button>
      </div>
    </div>
  )
}
