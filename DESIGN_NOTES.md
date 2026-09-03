# Mariem N. Elsbelgy — Design Notes (Next.js)

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

`tagline` **is** what is meant by "short description" — it is the only
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

## SEO/GEO research (v8)

Checked against current sources before implementing. Three findings changed
what the brief assumed — flagged rather than silently overridden.

### 1. "Claude-Web" is legacy naming

The brief lists `Claude-Web`. Anthropic's current agents are **ClaudeBot**
(training), **Claude-SearchBot** and **Claude-User** (retrieval), with
`anthropic-ai` as the older name. `Claude-Web` is kept in the allow list —
it costs nothing and may still be sent — but the current names are what
actually matter and were added.

### 2. Training crawlers and retrieval agents are separate opt-ins

The more important distinction the brief does not draw. Blocking GPTBot,
ClaudeBot or Google-Extended stops *training* but not citation; allowing only
OAI-SearchBot, Claude-SearchBot and PerplexityBot keeps citations while opting
out of training. Since the goal here is to be found *and* learned, `robots.ts`
allows both classes, each named explicitly — several of these agents only
honour directives addressed to them by name, not to `*`.

### 3. `llms.txt`: the blockquote is the load-bearing line

Per the spec (Jeremy Howard, 2024) the H1 is the only required element. The
blockquote after it is what generative engines treat as the canonical
one-sentence definition of the entity — so the same sentence is used verbatim
in `lib/seo.ts` as `ONE_LINER`, in the site description, and in `llms.txt`. An
H2 section literally named `Optional` marks content a model may skip under
context pressure; ours holds `/misc` and the link to `llms-full.txt`.

### 4. GEO evidence supports fact density over keyword repetition

The Princeton GEO work and follow-ups find that citations, quotations,
statistics and authoritative phrasing measurably raise inclusion in generated
answers — roughly +30% on position-adjusted word count in the source study —
while keyword stuffing does not. This confirms the brief's own instinct:
`llms.txt` is useful infrastructure, but the leverage is crawlable, fact-dense
HTML plus structured data. Hence concrete names, dates and numbers throughout
`/identity` rather than adjectives.

### 5. A live bug the audit caught

`public/robots.txt` — carried over from the Supabase build — was **shadowing**
`app/robots.ts` entirely. Next serves the static file and errors on the
conflict. The old file allowed Googlebot, Bingbot, Twitterbot and
facebookexternalhit only: **no AI crawler was listed and no sitemap was
referenced.** Deleted.

### Structured data shape

One `@graph` per page rather than separate script tags, so `@id` references
resolve. The site's single entity is `Person` (`#person`) — Mariem Nasser
Elsbelgy — carrying `jobTitle`, `alumniOf` (Modern Academy) and `knowsAbout`.
The home page adds `WebSite` (`#website`) and `ProfilePage` (`#profilepage`),
both pointing at that same `@id`; `mainEntity` on the ProfilePage is what marks
this as a page *about* her rather than one that merely mentions her.

`jobTitle` is "Architecture Student" and not "Architect" on purpose — she
graduates in 2027 and the latter is a protected title in most jurisdictions.

`sameAs` is deliberately absent until real profile URLs exist. It is the field
that reconciles this site with her other presences into one entity, so it is
both the highest-value one here and the one most damaged by a guess.

This replaced an anonymous `Organization` node, which had itself replaced a
developer-portfolio graph of a person and three companies.

## Earlier passes

See git history for the v4–v6 notes (slider peek, staggered experience
timeline, contact rebuild, and the Supabase→Prisma migration audit).
