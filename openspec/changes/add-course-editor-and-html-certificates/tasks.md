## 1. Implementation
- [x] 1.1 Add `CertificateHtmlEditor` component (HTML/CSS/JS + preview)
- [x] 1.2 Add `buildCertificateHtml` util with variable injection and glare
- [x] 1.3 Integrate Code tab into `admin/CertificateDesigner`
- [x] 1.4 Add download-as-HTML in certificates hook/service
- [x] 1.5 Persist templates to Supabase when available; fallback to localStorage
## 1.6 Add reusable GlarePreview component and styles
 - [x] .preview/.glare CSS with pointer-events:none, mix-blend-mode:screen
 - [x] JS (React effect) updates CSS variables via mouse/touch with rAF

## 2. Validation
- [ ] 2.1 Manual test: edit template and preview updates
- [ ] 2.2 Manual test: download HTML contains rendered data and glare
- [ ] 2.3 Manual test: save/load template via Supabase or fallback

## 3. Documentation
- [ ] 3.1 Update OpenSpec deltas
- [ ] 3.2 Brief usage notes in code comments / component props
