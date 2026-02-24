# Contributing

## Branch naming

Use conventional prefixes:

- `feat/<topic>`
- `fix/<topic>`
- `refactor/<topic>`
- `chore/<topic>`
- `docs/<topic>`

## Local checks before PR

```bash
bun run lint
bun run test
bun run build
```

## PR expectations

Every PR should include:

1. Clear summary of what changed
2. Why the change is needed
3. Validation steps + results
4. Risks and rollback notes (if relevant)
5. Follow-up tasks

## Docs policy

If behavior, setup, scripts, or architecture changes, update:

- `README.md`
- `ROADMAP.md` (if priorities changed)
- relevant `docs/*` pages
