# Website insights (analytics)

How the STARS website measures itself, what staff can see, and why it's built this way.

## Signing in

Go to **`/admin/insights`** (for example `https://www.mystarsacademy.org/admin/insights`) and enter the staff
password. You stay signed in for 12 hours on that browser. **Sign out** on shared computers. Changing the password
in Vercel (`INSIGHTS_PASSWORD`) signs everyone out.

## Reading the dashboard

| Number | What it means |
|---|---|
| **Visits** | Someone arrived from outside the site (a search, a link, a QR code, a bookmark). |
| **Page views** | Every page shown, including moving around within the site. |
| **Inquiries sent** | Website forms that reached STARS (tours, eligibility, referrals, jobs…). |
| **Inquiries per 100 visits** | How often a visit turns into an inquiry. The best single measure of whether the site is working. |
| **Phone taps / Directions opened** | People who chose to call or come in instead of writing. |

Each number is compared with the period before it (for example the 30 days before the last 30).

- **How they heard about STARS** comes from the optional question on the form, so it reflects real families and
  referral partners. Watch it for the doctors, First Connections and schools that send the most families.
- **How visitors arrived** groups visits into search, social media, other websites, campaigns and direct.
- **What people asked for / Who sent them** shows the mix of tours, eligibility questions, referrals and job
  interest.

Use **Download CSV** for board reports or spreadsheets.

## Tracking flyers, QR codes and posts

Add campaign tags to any link you print or share. The dashboard then shows exactly how many visits it brought.

```
https://www.mystarsacademy.org/?utm_source=flyer&utm_campaign=fall-open-house
https://www.mystarsacademy.org/es?utm_source=facebook&utm_campaign=spanish-speech
https://www.mystarsacademy.org/referrals?utm_source=clinic-letter&utm_medium=print&utm_campaign=2026-physicians
```

- `utm_source`: where the link appears (`flyer`, `facebook`, `newsletter`, `clinic-letter`).
- `utm_campaign`: the effort it belongs to (`fall-open-house`, `spanish-speech`).
- `utm_medium` (optional): `print`, `social` or `email`. Email links are grouped under "Email".

Use short lowercase words with hyphens. Make the QR code from the full tagged link. Never put a family's name or
anything personal in a link.

## What is and isn't collected

| Counted (as daily totals) | Never collected |
|---|---|
| Which page was viewed (from a fixed list of the site's pages) | Cookies (visitors never get one) |
| Phone, tablet or computer | IP addresses (not stored or logged) |
| Page language | Visitor or session IDs, fingerprints |
| The referring website's name, or campaign tags | Full web addresses, search terms or query strings |
| Taps on phone, email, directions; language and calm-mode switches; starting a form | Anything typed into a form |
| Delivered inquiries: request type, who sent it, form language, "how did you hear" | Names, contact details or messages |

Nothing connects one page view to another, so nobody's path through the site can be followed. Browsers that send
**Global Privacy Control** or **Do Not Track**, visitors who switch counting off on the privacy page, and bots are
never counted. Totals are kept for 13 months and then deleted automatically.

**Why it's built this way.** STARS serves children with disabilities. HHS guidance on online tracking
technologies treats a visit to a provider's site, combined with identifiers such as IP addresses or cookies, as
potentially sensitive. Third-party trackers such as Google Analytics or the Meta Pixel send exactly that to
another company. This system has no identifiers and no third parties: the counts stay with STARS' own hosting
(Vercel and Upstash). Even so, have the privacy notice reviewed by your compliance advisor
(docs/CONTENT-CHECKLIST.md).

## For developers

- Beacons: `src/lib/analytics/client.ts` (about 3 KB) → `POST /api/collect` → `incrementsFor()` (allowlist
  normalisation) → daily Redis hashes `stars:an:<day>:<metric>`.
- Open-ended fields (referrers, campaigns) are capped per day by an atomic Lua script; once a day is full, extra
  values fold into "(other)".
- Inquiries are counted server-side after successful delivery (`src/lib/inquiry/handler.ts`).
- Days follow `America/Chicago`. Ranges are 7, 30 or 90 days, each with the previous period for comparison.
- Without Upstash, counts are kept in server memory. That's fine for development, but not durable on Vercel.
- Switch analytics off entirely with `ANALYTICS_ENABLED=false`: the tracker isn't rendered and the collector
  ignores beacons.
