# Configuração do GitHub para Esquads Academy

## Passo 1: Criar repositório no GitHub

1. Acesse [github.com](https://github.com) e faça login
2. Clique no botão "+" no canto superior direito
3. Selecione "New repository"
4. Configure:
   - **Repository name**: `esquads-academy`
   - **Description**: `Plataforma de aprendizado em cibersegurança com gamificação e IA`
   - **Visibility**: Public ou Private (sua escolha)
   - **NÃO** marque nenhuma opção adicional (README, .gitignore, license)

## Passo 2: Conectar repositório local

Após criar o repositório, execute os comandos abaixo substituindo `SEU_USUARIO` pelo seu username do GitHub:

```bash
# Adicionar repositório remoto
git remote add origin https://github.com/SEU_USUARIO/esquads-academy.git

# Fazer push do código
git push -u origin main
```

## Passo 3: Verificar upload

Após executar os comandos, verifique se o código foi enviado corretamente acessando:
`https://github.com/SEU_USUARIO/esquads-academy`

## Informações do projeto

- **555 arquivos** foram commitados
- **121.150 linhas** de código
- **Tecnologias**: React, TypeScript, Supabase, TailwindCSS, Shadcn UI
- **Funcionalidades**: Sistema de autenticação, gamificação, certificados, missões de cibersegurança

## Estrutura principal

- `src/` - Código fonte da aplicação React
- `api/` - API backend com Express
- `supabase/` - Migrações e funções do banco de dados
- `docs/` - Documentação técnica
- `openspec/` - Especificações do projeto
