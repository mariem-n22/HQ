# Mahmoud HQ — Design Notes (Next.js)

Design system: "Pit Wall / Telemetry" — dark instrument-panel surfaces,
Instrument Serif display type, Work Sans body, indigo accent held in `--amber`,
cyan for data readouts. Tokens live in `app/globals.css`. Never hardcode hex.

## Dashboard field audit (v7)

Compiled by reading the actual public pages and shared components in the
pre-migration app (`pitwall-hq/src`), not from the schema alone. Columns:

- **Rendered on** — where the field is actually displayed today
- **Input** — the control the dashboard form must use
- Fields marked **(schema only)** exist but nothing renders them yet
- Fields marked **(new)** were added in this pass because they were missing

### Project — `/work`, `/work/[slug]`, `/portfolio` slider

| Field | Rendered on | Input |
|---|---|---|
| `title` | card + detail | text |
| `slug` | routing | text (auto from title if blank) |
| `tagline` | **card only** — the short description | text |
| `description` | **detail only** — long form | textarea |
| `role` | detail | text |
| `company` **(new)** | detail | text |
| `location` **(new)** | detail | text |
| `period` **(new)** | detail | text |
| `year` | card badge `2024 · SHIPPED` | text |
| `stack` | card + detail chips | tag input |
| `status` | card badge | select BUILDING/SHIPPED/ARCHIVED |
| `emoji` | detail header | text |
| `coverImage` | card + detail | image upload |
| `images[]` (gallery) | detail lightbox | gallery upload |
| `links` | detail (live/github/other) | three labelled URL inputs |
| `featured` | home featured slot | toggle |
| `showOnPortfolio` | `/portfolio` slider filter | toggle |
| `order` | sort | number |

`tagline` **is** what Mahmoud means by "short description" — it is the only
string the card renders, and the detail page renders `description` separately.
Relabelled "Short description (cards)" in the form so this is unambiguous.

`year` and `period` both exist deliberately: the card badge is a compact
`2024`, the detail page wants `Jul 2024 — Nov 2024`. Labelled distinctly.

### Skill — `/skills`, `/portfolio` stack section

| Field | Rendered on | Input |
|---|---|---|
| `name` | row label | text |
| `category` | group heading | select (7 known categories, free text allowed) |
| `level` | `95%` readout + bar width | number 0–100 |
| `icon` | brand mark via `skill-icons.ts` | datalist of known slugs |
| `iconImage` | fallback logo (schema only) | image upload |
| `order` | sort | number |

### Experience — `/story`, `/portfolio` timeline + popup

| Field | Rendered on | Input |
|---|---|---|
| `role` | card title | text |
| `org` | card subtitle | text |
| `period` | card meta row | text |
| `location` | card meta row | text |
| `summary` | **card only** | textarea |
| `description` | **popup only** | textarea |
| `achievements` | popup bullets | lines (one per line) |
| `stack` | popup chips | tag input |
| `image` | popup (schema only) | image upload |
| `order` | timeline order | number |

### IdentityMoment — `/identity`

| Field | Rendered on | Input |
|---|---|---|
| `year` | card meta | text |
| `title` | card title | text |
| `teaser` | **card only** | textarea |
| `description` | **popup only** | textarea |
| `image` | card + popup | image upload |
| `order` | sort | number |

### Venture — `/business`

| `name` | card title | text |
| `description` | card body | textarea |
| `jurisdiction` | card meta | text |
| `status` | card meta | select |
| `image` | card thumbnail | image upload |
| `order` | sort | number |

### MiscEntry — `/misc`

| `title` | card title | text |
| `emoji` | card glyph | text |
| `description` | card body | textarea |
| `image` | card cover | image upload |
| `order` | sort | number |

### NowEntry — `/now` + the telemetry ticker

| `text` | ticker + list | textarea |
| `active` | ticker filter | toggle |
| `date` | list meta, sort key | date |

### Achievement — `/portfolio` achievements grid

| `title` | card title | text |
| `date` | card meta | text |
| `category` | card meta | text |
| `location` | card meta | text |
| `description` | card body | textarea |
| `image` | card cover | image upload |
| `role` | **(schema only)** | text |
| `tags` | **(schema only)** | tag input |
| `order` | sort | number |

### ContactMessage (Inbox) — read-only

Written anonymously by the `/contact` form. Stored: `name`, `email`,
`subject`, `message`, `createdAt`. **There is no read/unread column** — the
brief assumed one. Added `readAt DateTime?` in this pass so the inbox can mark
messages read. No create/edit form: list, mark read/unread, delete.

## Image storage

Uploads go to a **public** Vercel Blob store, and `put()` returns a CDN URL
that is stored in the database verbatim and rendered directly.

An earlier store was provisioned with private access, which forced a
`/api/media/[...path]` read-through proxy: private blobs 403 for anonymous
visitors, so they could not be used in an `<img>` on a public page. That store
was replaced and the proxy deleted — images now come straight off the CDN with
no serverless hop.

Two details worth keeping in mind:

- The token env var is `HQ_READ_WRITE_TOKEN`, not the SDK's default
  `BLOB_READ_WRITE_TOKEN`, so it is passed to `put()` explicitly.
- `Frame` (public pages) renders a plain `<img>`, so the CDN URL works with no
  further configuration. The dashboard's `ImageField` uses `next/image`, which
  *does* require the blob host in `images.remotePatterns` — the wildcard
  subdomain there is store-specific and changes if the store is recreated.

## Earlier passes

See git history for the v4–v6 notes (slider peek, staggered experience
timeline, contact rebuild, and the Supabase→Prisma migration audit).
