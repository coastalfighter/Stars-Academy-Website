# STARS Academy — 3D scroll website

A redesign of the [STARS Academy](https://www.mystarsacademy.org) site: a pediatric developmental
day treatment program in Batesville, Arkansas (speech, occupational and physical therapy, licensed nursing and
developmental classrooms for children from birth to age 6).

The home page tells the STARS story as **one continuous 3D scroll**, built on the program's own words:

| Chapter | Copy (from the current site) | 3D scene |
|---|---|---|
| `hero` | "Therapy, learning and care … woven into one full day." | The STARS star (one point per discipline), with soft toy blocks around it |
| `care` | "Not a daycare. Not a therapy clinic. Both, working as one." | Classroom, therapy and nursing spheres come together; the glowing core is the child |
| `day` | "What 'one full day' actually looks like." | A sun crosses a 7:00 a.m. → 3:00 p.m. arc; a live clock and timeline follow it |
| `services` | "Everything your child needs, under one roof." | The active discipline's star point lifts and turns to the top, synced with the list |
| `approach` | "Calm adults help children calm." | A slow breathing orb (8 s cycle) with four companions, one per principle |
| `stars` | "We build it one block at a time." | Lettered blocks land one by one to spell **S·T·A·R·S** |
| `visit` | "Walk through the door." | The star returns in gold |

## Pages

| English | Spanish | Purpose |
|---|---|---|
| `/` | `/es` | The 7-chapter 3D scroll story |
| `/services`, `/services/[slug]` | `/es/servicios`, `/es/servicios/[slug]` | Overview + 5 statically generated discipline pages |
| `/approach` | `/es/nuestro-enfoque` | The six ideas behind STARS' care |
| `/about-us` | `/es/sobre-nosotros` | Story, name, vision, values, facilities |
| `/getting-started` | `/es/como-empezar` | Fit, eligibility, funding, steps, enrollment inquiry form |
| `/families` | `/es/familias` | Hours, absences, transport, health, kindergarten, who to contact |
| `/faq` | `/es/preguntas-frecuentes` | All questions by audience (FAQPage structured data) |
| `/contact-us`, `/schedule-a-tour` | `/es/contacto`, `/es/programar-visita` | General contact and tour requests |
| `/privacy`, `/accessibility`, `/nondiscrimination` | `/es/privacidad`, `/es/accesibilidad`, `/es/no-discriminacion` | Policy pages |
| `/enroll` | `/es/inscripcion` | Four-question eligibility check (browser-only), then the secure enrollment form |
| `/events` | `/es/eventos` | Upcoming events (CMS), add-to-calendar `.ics`, schema.org `Event` data |
| `/resources` | `/es/recursos` | Family resource library by topic, with language-aware PDFs and links |
| `/team` | `/es/equipo` | Roles, plus staff by team (CMS), bilingual staff marked |
| `/photos` | `/es/fotos` | Gallery with an accessible `<dialog>` viewer; consented photos only |
| `/referrals`, `/careers`, `/careers/apply` | — (English only) | Physician/school referrals; jobs |

Secondary pages share one hero: breadcrumbs (with `BreadcrumbList` JSON-LD) and a small interactive 3D STARS
star. On a service page, that service's point of the star lifts and lights up. The star only renders while it's
on screen, and in Calm mode it's a static SVG.

## Key decisions

- **Native scroll, not scroll-jacking.** Lenis smooths the real scroll position, so keyboard use, find-in-page,
  anchors and screen readers all keep working. Scroll position becomes a continuous *chapter progress* value
  (`src/lib/scroll/timeline.ts`) that every 3D object reads each frame, so the scene is deterministic and unit-tested.
- **Sensory-friendly "Calm mode".** STARS describes its care as sensory-informed and neuroaffirming, so the site is
  too. Calm mode follows the OS *reduce motion* setting and can be switched on in the header. It removes the WebGL
  scene, smooth scrolling and animation, and swaps the pinned sections for plain, readable lists. Devices without
  WebGL get the same fallback automatically.
- **No PHI through the website.** The inquiry form collects contact details only. It shows a clear notice,
  requires a confirmation checkbox, and its shared zod schema rejects text that looks like a date of birth, a
  Social Security number or an insurance/member number, on the client and again on the server.
- **Nothing invented.** All copy comes from the current site. Items the client hasn't confirmed live in
  [`docs/CONTENT-CHECKLIST.md`](docs/CONTENT-CHECKLIST.md) instead of appearing as placeholders.
- **Brand continuity.** Navy, star gold and berry come from the existing STARS mark; calm teal, sky and sand
  support them. Every text color pairing was checked for WCAG AA contrast.
- **One form pipeline, many contexts.** Enrollment, referral, job-interest and general contact forms are all
  presets of one `InquiryForm` backed by one zod schema and one hardened API route. Fields appear only when they're
  relevant: child age band and "has a doctor?" for families, organization for physicians and schools, role and
  start date for applicants.
- **No file uploads.** Résumés go through STARS' existing Adobe Sign employment application, so the website never
  has to receive, scan or store documents.
- **Old URLs keep working.** `/speech-therapy`, `/nursing` and the other old service URLs 308-redirect to `/services/*`.

## Languages (English & Spanish)

The Spanish site covers everything a family needs. Referral-partner and careers pages stay English-only: Spanish links to them say "(en inglés)", carry `hreflang="en-US"`, and are left out of the hreflang pairs.

- **One root layout per language.** `src/app/(en)` and `src/app/(es)` are route groups, each with its own root
  layout. That way `<html lang="en-US">` or `<html lang="es-US">` is correct in the server-rendered HTML
  (WCAG 3.1.1, screen-reader pronunciation and search engines), and pages stay statically generated. URLs that
  match no route get a bilingual `global-not-found` page.
- **Views are shared.** Each page is a single component in `src/views/` that takes a `locale`. The files in
  `src/app/(en)` and `src/app/(es)` are thin wrappers that only add metadata.
- **One route map.** `src/i18n/routes.ts` lists every page's address in each language. The language switcher,
  hreflang alternates, the sitemap and a route-integrity test all read from it.
- **Type-checked translations.** Spanish copy must `satisfies Widen<typeof en>`, so a missing or extra key is a
  compile error. Page copy lives in `src/content/copy/<page>.ts` with English and Spanish side by side, which makes
  line-by-line review easy. Shared facts and lists are in `src/content/es/`. Tests fail if a Spanish string still
  equals its English source.
- **The forms speak both languages.** zod issues are *codes* (`src/i18n/messages.ts`), translated in the browser
  and on the server. The API replies in the language of the page that sent the form. The PHI guard recognizes
  Spanish ("fecha de nacimiento", "seguro social", "número de Medicaid"), and staff emails show which language
  version of the site an inquiry came from.
- **Register.** Formal *usted*, neutral U.S. Spanish, and clinical terms in common U.S. pediatric usage. The
  organization's name and acronym (Striving To Achieve Real Success) stay in English and are marked `lang="en-US"`,
  with a Spanish gloss.

> **Before launch:** the Spanish text must be reviewed by a qualified health-care translator, and the official
> Spanish USDA nondiscrimination statement must replace the provisional translation. See the content checklist.

## Content management (Sanity)

Staff edit the content that changes most often in a hosted Sanity Studio
(`studio/`, deployed free at `stars-academy.sanity.studio`). See the
[staff guide](docs/EDITOR-GUIDE.md).

| In the CMS (bilingual) | Where it appears |
|---|---|
| Announcements & closures | Banner on every page (most important first, dismissible), Current Families page |
| FAQs | FAQ page, Getting Started, Current Families, Referrals, Careers, Nursing |
| Job openings (English) | Careers |
| Leadership | About |
| Family testimonials (consent required) | Home ("In families' words") |
| Contact details: fax, email, STARS Academy South | Contact, About |

Long-form page copy stays in code, where it is reviewed and translation-checked.

**How it works**

- **No SDK in the site bundle.** `src/cms/client.ts` sends GROQ queries over Sanity's HTTP API and validates
  every response with zod (`src/cms/schemas.ts`). CMS data is treated as untrusted: text is length-bounded, enums
  are checked, links are limited to http(s)/tel/mailto/site paths, and invalid items are dropped one at a time.
- **The bundled content is always the fallback.** If the CMS isn't configured, returns an error, or times out
  (5 s), the repositories in `src/cms/repository.ts` return the content in `src/content`. A CMS outage can't take
  the site down.
- **Pages stay static.** Reads use `force-cache` with a cache tag per document type. Publishing triggers a
  signed webhook to `POST /api/revalidate` (HMAC-SHA256, replay window 5 min), which refreshes only that tag.
  Announcements use `{ expire: 0 }`, so a closure shows on the very next request; everything else refreshes in
  the background. Safety nets: announcements revalidate every 5 min (start/end times), everything else hourly.
- **Preview without shared secrets.** The Studio's "Preview on website" action writes a one-hour random secret
  under a private document path (only signed-in editors can, and public reads can't see it). The site checks the
  secret server-side with `SANITY_READ_TOKEN`, then enables Next.js draft mode. Redirects are limited to site paths.
- **Healthcare guardrails in the editor.** Testimonials can't be published without consent on file. Text that
  looks like PHI triggers a warning. A missing Spanish translation triggers a warning, and the site falls back to
  English with `lang="en-US"`.

**Setup (one time)**

1. Create a free project at sanity.io/manage. In `studio/`, copy `.env.example` to `.env`, then run
   `npm install` and `npm run deploy`.
2. Import today's content: from the repo root, run `npm run cms:seed`; then in `studio/`, run
   `npx sanity dataset import seed/content.ndjson production`.
3. In Sanity → API: add a **viewer** token (`SANITY_READ_TOKEN`), a CORS origin for the Studio, and a webhook
   (POST `https://<site>/api/revalidate`, projection `{_type, _id}`, secret = `SANITY_WEBHOOK_SECRET`; trigger on
   create, update and delete).
4. Set `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_READ_TOKEN` and `SANITY_WEBHOOK_SECRET` on the host, then
   redeploy once.

The Studio's `npm audit` lists advisories in Sanity's CLI build tooling (zip, YAML and TOML parsers). These run
only on a developer machine during `sanity build/deploy` and aren't part of the deployed Studio or the website
(which audits clean).

## Stack

Next.js 16 (App Router, TypeScript strict) · React 19 · Tailwind CSS v4 · three.js + React Three Fiber + drei ·
Lenis · zod · Vitest + Testing Library · Playwright + axe-core · Lighthouse CI · GitHub Actions.

## Project structure

```
.
├── .github/workflows/ci.yml         # quality → E2E + Lighthouse; Studio checks
├── .github/workflows/preview-e2e.yml  # E2E against every Vercel preview
├── .github/workflows/uptime.yml     # production probe every 30 min
├── .github/workflows/content-links.yml  # weekly resource link check
├── .github/workflows/launch-verify.yml  # launch check after every production deployment
├── docs/OPERATIONS.md               # monitoring setup + incident runbook
├── docs/ANALYTICS.md                # website insights: staff guide, QR/UTM tagging, privacy model
├── docs/PHI-INTEGRATIONS.md         # secure enrollment, referrals and text alerts: rules, vendors, setup
├── docs/LAUNCH.md                   # Wix → Vercel launch runbook (DNS, email, rollback, decommission)
├── docs/ACCESSIBILITY-AUDIT.md      # protocol for sessions with assistive-technology users
├── docs/CONTENT-CHECKLIST.md        # facts awaiting client confirmation
├── docs/EDITOR-GUIDE.md             # plain-language guide for clinic staff
├── studio/                          # Sanity Studio (separate package) + seed/content.ndjson
├── scripts/export-cms-seed.ts       # bundled content → CMS seed
├── scripts/e2e-build.mjs            # builds the site and its CMS-enabled twin for E2E
├── scripts/uptime-check.mts         # dependency-free production probe
├── scripts/check-links.mts          # weekly check of the resource library's external links
├── e2e/                             # Playwright specs, fixtures (mock Sanity, webhook receiver)
├── public/                          # favicon + client photography
├── src/
│   ├── app/
│   │   ├── api/inquiry/route.ts     # POST endpoint (delegates to lib/inquiry/handler)
│   │   ├── api/{health,csp-report,client-error}/  # monitoring endpoints
│   │   ├── global-error.tsx         # bilingual last-resort error page
│   │   ├── (admin)/admin/           # staff-only: sign-in + insights dashboard (own root layout, noindex)
│   │   ├── (en)/                    # English root layout + thin route files
│   │   ├── (es)/es/                 # Spanish root layout + thin route files
│   │   ├── global-not-found.tsx     # bilingual 404 for unmatched URLs
│   │   ├── fonts.ts                 # next/font (Latin subset covers Spanish)
│   │   ├── globals.css              # design tokens (Tailwind @theme) + calm-mode rules
│   │   └── sitemap.ts · robots.ts · not-found.tsx
│   ├── components/
│   │   ├── three/                   # WebGL: home scene + HeroStar for page heroes (shared star geometry)
│   │   ├── page/                    # PageHero, Breadcrumbs, Section, FaqList, StepList, NextStep, LegalPage
│   │   ├── sections/                # home page sections, grouped into <Chapter>s
│   │   ├── providers/               # MotionProvider (calm mode), SmoothScroll, ScrollDirector
│   │   ├── layout/                  # SiteShell, Header, Footer, CalmToggle, LanguageSwitcher
│   │   ├── forms/InquiryForm.tsx
│   │   ├── seo/JsonLd.tsx           # schema.org MedicalClinic
│   │   └── ui/                      # Button, Reveal, CountUp, ScrollRail, StarMark
│   ├── cms/                         # Sanity client, schemas, repositories, webhook, preview
│   ├── views/                       # one locale-aware component per page (+ ErrorView)
│   ├── instrumentation.ts           # server error capture
│   ├── i18n/                        # locales, route map, UI dictionaries, messages, metadata
│   ├── content/                     # English facts & lists; es/ mirrors; copy/ = page copy (en + es)
│   └── lib/
│       ├── scroll/                  # timeline math, scroll store, hooks
│       ├── validation/inquiry.ts    # shared zod schema + PHI detection
│       ├── inquiry/                 # request handler + email/webhook delivery
│       ├── security/                # CSP, rate limiter (memory + Upstash), origin (CSRF) guard, body limits
│       ├── observability/           # JSON logger, PII redaction, alerts, health, browser error reports
│       ├── analytics/               # beacon protocol, normalisation, stores, collector, reports, staff auth
│       └── hooks/useMediaQuery.ts
├── tests/                           # 415 unit/component tests (incl. CMS, translation coverage, route integrity)
├── .env.example
├── playwright.config.ts             # projects: desktop, mobile, reduced-motion, cms
├── lighthouserc.cjs                 # Lighthouse scores + resource budgets
└── next.config.ts                   # security headers (CSP, HSTS…), legacy redirects
```

## Getting started

```bash
npm install
cp .env.example .env.local   # optional in development
npm run dev                  # http://localhost:3000
```

| Script | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm test` | Vitest suite |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (Next core-web-vitals + TypeScript) |
| `npm run e2e:build` | Builds `.next` and the CMS-enabled `.next-cms` for E2E |
| `npm run e2e` / `npm run e2e:ui` | Playwright suite (headless / interactive) |
| `npm run launch:check -- <url>` | Verifies a live deployment (redirects, hosts, every page, headers, health) |
| `npm run check:links` | Checks the resource library's external links (also weekly in `content-links.yml`) |
| `npm run lhci` | Lighthouse CI against the production build (run `npm run build` first) |

## Testing & CI

Three layers, all run by `.github/workflows/ci.yml` on every pull request and on `main`:

1. **Unit and component tests** (Vitest, 415 tests): secure channels (host allowlist, fallback, Direct addresses), the enrollment check, text alerts (SMS segments, idempotency, cap, dry-run, signatures), launch readiness (old-URL coverage, redirect targets, preview
   noindex, placeholder guard, the launch checker against a faulty fake site), community content (event, resource and gallery validation,
   consent, language fallback, clinic-time formatting, RFC 5545 calendar files, the photo viewer, link checks), analytics (normalisation, stores, collector, consent,
   reports, staff sessions), validation and the PHI guard, delivery signing, rate
   limiting (memory, Upstash, failover), the origin guard, logging redaction, alerts, CSP and browser error
   reports, health, the uptime probe, error pages, CMS schemas, webhook signatures and preview, timeline maths, calm mode and
   WebGL detection, translation coverage and route integrity.
2. **End-to-end** (Playwright, 143 tests across 4 projects; 117 run against previews). The suite builds the site twice: once with bundled
   content, and once with the CMS on, where Sanity is answered by `e2e/fixtures/mock-sanity.cjs`. A local
   receiver captures delivered inquiries so the HMAC signature can be checked.
   - `smoke`: every sitemap URL loads with the right `lang`, one `h1`, metadata and no console errors. Also
     covers the bilingual 404, legacy redirects, security headers and the sitemap's hreflang.
   - `a11y`: axe-core, failing on any serious or critical WCAG 2.2 A/AA violation (16 pages plus the form's
     error state), on desktop and mobile.
   - `story`: the 3D scene mounts, and the day clock and services list follow the scroll, in English and Spanish.
   - `calm`: reduced motion starts in calm mode, and the switch removes WebGL and remembers the choice. The
     mobile layout never scrolls sideways.
   - `forms`: errors are announced, PHI is blocked, a Spanish inquiry is delivered and signed, job
     applications pre-select the role, and cross-site or malformed posts are rejected.
   - `i18n` and `keyboard`: the language switcher, hreflang, the skip link, the FAQ disclosure and the
     mobile-menu focus trap.
   - `community` and `cms` (Milestone 8):
     - events, calendar files and structured data;
     - language-aware resources and the refusal of unsafe links;
     - team photos shown only with consent, through the site's own image optimizer;
     - a gallery that never shows a photo without a release;
     - the keyboard-operable photo viewer.
   - `analytics`: beacons are counted and show up for staff, visitors never get a cookie, GPC and the opt-out
     switch stop all counting, and the dashboard signs in, passes axe, exports CSV and signs out.
   - `smoke › operations endpoints`: the health check, both CSP report formats, and that browser error reports
     are accepted from this site only.
   - **Against a deployment**: `E2E_BASE_URL=https://… npm run e2e`, which `preview-e2e.yml` runs for every Vercel
     preview. It sends Vercel's protection-bypass header, and skips the mocked-CMS project and tests tagged
     `@local` (real inquiry delivery).
   - `cms`: closures appear as a banner, scheduled and unsafe announcements are hidden, untranslated content is
     marked, only testimonials with consent are shown, and signed revalidation and preview links work.
3. **Lighthouse CI** (`lighthouserc.cjs`): 7 representative URLs, 3 runs each, mobile profile, median asserted.
   - Scores: accessibility, SEO and best practices must be 100; performance must be at least 80.
   - Metrics: LCP ≤ 4.5 s, TBT ≤ 300 ms, CLS ≤ 0.05.
   - Budgets: JS ≤ 380 KB, CSS ≤ 25 KB, fonts ≤ 170 KB, images ≤ 250 KB, total ≤ 700 KB, and zero
     third-party requests.
   - Measured on this build: performance 0.86–0.95, TBT 50–175 ms, CLS 0.

Run locally:

```bash
npm run e2e:build && npm run e2e                 # PLAYWRIGHT_CHROMIUM_EXECUTABLE=… to use a preinstalled Chromium
npm run build && npm run lhci                    # CHROME_PATH=… if Chrome isn't on the PATH
```

**Software rendering.** Browsers without a usable GPU (blocklisted drivers, VMs, CI) render WebGL on the CPU,
and every frame then blocks the main thread. The site detects SwiftShader, llvmpipe and similar renderers and
shows the static backdrop instead. On such a machine, set `localStorage["stars:force-3d"] = "true"` to see the
scene anyway; the E2E specs for the 3D story do this.

## Inquiry form & API

`POST /api/inquiry` runs: same-origin check → JSON content-type and 16 KB size limit → per-IP rate limit →
honeypot and minimum-fill-time bot checks (bots get a fake success) → zod validation, including the PHI guard →
delivery.

Delivery goes to **email via Resend** and/or a **signed webhook** (HMAC-SHA256 in `X-Stars-Signature`), whichever
are configured. If at least one channel accepts the inquiry, the request succeeds. **If no channel is configured in
production, the API returns 503 with the phone number, so inquiries are never silently lost.** In development
it logs a PHI-free summary and accepts the request.

Rate limiting is shared across all serverless instances when Upstash Redis is configured
(`UPSTASH_REDIS_REST_URL` / `_TOKEN`, or Vercel KV's names). It runs as an atomic sliding window over Upstash's
REST API, with no SDK, and IPs are HMAC-hashed before they leave the server. If Upstash is slow or down, each
instance falls back to its own in-memory window, so the form stays available. Without Upstash, the in-memory
store is exact on a single Node server and best-effort on serverless.

## Website insights (privacy-friendly analytics)

See **[docs/ANALYTICS.md](docs/ANALYTICS.md)**. Analytics is first-party and cookieless, and never stores an IP
address or a visitor ID. It is built for a pediatric healthcare audience, in light of HHS guidance on tracking
technologies.

- **Tracker** (`src/lib/analytics/client.ts`, about 3 KB, no dependencies): sends one beacon per page view and per
  meaningful tap (phone, email, directions, language, calm mode, form start) to `POST /api/collect`. It sends
  nothing under Global Privacy Control, Do Not Track, the opt-out switch on `/privacy`, or automation.
- **Collector**: same-origin and rate limited. Bot and GPC/DNT requests are dropped on the server too. An
  allowlist turns beacons into bounded dimensions (known page keys, channel, device, sanitised campaign tags), and
  only **daily aggregate counters** are incremented, in Upstash with a 13-month TTL. Open-ended values are capped
  atomically.
- **Conversions**: delivered inquiries are counted server-side by request type, sender, language and the new
  optional **"How did you hear about STARS?"** field (also included in the inquiry email or webhook).
- **Staff dashboard** at `/admin/insights`:
  - KPI tiles with a period-over-period change, daily charts with table views, and breakdowns.
  - 7, 30 or 90 days, plus CSV export (protected against formula injection).
  - Shared-password sign-in with an HMAC-signed, httpOnly, SameSite=Strict session. The session is invalidated
    when the password changes.
  - Rate limited, `noindex`, and disallowed in robots.txt.

## Monitoring & operations

See **[docs/OPERATIONS.md](docs/OPERATIONS.md)** for setup and the incident runbook.

- **Structured logs**: every server log is one JSON line with an `event` field, and contact details and health
  information are redacted (`src/lib/observability`).
- **Alerts** go to any chat incoming webhook (`ALERT_WEBHOOK_URL`). They are de-duplicated and optionally signed.
  They cover server errors (`src/instrumentation.ts`), failed or refused inquiry deliveries, and pages that fail
  to render in a browser.
- **Error pages**: friendly English and Spanish error pages (`error.tsx` per language, plus `global-error.tsx`)
  keep the phone number visible and report the failure. `ErrorReporter` reports uncaught errors from the site's
  own scripts only, not from browser extensions.
- **`GET /api/health`** returns `200 ok` or `503 degraded` (production with no delivery channel), for uptime
  monitors. It makes no outbound calls and exposes no secrets.
- **CSP reports**: `report-to` and `report-uri` send violations to `/api/csp-report`. The endpoint handles both
  browser formats, strips query strings and drops browser-extension noise.
- **Uptime workflow**: probes production every 30 minutes and alerts on failure.

## Security headers

Set in `next.config.ts` (policy in `src/lib/security/csp.ts`): Content-Security-Policy with violation reporting
(self-hosted fonts, no third-party scripts, no `eval`; Zod runs in its jitless mode for this reason), HSTS,
`X-Frame-Options: DENY`, `nosniff`, a strict Referrer-Policy, a locked-down Permissions-Policy and COOP.
API responses are `no-store`.

## Accessibility

Skip link · semantic landmarks and headings · the 3D canvas is `aria-hidden` and every idea it shows is also
in text · visible focus rings · focus-trapped mobile menu with Escape · form error summary that takes focus,
with `aria-invalid` and `aria-describedby` on fields · minimum 44 px touch targets · AA contrast · calm mode
and `prefers-reduced-motion` support.

## Secure enrollment, referrals and text alerts

See **[docs/PHI-INTEGRATIONS.md](docs/PHI-INTEGRATIONS.md)**. Health information never passes through the
website's own services; it goes from the visitor's browser straight to services STARS has a BAA with.

- **`/enroll`** (`/es/inscripcion`): a four-question eligibility check that runs entirely in the browser (nothing is
  sent or stored), then hands off to the secure enrollment form. The old `/enroll-now` redirects here.
- **Secure referrals** on `/referrals`: secure upload, Direct secure messaging, fax and phone, showing only the
  channels that are configured.
- **Host allowlist**: PHI-receiving links are editable in the CMS but only render if their host is in
  `SECURE_FORM_HOSTS`, which lives in Vercel. Anything else is hidden and raises a 🔴 alert. Adobe Acrobat Sign is
  the default.
- **Text closure alerts**: text-to-join sign-up on Current Families, with the required consent wording. Publishing
  a closure with *Also text families* calls `/api/alerts/text`, which:
  - checks the webhook signature, then re-reads the notice uncached;
  - checks its kind and timing, and fits the text to 4 SMS parts;
  - never sends the same text twice, and caps alerts at 4 per 6 hours;
  - only sends in `TEXT_ALERTS_MODE=live` (`dry-run` previews in the staff chat);
  - sends to the provider through a signed webhook.

  Phone numbers stay at the provider.

## Launch

**[docs/LAUNCH.md](docs/LAUNCH.md)** is the step-by-step move from Wix: the content sprint, services, DNS changes
in Wix, email (the domain has no mail service today), rollback, Search Console and retiring Wix.
**[docs/ACCESSIBILITY-AUDIT.md](docs/ACCESSIBILITY-AUDIT.md)** is the protocol for pre-launch sessions with
assistive-technology users.

- **Old URLs**: every page of the Wix site, taken from its own sitemap, is covered
  (`src/lib/launch/legacyRedirects.ts`). Unit tests prove each target is a real page, in one hop, and E2E checks
  every redirect.
- **Previews stay out of search**: deployments other than production send `noindex`, through robots.txt, an
  `X-Robots-Tag` header and a robots meta tag.
- **`npm run launch:check -- <url>`** checks a live deployment:
  - www, apex and http hosts;
  - all old URLs;
  - every sitemap page (status, canonical, `lang`, no `noindex`, no placeholder text);
  - robots.txt, security headers, a real 404, and health.

  It runs after every production deployment (`launch-verify.yml`).
- **Placeholder guard**: a unit test fails if shipped content contains `[Client to confirm]`, TODO, lorem ipsum,
  example domains or 555 numbers.

## Deployment

Built for Vercel (or any Node 20.9+ host). Set `NEXT_PUBLIC_SITE_URL` and at least one delivery channel
(`RESEND_API_KEY` + `INQUIRY_TO_EMAIL`, or `INQUIRY_WEBHOOK_URL`). Preview deployments need no origin
configuration: the CSRF guard compares the `Origin` with the host the browser requested. Then follow the setup
checklist in [docs/OPERATIONS.md](docs/OPERATIONS.md) (alerts, Upstash, uptime, preview checks).

## Roadmap (next milestones)

- ~~Milestone 1: 3D home page, service pages, inquiry API~~
- ~~Milestone 2: every remaining page, form presets, legal pages, shared page system~~
- ~~Milestone 3: Spanish site, bilingual forms/API, hreflang, bilingual 404~~
- ~~Milestone 4: Sanity CMS for announcements, FAQs, roles, leadership, testimonials, contact details~~
- ~~Milestone 5: Playwright E2E (axe, forms, CMS), Lighthouse CI budgets, GitHub Actions pipeline~~
- ~~Milestone 6: shared rate limiting, CSP reporting, error and uptime monitoring, preview E2E~~
- ~~Milestone 7: privacy-friendly analytics, "how did you hear" field, staff insights dashboard~~
- ~~Milestone 8: events calendar, family resource library, Our Team, photo gallery (all CMS-managed)~~
- ~~Milestone 9: launch readiness: old-URL redirects, preview noindex, launch checker, runbook, accessibility
  audit protocol~~
- ~~Milestone 10: enrollment check and secure handoff, secure referral channels, text closure alerts (PHI kept
  off the website's own systems)~~

The build plan is complete. Further work is operational: vendor selection and BAAs, A2P 10DLC registration, content
and the accessibility sessions.
