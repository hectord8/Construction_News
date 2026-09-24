# BuildWire

BuildWire is a construction industry news, analysis and materials-pricing site for the UK industry. Next.js 16 app with a PostgreSQL backend and Clerk-managed reader accounts.

## Live URLs

None documented in the repo. `https://buildwire.news` appears in the article JSON-LD (`src/app/articles/[slug]/page.tsx`) but the domain does not resolve (NXDOMAIN at time of writing). The repo contains no committed deployment URL.

## Features

- Editorial site with lead story, trending (last 21 days by view count), category sections, tags and UK regions.
- Full-text search over published articles (Postgres `tsvector` + `websearch_to_tsquery`), filtered by category, region and inclusive date range.
- Material prices tracker: official UK building-materials indices (2015 = 100) with month-on-month, year-on-year deltas, 12-month sparklines and anchored £ estimates.
- Free reader accounts (Clerk): save articles, follow categories, personal dashboard at `/dashboard`.
- Weekly digest newsletter subscriptions and a contact form; both land in the database and are manageable from the admin area.
- RSS import pipeline: 11 industry feeds, per-source category/region mapping, de-duplication by normalized URL and slug, article-body extraction to Markdown, imported as drafts with source attribution.
- Admin studio (`/admin`): manage articles, categories, tags, messages, subscribers, material price anchors.
- SEO: generated `sitemap.xml`, `robots.txt`, `rss.xml` feed, JSON-LD on articles.

## Tech stack

| Layer | Technology | Version |
| --- | --- | --- |
| Framework | Next.js (App Router, React Server Components) | 16.3.0 |
| UI | React | 19.2.8 |
| Language | TypeScript (strict) | 5.9.3 |
| Styling | Tailwind CSS | 4.3.3 |
| Database | PostgreSQL (external; version not pinned in repo) | — |
| ORM | Drizzle ORM | 0.45.2 |
| Migrations | Drizzle Kit | 0.31.10 |
| Postgres driver | `postgres` (postgres.js) | 3.4.9 |
| Auth | Clerk (`@clerk/nextjs`) | 7.6.5 |
| Validation | Zod | 4.4.3 |
| Scraping / parsing | Cheerio (feed + HTML extraction) | 1.2.0 |
| Spreadsheets | `xlsx` (ODS parsing for prices refresh) | 0.18.5 |
| Markdown rendering | react-markdown + remark-gfm | 10.1.0 / 4.0.1 |
| Test / script runner | node:test via `tsx` | 4.23.8 |
| Linting | ESLint + `eslint-config-next` (core-web-vitals, typescript) | 9.39.5 / 16.3.0 |

No `engines` field or `.nvmrc` is committed. `@types/node` targets 20.x — Node 20+ is the safe choice.

## Repository layout

```
.
├── package.json              # Scripts and dependencies
├── next.config.ts            # Empty — no custom config
├── tsconfig.json             # Strict TS, "@/*" path alias → ./src/*
├── postcss.config.mjs        # Tailwind CSS v4 PostCSS plugin
├── eslint.config.mjs         # eslint-config-next core-web-vitals + typescript
├── drizzle.config.ts         # Drizzle Kit → PostgreSQL, schema in src/lib/db
├── AGENTS.md                 # Contributor/agent rules
├── CLAUDE.md                 # Pointer file
├── PHASE_1.md                # Beta-stabilisation notes and verification checklist
├── drizzle/                  # SQL migrations (0000_init.sql … 0004_*)
├── scripts/
│   ├── seed.ts               # Runs migrations, seeds categories/tags/articles (--reset wipes)
│   ├── set-admin.ts          # Promotes an existing user email to role=admin
│   └── refresh-prices.ts     # Downloads ONS ODS from data.gov.uk, upserts material prices
├── src/
│   ├── app/                  # App Router routes, API routes, sitemap/robots/RSS
│   │   ├── api/import/      # GET /api/import — RSS import trigger (Bearer token)
│   │   └── api/track-view/  # POST /api/track-view — increments article view_count
│   ├── components/           # React components (admin/, site/, cards, forms)
│   ├── lib/
│   │   ├── db/               # PostgreSQL client (pool) + Drizzle schema
│   │   ├── queries.ts        # Server-only read queries (articles, search, prices)
│   │   ├── import.ts         # RSS fetch/parse, HTML→Markdown extraction, dedupe
│   │   ├── auth.ts           # Clerk session → app user; admin allowlist logic
│   │   ├── prices.ts         # Material config (ONS series codes, anchors)
│   │   └── validation.ts     # Shared Zod schemas + date-param helpers
│   ├── server/               # "use server" actions: admin actions, reader actions, forms
│   └── proxy.ts              # Next 16 middleware: Clerk route protection + security/CSP headers
└── tests/validation.test.ts  # node:test unit tests for validation helpers
```

## Quick start

No Dockerfile or docker-compose is present, so the fastest path is a local Node + an existing PostgreSQL database:

```bash
npm install

# Create .env (no template is committed — see Configuration reference):
#   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/buildwire"
#   NEXT_PUBLIC_SITE_URL="http://localhost:3000"

npm run db:seed   # applies ./drizzle migrations, then seeds sample content
npm run dev       # http://localhost:3000
```

`db:seed` runs the migrator and the seeder in one command, so it is the single-setup path. Without Clerk keys the site still renders; accounts, dashboard and admin are inert (see below).

## Manual local dev

```bash
npm run dev            # dev server on :3000
npm run build          # production build (npx tsc --noEmit first)
npm run start          # serve the production build
npm run lint           # ESLint
npm test               # node:test suite (tests/*.test.ts) via tsx
npx tsc --noEmit       # type check (not a script — run explicitly)
```

Database commands (all read `DATABASE_URL`):

```bash
npm run db:generate           # drizzle-kit generate — new SQL migration from schema changes
npm run db:migrate            # apply committed migrations in ./drizzle
npm run db:seed               # migrate + seed (loads .env via --env-file=.env)
npm run db:seed:reset         # same, but wipes seeded content tables first — never against prod
npm run db:seed:prod          # migrate + seed using environment DATABASE_URL (no --env-file)
npm run db:set-admin -- <email>  # promote an existing user to admin (they must have signed in once)
npm run db:studio             # Drizzle Studio UI
npm run db:push               # drizzle-kit push — bypasses migrations, prod-unsafe
npm run prices:refresh        # fetch latest ONS ODS from data.gov.uk and upsert material prices
```

The Postgres client (`src/lib/db/index.ts`) is a postgres.js pool of `max: 10`, `idle_timeout: 20`, with a `globalThis` singleton in dev.

## Configuration reference

Resolution logic is taken directly from the code (`src/lib/db/index.ts`, `src/lib/auth.ts`, `src/proxy.ts`, app routes).

| Variable | Required | Resolution / default | Effect if missing |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | Used as-is by all scripts and the app client; `drizzle.config.ts` reads `process.env.DATABASE_URL!` | App throws `DATABASE_URL is not set` at import time (fails to boot); scripts `exit(1)` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` | Yes (for accounts) | Both must be set together; `hasClerkKeys` gates middleware and `getCurrentUser()` | App runs without them but auth is inert: `/dashboard` redirects to `/sign-in`, sign-in/sign-up UI has no session, admin routes unreachable |
| `ADMIN_EMAILS` | No | `(process.env.ADMIN_EMAILS ?? "")` split on commas; role is auto-synced at every request — allowlisted users are promoted to `admin`, delisted users are demoted | No one is an admin regardless of DB role |
| `SCRAPE_API_TOKEN` | For import | Compared as `Bearer ${token}` in `GET /api/import` | Endpoint always returns 401 |
| `NEXT_PUBLIC_SITE_URL` | No | `?? "http://localhost:3000"` in layout metadata, `sitemap.ts`, `robots.ts`, `rss.xml/route.ts`, `share-bar.tsx` | Sitemap, robots, RSS feed and share/copy URLs point at localhost in production |
| `CSP_*` (`CSP_SCRIPT_SOURCES`, `CSP_STYLE_SOURCES`, `CSP_IMG_SOURCES`, `CSP_CONNECT_SOURCES`, `CSP_FONT_SOURCES`, `CSP_FRAME_SOURCES`, `CSP_OBJECT_SOURCES`, `CSP_BASE_URI_SOURCES`, `CSP_FORM_ACTION_SOURCES`) | No | Defaults per directive in `src/proxy.ts`, e.g. script `'self' 'unsafe-inline' 'unsafe-eval'`, img `'self' data: https:`, connect `'self' https://*.clerk.dev`; header is sent in Report-Only mode | Defaults apply |

Unused variables: `CLERK_WEBHOOK_SECRET` and `SCRAPE_POSTCODE` are set in local `.env`/`.env.local` files but no code reads them (no Clerk webhook route exists).

Other security headers are set unconditionally in `src/proxy.ts`: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, HSTS, CSP (report-only).

## API overview

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/import` | Bearer token = `SCRAPE_API_TOKEN` | Runs the RSS import over all sources; inserts new stories as **drafts**; returns `{ imported, results[] }`. `maxDuration = 300` |
| POST | `/api/track-view` | none (public) | Body `{ articleId }` (UUID v4, validated by regex); increments `view_count` only for published articles; `400` on invalid input, `{ ok }` otherwise |

The rest of the mutating surface is Next.js server actions (`src/server/`):

- `toggleSaveArticle(articleId)`, `toggleFollowCategory(categorySlug)` — signed-in readers; scoped to the current user.
- `submitContact(formData)`, `subscribeNewsletter(formData)` — public. Re-subscription after unsubscribe is refused by design.
- `unsubscribeNewsletter(token)` — public, token-scoped (UUID).
- `deleteAccount()` — signed-in; deletes the Clerk identity first and only then local rows; throws visibly if the Clerk deletion fails.
- `saveArticle`, `deleteArticle`, `saveCategory`, `deleteCategory`, `toggleMessageRead`, `deleteMessage`, `unsubscribeSubscriber`, `saveMaterialAnchors`, `refreshPrices` — all `requireAdmin()`. `refreshPrices` does not actually run the data refresh (see gotchas).

## Database schema

PostgreSQL, managed by Drizzle. Migrations live in `drizzle/` (0000–0004). Tables and notable columns:

| Table | Columns (notable) |
| --- | --- |
| `categories` | `slug` PK, `name`, `description`, `order` |
| `tags` | `slug` PK, `name` |
| `users` | `id` UUID PK, `clerk_id` unique, `email`, `name`, `role` (`user`/`admin`), `image_url`, `created_at` |
| `articles` | `id` UUID PK, `slug` unique, `title`, `excerpt`, `body`, `cover_image`, `category_slug` FK, `status` enum, `featured`, `lead_story`, `region`, `source_url` unique, `source_name`, `author_id` FK (nullable), `author_name`, `published_at`, `created_at`, `updated_at`, `view_count`, generated `search_vector` (`to_tsvector`) |
| `article_tags` | `article_id` FK + `tag_slug` FK, composite PK |
| `saved_articles` | `user_id` FK + `article_id` FK, composite PK, `created_at` |
| `followed_categories` | `user_id` FK + `category_slug` FK, composite PK, `created_at` |
| `newsletter_subscribers` | `id` UUID PK, `email` unique, `token` unique, `status`, `created_at` |
| `contact_messages` | `id` UUID PK, `name`, `email`, `subject`, `body`, `is_read`, `created_at` |
| `materials` | `id` UUID PK, `slug` unique, `name`, `category`, `unit`, `source_series` (ONS code), `description`, `order`, `anchor_price`, `anchor_index`, `anchor_period`, `updated_at` |
| `material_prices` | `id` UUID PK, `material_id` FK, `value` numeric, `period` (`YYYY-MM`), `as_of`, `created_at`; unique `(material_id, period)` |

Indexes: category/status/published on `articles`, GIN on `search_vector`, plus per-table user/email/material indexes. Search uses `websearch_to_tsquery('english', …)` ranked by `ts_rank`.

## Checks & CI

Commands the repo actually defines/uses:

```bash
npm test          # node:test suite — currently tests/validation.test.ts (slug, URL, date params)
npm run lint      # ESLint (eslint-config-next core-web-vitals + typescript)
npx tsc --noEmit  # type check
npm run build     # production build — PHASE_1.md requires it before deploying
```

There is no CI: no `.github/` directory and no workflow files are committed. `PHASE_1.md` documents the full pre-deploy gate as `npm test`, `npm run lint`, `npx tsc --noEmit`, then `npm run build`.

## Deployment

- Platform: Railway, per code comments in `src/app/layout.tsx`, `src/app/sitemap.ts` and `src/server/admin.ts` (“Railway's build environment cannot reach the private Postgres hostname”, “handled by Railway cron”).
- No infrastructure-as-code is committed: no Dockerfile, `railway.json`, `vercel.json`, `netlify.toml` or workflow files. Builds rely on platform defaults driven by the standard `build`/`start` scripts.
- Build-time DB access is deliberately avoided: `layout.tsx` and `sitemap.ts` are `force-dynamic` so routes are not prerendered during `next build` (otherwise the build would fail against a private Postgres hostname).
- Production environment variables are set on the platform itself. The repo’s `.env`/`.env.local` are gitignored and hold local-only values (e.g. `NEXT_PUBLIC_SITE_URL="http://localhost:3000"`), so `NEXT_PUBLIC_SITE_URL` must be set to the real public URL on the platform or sitemap/RSS/share links will point at `localhost`.
- Live URL: none documented (see “Live URLs”); the last commits (“Force deploy”, “Publish before prices scraper”) contain no CI or platform config.

## Troubleshooting gotchas

- **Dead domain in JSON-LD.** `mainEntityOfPage` in `src/app/articles/[slug]/page.tsx` is hardcoded to `https://buildwire.news/…`; the domain does not resolve (NXDOMAIN). It is derived from no env var.
- **`refreshPrices` admin action is a stub.** It never runs the refresh — it revalidates paths and tells you to run `npm run prices:refresh` manually. There is no scheduled job in the repo.
- **Re-saving a published article resets `publishedAt`.** `saveArticle` in `src/server/admin.ts` sets `publishedAt = new Date()` on every save of a published article, which can reshuffle article ordering.
- **`db:push` and `db:seed:reset` are footguns.** `drizzle-kit push` bypasses migrations and `db:seed:reset` deletes content tables; `PHASE_1.md` explicitly forbids both against production (apply changes via `db:migrate`).
- **No `.env.example` committed.** `.gitignore` allows one (`!.env.example`) but none exists; new contributors must assemble env vars from the Configuration reference above.
- **Auth is compile-time disabled without Clerk keys.** With no `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`/`CLERK_SECRET_KEY`, middleware skips Clerk and `/dashboard` always redirects to `/sign-in`, which itself cannot establish a session.
- **Import writes drafts only.** `GET /api/import` inserts stories with `status = "draft"`; nothing in the repo auto-publishes them. The RSS category must exist, otherwise stories from that source are skipped.