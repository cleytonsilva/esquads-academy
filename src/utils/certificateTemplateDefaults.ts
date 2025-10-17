export type CertificateTemplateCode = {
  html: string
  css: string
  js: string
}

// Default glare effect styles and behavior
const glareCss = `
.certificate-preview { position: relative; overflow: hidden; }
.certificate-preview .glare { position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; pointer-events: none; opacity: 0; transition: opacity 300ms ease; background: radial-gradient( circle at center, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.15) 30%, rgba(255,255,255,0.0) 60% ); mix-blend-mode: screen; }
.certificate-preview:hover .glare { opacity: 1; }
@keyframes float-glare { 0% { transform: translate(0,0) rotate(15deg); } 50% { transform: translate(5%, -5%) rotate(15deg);} 100% { transform: translate(0,0) rotate(15deg);} }
`

const glareJs = `
(() => {
  const root = document.querySelector('.certificate-preview')
  const glare = document.querySelector('.certificate-preview .glare')
  if (!root || !glare) return
  const update = (e) => {
    const rect = root.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const tx = (x - 0.5) * 40
    const ty = (y - 0.5) * 40
    glare.style.transform = 'translate(' + tx + '%, ' + ty + '%) rotate(15deg)'
  }
  root.addEventListener('mousemove', update)
  root.addEventListener('mouseleave', () => {
    glare.style.animation = 'float-glare 4s ease-in-out infinite'
  })
  root.addEventListener('mouseenter', () => {
    glare.style.animation = 'none'
  })
})()
`

export const defaultCertificateTemplate: CertificateTemplateCode = {
  html: `
<div class="certificate-preview" style="width: 1024px; height: 724px; background: linear-gradient(135deg, #ffffff, #f8fafc); border: 1px solid #e5e7eb; border-radius: 12px; position: relative;">
  <div class="glare"></div>
  <div style="position:absolute; inset: 0; padding: 48px; display:flex; flex-direction:column; align-items:center; text-align:center;">
    <div style="width:80px; height:80px; border-radius:50%; background: linear-gradient(135deg, #3b82f6, #8b5cf6); display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; font-size:28px; box-shadow: 0 10px 30px rgba(59,130,246,0.25);">EA</div>
    <h1 style="margin: 16px 0 4px; font-family: Inter, system-ui, sans-serif; font-size: 28px; color:#111827;">CERTIFICADO DE CONCLUSÃO</h1>
    <div style="font-size:14px; color:#6b7280;">Esquads Academy</div>
    <div style="margin-top: 28px; font-size: 16px; color:#374151;">Certificamos que</div>
    <div style="margin-top: 8px; font-size: 40px; font-weight: 800; color:#111827;">{{student_name}}</div>
    <div style="margin-top: 12px; font-size: 16px; color:#374151;">concluiu com sucesso o curso</div>
    <div style="margin-top: 8px; font-size: 22px; font-weight: 700; color:#2563eb;">{{course_title}}</div>
    <div style="margin-top: 6px; font-size: 14px; color:#374151;">ministrado por <b>{{instructor_name}}</b></div>
    <div style="display:grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 16px; margin-top: 28px; width: 70%;">
      <div style="border:1px solid #bfdbfe; background:#eff6ff; color:#1d4ed8; padding:10px 12px; border-radius:999px; font-weight:600;">Nota: {{grade}}/100</div>
      <div style="border:1px solid #c7d2fe; background:#eef2ff; color:#4338ca; padding:10px 12px; border-radius:999px; font-weight:600;">Horas: {{hours_completed}}h</div>
      <div style="border:1px solid #bbf7d0; background:#f0fdf4; color:#166534; padding:10px 12px; border-radius:999px; font-weight:600;">Data: {{completion_date}}</div>
    </div>
    <div style="margin-top: 20px; max-width: 80%; font-size: 13px; color:#4b5563;">Habilidades adquiridas: {{skills_acquired}}</div>
    <div style="position:absolute; bottom: 36px; width: 100%; display:flex; align-items:center; justify-content:center; gap: 12px; color:#374151;">
      <div style="font-family: ui-monospace, SFMono-Regular, Menlo, monospace; background:#f3f4f6; padding: 6px 10px; border-radius: 6px;">Código: {{verification_code}}</div>
    </div>
  </div>
</div>
`,
  css: `${glareCss}`,
  js: `${glareJs}`
}

export const sampleCertificateData = {
  student_name: 'João Silva',
  course_title: 'Introdução à Segurança em Aplicações',
  instructor_name: 'Profa. Maria Andrade',
  completion_date: new Date().toLocaleDateString('pt-BR'),
  grade: 92,
  hours_completed: 24,
  skills_acquired: ['OWASP Top 10', 'Threat Modeling', 'Secure Coding'],
  verification_code: 'ABC-123-XYZ'
}
