import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/integrations/supabase/client'
import CertificateHtmlEditor from '@/components/certificates/CertificateHtmlEditor'

type Element = {
  id: string
  type: 'text' | 'image'
  x: number
  y: number
  text?: string
  font?: string
  size?: number
  color?: string
  url?: string
}

export default function CertificateDesigner() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [bg, setBg] = useState<string>('')
  const [elements, setElements] = useState<Element[]>([])
  const [name, setName] = useState('Modelo Padrão')

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    // background
    if (bg) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        drawElements(ctx)
      }
      img.src = bg
    } else {
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      drawElements(ctx)
    }
  }

  const drawElements = (ctx: CanvasRenderingContext2D) => {
    for (const el of elements) {
      if (el.type === 'text') {
        ctx.fillStyle = el.color || '#111'
        ctx.font = `${el.size || 20}px ${el.font || 'Inter, Arial'}`
        ctx.fillText(el.text || '', el.x, el.y)
      } else if (el.type === 'image' && el.url) {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => ctx.drawImage(img, el.x, el.y, 120, 120)
        img.src = el.url
      }
    }
  }

  useEffect(() => { draw() }, [bg, elements])

  const addText = () => setElements((prev) => prev.concat({ id: `${Date.now()}`, type: 'text', x: 100, y: 100, text: 'Nome do Aluno', size: 28, color: '#111' }))
  const addImage = () => setElements((prev) => prev.concat({ id: `${Date.now()}`, type: 'image', x: 50, y: 50, url: '' }))

  const uploadBackground = async (file: File) => {
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/uploads`, { method: 'POST', body: form })
      const json = await res.json()
      if (json?.url) setBg(json.url)
    } catch (e) { console.error(e) }
  }

  const saveTemplate = async () => {
    await supabase.from('certificate_templates').insert({ name, background_url: bg, elements })
    alert('Template salvo!')
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="visual" className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full md:w-auto">
          <TabsTrigger value="visual">Designer Visual</TabsTrigger>
          <TabsTrigger value="code">Editor HTML/CSS/JS</TabsTrigger>
        </TabsList>
        <TabsContent value="visual">
          <Card>
            <CardHeader>
              <CardTitle>Designer de Certificado (Visual)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <Label>Nome do Modelo</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                  <Label>Background</Label>
                  <Input type="file" accept="image/*" onChange={(e) => e.target.files && uploadBackground(e.target.files[0])} />
                  <div className="flex gap-2">
                    <Button type="button" onClick={addText} variant="outline">+ Texto</Button>
                    <Button type="button" onClick={addImage} variant="outline">+ Imagem</Button>
                  </div>
                  <Button onClick={saveTemplate}>Salvar Template</Button>
                </div>
                <div className="md:col-span-2">
                  <canvas ref={canvasRef} width={1000} height={700} className="border rounded w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="code">
          <CertificateHtmlEditor />
        </TabsContent>
      </Tabs>
    </div>
  )
}
