# Launch runbook: moving www.mystarsacademy.org from Wix to the new site

Written for whoever holds the Wix and Vercel logins and for STARS' director. Each step says who does it, what to
check, and how to undo it. Pick a **Tuesday or Wednesday morning** for launch day, never a Friday.

## What we know about today's setup (checked October 2026)

| Item | Today | After launch |
|---|---|---|
| Website | Wix, 14 pages | This site, on Vercel |
| Domain's DNS | Managed by **Wix** (nameservers `ns8.wixdns.net`, `ns9.wixdns.net`) | Same place, records changed (see "DNS") |
| `mystarsacademy.org` (no www) | Wix servers `185.230.63.171`, `.107`, `.186` | Redirects to `https://www.mystarsacademy.org` |
| `www.mystarsacademy.org` | CNAME `cdn1.wixdns.net` | Vercel |
| **Email on the domain** | **None** (no MX records, no SPF or DMARC) | Only the website's sending subdomain (see "Email") |
| Enrollment and employment forms | Adobe Sign widgets on adobe.com | Unchanged: the new site links to the same two forms |
| Files hosted on Wix | None besides the favicon | None needed |

**Write the current Wix DNS records down (screenshot the Wix DNS page) before changing anything.** They are your
rollback.

All 14 old pages are handled: 10 redirect permanently to their new home (`src/lib/launch/legacyRedirects.ts`), and 4
keep their address (`/`, `/about-us`, `/contact-us`, `/schedule-a-tour`).

| Old page | New page |
|---|---|
| `/speech-therapy`, `/occupational-therapy`, `/physical-therapy` | `/services/…` (same names) |
| `/nursing` | `/services/nursing-care` |
| `/classrooms` | `/services/developmental-classrooms` |
| `/what-we-do` | `/services` |
| `/enroll-now` | `/enroll` (enrollment check, then the secure form) |
| `/apply-now` | `/careers/apply` |
| `/general-8` (Career Opportunities) | `/careers` |
| `/walk` (Instructional Videos, never finished) | `/resources` |

## Timeline

### 3 weeks before: content sprint (STARS staff, about 2 weeks)
- [ ] Work through `docs/CONTENT-CHECKLIST.md` with the web team. Anything not confirmed stays off the site rather
      than going live as a guess.
- [ ] A 45-minute Studio training for the people who will post closures and events (`docs/EDITOR-GUIDE.md`). Each
      person posts and then deletes a test announcement.
- [ ] Enter team members, events, resources and gallery photos in the Studio, with photo releases on file.
- [ ] Spanish review of all new and changed text by a native speaker who knows the families STARS serves.
- [ ] Compliance review of the privacy notice (English and Spanish).

### 2 weeks before: services and accessibility
- [ ] **Accessibility sessions** with assistive-technology users, following `docs/ACCESSIBILITY-AUDIT.md`. Fix every
      "blocker" and "serious" finding before launch.
- [ ] Create the services and put their settings in Vercel → Project → Settings → Environment Variables
      (**Production**). Every variable is described in `.env.example`.
  - [ ] Sanity project, read token and publish webhook (README, "Content management")
  - [ ] Upstash Redis via the Vercel integration (rate limiting and website insights)
  - [ ] Resend with the sending subdomain verified (see "Email"), and `INQUIRY_TO_EMAIL` set to an inbox staff check
  - [ ] Alert webhook (`ALERT_WEBHOOK_URL`) into the staff chat
  - [ ] `INSIGHTS_PASSWORD` and `INSIGHTS_SESSION_SECRET`
  - [ ] `NEXT_PUBLIC_SITE_URL=https://www.mystarsacademy.org`
- [ ] Deploy to production on the Vercel address (`<project>.vercel.app`). Then run
      `npm run launch:check -- https://<project>.vercel.app`, which skips the host checks on vercel.app. Expect it to
      flag only the sitemap host until the domain moves.
- [ ] **Send a real test inquiry in English and in Spanish** from the Vercel address. Confirm both arrive, then
      delete them.
- [ ] Trigger a test alert: temporarily remove `INQUIRY_TO_EMAIL` on a preview deployment and submit, or ask the
      web team.

### 1 week before: go / no-go
- [ ] Every item above is done.
- [ ] `npm run launch:check` shows no ❌ apart from the host and sitemap checks that need the domain.
- [ ] CI is green on `main`: unit, E2E, Lighthouse and Studio checks.
- [ ] People are named for launch day: one person with Wix access, one with Vercel access, and one at the front
      desk who knows the plan.
- [ ] The Wix premium plan stays active for **at least 30 days after launch** (rollback).

### Launch day (about 1 hour, plus up to a few hours for DNS)
0. If the site was hosted temporarily with `SITE_INDEXABLE=false`, **delete that variable** in Vercel and redeploy;
   otherwise search engines are told not to index the real site. (`npm run launch:check` flags it as "marked
   noindex".)
1. **Vercel**: Project → Settings → Domains → add `www.mystarsacademy.org`, then add `mystarsacademy.org` and choose
   *Redirect to www.mystarsacademy.org (308)*. Vercel shows the exact DNS records each domain needs.
2. **Wix**: Domains → mystarsacademy.org → disconnect it from the Wix site (Wix calls this *Disconnect* or *Assign
   to a different site*). Leave the domain registered at Wix.
3. **Wix**: Domains → mystarsacademy.org → *Manage DNS records*. Replace the `@` A records and the `www` CNAME with
   the values Vercel showed (typically an A record for `@` and a CNAME to Vercel's DNS for `www`). Add, don't
   delete, any records you don't recognize.
4. Wait for Vercel's Domains page to show both domains as **Valid Configuration**, with certificates issued
   (usually minutes, sometimes up to a few hours).
5. Run the full check and fix anything ❌:
   ```bash
   npm run launch:check -- https://www.mystarsacademy.org
   ```
   (or GitHub → Actions → *Production verification* → *Run workflow*)
6. By hand: open the site on a phone with mobile data, switch to Español, start a tour request (don't send it),
   and tap the phone number.
7. Turn on monitoring:
   - set the `PRODUCTION_URL` repository variable (enables the uptime probe and production verification);
   - add the external uptime monitor on `/api/health` (`docs/OPERATIONS.md`).

### Rollback (if something serious can't be fixed within the hour)
In Wix DNS, put back the records from your screenshot (`@` A → `185.230.63.171`, `185.230.63.107`,
`185.230.63.186`; `www` CNAME → `cdn1.wixdns.net`) and reconnect the domain to the Wix site. Visitors return to the
old site as DNS caches expire (minutes to a few hours). Nothing on the new site needs undoing.

### First week after
- [ ] **Google Search Console**: add a *Domain* property and verify it with the DNS TXT record Google gives you
      (added in Wix DNS). Submit `https://www.mystarsacademy.org/sitemap.xml`. Old URLs will appear under "Page with
      redirect"; that's expected.
- [ ] **Bing Webmaster Tools**: import the site from Search Console.
- [ ] Update the website link and hours on the **Google Business Profile**, Facebook and Instagram.
- [ ] Ask the places that list STARS (insurance and Medicaid provider directories, referral partners' resource
      lists, the school district) to update the link. Old links keep working, but direct links are better.
- [ ] Watch `/admin/insights` and the alerts channel daily. In *Most viewed pages*, "Other pages (incl. not found)"
      should stay near zero.

### 30 days after: retire Wix
- [ ] Export anything you need from Wix, including any **form submissions stored in the Wix inbox**. They may contain
      families' details: keep them according to STARS' records policy, then delete them from Wix.
- [ ] Cancel the Wix *site* premium plan. **Do not let the domain lapse**: confirm who owns the domain registration,
      that auto-renew is on, and that the Wix account uses two-factor sign-in.
- [ ] Optional, later: transfer the domain to a dedicated registrar (Cloudflare, Namecheap or Vercel) so it no
      longer depends on a Wix account. Do it on a quiet week, after the DNS records are copied over.

### 90 days after
- [ ] Review Search Console: impressions and clicks back to the old levels or above, and no unexpected 404s.
- [ ] Review website insights with STARS' director: inquiries per 100 visits, and how families heard about STARS.

## Email

`mystarsacademy.org` has no mailboxes today, so the new site doesn't assume any:

- **Where inquiries go** (`INQUIRY_TO_EMAIL`): an inbox staff already read. If STARS later wants
  `info@mystarsacademy.org`, set up Google Workspace or Microsoft 365 for the domain as its own small project (it adds
  MX records), then change this setting.
- **Who inquiries come from** (`INQUIRY_FROM_EMAIL`): Resend needs a verified domain. Use the subdomain
  `send.mystarsacademy.org`. In Resend, add the domain and copy the records it lists (an MX and an SPF TXT on `send`,
  and a DKIM TXT) into Wix DNS.
- **DMARC**: also add `_dmarc` TXT `v=DMARC1; p=none; rua=mailto:<an inbox you read>`. It costs nothing and stops
  others from easily spoofing the domain. Tighten it to `p=quarantine` once reports look clean.

## Who does what

| Task | Who |
|---|---|
| Content, photos, releases, Spanish review | STARS office and director |
| Accessibility sessions | Web team with participants (see the audit protocol) |
| Vercel, Sanity, Upstash, Resend and alert settings | Web team |
| Wix DNS changes on launch day | Whoever owns the Wix account, with the web team on a call |
| Search Console, Google Business Profile, social links | STARS office, with the web team's help |
