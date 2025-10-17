# Padrões VibeCheck

Guia prático para segurança nula, consistência de dados e resiliência na UI.

## Objetivos
 - Evitar `TypeError` por acesso a campos nulos/indefinidos
 - Padronizar normalização de perfil de usuário
 - Proteger operações com arrays (`.length`, `.join`, `.map`, `.filter`)
 - Aplicar fallbacks e cache com TTL razoáveis

## Utilitários centrais

Arquivo: `src/utils/vibeCheck.ts`

- `safeArray(value)`: garante um array seguro (fallback `[]`).
- `hasItems(arr)`: checa rapidamente se há elementos.
- `compact(arr)`: remove `null`/`undefined` no array.
- `uniq(arr)`: remove duplicatas.
- `safeJoin(arr, sep)`: junta valores com separador de forma segura.
- `safeString(v, fallback)`: garante uma string definida.
- `safeNumber(v, fallback)`: garante um número válido (não `NaN`).
- `normalizeUserProfileData(data)`: normaliza o perfil com tipos seguros, mantendo listas como arrays.

## Perfil de usuário

Ao ler dados de `user_profiles` ou `users`, sempre normalizar:

```ts
import { normalizeUserProfileData } from '@/utils/vibeCheck'

const profile = normalizeUserProfileData(row)
```

Regras:
- Arrays potencialmente nulos devem ser convertidos com `safeArray`.
- Campos opcionais numéricos devem ser verificados com `typeof === 'number'`.
- Strings opcionais devem usar `safeString` quando for importante evitar `undefined`.

## Recomendações e filtros

Ao excluir cursos completados no filtro SQL:

```ts
import { safeArray, safeJoin } from '@/utils/vibeCheck'

const completedIds = safeArray(profile.completed_courses)
const list = safeJoin(completedIds.map(String))
if (list) {
  query = query.not('id', 'in', `(${list})`)
}
```

## Cache e TTL

Utilizar `src/utils/cache.ts` com `cacheWithFallback` e chaves padronizadas.
Mensagens de log:
- `📦 Cache hit for key: ...`
- `🔄 Cache miss for key: ...`

Recomendações:
- Perfil do usuário: TTL curto (2–5 min) para frescor.
- Cursos populares: TTL médio (10 min).

## UI Resiliente

Componentes devem usar `ErrorBoundary` (`src/components/ui/ErrorBoundary.tsx`) com fallbacks elegantes.
- Registrar erros no console em desenvolvimento.
- Oferecer opções de re-tentativa e navegação segura.

## Boas práticas de logs

- Prefixar operações críticas com emojis e contexto.
- Evitar spam: logar apenas transições de cache (hit/miss) e erros.

## Checklist de adoção

1. Importar utilitários do `vibeCheck.ts` ao lidar com dados incertos.
2. Normalizar perfil de usuário sempre que vier do banco.
3. Proteger `.join` e `.length` em arrays potencialmente nulos.
4. Usar `cacheWithFallback` nas consultas frequentes.
5. Testar no Dashboard e verificar console sem `TypeError`.