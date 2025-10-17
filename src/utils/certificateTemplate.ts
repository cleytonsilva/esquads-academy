import { CertificateTemplateCode, defaultCertificateTemplate } from '@/utils/certificateTemplateDefaults'

export type CertificateDataVars = {
  student_name: string
  course_title: string
  instructor_name: string
  completion_date: string
  grade: number | string
  hours_completed: number | string
  skills_acquired: string[] | string
  verification_code: string
}

const toArrayString = (v: string[] | string) => Array.isArray(v) ? v.join(', ') : String(v)

export function buildCertificateHtml(
  data: Partial<CertificateDataVars> = {},
  code: Partial<CertificateTemplateCode> = {}
): string {
  const tpl: CertificateTemplateCode = {
    html: code.html ?? defaultCertificateTemplate.html,
    css: code.css ?? defaultCertificateTemplate.css,
    js: code.js ?? defaultCertificateTemplate.js,
  }

  const vars: CertificateDataVars = {
    student_name: data.student_name ?? 'Aluno(a)',
    course_title: data.course_title ?? 'Curso',
    instructor_name: data.instructor_name ?? 'Instrutor(a)',
    completion_date: data.completion_date ?? new Date().toLocaleDateString('pt-BR'),
    grade: data.grade ?? 100,
    hours_completed: data.hours_completed ?? 0,
    skills_acquired: data.skills_acquired ?? [],
    verification_code: data.verification_code ?? 'XXXX-XXXX',
  }

  const injectedHtml = applyVariables(tpl.html, vars)

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Certificado</title>
  <style>*{box-sizing:border-box}</style>
  <style>${tpl.css || ''}</style>
</head>
<body style="margin:0; display:grid; place-items:center; min-height:100vh; background:#f3f4f6;">
  ${injectedHtml}
  <script>(function(){ try { ${tpl.js || ''} } catch(e){ console.error(e) } })()</script>
</body>
</html>`
}

export function applyVariables(html: string, vars: CertificateDataVars): string {
  let out = html
  out = out.split('{{student_name}}').join(escapeHtml(String(vars.student_name)))
  out = out.split('{{course_title}}').join(escapeHtml(String(vars.course_title)))
  out = out.split('{{instructor_name}}').join(escapeHtml(String(vars.instructor_name)))
  out = out.split('{{completion_date}}').join(escapeHtml(String(vars.completion_date)))
  out = out.split('{{grade}}').join(escapeHtml(String(vars.grade)))
  out = out.split('{{hours_completed}}').join(escapeHtml(String(vars.hours_completed)))
  out = out.split('{{verification_code}}').join(escapeHtml(String(vars.verification_code)))
  out = out.split('{{skills_acquired}}').join(escapeHtml(toArrayString(vars.skills_acquired)))
  return out
}

function escapeHtml(input: string | number): string {
  const str = String(input)
  return str
    .split('&').join('&amp;')
    .split('<').join('&lt;')
    .split('>').join('&gt;')
    .split('"').join('&quot;')
    .split("'").join('&#039;')
}
