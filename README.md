# portfolio-HQ

Portfolio and archive for **Mariem Nasser Elsbelgy** — architecture student at
Modern Academy, graduating 2027. Public sections (Projects, About, Experience,
Identity, Expertise, Philosophy, Recognition, Now, Contact), a standalone
shareable `/portfolio` page, and a private admin dashboard called the
**Pit Wall**.

The site was originally built as a software-engineering portfolio for a
different person and has been progressively rewritten; see DESIGN_NOTES.md for
the design system and MIGRATIONS.md before running any schema change against
production.

Design direction: "Pit Wall / Telemetry" — dark instrument-panel surfaces,
condensed display type, monospaced data readouts.

## Stack

- Next.js 16 (App Router), React 19, TypeScript strict
- Tailwind CSS v4 — all design tokens live in `app/globals.css`
- PostgreSQL via Prisma 7 (driver adapter; connection in `prisma.config.ts`)
- NextAuth v5 — single admin, credentials, JWT. No sign-up route.
- Vercel Blob for uploaded images
- Deployed on Vercel

## Local setup

```bash
bun install
cp .env.example .env.local   # fill in DATABASE_URL and the auth secrets
bun run db:push              # create the schema
bun run db:seed              # create the single admin account
bun run dev
```

## Scripts

| Script | Does |
|---|---|
| `bun run dev` | Next dev server |
| `bun run db:push` | Push the Prisma schema to Postgres |
| `bun run db:seed` | Create/reset the admin account from `ADMIN_EMAIL` / `ADMIN_PASSWORD` |
| `bun run db:import` | One-off import of the legacy Supabase export (see `migration/`) |
| `bun run db:studio` | Prisma Studio |

## Migration status

This project is being re-platformed from a TanStack Start + Supabase build. The
audit, data export and mapping notes live in `migration/`; the import script is
`scripts/migrate-from-supabase.ts` and is deletable once the migration is
verified.

## Admin

Sign in at `/dashboard/login` with the seeded credentials. There is no
registration route and no email-confirmation step — re-running `db:seed`
resets the password.
