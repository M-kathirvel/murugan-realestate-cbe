# Workspace instructions

- Use the Next.js App Router, TypeScript, and existing Tailwind v4 setup.
- Keep credentials and session signing in server-only modules; never ship admin authentication logic or secrets to client components.
- Property writes and photo uploads must require the signed admin session. Keep public property reads read-only.
- Property records and login lockouts are stored in SQLite through `lib/database.ts`; preserve parameterized queries and payload validation.
- Runtime data lives in `data/` and `public/uploads/`; do not commit local databases or uploaded customer assets.
- Run `npm run lint`, `npm run typecheck`, and `npm run build` after changes to the app.
