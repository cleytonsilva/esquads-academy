## Documento de Requisitos do Produto — Esquads Academy Platform (v2)

### 1. Visão Geral do Produto
A **Esquads Academy Platform** é uma plataforma de e-learning gamificada, voltada para formações técnicas com foco inicial em cibersegurança. Integra IA, gamificação, missões práticas, simulados e certificações com uma experiência interativa e personalizada.

A plataforma se divide em dois ambientes principais:
- **Admin**: gerenciamento de cursos, usuários, gamificação, IA e relatórios.
- **Estudante**: trilhas de aprendizado, simulações práticas, área social, sistema de conquistas e certificados.

---

### 2. Papéis de Usuário

| Papel        | Registro                 | Permissões                                                                 |
|--------------|--------------------------|----------------------------------------------------------------------------|
| Admin        | Convite interno          | Gerencia tudo: cursos, usuários, badges, IA, certificados, relatórios     |
| Estudante    | E-mail ou convite        | Consome conteúdos, completa missões, participa de simulações e interações |

---

### 3. Funcionalidades Gerais

#### 3.1 Módulos Principais

1. **Dashboard Admin**: analytics em tempo real, notificações, insights de uso
2. **Gestão de Cursos**: editor modular, controle de versão, pré-requisitos
3. **Ambiente de Missões**: terminal interativo + IA com hints progressivas
4. **Simulador de Provas**: modo teórico e prático (CTF), com feedback
5. **Gamificação**: sistema de pontos, XP, badges, conquistas e ranking
6. **Sistema de Certificados**: emissão automática, PDF, validação digital
7. **Geração de Cursos IA**: assistente que cria trilhas completas com avaliações e visuais
8. **Social Learning**: fóruns, grupos de estudo, rankings colaborativos

---

### 4. Missões com IA

#### 4.1 Estrutura de Missões
- Terminal no estilo "hacker" com fundo escuro
- Missão tem início, meio e fim com checkpoints
- Chatbot IA guia com dicas progressivas
- Avaliação automatizada por critérios de sucesso

#### 4.2 Exemplo de Missão
```json
{
  "titulo": "Protegendo uma API com Rate Limiting",
  "entrada": "curl requests",
  "meta": "Usar express-rate-limit para bloquear após 10 requisições/min",
  "hints": [
    "Considere o volume de requisições numa API pública.",
    "Você conhece algum middleware de segurança para isso?",
    "Explore express-rate-limit com windowMs: 60000, max: 10"
  ],
  "validacao": "Middleware implementado corretamente com resposta de erro",
  "badge": "Network Defender - Rare"
}
```

---

### 5. Simulados

#### 5.1 Modos Disponíveis
- **Teórico**: múltipla escolha, verdadeiro/falso, adaptativo por IA
- **Prático/CTF**: sandbox com desafios técnicos reais

#### 5.2 Geração Automática
- A IA gera questões com base nos tópicos da trilha
- Nível adaptável à performance do aluno
- Feedback pedagógico individual por resposta

---

### 6. Sistema de Gamificação Dinâmica

#### 6.1 Elementos
- **XP**: progresso acumulativo (subida de nível)
- **Reputação**: score social que pode subir ou cair
- **Níveis**: desbloqueiam conteúdos, badges e simulações avançadas
- **Ranking Sazonal**: recompensas mensais e destaque público

#### 6.2 Tabela de Pontuação

| Ação                                      | XP     | Reputação | Badge               |
|------------------------------------------|--------|-----------|---------------------|
| Finalizar aula com quiz 100%             | +50    | +5        | -                   |
| Completar missão IA                      | +120   | +10       | Pode desbloquear    |
| Ser avaliado positivamente em fórum      | +20    | +5        | -                   |
| Gabaritar simulado                       | +150   | +10       | Simulated Hero      |
| Abandonar missão                         | 0      | -10       | -                   |
| Ser denunciado por trapaça/spam          | -50    | -25       | Suspensão Temporária|

#### 6.3 Reputação
- Varia de -100 a +100
- Abaixo de -30: bloqueio parcial de funções sociais
- Acima de +70: selo "Mentor da Comunidade", acesso antecipado

#### 6.4 Ranking Sazonal
- Baseado em: XP + badges + simulados + reputação
- Recompensas: certificado, destaque no feed, badge exclusiva

---

### 7. Sistema de Conquistas

#### 7.1 Tipos
| Tipo        | Exemplo                                |
|-------------|-----------------------------------------|
| Progress    | "Concluir 5 módulos"                   |
| Achievement | "Gabaritar simulado em 3 trilhas"      |
| Special     | "Evento de Outubro - CTF Hackerween"   |
| Milestone   | "Finalizar 10 cursos com certificado"  |

#### 7.2 Raridade

| Raridade   | Cor                             |
|------------|----------------------------------|
| Common     | #6B7280                          |
| Rare       | #06B6D4                          |
| Epic       | gradiente #8B5CF6 → #EC4899      |
| Legendary  | gradiente #F59E0B → #EF4444      |

#### 7.3 Regras de Perda
- Badges de reputação podem ser revogadas
- Badges sazonais desaparecem após inatividade > 60 dias
- Certificados fraudulentos removem conquistas associadas

#### 7.4 Interface
- Cards com status: conquistado / disponível / revogado
- Filtros por categoria e raridade
- Animações ao conquistar (som, brilho, fade-in)
- Notificações no dashboard e email

---

### 8. Certificados
- Emissão automática ao final de cursos com aprovação
- Compartilháveis com LinkedIn
- QR Code e hash digital de verificação
- Estatísticas: horas estudadas, notas médias, instrutores

---

### 9. Barra Lateral do Estudante
```
📊 Dashboard
📚 Cursos
🧠 Missões
🧪 Simulados
🏆 Conquistas
🎓 Certificados
🧑‍💻 Perfil
```

---

### 10. Design e Estilo
- **Fonte**: Inter, Roboto Mono
- **Cores principais**: #1E40AF, #3B82F6, #60A5FA
- **Estilo**: cards com sombras suaves, layout responsivo
- **Ícones**: Lucide React, outline, 20px padrão
- **Gamificação**: cores específicas por badge, transições suaves, responsividade mobile-first

---

### 11. Fluxos de Usuário

#### Estudante:
1. Acessa dashboard
2. Visualiza progresso, cursos, conquistas
3. Faz missão ou simulado
4. Recebe XP, badge, certificado
5. Ranking atualizado

#### Admin:
1. Acessa analytics
2. Cria cursos com IA
3. Valida conteúdo
4. Gera relatórios e rankings
5. Garante moderação e justiça no sistema

---

Seções futuras podem incluir:
- Integração com Supabase/Auth
- Painel de IA para criar quizzes contextuais
- Loja de skins com tokens simbólicos
- API pública para organizações parceiras

