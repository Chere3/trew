# Trew Architecture

## Purpose
Trew is a production-minded conversational UI platform built on Next.js with a reusable design system and a pragmatic local-first data setup.

## High-level layers

1. **Presentation layer**
   - `app/` routes, layouts, and page composition
   - `components/` design system and feature UI blocks
   - Storybook stories under `stories/` for visual contracts

2. **Application layer**
   - `lib/` utilities and cross-cutting abstractions
   - auth helpers (`lib/auth.ts`, `lib/auth-client.ts`)
   - constants/types shared by routes and components

3. **Data layer**
   - SQLite dev path via `lib/db.ts`
   - Postgres migration scripts in `migrations/`
   - Better Auth migrations in `better-auth_migrations/`

## Module boundaries

- `app/*` should orchestrate; avoid embedding business logic in route files.
- `components/*` should remain UI-first, with domain behavior flowing through explicit props.
- `lib/*` is the boundary for shared logic, adapters, and typed helpers.
- `migrations/*` must remain append-only and reversible.

## Data flow (request lifecycle)

```text
User Action
  -> app route / server entry
  -> validation + auth checks
  -> lib adapters (db/auth/utils)
  -> data persistence / fetch
  -> UI state update + render
```

## Quality gates

- `bun run lint`
- `bun run typecheck`
- `bun run test --run`
- `bun run build`

CI enforces the same baseline for pull requests.

## Known architecture risks

- Potential coupling growth inside `components/` as feature count grows
- Dual database path (SQLite local + Postgres migration target) requires discipline to avoid drift
- Auth flows need regular hardening as product scope expands

## Next architecture milestones

- Introduce feature-oriented folders to reduce horizontal sprawl
- Formalize schema validation boundaries per route/action
- Add smoke E2E for critical conversation flow
