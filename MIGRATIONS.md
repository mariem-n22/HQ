# Migrations — running schema changes against production

This project uses `prisma db push` rather than a migrations folder, which keeps
development fast and puts the entire burden of ordering on whoever runs the
deploy. This file exists so that ordering is written down where it will be read
at the moment it matters, rather than reconstructed from memory.

Read the **Standing rules** before running anything. **Status** records what has
actually been applied, verified against the live schema rather than assumed from
what a command printed. Re-verify rather than trusting that table if time has
passed — it is a snapshot, not a guarantee.

---

## Standing rules

### 1. `db push` cannot see a rename

Prisma compares the schema file to the live database. It has no history, so a
renamed column looks identical to *one column deleted and a different one
added* — and it will resolve that by dropping the old column and creating the
new one empty. Every value in it is destroyed.

This is what `--accept-data-loss` is warning about. **Passing that flag to get
past a rename is always wrong**: it does not preserve anything, it authorises
the deletion.

Rename by hand first, then push:

```sql
ALTER TABLE "TableName" RENAME COLUMN "old_name" TO "new_name";
```

Once the column already has its new name, `db push` sees a database that matches
the schema and does nothing to it. The rename is preserved and the flag is never
needed.

### 2. If `db push` asks for `--accept-data-loss`, stop

On an additive change — new table, new column, new enum — it will never ask. If
it does ask, the schema and the database disagree about something destructive
and you have not yet done the manual step that reconciles them. Work out what it
wants to drop before going further. Do not pass the flag to make the prompt go
away.

Additive changes are safe to run against a live database at any time: existing
rows take the column default and nothing reads the new field until the new code
is deployed.

### 3. Schema first, deploy second

A running instance holds a Prisma client generated at build time. Deploy code
that expects a column before the column exists and reads come back `undefined`
rather than throwing — so sections that hide when their data is empty will
**silently disappear** instead of erroring. Nothing appears in the logs and the
feature simply looks like it never shipped.

This is not hypothetical; it has happened twice in local development, both times
costing a debugging session before the cause was found. The Practice section on
the home page vanished for exactly this reason.

The order is always:

```
1. manual ALTERs (renames)      ← safe on a live database
2. prisma db push               ← safe on a live database
3. redeploy                     ← the only step visitors can see
```

The same applies locally: **restart the dev server after any schema change**, or
it will keep serving from the client it started with.

### 4. Verify a rename actually landed

```sql
select column_name from information_schema.columns where table_name = 'Book';
```

The new name should be present and the old one absent. Running the `ALTER` twice
errors rather than corrupting anything, so it is safe to check by re-running if
you are unsure.

### 5. Renamed columns keep their old contents

A rename preserves data — which is the point, but it means the values in the
column are now filed under a heading that may no longer describe them. Decide
per column whether the existing contents are still meaningful, and clear or
re-enter them through the dashboard if not. See the `Book.author` case below for
an example where they were not.

---

## Status — verified 2026-09-04

**There is no production deployment.** No `.vercel` directory, no `vercel.json`,
`NEXTAUTH_URL` is localhost, and the fallback URL hard-coded in `lib/seo.ts`
(`portfolio-hq-e8g7.vercel.app`) returns `DEPLOYMENT_NOT_FOUND`. Vercel's own
environment variables cannot be read from this machine, so if a deployment is
created later, whether it points at this database or a new one is a fact that
has to be established then rather than assumed now.

There is therefore exactly one database, and everything below was verified
against it directly — reading `information_schema` and `pg_type` rather than
trusting that a command run earlier had the effect it claimed.

Host: `ep-cool-salad-awmxd8qr-pooler.c-12.us-east-1.aws.neon.tech`

| Change | State |
|---|---|
| `Book.author` → `country` renamed | applied |
| `BookCategory` enum created | applied |
| `Book.category` added | applied |
| `SiteSettings.practiceImage` added | applied |
| `Philosophy.image` added | applied |
| `SiteSettings.practiceHeadline` / `practiceBody` / `practiceDisciplines` | applied |
| `SiteSettings.github` dropped | applied |
| `SiteSettings.archdaily` + `behance` added | applied |
| AIMA book row deleted | applied — 0 book rows |
| `SiteSettings.linkedin` prose cleared | applied — empty |
| Achievement `order` sequenced | applied — 0,1,2,3 |
| BMawy Now entries removed | **no — see below** |

### The BMawy Now entries came back

They were deleted earlier, and two rows carrying the same subjects exist again
with **different ids**, so these are new records rather than a failed delete:

- `BMawy Automobili` — dated 2032-07-21, active, 368 characters of detail
- `BMawy Track` — dated 2028-07-21, active, 388 characters of detail

The earlier pair were inactive with empty `details`. These are active, and the
long prose has been moved into `details` where it belongs, which is the field
working as designed. That pattern reads as someone deliberately re-entering the
content through the dashboard, not an accident or a restore.

**They have deliberately not been deleted again.** The instruction to remove
them referred to specific rows that are already gone; re-deleting content that
someone has since chosen to create would be acting on stale authority.

Two things are worth a decision either way:

- Whether this content belongs on an architecture portfolio at all. A supercar
  factory and a Formula 1 circuit were the reason for removing them the first
  time.
- The dates are 2032 and 2028, both in the future. Whatever is decided about
  the entries themselves, those dates will render as-is.

## If production is ever a separate database

Nothing here has been run anywhere except the database above. If a deployment
is created and pointed at a *different* database, run these in order. Read the
standing rules first — particularly rule 1, because step 1 is the destructive
half and `db push` cannot do it safely on its own.

### Step 1 — renames and drops, by hand

```sql
-- The rename. db push cannot infer it and would drop the column instead.
ALTER TABLE "Book" RENAME COLUMN "author" TO "country";

-- The drop. Check it is empty first; it held "" here.
select "github" from "SiteSettings";
ALTER TABLE "SiteSettings" DROP COLUMN IF EXISTS "github";
```

### Step 2 — additive push

```bash
bunx prisma db push
```

No flags. Adds the `BookCategory` enum, `Book.category`,
`SiteSettings.practiceImage` / `practiceHeadline` / `practiceBody` /
`practiceDisciplines` / `archdaily` / `behance`, and `Philosophy.image`.

If it asks for `--accept-data-loss`, step 1 did not take. Stop and check.

### Step 3 — data

- Book rows: after the rename, old author values sit in `country`. Clear or
  re-enter them. `scripts/seed-books.ts` was deleted and must not be restored
  to "fix" this — it wrote author names into what is now the country column.
- `SiteSettings.linkedin`: check for a pasted paragraph rather than a URL. It
  held one here, and `channelsOf()` renders that field as an href, so the
  contact page shows a link pointing at a sentence.
- Achievement `order`: all rows default to 999, so nothing is sequenced and the
  Recognition section's "first three" is arbitrary until they are.

### Step 4 — redeploy

Only after 1 and 2 succeed. See standing rule 3.

## Open work, not yet started

### Derive `sameAs` from settings instead of the SOCIALS constant

`SOCIALS` in `lib/seo.ts` is a hardcoded array feeding the `Person` schema's
`sameAs` and the profile lines in llms.txt. The contact channels read the same
kind of URLs from `SiteSettings` instead, where they are dashboard-editable.

That is two sources of truth for one fact. The moment a profile URL is entered
in the dashboard and not also added to `SOCIALS` — or the reverse — the
structured data and the visible contact links disagree, and the failure is
silent: nothing breaks, the entity reconciliation just quietly stops working.

The fix is to derive `sameAs` from the settings row so the URL is entered once.
`personSchema()` is currently a synchronous no-argument function called from
server components that already load settings, so it would take the settings (or
the URL list) as a parameter. Contained, but it touches every caller, which is
why it was not folded into the channel swap.

Not urgent. It becomes urgent the first time a real profile URL is added.

### Not included

No route or slug has been renamed. `/skills`, `/business`, `/story` and `/misc`
still have URLs that no longer match their displayed names — that change needs
redirects from the old paths and is deliberately held as a separate decision.
