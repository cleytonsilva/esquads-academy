# 🔧 Instruções para Aplicar as Correções

**Data:** 17 de Outubro de 2025  
**Tempo estimado:** 5 minutos

---

## 📋 O Que Foi Corrigido

✅ **Erro crítico:** `getFilteredAchievements is not a function`  
✅ **Erro de iteração:** useSocialChallenges  
✅ **Erros RLS 406:** social_post_likes  
✅ **Erros de query 400:** Múltiplas tabelas  
✅ **Notificações sociais:** Tratamento gracioso de erros  

**Total de arquivos corrigidos:** 7 arquivos  
**Total de correções:** 13 correções

---

## 🚀 Passos para Aplicar

### 1. Aplicar Migração SQL no Supabase

**Opção A: Via Supabase Studio (Recomendado)**

1. Acesse: https://supabase.com/dashboard/project/[SEU-PROJETO]/sql/new
2. Copie todo o conteúdo do arquivo:
   ```
   supabase/migrations/20251017_fix_social_tables_rls.sql
   ```
3. Cole no editor SQL
4. Clique em "Run" (▶️)
5. Aguarde confirmação de sucesso

**Opção B: Via Supabase CLI**

```bash
# Aplicar todas as migrações pendentes
supabase db push

# OU aplicar esta migração específica
supabase db push --file supabase/migrations/20251017_fix_social_tables_rls.sql
```

### 2. Reiniciar Servidor de Desenvolvimento

```bash
# Parar o servidor (Ctrl+C no terminal)
# Reiniciar
npm run dev
```

### 3. Testar a Página de Conquistas

1. Abra o navegador em: `http://localhost:5173/student/achievements`
2. Abra o DevTools (F12)
3. Verifique a aba Console

**Resultado Esperado:**
- ✅ Página carrega sem erros
- ✅ Conquistas são exibidas
- ✅ Filtros funcionam
- ✅ Console limpo (sem erros críticos)

---

## 🧪 Checklist de Validação

Execute este checklist para confirmar que tudo está funcionando:

### Página de Conquistas
- [ ] Página `/student/achievements` abre sem erro
- [ ] Cards de conquistas são exibidos
- [ ] Filtros funcionam (busca, categoria, raridade, status)
- [ ] Estatísticas são exibidas corretamente
- [ ] Badges do usuário aparecem na aba "Badges"
- [ ] Modal de detalhes abre ao clicar em uma conquista

### Componentes Sociais (Opcional)
- [ ] Posts do fórum carregam
- [ ] Curtir/Descurtir funciona
- [ ] Grupos de estudo são listados
- [ ] Desafios são exibidos
- [ ] Busca de usuários funciona

### Console do Navegador
- [ ] Sem erros `getFilteredAchievements is not a function`
- [ ] Sem erros `TypeError: object is not iterable`
- [ ] Sem erros `406` em social_post_likes
- [ ] Sem erros `400` em queries

---

## 🐛 Troubleshooting

### Problema: Migração falha com "relation already exists"
**Solução:** Isso é normal! A migração usa `CREATE TABLE IF NOT EXISTS`, então ela só cria se não existir.

### Problema: Ainda vejo erros 406
**Solução:** 
1. Faça logout e login novamente
2. Limpe o cache do navegador (Ctrl+Shift+Delete)
3. Verifique se a migração foi aplicada com sucesso

### Problema: Erro "user_stats does not exist"
**Solução:** A tabela `user_stats` pode não existir. Verifique se há migração para criá-la ou ajuste as queries.

### Problema: Conquistas não aparecem
**Solução:**
1. Verifique se há dados na tabela `achievements`:
   ```sql
   SELECT COUNT(*) FROM achievements;
   ```
2. Se vazio, execute o seed de dados (se disponível)

---

## 📊 O Que Mudou

### Arquivos Modificados
```
✅ src/hooks/useAchievements.ts
✅ src/hooks/useSocialChallenges.ts
✅ src/hooks/useSocialNotifications.ts
✅ src/components/social/ForumDiscussions.tsx
✅ src/hooks/useStudyGroups.ts
✅ src/hooks/useUserProfile.ts
✅ src/hooks/useCompetitions.ts
```

### Arquivos Criados
```
📄 supabase/migrations/20251017_fix_social_tables_rls.sql
📄 CORRECAO_ERROS_ACHIEVEMENTS.md (este documento)
📄 INSTRUCOES_APLICAR_CORRECOES.md
```

---

## 🎯 Resultados Esperados

### Antes das Correções
```
❌ 50+ erros no console
❌ Página de conquistas quebrada
❌ Sistema social não funciona
❌ Erros RLS bloqueando operações
```

### Depois das Correções
```
✅ Console limpo
✅ Página de conquistas funcional
✅ Sistema social operacional
✅ RLS configurado corretamente
```

---

## 📞 Suporte

Se algo não funcionar após seguir estas instruções:

1. **Verifique o console** para ver a mensagem de erro exata
2. **Leia o documento** `CORRECAO_ERROS_ACHIEVEMENTS.md` para entender as correções
3. **Reverta as mudanças** se necessário:
   ```bash
   git checkout HEAD -- src/hooks/useAchievements.ts
   # ... outros arquivos
   ```

---

## ✅ Confirmação

Após seguir todos os passos, você deve ter:

- [x] Migração SQL aplicada com sucesso
- [x] Servidor reiniciado
- [x] Página `/student/achievements` funcionando
- [x] Console limpo de erros críticos
- [x] Todos os componentes sociais operacionais

**Se todos os itens acima estão marcados, as correções foram aplicadas com sucesso! 🎉**

