# Content checklist — items for STARS to confirm

> **Since Milestone 4, staff can enter many of these directly in the CMS** (see `docs/EDITOR-GUIDE.md`):
> closures and weather notices, holiday closures and announcements, leadership profiles, family testimonials
> (with consent), the fax number, the general email, the STARS Academy South address, job openings, and new
> FAQs (for example the weather-closure question). Items marked 🛠 still need a developer.

The redesign only publishes facts that appear on the current STARS website.
Anything that site marked **[Client to confirm]** is listed here instead of being shown to visitors.
Once STARS confirms an item, add it to `src/content/*.ts`.

## Organization
- [ ] Founder story, key milestones (e.g. opening STARS Academy South)
- [ ] STARS Academy South street address and what's offered there
- [ ] Leadership: names, titles, credentials and portraits (natural light, candid)
- [ ] A real family testimonial (2–3 sentences) with written permission, plus parent first name and child's age/program

## Families
- [ ] Exact classroom age groupings and class sizes
- [ ] Typical time from first call to first day; whether there is a waitlist
- [ ] Whether private insurance is accepted; any out-of-pocket costs
- [ ] Whether STARS requests the prescription from the physician for the family
- [ ] Who completes evaluations and how they're scheduled
- [ ] Typical therapy session length and frequency (speech, OT, PT)
- [ ] How often progress is reviewed with families; how teachers communicate (notes, app, conferences)
- [ ] Transportation: eligibility, service area, how to request
- [ ] Other Spanish-language support beyond speech-language services
- [ ] Summer services for school-age children
- [ ] Absence reporting process; weather/emergency closure announcements
- [ ] Health forms and physician orders required at enrollment and for medication changes
- [ ] Enrollment inquiry packet link (Adobe Sign)

## Referral partners
- [ ] Referral fax number or secure method for prescriptions and records
- [ ] Downloadable referral packet / prescription form (PDF)
- [ ] Format and frequency of progress reports to prescribing physicians
- [ ] School districts STARS partners with and the kindergarten transition process

## Careers
- [ ] Benefits (health insurance, PTO, CEUs, schedule) and 1–2 staff quotes (with permission)
- [ ] Currently open clinical roles and licensure requirements
- [ ] Interview steps and typical hiring timeline

## Legal & compliance (Milestone 2)
- [ ] **Complete USDA nondiscrimination statement** (with program-information and complaint-filing instructions), exactly as provided by the sponsoring agency — `/nondiscrimination` currently shows the short form only
- [ ] Compliance review of the website privacy notice (`/privacy`), which describes this build: no analytics, form submissions delivered by email/webhook and not stored, calm-mode preference kept in the visitor's browser
- [ ] Link to the HIPAA Notice of Privacy Practices (PDF)
- [ ] Hosting provider name and log-retention period
- [ ] Main fax number and general inbox (e.g. info@mystarsacademy.org) for the Contact page
- [ ] Direct emails per team (enrollment, referrals, current families, HR)

## Current families (Milestone 2)
- [ ] Announcements (closures, events, reminders)
- [ ] Holiday closure calendar for the current school year
- [ ] How weather/emergency closures are announced (the FAQ answer is withheld until confirmed)
- [ ] Van pick-up/drop-off windows, what to do if a child won't ride, how to request route changes
- [ ] Illness/exclusion policy and required medication forms
- [ ] When kindergarten-transition conversations begin and what to prepare
- [ ] Parent handbook, forms and family videos

## Careers (Milestone 2)
- [ ] Résumé collection: the new site sends applicants to the Adobe Sign application (which accepts attachments) rather than accepting file uploads on the website — confirm this is acceptable

## CMS setup (Milestone 4)
- [ ] 🛠 Create the Sanity project, deploy the Studio, import the seed, add the webhook and token (README → Content management)
- [ ] Invite staff editors to the Sanity project (Editor role); keep tokens with the web team only
- [ ] Decide who may publish testimonials and how written consent forms are filed

## Spanish site (Milestone 3)
- [ ] **Professional health-care translation review** of all Spanish copy: `src/content/es/*`, the `es` blocks in `src/content/copy/*`, `src/i18n/dictionaries/es.ts` and `src/i18n/messages.ts`. Register is formal *usted* and neutral U.S. Spanish.
- [ ] **Official Spanish USDA nondiscrimination statement**: `/es/no-discriminacion` shows a provisional translation of the short form, labelled as such
- [ ] Spanish review of the privacy notice by the compliance advisor
- [ ] Confirm the Spanish glossing of the STARS acronym ("Esforzarnos para lograr un éxito verdadero")
- [ ] Decide whether referral-partner and careers pages should also be translated (currently English-only, labelled "(en inglés)")
- [ ] Bilingual staff available to return Spanish inquiries (inquiry emails show "Sent from: Spanish website")

## Leadership review
- [ ] STARS leadership to review the "Our approach" descriptions and examples for accuracy
