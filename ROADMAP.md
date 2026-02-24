# ROADMAP

## Quick wins (1-2 weeks)

- [ ] Add `docs/ARCHITECTURE.md` with module boundaries and data-flow diagrams.
- [ ] Add `pnpm` compatibility note or enforce Bun-only in docs/tooling.
- [ ] Add CI workflow for `lint + test + build` on PRs.
- [ ] Add `.env.example` with all required runtime vars.
- [ ] Add smoke E2E check (Playwright) for core chat happy-path.

## Medium bets (2-6 weeks)

- [ ] Stabilize auth + session lifecycle (better-auth hardening, refresh/revoke strategy).
- [ ] Create domain folders (`features/`) to reduce component sprawl.
- [ ] Add database seeding and deterministic local fixtures.
- [ ] Add Storybook visual regression checks.
- [ ] Introduce strict API validation boundaries (zod schemas per route/action).

## Big bets (1-2 quarters)

- [ ] Extract design system into publishable package(s).
- [ ] Introduce observability stack (logs, traces, metrics) for production debugging.
- [ ] Multi-tenant workspace model and role-based permissions.
- [ ] Add offline-first behavior for draft messages and queued actions.

## Strategic rewrites (as needed)

- [ ] Re-evaluate data layer abstraction to support SQLite local + Postgres cloud without drift.
- [ ] Refactor high-churn UI primitives into token-driven architecture for maintainability.
- [ ] Standardize async boundaries (Server Actions vs route handlers) to reduce coupling.

## Validation checklist per milestone

- [ ] Lint/typecheck/tests green.
- [ ] Updated docs and migration notes.
- [ ] Risk notes captured in PR.
- [ ] Rollback strategy documented for DB/auth changes.
