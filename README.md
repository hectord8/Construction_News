# BuildWire

BuildWire is a construction industry news, analysis and materials-pricing site for the UK market. Built with Next.js, React and PostgreSQL.

> There is no live deployment yet — this runs locally. The repo contains no release URL or deployment config.

## Features

- Editorial site with lead stories, trending sections, categories, tags and UK regions.
- Full-text search across published articles.
- Material prices tracker: UK building-materials indices (2015 = 100) with month-on-month and year-on-year changes, refreshed from the ONS data published on data.gov.uk.
- Free reader accounts (Clerk): save articles, follow categories, personal dashboard.
- Weekly digest newsletter subscriptions and a contact form.
- RSS import pipeline: pulls stories from 11 industry feeds as drafts, with source links.
- Admin studio (`/admin`): manage articles, categories, messages, subscribers and price data.

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js (App Router) 16, React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL with Drizzle ORM |
| Auth | Clerk |
| Validation | Zod |
| Data tooling | Cheerio (RSS/HTML), `xlsx` (price spreadsheets) |

## Getting started

Requires Node 20+ and a PostgreSQL database.

```bash
npm install

# create .env with:
#   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/buildwire"

npm run db:seed   # applies migrations and seeds sample content
npm run dev       # http://localhost:3000
```

Without Clerk keys the site still runs, but accounts and the admin area are disabled. To enable them, add to `.env`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
ADMIN_EMAILS="you@example.com"
```

Other useful scripts:

```bash
npm run db:migrate        # apply committed migrations
npm run db:set-admin -- <email>   # promote a user to admin (must have signed in once)
npm run prices:refresh    # update material price data from data.gov.uk
npm test                  # run tests
npm run lint              # lint
npm run build             # production build
```

## Project layout

- `src/app/` — pages and API routes
- `src/components/` — React components
- `src/lib/` — database client + schema, queries, auth, RSS import, validation
- `src/server/` — server actions (forms, admin, reader actions)
- `scripts/` — seed, admin, price refresh scripts
- `drizzle/` — SQL migrations

## Deployment

No live deployment at the moment. The code was built with Railway in mind (see comments in `src/app/layout.tsx`), but no Dockerfile or platform config is committed. To deploy, point the platform at this repo's standard `build`/`start` scripts and set the env vars above, including `NEXT_PUBLIC_SITE_URL` set to the real public URL.