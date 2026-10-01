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
Lenis · zod · Vitest + Testing Library.

## Project structure

```
.
├── docs/CONTENT-CHECKLIST.md        # facts awaiting client confirmation
├── docs/EDITOR-GUIDE.md             # plain-language guide for clinic staff
├── studio/                          # Sanity Studio (separate package) + seed/content.ndjson
├── scripts/export-cms-seed.ts       # bundled content → CMS seed
├── public/                          # favicon + client photography
├── src/
│   ├── app/
│   │   ├── api/inquiry/route.ts     # POST endpoint (delegates to lib/inquiry/handler)
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
│   ├── views/                       # one locale-aware component per page
│   ├── i18n/                        # locales, route map, UI dictionaries, messages, metadata
│   ├── content/                     # English facts & lists; es/ mirrors; copy/ = page copy (en + es)
│   └── lib/
│       ├── scroll/                  # timeline math, scroll store, hooks
│       ├── validation/inquiry.ts    # shared zod schema + PHI detection
│       ├── inquiry/                 # request handler + email/webhook delivery
│       ├── security/                # rate limiter, origin (CSRF) guard
│       └── hooks/useMediaQuery.ts
├── tests/                           # 219 unit/component tests (incl. CMS, translation coverage, route integrity)
├── .env.example
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

## Inquiry form & API

`POST /api/inquiry` runs: same-origin check → JSON content-type and 16 KB size limit → per-IP rate limit →
honeypot and minimum-fill-time bot checks (bots get a fake success) → zod validation, including the PHI guard →
delivery.

Delivery goes to **email via Resend** and/or a **signed webhook** (HMAC-SHA256 in `X-Stars-Signature`), whichever
are configured. If at least one channel accepts the inquiry, the request succeeds. **If no channel is configured in
production, the API returns 503 with the phone number, so inquiries are never silently lost.** In development
it logs a PHI-free summary and accepts the request.

The rate limiter is in-memory: exact on a single Node server, best-effort on serverless. The `RateLimitStore`
interface lets you swap in Redis/Upstash without changing the handler.

## Security headers

Set in `next.config.ts`: Content-Security-Policy (self-hosted fonts, no third-party scripts), HSTS,
`X-Frame-Options: DENY`, `nosniff`, a strict Referrer-Policy, a locked-down Permissions-Policy and COOP.
API responses are `no-store`.

## Accessibility

Skip link · semantic landmarks and headings · the 3D canvas is `aria-hidden` and every idea it shows is also
in text · visible focus rings · focus-trapped mobile menu with Escape · form error summary that takes focus,
with `aria-invalid` and `aria-describedby` on fields · minimum 44 px touch targets · AA contrast · calm mode
and `prefers-reduced-motion` support.

## Deployment

Built for Vercel (or any Node 20.9+ host). Set `NEXT_PUBLIC_SITE_URL` and at least one delivery channel
(`RESEND_API_KEY` + `INQUIRY_TO_EMAIL`, or `INQUIRY_WEBHOOK_URL`). Add preview URLs to `ALLOWED_ORIGINS`.

## Roadmap (next milestones)

- ~~Milestone 1: 3D home page, service pages, inquiry API~~
- ~~Milestone 2: every remaining page, form presets, legal pages, shared page system~~
- ~~Milestone 3: Spanish site, bilingual forms/API, hreflang, bilingual 404~~
- ~~Milestone 4: Sanity CMS for announcements, FAQs, roles, leadership, testimonials, contact details~~
5. **Shared rate-limit store** (Upstash Redis) and privacy-friendly analytics, if STARS wants them (the privacy
   notice would need updating).
6. **Playwright E2E + Lighthouse CI** budgets for performance and accessibility.
