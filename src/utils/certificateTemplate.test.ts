import { describe, it, expect } from 'vitest'
import { buildCertificateHtml } from './certificateTemplate'

describe('buildCertificateHtml', () => {
  it('builds a self-contained HTML with injected variables', () => {
    const html = buildCertificateHtml({
      student_name: 'Alice',
      course_title: 'Segurança Web',
      instructor_name: 'Dr. Bob',
      completion_date: '01/10/2025',
      grade: 95,
      hours_completed: 12,
      skills_acquired: ['XSS', 'CSRF'],
      verification_code: 'ABC-123',
    }, {})

    expect(html).toContain('<!doctype html>')
    expect(html).toContain('Alice')
    expect(html).toContain('Segurança Web')
    expect(html).toContain('Dr. Bob')
    expect(html).toContain('01/10/2025')
    expect(html).toContain('95')
    expect(html).toContain('12')
    expect(html).toMatch(/XSS.*CSRF|CSRF.*XSS/) // order-insensitive check
    expect(html).toContain('ABC-123')
  })

  it('includes glare styling/hooks by default', () => {
    const html = buildCertificateHtml({}, {})
    // Should contain the glare overlay and default styles
    expect(html).toContain('class="glare"')
    expect(html).toContain('mix-blend-mode')
  })
})

