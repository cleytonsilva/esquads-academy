# Repository Guidelines

## Project Structure & Module Organization
- `src/` React + TypeScript app: `components/`, `pages/`, `hooks/`, `contexts/`, `services/`, `utils/`, `types/`, `assets/`.
- `api/` Express server (local: `server.ts`, Vercel handler: `index.ts`, routes in `routes/`). Do not modify `api/index.ts` (deployment entry).
- `public/` static assets served by Vite.
- `docs/` project docs; `supabase/` configuration; `.env*` for local env.
- Path alias: `@/` maps to `src/` (example: `import { Toaster } from '@/components/ui/toaster'`).

## Build, Test, and Development Commands
- `pnpm install` install dependencies.
- `pnpm dev` run client (Vite, http://localhost:5173) and API (Express, http://localhost:3001) concurrently.
- `pnpm build` type-check and build client (`tsc -b && vite build`).
- `pnpm preview` serve production build locally.
- `pnpm check` TypeScript no-emit check.
- `pnpm lint` run ESLint across the repo.

## Coding Style & Naming Conventions
- TypeScript, React hooks, 2-space indent, semicolons, single quotes.
- Components: PascalCase files (`FeaturePanel.tsx`) and named/default exports.
- Hooks: `useThing.ts`; utilities/services: camelCase (`cacheService.ts`, `format.ts`).
- Pages in `src/pages/` use PascalCase (`Dashboard.tsx`).
- Prefer `@/` imports over relative ladders.
- Keep types in `src/types/`; validate external data with `zod` when possible.

## Testing Guidelines
- No test runner is configured yet. If adding tests, prefer Vitest.
- Place tests under `src/__tests__/` or alongside files as `*.test.ts(x)`.
- Aim for meaningful unit tests around `services/` and `utils/`.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, etc.
- PRs must include: summary, linked issues, test plan (steps or commands), and screenshots for UI changes.
- Ensure `pnpm lint` and `pnpm check` pass; update `docs/` when behavior changes.

## Security & Configuration
- Use `.env.local` for secrets; never commit real credentials. Configure production vars in Vercel.
- CORS and request limits are set in `api/app.ts`; propose changes via PR.
- Avoid committing large binaries to the repo; place static assets in `public/`.

## Performance & Hygiene
- Prefer route-level code splitting (lazy imports) for heavy pages.
- Remove dead code and unused pages promptly (keep only what is referenced).
- Keep API requests coalesced and cache static data where reasonable.
- Use Supabase Edge Functions for AI/CPU-heavy work to keep UI responsive.
