# Dana Jo — Graphic Designer Portfolio

A complete, production-ready portfolio website for Dana Jo (graphic designer, 5 years of experience):
**real frontend + backend + database + authentication + image uploads + admin dashboard.** Nothing is mocked.

**Fully bilingual:** every string on the public site *and* in the admin panel exists in English and Arabic.
A language switcher (header, mobile menu, admin topbar, login page) flips the whole site between
`EN` (LTR) and `AR` (RTL, Arabic typography). Content (projects, services, announcements, site text)
can be entered in both languages — Arabic falls back to English wherever a translation is missing.

## What’s inside

| Area | Implementation |
|---|---|
| Public site | Home (hero, work, services, announcements, about, CTA), Work with category filters, project detail pages, Services, About, Contact form, footer with WhatsApp + Facebook — all EN/AR |
| i18n | `lib/i18n.js` dictionaries (every UI string), locale cookie (`dj_lang`), `/lang/:l` switcher, `?lang=` override, `Accept-Language` detection, RTL layout, self-hosted Arabic fonts (Amiri + IBM Plex Sans Arabic) |
| Admin (`/admin`) | Signed-cookie-auth dashboard, fully translated: projects (CRUD + publish/unpublish + cover & gallery uploads), services, announcements, bilingual site-text content, contact-message inbox |
| Database | **Local:** SQLite file (`data/dana.db`) via Node’s built-in `node:sqlite`. **Vercel:** JSON documents in Vercel Blob (`dana-store/*.json`). One async repository API (`lib/store.js`) with two backends — routes never touch SQL directly |
| Auth | bcrypt-hashed admin password, signed cookie session (works on serverless), login rate-limiting. Env is the source of truth: `ADMIN_EMAIL`/`ADMIN_PASSWORD` sync on every boot |
| Uploads | Validated images (JPG/PNG/WebP/GIF, ≤5MB, MIME-checked, randomised names). **Local:** `public/uploads/`. **Vercel:** Vercel Blob. Files are deleted from storage when their record is deleted |
| Design | Warm ivory / deep charcoal / muted sage / soft sand palette, Fraunces + Inter + Amiri + IBM Plex Sans Arabic (all self-hosted, zero external requests), mobile-first responsive (320px → ultrawide), RTL-mirrored layout |

Only **published** projects/services/announcements appear publicly. Drafts stay private.

## Quick start (local)

```bash
cd dana-jo
npm install
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=choose-a-strong-password npm run seed
npm start
# → http://localhost:3000   (admin: http://localhost:3000/admin/login)
```

Environment variables (see `.env.example`):

| Var | Purpose | Default |
|---|---|---|
| `PORT` | HTTP port | `3000` |
| `SESSION_SECRET` | Cookie-session signing secret — **set a long random string in production** | random per boot (sessions invalidate on restart) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Create/reset the admin user on boot (env = source of truth). If `ADMIN_PASSWORD` is unset and no user exists, a strong one is generated and printed **once** to the server log | — |
| `DATA_DIR` | Where `dana.db` lives (local mode) | `./data` |
| `BLOB_READ_WRITE_TOKEN` | Switches storage **and** uploads to Vercel Blob (production mode). Auto-injected when the Blob store is connected to the Vercel project | unset → SQLite + disk |

> Never commit a real `.env`.

## Deploying to Vercel

The app runs as a serverless function (`api/index.js` → Express). Because Vercel’s filesystem is
ephemeral, production uses **Vercel Blob** for both the database (JSON docs) and image uploads —
set automatically when `BLOB_READ_WRITE_TOKEN` is present.

1. Push this repo to GitHub.
2. Create a Vercel project from the repo (framework preset: *Other*).
3. Create a Blob store (Vercel dashboard → Storage → Create → Blob, e.g. `dana-jo-store`) and
   **connect it to the project** — Vercel auto-adds `BLOB_READ_WRITE_TOKEN`.
4. Set env vars: `SESSION_SECRET` (long random string), `ADMIN_EMAIL` (`dana@danajo.design`),
   `ADMIN_PASSWORD` (choose a strong password).
5. Deploy. On first boot the app seeds bilingual default content/services and creates the admin user.

No code changes are needed between local and production — the storage backend is picked by env.

## Admin guide

1. Log in at `/admin/login` (use the language switcher for Arabic).
2. **Projects → New Project**: title, category (drives the public filters), description, cover image,
   gallery images, sort order, publish toggle — **each text field has an English + Arabic input**.
   Only published projects appear on the site.
3. **Services / Announcements**: add, edit, publish/unpublish, delete — bilingual fields; announcements support an optional image.
4. **Site Content**: edit every headline, paragraph and link on the public site in both languages (including WhatsApp/Facebook URLs).
5. **Messages**: read and manage contact-form submissions.

## Project structure

```
server.js            Express app: public routes, admin routes, JSON API, uploads
api/index.js         Vercel serverless entry (wraps the Express app)
vercel.json          Vercel rewrites (all routes → serverless function)
lib/i18n.js          EN/AR dictionaries, t()/tf()/L() helpers
lib/store.js         Repository picker (blob vs sqlite), seeding, admin sync
lib/store-sqlite.js  SQLite backend (local dev)
lib/store-blob.js    Vercel Blob JSON backend (production)
lib/sqlite.js        SQLite connection + schema (incl. _ar columns)
lib/uploads.js       Upload abstraction (disk vs Blob)
lib/content-defaults.js  Bilingual seed content + services
lib/util.js          slugify, cookie parsing, misc
scripts/seed.js      Ensure content + admin user exist (uses env)
views/               EJS templates (public pages + admin dashboard), all t()-translated
public/css/          site.css (public design system + RTL), admin.css
public/js/site.js    Mobile menu, scroll reveals, contact-form validation
public/fonts/        Self-hosted Fraunces + Inter + Amiri + IBM Plex Sans Arabic (woff2)
public/uploads/      Uploaded images, local mode only (git-ignored)
data/dana.db         SQLite database, local mode only (git-ignored)
```

## Verification performed

- All public routes return 200 in EN and AR; `/admin` redirects to login when signed out; unknown routes render a translated 404.
- 87-check Playwright sweep (EN + AR, 320–1440px): zero console errors, zero failed requests, zero horizontal overflow; `lang`/`dir` attributes correct; no English UI strings on Arabic pages and vice versa; Arabic fonts (Amiri / IBM Plex Sans Arabic) load.
- 29-check admin sweep: translated login + errors, bilingual project/service/announcement CRUD, publish/unpublish visibility, category filters localized, contact validation messages in Arabic, inbox flow.
- Login rejects wrong passwords (401); unauthenticated admin POSTs redirect to login.
- Project lifecycle end-to-end: create with Arabic fields + cover + gallery → publish → Arabic title on AR pages / English on EN pages → unpublish → hidden → delete (records **and** files removed).
- Upload guards: >5MB rejected (413), non-image files skipped, filenames randomised.
