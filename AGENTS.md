<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

## Notas específicas do projeto (Esquads Academy)

- Referência principal: `openspec/AGENTS.md` e `openspec/project.md`
- Documentos de contexto: `.trae/documents/PRD_Esquads_Academy_Platform.md`, `.trae/documents/Arquitetura_Tecnica_Esquads_Academy.md`, `.trae/documents/Plano_Implementacao_Tecnica_Esquads.md`

### Comandos essenciais
- `openspec spec list --long` — listar capacidades atuais
- `openspec list` — listar propostas de mudança
- `openspec validate <item> --strict` — validar propostas e specs
- `openspec diff <change-id>` — ver diferenças das deltas

### Fluxo
- Planeje e crie propostas em `openspec/changes/<id>/`
- Escreva deltas por capacidade em `specs/<capability>/spec.md`
- Valide e obtenha aprovação antes de implementar