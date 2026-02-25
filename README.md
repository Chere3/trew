# Trew

Production-minded Next.js workspace for building a conversational UI platform and reusable design system.

## What this repo contains

- **Next.js 16 + React 19** app shell
- **Design system** components under `components/`
- **Storybook 10** for visual development
- **Vitest** test setup
- **SQLite + Postgres migration scripts** for local/dev workflows

## Quick start

### 1) Install dependencies

```bash
bun install
```

### 2) Run development server

```bash
bun run dev
```

### 3) Run quality checks

```bash
bun run lint
bun run typecheck
bun run test --run
bun run test:coverage
bun run build
```

Or run the full gate:

```bash
bun run check
```

### 4) Run Storybook

```bash
bun run storybook
```

## Scripts

- `bun run dev` – start Next.js dev server
- `bun run build` – production build
- `bun run start` – run production build
- `bun run lint` – lint project
- `bun run test` – unit/integration tests
- `bun run test:ui` – interactive Vitest UI
- `bun run test:coverage` – coverage report
- `bun run storybook` – Storybook dev server
- `bun run build-storybook` – static Storybook build

## Environment

Create `.env.local` based on `.env.example`.

```bash
cp .env.example .env.local
```

Fill in values according to your auth/database setup.

## Documentation

- Getting started: `docs/GETTING_STARTED.md`
- Architecture notes: `docs/ARCHITECTURE.md`
- Component standards: `docs/COMPONENT_GUIDELINES.md`
- Database migrations: `docs/DATABASE_MIGRATIONS.md`
- Product roadmap: `ROADMAP.md`

## Contributing

See `CONTRIBUTING.md` for branch conventions, checks, and PR expectations.

## License

Currently private/internal. Add an explicit LICENSE before public distribution.
