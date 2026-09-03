# Migrations — running schema changes against production

This project uses `prisma db push` rather than a migrations folder, which keeps
development fast and puts the entire burden of ordering on whoever runs the
deploy. This file exists so that ordering is written down where it will be read
at the moment it matters, rather than reconstructed from memory.

Read the **Standing rules** before running anything. The **Pending** section at
the bottom is the specific work waiting to go out; delete each entry once it has
been applied to production.

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

## Pending — not yet applied to production

Covers commits `ae00a7c` (home page sections) and `3ebab83` (book shelf and page
names). Everything below has been applied to the development database only.

### Step 1 — rename, by hand, before anything else

```sql
ALTER TABLE "Book" RENAME COLUMN "author" TO "country";
```

The book shelf was repurposed for an architecture practice, where the useful
fact about a code or standard is the jurisdiction it belongs to rather than an
author. Without this step, step 2 will demand `--accept-data-loss` and, if given
it, will delete every author value in the table.

### Step 2 — additive push

```bash
bunx prisma db push
```

No flags. This adds:

| Change | Table | Note |
|---|---|---|
| `BookCategory` enum | — | `GENERAL`, `CODES_AND_STANDARDS` |
| `category` | `Book` | defaults to `GENERAL`, so existing rows stay valid |
| `practiceImage` | `SiteSettings` | nullable |
| `image` | `Philosophy` | nullable |
| `practiceHeadline`, `practiceBody`, `practiceDisciplines` | `SiteSettings` | from `ae00a7c`, if production has not had it yet |

If this asks for `--accept-data-loss`, step 1 did not take. Go back and check.

### Step 3 — clean up the renamed column's contents

After step 1, whatever was in `author` is sitting in `country` — author names in
a country field. They are not valid data any more and there is no automatic way
to convert them.

On the development database there was exactly one row, titled `AIMA` with
`AIMA` repeated in the author field — a leftover from the site's previous life
as a software portfolio — and it was deleted outright rather than migrated.
Production has its own rows: clear or re-enter them through
**Dashboard → Books**, or delete the ones that are stale in the same way.

`scripts/seed-books.ts` was deleted in `3ebab83` and must not be restored to
"fix" this. Its only function was recreating those software titles, and it wrote
author names into what is now the country column.

### Step 4 — redeploy

Only after steps 1 and 2 have completed successfully. See standing rule 3 for
what happens if this runs first.

### Also pending — contact channels

GitHub was removed from the contact channels and replaced with ArchDaily and
Behance. GitHub was a leftover from the site's previous life as a software
portfolio.

The development database was migrated as follows, and production needs the
same. The drop is listed first because it is the destructive half:

```sql
-- Verify it is empty before dropping. It held "" in development; if production
-- holds a real URL, decide what to do with it before running this.
select "github" from "SiteSettings";

ALTER TABLE "SiteSettings" DROP COLUMN IF EXISTS "github";
```

Then a plain, additive push adds `archdaily` and `behance`:

```bash
bunx prisma db push
```

Both new columns default to `""`. `channelsOf()` drops any channel with a blank
href, so they render nothing at all until real URLs are entered through
**Dashboard → Settings** — no empty icon, no dead link.

### Also pending — a data fix, not a schema one

`SiteSettings.linkedin` held a paragraph of prose rather than a URL:

> "Skilled in architectural design, teamwork, leadership, and communication…"

`channelsOf()` treats that field as an href, so the contact page rendered a
link pointing at a sentence. Cleared to `""` in development. **Check production
for the same value** — it was almost certainly entered through the dashboard on
whichever database was live at the time.

---

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
