# Contributing

## Development

1. Fork or clone the repository.
2. Copy `.env.example` to `.env` and set local values.
3. Run `npm install`, `npm run db:push`, and `npm run db:seed`.
4. Start the app with `npm run dev`.

## Pull requests

- Keep changes focused and described clearly.
- Do not commit `.env`, database files, or secrets.
- Run `npm run lint` before opening a pull request.
- Update docs when behavior or setup steps change.

## Code style

- TypeScript and React (App Router)
- Prefer existing patterns in `src/` for UI, i18n, and API routes
