import React, { useState } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface ChatBluProps {
  onMessage?: (message: string) => void
}

export const ChatBlu: React.FC<ChatBluProps> = ({ onMessage }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Olá! Sou o BLU, seu assistente para esta missão. Como posso ajudar?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const send = async () => {
    if (!input.trim() || loading) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    
    // Simular resposta do BLU
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Entendi sua pergunta. Vou ajudar você com isso!'
      }
      setMessages(prev => [...prev, botResponse])
      setLoading(false)
      onMessage?.(userMessage.content)
    }, 1000)
  }

  return (
    <div className="border rounded-md p-3 h-full flex flex-col">
      <div className="font-semibold mb-2">BLU</div>
      <div className="flex-1 overflow-auto space-y-2">
        {messages.map((m) => (
          <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
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
