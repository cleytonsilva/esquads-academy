import React, { useMemo, useRef, useState } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { supabase } from '@/integrations/supabase/client'

type Props = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const quillRef = useRef<ReactQuill | null>(null)
  const [aiLoading, setAiLoading] = useState(false)

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image', 'video'],
        [{ align: [] }],
        ['clean'],
      ],
      handlers: {
        image: async () => {
          const input = document.createElement('input')
          input.type = 'file'
          input.accept = 'image/*'
          input.onchange = async () => {
            const file = (input.files && input.files[0]) || null
            if (!file) return
            const url = await uploadFile(file)
            const editor = quillRef.current?.getEditor()
            const range = editor?.getSelection(true)
            if (range && url) {
              editor?.insertEmbed(range.index, 'image', url, 'user')
              editor?.setSelection({ index: range.index + 1, length: 0 })
            }
          }
          input.click()
        },
        video: async () => {
          const input = document.createElement('input')
          input.type = 'file'
          input.accept = 'video/*'
          input.onchange = async () => {
            const file = (input.files && input.files[0]) || null
            if (!file) return
            const url = await uploadFile(file)
            const editor = quillRef.current?.getEditor()
            const range = editor?.getSelection(true)
            if (range && url) {
              editor?.insertEmbed(range.index, 'video', url, 'user')
              editor?.setSelection({ index: range.index + 1, length: 0 })
            }
          }
          input.click()
        },
      },
    },
  }), [])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">Editor</div>
        <button
          type="button"
          onClick={async () => {
            try {
              const prompt = window.prompt('Gerar conteúdo (tópico):', 'Introdução') || 'Introdução'
              setAiLoading(true)
              const { data, error } = await supabase.functions.invoke('ai_generate_lesson_content', {
                body: { prompt, context: {} },
              })
              if (error) throw error
              const html = (data as any)?.html || ''
              const editor = quillRef.current?.getEditor()
              const range = editor?.getSelection(true)
              const index = range ? range.index : (editor?.getLength() || 0)
              if (html) {
                editor?.insertEmbed(index, 'divider', true, 'user')
                editor?.clipboard.dangerouslyPasteHTML(index, html, 'user')
              }
            } catch (e) {
              console.error('AI generate error', e)
            } finally {
              setAiLoading(false)
            }
          }}
          className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
          disabled={aiLoading}
          title="Gerar conteúdo com IA (Supabase Edge)"
        >
          {aiLoading ? 'Gerando…' : 'Gerar com IA'}
        </button>
      </div>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder || 'Escreva o conteúdo aqui...'}
      />
    </div>
  )
}

async function uploadFile(file: File): Promise<string | null> {
  try {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/uploads`, {
      method: 'POST',
      body: form,
    })
    if (!res.ok) return null
    const json = await res.json()
    return json?.url || null
  } catch (e) {
    console.error('Upload error', e)
    return null
  }
}
