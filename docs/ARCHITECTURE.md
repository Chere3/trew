# Architecture

## System overview

Trew is a Next.js application with a modular UI system and a lightweight local-first data layer.

```text
Client UI (App Router + components)
        │
        ├── Server Actions / Route Handlers
        │         │
        │         ├── Auth boundary (better-auth)
        │         └── Domain services (lib/*)
        │
        └── Persistence boundary
                  ├── SQLite (local development)
                  └── PostgreSQL (cloud/prod target)
```

## Module boundaries

- `app/`: Route composition and page-level server/client boundaries.
- `components/`: Reusable UI primitives and feature components.
- `lib/`: Cross-cutting concerns (auth client/server helpers, constants, utilities, db client, types).
- `migrations/` + `better-auth_migrations/`: Schema evolution and auth-related migrations.
- `stories/`: Component examples and visual documentation.
- `scripts/`: Operational scripts (migrations, setup helpers).

## Data flow

1. User action originates in UI component.
2. UI calls a Server Action or API route.
3. Boundary layer validates payload and session.
4. Domain logic executes and persists through DB abstraction.
5. Response returns typed data for rendering.

## Auth and security posture

- `better-auth` manages session lifecycle.
- Environment variables stay in `.env.local` (never committed).
- Migrations must be forward-only and reviewed in PR.
- All auth-sensitive routes should verify session server-side.

## Frontend architecture principles

- Keep page components thin; push behavior into composable components/hooks.
- Prefer pure presentational components in `components/` and isolate side effects.
- Define explicit UI states: loading, empty, error, success.
- Reuse design tokens through Tailwind and shared constants.

## Quality gates

Every PR should pass:

- `bun run lint`
- `bun run test`
- `bun run build`

Optional for UI-heavy changes:

- `bun run storybook`
- `bun run test:coverage`

## Risks and mitigation

- **SQLite/Postgres drift** → keep migration strategy documented and deterministic.
- **Auth regressions** → add integration checks around login/session revocation.
- **Component sprawl** → move toward `features/*` organization for domain grouping.

## Next architecture milestones

- Introduce `features/` folders for domain separation.
- Add architecture decision records (ADRs) under `docs/adr/`.
- Add API validation schemas for all route boundaries.
