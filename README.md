# STARS Academy — 3D scroll website

A redesign of the [STARS Academy](https://star-academy-sample-1.vercel.app/) site: a pediatric developmental
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
- **Old URLs keep working.** `/speech-therapy`, `/nursing` and the other old service URLs 308-redirect to `/services/*`.

## Stack

Next.js 16 (App Router, TypeScript strict) · React 19 · Tailwind CSS v4 · three.js + React Three Fiber + drei ·
Lenis · zod · Vitest + Testing Library.

## Project structure

```
.
├── docs/CONTENT-CHECKLIST.md        # facts awaiting client confirmation
├── public/                          # favicon + client photography
├── src/
│   ├── app/
│   │   ├── api/inquiry/route.ts     # POST endpoint (delegates to lib/inquiry/handler)
│   │   ├── services/[slug]/page.tsx # 5 statically generated service pages
│   │   ├── schedule-a-tour/page.tsx # tour / inquiry / referral form
│   │   ├── layout.tsx               # fonts, metadata, JSON-LD, providers, skip link
│   │   ├── page.tsx                 # the 7-chapter 3D scroll story
│   │   ├── globals.css              # design tokens (Tailwind @theme) + calm-mode rules
│   │   └── sitemap.ts · robots.ts · not-found.tsx
│   ├── components/
│   │   ├── three/                   # WebGL scene: canvas, camera rig, star, blocks, spheres, sun, orb
│   │   ├── sections/                # home page sections, grouped into <Chapter>s
│   │   ├── providers/               # MotionProvider (calm mode), SmoothScroll, ScrollDirector
│   │   ├── layout/                  # Header (accessible mobile menu), Footer, CalmToggle
│   │   ├── forms/InquiryForm.tsx
│   │   ├── seo/JsonLd.tsx           # schema.org MedicalClinic
│   │   └── ui/                      # Button, Reveal, CountUp, ScrollRail, StarMark
│   ├── content/                     # typed site copy: site.ts, services.ts, photos.ts
│   └── lib/
│       ├── scroll/                  # timeline math, scroll store, hooks
│       ├── validation/inquiry.ts    # shared zod schema + PHI detection
│       ├── inquiry/                 # request handler + email/webhook delivery
│       ├── security/                # rate limiter, origin (CSRF) guard
│       └── hooks/useMediaQuery.ts
├── tests/                           # 81 unit/component tests
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

1. **Content pages:** Our Approach, About, Getting Started, For Referral Partners, Careers, FAQ, Current Families,
   and the Privacy, Accessibility and Nondiscrimination pages (the content model is already in `src/content`).
2. **Spanish-language pages** (`/es`), building on the Spanish speech-therapy service.
3. **CMS integration** so staff can edit copy and the checklist items without a deploy.
4. **Shared rate-limit store** (Upstash Redis) and privacy-friendly analytics.
5. **Playwright E2E + Lighthouse CI** budgets for performance and accessibility.
