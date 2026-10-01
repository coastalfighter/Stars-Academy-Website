# Operations runbook

For whoever keeps the STARS website running. No knowledge of the code is needed for the "If something goes wrong"
section.

## What is monitored

| Signal | Where it comes from | Where it goes |
|---|---|---|
| **Server errors** (a page or API fails on the server) | `src/instrumentation.ts` | Log `server.error` + 🔴 alert |
| **Inquiry not delivered** (email/webhook provider down) | `/api/inquiry` | Log `inquiry.failed` + 🔴 alert |
| **Inquiries refused** (no delivery channel configured) | `/api/inquiry`, `/api/health` | Log `inquiry.unconfigured` + 🔴 alert; health check turns `degraded` |
| **Page failed in a visitor's browser** | Error pages → `/api/client-error` | Log `client.error` + 🟡 alert |
| **Uncaught browser errors** from the site's own scripts | `ErrorReporter` → `/api/client-error` | Log `client.error` (no alert) |
| **Content-Security-Policy violations** | Browsers → `/api/csp-report` | Log `csp.violation` (no alert) |
| **Shared rate limiter unavailable** | Upstash failover | Log `ratelimit.failover` (at most once a minute per instance) |
| **Site down or degraded** | `.github/workflows/uptime.yml` every 30 min | Failed workflow email + 🔴 chat message |
| **A preview deployment is broken** | `.github/workflows/preview-e2e.yml` | Failed check on the pull request |
| **A production deployment is broken** (redirects, pages, headers, health) | `.github/workflows/launch-verify.yml` | Failed workflow email |
| **A resource link went dead** | `.github/workflows/content-links.yml` (weekly) | Failed workflow email |
| **A secure-form link in the CMS points to an unapproved site** | `getSecureChannels` | Log `secure.rejected` + 🔴 alert; the link is hidden |
| **Text alerts** sent, previewed (dry run), capped or failed | `/api/alerts/text` | Log `textalert.*` + chat message (🔴 when not sent) |

Alerts are de-duplicated: the same problem alerts once per 15 minutes per server instance, and at most 20 alerts per
hour, so an outage produces a handful of messages, not a flood.

**Privacy.** Logs and alerts never contain what a family typed. Fields such as name, phone, email and message are
replaced with `[redacted]`. Email addresses, phone numbers, dates, long numbers and IP addresses are masked inside any
other text, and URLs lose their query strings. The rate limiter stores only keyed hashes of IP addresses.

## Setup checklist (production)

1. **Inquiry delivery**: `RESEND_API_KEY` + `INQUIRY_TO_EMAIL`, and/or `INQUIRY_WEBHOOK_URL` (+ secret). Configure both
   if you can: if one provider is down, the other still delivers.
2. **Alerts**: create an incoming webhook in the staff chat (Slack: *Apps → Incoming Webhooks*; Google Chat:
   *Space → Apps & integrations → Webhooks*; Teams: a *Workflows* "post to channel when a webhook request is
   received"). Set `ALERT_WEBHOOK_URL` in Vercel, and the same URL as the `ALERT_WEBHOOK_URL` **GitHub secret** for
   the uptime probe.
3. **Shared rate limiting**: add the Upstash integration in Vercel (*Storage → Upstash → Redis*, free tier). It sets
   `KV_REST_API_URL` / `KV_REST_API_TOKEN` automatically.
4. **Uptime**:
   - Set the `PRODUCTION_URL` repository variable to enable the GitHub probe.
   - Also add a dedicated monitor on `https://<site>/api/health` (Better Stack, UptimeRobot or similar; the free
     tiers check every 1 to 5 minutes). Alert on any status other than 200. GitHub's schedule is a backup, not a
     guarantee.
5. **Preview checks**: in Vercel, *Settings → Deployment Protection → Protection Bypass for Automation*. Copy the
   secret into the `VERCEL_AUTOMATION_BYPASS_SECRET` GitHub secret.
6. **Website insights**: set `INSIGHTS_PASSWORD` (12+ characters) and `INSIGHTS_SESSION_SECRET` (32+ random
   characters) in Vercel, then share the password with the staff who need it. Counts use the same Upstash database
   as rate limiting. See [ANALYTICS.md](ANALYTICS.md).
7. **Logs**: Vercel keeps runtime logs briefly. For history, add a log drain (*Settings → Log Drains*, e.g. Better
   Stack, Axiom or Datadog). Every line is JSON, so you can filter on `event`, `level` or `path`.

`GET /api/health` shows which of these are active:

```json
{ "status": "ok", "version": "1a2b3c4", "checks": { "inquiryDelivery": "configured", "rateLimit": "shared", "content": "cms", "alerts": "on" } }
```

## If something goes wrong

**🔴 "Website inquiries are being refused" or "could not be delivered"**
Families who try the form are being asked to call instead, so no inquiry is lost, but answer the phones.
1. Check the email provider's status page (Resend) and the webhook target (CRM, Zapier, etc.).
2. In Vercel, confirm the delivery variables are set for **Production**, then redeploy.
3. Watch for `inquiry.delivered` in the logs, then submit a test inquiry from the site.

**🔴 "Server error on …"**
1. Open Vercel → the deployment → *Logs*, and filter for `server.error`. The `digest` matches the "Ref." code a
   visitor may quote from the error page.
2. If the error started with the latest deployment, use *Instant Rollback* in Vercel (Deployments → previous →
   *Promote*). Then fix forward.
3. If it involves content (CMS), check what was published recently in the Studio and unpublish or fix it. The site
   falls back to built-in content when the CMS is unreachable.

**🔴 Uptime probe failing**
1. Open the site in a private window. If it is down, check Vercel's status page and the latest deployment.
2. If only `/api/health` fails with `degraded`, a delivery setting is missing (see the first case above).

**🔴 "A secure-form link … points to an unapproved site"**
Someone changed an enrollment or upload link in the Studio to a host that isn't on `SECURE_FORM_HOSTS`. The site is
already showing the safe default. Check in the Studio's history who changed *Contact details & secure forms*. If it
was a planned switch to a new BAA-covered vendor, add the host in Vercel and redeploy. If not, change the Studio
passwords and review its members.

**🔴 "Text alert NOT sent" or "FAILED to send"**
Families didn't get the text. For an emergency, send it from the SMS provider's own console now. Then check the
provider settings (`TEXT_ALERTS_PROVIDER_URL`) and the provider's status page, and publish the notice again to
retry.

**🟡 "A page failed to display in a visitor's browser"**
Usually a specific browser or device. Reproduce with the `userAgent` from the alert, using the page named. If it
happens once, it is probably an extension or an old browser; if it repeats, treat it as a bug.

**Many `csp.violation` logs for one URL**
Something on the page is trying to load a resource that isn't allowed. If it is a new legitimate service (an
embedded map, a video), extend the policy in `src/lib/security/csp.ts` deliberately. If it is unknown, investigate:
it may be injected code.

## Routine

- **Monthly**: look at `/admin/insights` (inquiries per 100 visits, how families heard about STARS), check that the uptime workflow is still running (GitHub pauses scheduled workflows in inactive
  repositories), review `client.error` and `csp.violation` volumes, and run `npm audit`.
- **After each content change**: nothing; the site revalidates itself.
- **Before a big launch or campaign**: run the Lighthouse and E2E workflows manually (*Actions → CI → Run workflow*).
