## Documento de Requisitos do Produto — Esquads Academy Platform (v3 - Baseado no Código Atual)

### 1. Visão Geral do Produto

A **Esquads Academy Platform** é uma plataforma gamificada de ensino técnico, focada em cibersegurança, que alia aprendizado prático com IA, missões, simulados e recompensas. O objetivo é promover uma experiência envolvente e orientada a conquistas, com gamificação invisível e progresso tangível para o aluno.

A plataforma se divide em duas interfaces principais:

* **Admin** (`/admin`) — gerenciamento de cursos, usuários, badges, certificados e supervisão de progresso.
* **Student** (`/student`) — consumo de conteúdo, execução de missões, simulados, acompanhamento de progresso e certificados.

A lógica de gamificação é executada **no backend**, embutida no fluxo da plataforma, e **não deve aparecer como seção de menu separada** (como era o caso da rota `/student/gamification`, que será removida).

---

### 2. Papéis e Acesso

| Papel   | Rota Base  | Permissões                                                                                      |
| ------- | ---------- | ----------------------------------------------------------------------------------------------- |
| Admin   | `/admin`   | Criar e editar cursos, missões, usuários, certificados, badges, relatórios e validações manuais |
| Student | `/student` | Navegar entre cursos, missões, simulados, acompanhar progresso, receber certificados            |

---

### 3. Estrutura de Rotas

#### 3.1 Admin

| Rota               | Função                           |
| ------------------ | -------------------------------- |
| `/admin/dashboard` | Painel geral com indicadores     |
| `/admin/courses`   | Gestão de cursos                 |
| `/admin/users`     | Gestão de usuários               |
| `/admin/badges`    | Criação e edição de badges       |
| `/admin/reports`   | Relatórios e análise de uso      |
| `/admin/validate`  | Validação manual de certificados |

#### 3.2 Student

| Rota                    | Função                                           |
| ----------------------- | ------------------------------------------------ |
| `/student/dashboard`    | Painel com visão de progresso                    |
| `/student/courses`      | Lista e acesso aos cursos                        |
| `/student/missions`     | Execução de missões práticas                     |
| `/student/simulations`  | Simulados teóricos e práticos                    |
| `/student/progress`     | Visualização de badges, reputação e XP acumulado |
| `/student/certificates` | Listagem e download de certificados              |
| `/student/profile`      | Configurações pessoais                           |

---

### 4. Funcionalidades

#### 4.1 Missões com IA

* Terminal interativo embutido (xterm.js)
* Chatbot IA fornece dicas progressivas (nível 1 → 3)
* Backend avalia entrada e saída do aluno conforme critérios
* Eventos são registrados (duração, tentativas, sucesso, falha)

#### 4.2 Simulados

* **Teóricos**: múltipla escolha, verdadeiro/falso, com feedback por questão
* **Práticos (CTF)**: desafios que exigem envio de flags ou ações em ambiente controlado
* Geração automática por IA com ajustes dinâmicos de dificuldade

#### 4.3 Gamificação

* Implementada como serviço de backend (não rota ou página)
* Regras configuráveis para eventos: `missão completa`, `quiz correto`, `feedback positivo`, `abandono de missão`, etc.
* Pontuação automática:

  * XP acumulativo para níveis
  * Reputação que pode subir ou cair
  * Ranking sazonal
* Backend calcula, atualiza e fornece progresso ao frontend via API
* Nenhuma rota de menu chamada "/gamification" — lógica integrada nos módulos e no dashboard do estudante

#### 4.4 Sistema de Conquistas (Badges)

* Tipos: `Progress`, `Achievement`, `Special`, `Milestone`
* Raridades: `Common`, `Rare`, `Epic`, `Legendary`
* Atribuição automática baseada em eventos e regras do sistema
* Revogação automática (reputação negativa, inatividade, fraude)

#### 4.5 Certificados Digitais

* Gerados automaticamente após conclusão e aprovação em curso
* Cursos com CTF exigem validação manual pelo admin
* Incluem PDF, QR Code, e verificação via hash
* Página pública de verificação

#### 4.6 Dashboard do Estudante

* Barra de XP + nível atual
* Conquistas e badges adquiridas
* Missões pendentes
* Simulados sugeridos
* Reputação
* Ranking sazonal
* Recomendações personalizadas via IA (próxima missão ou reforço)

---

### 5. Backend e Serviços Auxiliares

* **GamificationService**

  * `recordEvent(userId, eventType)`
  * `evaluateBadges(userId)`
  * `calculateRanking()`

* **IA Services**

  * `HintAgent`: gera dicas baseadas em progresso
  * `FeedbackAgent`: emite análise personalizada de desempenho
  * `CourseGeneratorAgent`: cria cursos e simulados dinamicamente

* **CertificadosService**

  * `generateCertificate(userId, courseId)`
  * `verifyHash(hash)`

* **ProgressoService**

  * `getStudentSummary(userId)` — usado pelo dashboard

---

### 6. Modelagem de Dados Requerida (Supabase)

| Tabela              | Função                                    |
| ------------------- | ----------------------------------------- |
| `xp_events`         | Histórico de XP ganhos                    |
| `reputation_events` | Eventos que afetam reputação              |
| `user_badges`       | Relacionamento aluno x conquistas         |
| `badge_definitions` | Configuração de badges e regras           |
| `user_rankings`     | Ranking mensal ou trimestral              |
| `missions`          | Banco de missões e critérios de validação |
| `user_missions`     | Progresso do aluno em missões             |
| `simulations`       | Simulados disponíveis                     |
| `user_simulations`  | Progresso do aluno em simulados           |
| `certificates`      | Certificados emitidos                     |

---

### 7. Considerações Finais

* A lógica de gamificação deve ser **invisível para o usuário** e **consumida via dados** integrados ao progresso e ao dashboard.
* O sistema deve manter **separação clara entre rotas admin e student**, com autorização e RLS configuradas adequadamente.
* Missões e simulados devem gerar eventos para o sistema de gamificação.
* O frontend apenas exibe dados consolidados e nunca executa lógica de gamificação diretamente.

---

> Esse PRD reflete a arquitetura real observada no repositório e os ajustes sugeridos para alinhar código, experiência do usuário e escalabilidade técnica.
