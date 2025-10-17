# Documentação dos Testes - Esquads Academy

## 📋 Visão Geral

Este documento descreve a implementação dos testes unitários para o sistema Esquads Academy, seguindo as regras estabelecidas no sistema e garantindo a qualidade do código.

## 🛠️ Configuração do Ambiente de Testes

### Tecnologias Utilizadas

- **Vitest**: Framework de testes principal
- **@testing-library/react**: Utilitários para testes de componentes React
- **@testing-library/jest-dom**: Matchers customizados para DOM
- **@testing-library/user-event**: Simulação de eventos de usuário
- **jsdom**: Ambiente DOM para testes
- **@vitest/ui**: Interface gráfica para visualização dos testes
- **@vitest/coverage-v8**: Relatórios de cobertura de código

### Estrutura de Arquivos

```
src/
├── test/
│   ├── setup.ts              # Configuração global dos testes
│   ├── utils.tsx              # Utilitários e helpers de teste
│   ├── basic.test.ts          # Testes básicos de validação
│   └── component.test.tsx     # Teste de exemplo de componente
├── components/
│   └── admin/
│       └── __tests__/         # Testes dos componentes admin
│           ├── AdminDashboard.test.tsx
│           ├── UserForm.test.tsx
│           └── UserManagement.test.tsx
└── hooks/
    └── __tests__/             # Testes dos hooks customizados
        ├── useRealtimeUpdates.test.ts
        └── useWebSocket.test.ts
```

## 🧪 Testes Implementados

### 1. Testes de Componentes Admin

#### AdminDashboard.test.tsx
**Localização**: `src/components/admin/__tests__/AdminDashboard.test.tsx`

**Funcionalidades testadas**:
- ✅ Renderização de métricas em tempo real
- ✅ Exibição de KPIs executivos
- ✅ Gerenciamento de alertas do sistema
- ✅ Indicadores de conexão em tempo real
- ✅ Atualização manual de dados
- ✅ Estados de carregamento e erro
- ✅ Interações com alertas (marcar como lido, descartar)

**Mocks utilizados**:
- `useRealtimeUpdates`: Hook para atualizações em tempo real
- `useWebSocket`: Hook para conexão WebSocket

#### UserForm.test.tsx
**Localização**: `src/components/admin/__tests__/UserForm.test.tsx`

**Funcionalidades testadas**:
- ✅ Renderização nos modos criar e editar
- ✅ Validação de formulário (campos obrigatórios, email, telefone)
- ✅ Salvamento com dados válidos
- ✅ Seleção de permissões customizadas
- ✅ Alternância de status ativo/inativo
- ✅ Fechamento e reset do modal
- ✅ Estados de carregamento durante salvamento

**Dados de teste**:
- Departamentos mock
- Funções mock
- Permissões mock
- Usuários mock

#### UserManagement.test.tsx
**Localização**: `src/components/admin/__tests__/UserManagement.test.tsx`

**Funcionalidades testadas**:
- ✅ Renderização da lista de usuários
- ✅ Funcionalidade de busca
- ✅ Filtros por função e status
- ✅ Abertura de modais para criar/editar usuários
- ✅ Salvamento de novos usuários
- ✅ Atualização de usuários existentes
- ✅ Exclusão de usuários
- ✅ Exibição de badges de status
- ✅ Tratamento de lista vazia
- ✅ Estados de carregamento

**Mocks do Supabase**:
- Operações CRUD de usuários
- Busca de departamentos, funções e permissões
- Tratamento de erros

### 2. Testes de Hooks Customizados

#### useRealtimeUpdates.test.ts
**Localização**: `src/hooks/__tests__/useRealtimeUpdates.test.ts`

**Funcionalidades testadas**:
- ✅ Carregamento inicial de dados
- ✅ Configuração de canal em tempo real
- ✅ Atualizações de métricas em tempo real
- ✅ Marcação de alertas como lidos
- ✅ Descarte de alertas
- ✅ Atualização manual de dados
- ✅ Tratamento de erros
- ✅ Limpeza na desmontagem
- ✅ Cálculo de usuários online

#### useWebSocket.test.ts
**Localização**: `src/hooks/__tests__/useWebSocket.test.ts`

**Funcionalidades testadas**:
- ✅ Estados de conexão WebSocket
- ✅ Tratamento de mensagens (métricas, alertas, atividades)
- ✅ Tentativas de reconexão automática e manual
- ✅ Limpeza na desmontagem
- ✅ Mock completo da classe WebSocket

## 🔧 Configuração e Mocks

### Setup Global (setup.ts)

O arquivo de configuração global inclui:

- **Mocks do Supabase**: Cliente mockado com operações básicas
- **Mocks de APIs Web**: WebSocket, matchMedia, ResizeObserver, IntersectionObserver
- **Mocks do Radix UI**: Componentes Select, Dialog, Tabs
- **Variáveis de ambiente**: URLs e chaves de teste

### Utilitários de Teste (utils.tsx)

Fornece:

- **AllTheProviders**: Wrapper com BrowserRouter para componentes
- **customRender**: Função de renderização customizada
- **Factories de dados mock**: Criação de dados de teste consistentes
- **Mocks de hooks**: Implementações mockadas para hooks customizados

## 📊 Scripts de Teste

### Comandos Disponíveis

```bash
# Executar todos os testes
pnpm test

# Executar testes com interface gráfica
pnpm test:ui

# Executar testes uma vez (CI)
pnpm test:run

# Executar testes com cobertura
pnpm test:coverage
```

### Configuração do Vitest

**Arquivo**: `vitest.config.ts`

- **Ambiente**: jsdom para simulação do DOM
- **Setup**: Configuração automática via `src/test/setup.ts`
- **Plugins**: React, tsconfigPaths
- **Cobertura**: Provider v8 com exclusões apropriadas

## 🎯 Padrões de Teste

### Nomenclatura

- **Arquivos de teste**: `*.test.ts` ou `*.test.tsx`
- **Suites de teste**: Nomes descritivos em português
- **Casos de teste**: Começam com "deve" seguido da ação esperada

### Estrutura dos Testes

```typescript
describe('Nome do Componente', () => {
  beforeEach(() => {
    // Setup antes de cada teste
  })

  it('deve realizar ação específica', () => {
    // Arrange
    // Act
    // Assert
  })
})
```

### Mocks e Dados de Teste

- **Dados consistentes**: Uso de factories para criar dados de teste
- **Mocks isolados**: Cada teste tem seus próprios mocks
- **Cleanup**: Limpeza automática entre testes

## 🚀 Execução e Validação

### Testes Básicos Validados

- ✅ Configuração do ambiente funcional
- ✅ Importação e renderização de componentes
- ✅ Mocks do Radix UI funcionais
- ✅ Integração com Testing Library

### Próximos Passos

1. **Cobertura de código**: Implementar relatórios detalhados
2. **Testes de integração**: Adicionar testes end-to-end
3. **Performance**: Testes de performance para componentes críticos
4. **Acessibilidade**: Validação de padrões de acessibilidade

## 📝 Troubleshooting

### Problemas Comuns

1. **Erro de importação de componentes Radix UI**
   - **Solução**: Verificar se todos os exports estão mockados no setup.ts

2. **Falha na configuração de variáveis de ambiente**
   - **Solução**: Usar atribuição direta em vez de Object.defineProperty

3. **Problemas com arquivos de backup**
   - **Solução**: Configurar exclusões no vitest.config.ts

### Logs de Depuração

Para depuração, adicionar `console.debug` nos testes e verificar a saída no navegador ou terminal.

## 📋 Checklist de Qualidade

- [x] Testes unitários para componentes críticos
- [x] Mocks apropriados para dependências externas
- [x] Cobertura de casos de sucesso e erro
- [x] Validação de estados de carregamento
- [x] Testes de interação do usuário
- [x] Documentação completa dos testes
- [ ] Relatórios de cobertura configurados
- [ ] Integração com CI/CD

---

**Responsável**: SOLO Coding  
**Data de Criação**: Janeiro 2025  
**Última Atualização**: Janeiro 2025