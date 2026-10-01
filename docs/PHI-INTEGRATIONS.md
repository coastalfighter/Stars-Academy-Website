# Secure enrollment, referrals and text alerts

How the website handles anything involving **protected health information (PHI)**, and how to switch each feature
on. Read this before choosing a vendor or changing a setting.

## The rule

**PHI never passes through the website's own systems.** Vercel (hosting), Sanity (CMS), Upstash (rate limits and
insights), Resend (inquiry email) and the analytics have no Business Associate Agreement (BAA) with STARS, and the
site is built so they don't need one:

- the website **guides** people (eligibility check, instructions, links), and that guidance runs in the visitor's
  browser or uses no personal data;
- PHI goes **directly from the visitor's browser to a service STARS has a BAA with** (a top-level link to that
  service, no embedding);
- links that receive PHI can be edited in the CMS, but **only work if their host is on `SECURE_FORM_HOSTS`**, an
  allowlist set in Vercel. A changed link to anywhere else is hidden, and the team gets a 🔴 alert. A stolen CMS
  login can't redirect families' data to a look-alike form.

| Feature | What the website does | Where PHI goes |
|---|---|---|
| Enrollment check (`/enroll`, `/es/inscripcion`) | Four questions answered in the browser; nothing is sent or stored. Only an anonymous "a check finished: fit / talk / over age" count goes to insights. | — |
| Secure enrollment | Links to the form | **Enrollment form service** (Adobe Acrobat Sign today) |
| Secure referrals (`/referrals`) | Lists the channels that are configured | **Upload service**, **Direct secure messaging**, fax |
| Text closure alerts | Text-to-join instructions; sends the text of a published closure to the provider | **SMS provider** (holds the subscriber list) |

## 1. Secure enrollment form

**Today:** the Adobe Acrobat Sign enrollment packet STARS already uses. Adobe Sign hosts (`*.documents.adobe.com`)
are allowed by default.

**To move to an online intake form** (shorter, mobile-friendly, ideally with a Spanish version):

1. Choose a form service that **signs a BAA with STARS on the plan you buy**. Many offer a BAA only on a specific
   HIPAA or enterprise tier: get the signed BAA before any family uses the form. Also check:
   - encryption in transit and at rest, plus access logs;
   - Spanish form support, and WCAG 2.1 AA accessibility (test it with the audit protocol);
   - staff notification without PHI in the email body (a "new submission" notice plus a secure login to view it);
   - export and deletion, so you can meet STARS' records-retention policy.
2. Build the form (English and Spanish). Collect only what intake needs.
3. Web team: add the form's host to `SECURE_FORM_HOSTS` in Vercel (e.g. `forms.yourvendor.com`), then redeploy.
4. Staff: Studio → **Contact details & secure forms** → *Secure forms & alerts* → paste the English and Spanish
   form links → Publish. The website switches over within seconds.
5. Submit a test enrollment in both languages, confirm that staff receive them, then delete the test entries.

## 2. Secure referrals

The referrals page always offers the intake phone line. It adds each of these once set up:

- **Secure upload link**: an upload page at a BAA-covered service. Add its host to `SECURE_FORM_HOSTS`, then paste
  the link in the Studio.
- **Direct secure messaging address**: what physicians' EHRs send to (e.g. `referrals@direct.mystarsacademy.org`).
  Get one from a HISP (Direct messaging provider) or from STARS' own EHR vendor if it includes one. Paste it in the
  Studio.
- **Fax**: the existing *Fax number* in Contact details.

## 3. Text-message closure alerts

**How it works:**
- Families text a keyword (e.g. `STARS`) to the provider's number; the provider keeps the list.
- When staff publish a **closure** or **urgent** notice with *Also text families* ticked, Sanity calls
  `/api/alerts/text`.
- The website re-reads the published notice, checks it, and sends the message to the provider through a signed
  webhook. The provider texts the list.
- The website never sees a phone number.

**Is the subscriber list PHI?** Sign-up is open to anyone, so being on the list doesn't prove a child attends
STARS. But most subscribers will be patient families, so treat the list as sensitive: choose a provider that will
sign a BAA if possible, and never upload a patient roster to it.

### Choosing and setting up a provider
1. Pick an SMS platform that offers keyword opt-in lists and can send to a list from an incoming webhook (directly,
   or through Zapier or Make). Prefer one that will sign a BAA.
2. **Carrier registration (required in the US):** register STARS for A2P 10DLC through the provider (brand and
   campaign: "Account notifications / emergency alerts"), or use a toll-free number with toll-free verification.
   Unregistered business texts are blocked. Approval can take days to weeks, so start early.
3. Set up the keyword and its replies with the provider:
   - **Sign-up confirmation:** "STARS Academy: You're signed up for closure and emergency alerts. Msg & data rates
     may apply. Reply HELP for help, STOP to cancel." Add a Spanish line.
   - **HELP reply:** STARS' name and phone number.
   - **STOP:** handled automatically by the provider. Never re-add someone who sent STOP.
4. Connect the provider so a signed POST from STARS sends a text to the list:
   - URL in `TEXT_ALERTS_PROVIDER_URL` (https);
   - shared secret in `TEXT_ALERTS_PROVIDER_SECRET`, so the receiver can check `X-Stars-Signature` (HMAC-SHA256,
     hex, of the raw body);
   - the body is
     `{"type":"stars.text_alert","id":"…","kind":"closure","message":"…","segments":2,"encoding":"UCS-2","sentAt":"…"}`;
   - it carries an `Idempotency-Key` header. If the provider supports idempotency keys, pass it on.
5. In Sanity → API → Webhooks, add a **second** webhook:
   - URL: `https://www.mystarsacademy.org/api/alerts/text`;
   - trigger on create and update; filter `_type == "announcement" && sendText == true`; projection `{_id}`;
   - secret: `TEXT_ALERTS_WEBHOOK_SECRET` (or reuse `SANITY_WEBHOOK_SECRET`).
6. In the Studio, under *Text-message closure alerts*, enter the number and keyword. The sign-up section then
   appears on Current Families in both languages.

### Switching it on safely
`TEXT_ALERTS_MODE` controls sending:

| Value | Behavior |
|---|---|
| unset / `off` | Nothing is sent (default) |
| `dry-run` | The exact text is posted to the staff alert chat; nothing goes to families |
| `live` | Texts are sent |

Run `dry-run` for at least one real closure, check the preview in the staff chat, then switch to `live`.

### Built-in safeguards
- Only **published** closure or urgent notices with *Also text families* ticked, showing now or within 12 hours,
  and not yet over.
- **Never twice:** re-publishing a notice whose text message hasn't changed sends nothing. Editing the text message
  and publishing sends the correction.
- **At most 4 alerts in 6 hours.** Beyond that, nothing is sent and the team gets a 🔴 alert: use the provider's
  own console in a genuine emergency.
- Texts are limited to 4 SMS parts. Spanish accents (á, í, ó, ú) shorten each part to 70 characters, and the site
  counts this exactly.
- Every send or dry run is posted to the staff alert chat. A failed send is posted as 🔴 and can be retried by
  publishing again.

## What not to do
- Don't put a form provider in `SECURE_FORM_HOSTS` before STARS has a signed BAA with it.
- Don't embed PHI forms in the website (iframes) or add fields that collect health details to the website's own
  inquiry form. Its PHI guard is there on purpose.
- Don't paste patient names or details into text alerts, announcements or any CMS field.
- Don't let the SMS provider import phone numbers from the patient records system: families opt in themselves.
