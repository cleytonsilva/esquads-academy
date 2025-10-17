import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { defaultCertificateTemplate, sampleCertificateData, CertificateTemplateCode } from '@/utils/certificateTemplateDefaults'
import { buildCertificateHtml } from '@/utils/certificateTemplate'
import { supabase } from '@/integrations/supabase/client'

type Props = {
  initialName?: string
}

type SaveResult = { ok: boolean, id?: string, error?: any }

export default function CertificateHtmlEditor({ initialName = 'Modelo HTML' }: Props) {
  const [name, setName] = useState(initialName)
  const [html, setHtml] = useState(defaultCertificateTemplate.html)
  const [css, setCss] = useState(defaultCertificateTemplate.css)
  const [js, setJs] = useState(defaultCertificateTemplate.js)
  const [loadingList, setLoadingList] = useState(false)
  const [templates, setTemplates] = useState<Array<{ id: string; name: string; html?: string; css?: string; js?: string }>>([])
  const [selectedId, setSelectedId] = useState<string>('')

  const [studentName, setStudentName] = useState(sampleCertificateData.student_name)
  const [courseTitle, setCourseTitle] = useState(sampleCertificateData.course_title)
  const [instructorName, setInstructorName] = useState(sampleCertificateData.instructor_name)
  const [grade, setGrade] = useState(String(sampleCertificateData.grade))
  const [hours, setHours] = useState(String(sampleCertificateData.hours_completed))
  const [skills, setSkills] = useState(sampleCertificateData.skills_acquired.join(', '))
  const [code, setCode] = useState(sampleCertificateData.verification_code)

  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  const compiled = useMemo(() => buildCertificateHtml({
    student_name: studentName,
    course_title: courseTitle,
    instructor_name: instructorName,
    completion_date: new Date().toLocaleDateString('pt-BR'),
    grade: Number(grade) || 0,
    hours_completed: Number(hours) || 0,
    skills_acquired: skills.split(',').map(s => s.trim()).filter(Boolean),
    verification_code: code,
  }, { html, css, js }), [studentName, courseTitle, instructorName, grade, hours, skills, code, html, css, js])

  const downloadHtml = () => {
    const blob = new Blob([compiled], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `certificado-${Date.now()}.html`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const saveTemplate = async (): Promise<SaveResult> => {
    const payload: any = { name, html, css, js }
    try {
      const { data, error } = await supabase.from('certificate_templates').insert(payload).select('id').single()
      if (error) throw error
      const id = (data as any)?.id as string | undefined
      return { ok: true, id }
    } catch (e) {
      try {
        const list = JSON.parse(localStorage.getItem('certificate_templates') || '[]')
        const id = `local_${Date.now()}`
        list.push({ id, ...payload })
        localStorage.setItem('certificate_templates', JSON.stringify(list))
        return { ok: true, id }
      } catch (err) {
        return { ok: false, error: err }
      }
    }
  }

  const openInNewTab = () => {
    const blob = new Blob([compiled], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  }

  const loadTemplates = async () => {
    setLoadingList(true)
    try {
      // Try Supabase
      const { data, error } = await supabase
        .from('certificate_templates')
        .select('id, name, html, css, js')
        .order('name', { ascending: true })
      if (!error && data) {
        setTemplates(data as any)
        return
      }
    } catch (_) { /* fallback below */ }
    try {
      const list = JSON.parse(localStorage.getItem('certificate_templates') || '[]')
      setTemplates(list)
    } catch { setTemplates([]) }
    setLoadingList(false)
  }

  const loadSelected = () => {
    const t = templates.find(t => t.id === selectedId)
    if (!t) return
    setName(t.name || 'Modelo HTML')
    setHtml(t.html || defaultCertificateTemplate.html)
    setCss(t.css || defaultCertificateTemplate.css)
    setJs(t.js || defaultCertificateTemplate.js)
  }

  useEffect(() => {
    // Update iframe srcdoc
    if (iframeRef.current) {
      iframeRef.current.srcdoc = compiled
    }
  }, [compiled])

  useEffect(() => { loadTemplates() }, [])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Editor de Certificado (HTML/CSS/JS)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <Label>Nome do Template</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label>Aluno</Label>
                  <Input value={studentName} onChange={(e) => setStudentName(e.target.value)} />
                </div>
                <div>
                  <Label>Curso</Label>
                  <Input value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} />
                </div>
                <div>
                  <Label>Instrutor</Label>
                  <Input value={instructorName} onChange={(e) => setInstructorName(e.target.value)} />
                </div>
                <div>
                  <Label>Nota</Label>
                  <Input value={grade} onChange={(e) => setGrade(e.target.value)} />
                </div>
                <div>
                  <Label>Horas</Label>
                  <Input value={hours} onChange={(e) => setHours(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <Label>Skills (separadas por vírgula)</Label>
                  <Input value={skills} onChange={(e) => setSkills(e.target.value)} />
                </div>
                <div>
                  <Label>Código</Label>
                  <Input value={code} onChange={(e) => setCode(e.target.value)} />
                </div>
              </div>
              <Tabs defaultValue="html" className="space-y-3">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="html">HTML</TabsTrigger>
                  <TabsTrigger value="css">CSS</TabsTrigger>
                  <TabsTrigger value="js">JS</TabsTrigger>
                </TabsList>
                <TabsContent value="html">
                  <Textarea value={html} onChange={(e) => setHtml(e.target.value)} rows={16} className="font-mono" />
                </TabsContent>
                <TabsContent value="css">
                  <Textarea value={css} onChange={(e) => setCss(e.target.value)} rows={16} className="font-mono" />
                </TabsContent>
                <TabsContent value="js">
                  <Textarea value={js} onChange={(e) => setJs(e.target.value)} rows={16} className="font-mono" />
                </TabsContent>
              </Tabs>
              <div className="flex flex-wrap gap-2 items-end">
                <div>
                  <Label>Modelos Salvos</Label>
                  <div className="flex gap-2">
                    <select className="border rounded px-2 py-2" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
                      <option value="">Selecione…</option>
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name || t.id}</option>
                      ))}
                    </select>
                    <Button type="button" variant="outline" onClick={loadSelected} disabled={!selectedId}>Carregar</Button>
                    <Button type="button" variant="ghost" onClick={loadTemplates} disabled={loadingList}>Atualizar</Button>
                  </div>
                </div>
                <div className="flex gap-2 ml-auto">
                  <Button type="button" onClick={downloadHtml}>Baixar HTML</Button>
                  <Button type="button" variant="secondary" onClick={openInNewTab}>Abrir</Button>
                  <Button type="button" variant="outline" onClick={async () => { const res = await saveTemplate(); alert(res.ok ? 'Template salvo!' : 'Falha ao salvar') }}>Salvar Template</Button>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <Label>Preview</Label>
              <div className="border rounded overflow-hidden bg-white">
                <iframe ref={iframeRef} title="Preview do Certificado" className="w-full" style={{ height: 380 }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
