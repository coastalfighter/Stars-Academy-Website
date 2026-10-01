# Accessibility sessions with assistive-technology users

Automated checks run on every change: axe on every page in both languages, Lighthouse accessibility 100, and
keyboard tests. They catch perhaps a third of real barriers. This protocol covers the rest, with the people STARS
actually serves. Run it two weeks before launch, and again after any major change.

## Participants (5–6 people, one or two sessions each)

Recruit through the families STARS serves, the Arkansas School for the Blind and Visually Impaired, independent
living centers, or local disability organizations. Aim for:

| Who | Setup they bring or use |
|---|---|
| A blind screen-reader user | Windows with NVDA or JAWS, Chrome or Firefox |
| A blind screen-reader user on a phone | iPhone with VoiceOver (Safari) |
| A Spanish-speaking screen-reader or magnifier user | Their own device, Spanish site |
| A low-vision user | Browser zoom at 200–400% or screen magnification |
| A keyboard-only or switch user | Their own setup |
| A parent who is sensitive to motion, or of a sensory-sensitive child | Phone, with the 3D site and calm mode |

Pay participants for their time ($75–100 an hour is typical). Get consent to take notes. Never record or ask about
their health beyond what they choose to share. Sessions can be remote (screen share and audio) or at STARS.

## Tasks (60 minutes; read them aloud, don't demonstrate)

Give each person the site's address only. Use the Spanish wording for Spanish-speaking participants.

1. **Find out whether STARS takes your child's insurance.** / *Averigüe si STARS acepta el seguro de su hijo.*
   Success: reaches the funding answer (Medicaid, ARKids First, SSI, TEFRA).
2. **Find STARS' hours and phone number, and call.** Success: hears or reads the hours, and the phone link starts a
   call on mobile.
3. **Ask for a tour.** Fill in the form, make one mistake on purpose (leave the phone number empty), fix it and send
   it. Success: the error is announced, focus goes to the error summary, and the confirmation is announced.
4. **Switch the site to Spanish (or English) and back.** Success: lands on the same page in the other language.
5. **Find out what speech therapy at STARS looks like.** Success: reaches the speech therapy page and understands it.
6. **Find the next family event and add it to your calendar.** (Needs at least one event in the CMS.)
7. **Look at photos of the classrooms.** Open one larger, go to the next, close it. Success: descriptions are read,
   and focus returns to where they were.
8. **Motion-sensitive participants only:** scroll the home page, then turn on calm mode. Success: they find the
   switch and the motion stops.

After each task, ask: *How easy was that, from 1 (very hard) to 5 (very easy)? What got in the way?*

## Recording findings

One row per problem in a shared spreadsheet:

| Page | Task | What happened (in the participant's words) | Assistive technology | Severity | WCAG reference (if any) |
|---|---|---|---|---|---|

**Severity:**
- **Blocker**: the task can't be completed. Fix before launch.
- **Serious**: completed only with great effort or help. Fix before launch.
- **Moderate**: slows them down or confuses them. Fix within 30 days.
- **Minor**: polish. Schedule it.

## Manual checks between sessions (web team, about 2 hours)

These need a person; automated tools can't judge them.

- [ ] Keyboard only, every page: focus is always visible, the order makes sense, and nothing traps focus except the
      open mobile menu and photo viewer (both close with Escape).
- [ ] 320 px wide and at 400% zoom: no sideways scrolling, nothing cut off (WCAG 1.4.10).
- [ ] Text spacing bookmarklet (WCAG 1.4.12): nothing overlaps or disappears.
- [ ] Every image's description says what matters in that context; decorative images are silent.
- [ ] Headings read as a sensible outline (screen-reader headings list) in both languages.
- [ ] Spanish pages: screen readers switch to a Spanish voice, and English-only items such as untranslated CMS text
      are read in English.
- [ ] Error messages and the success message are announced without moving the visitor's place unexpectedly.
- [ ] Calm mode and the OS "reduce motion" setting both stop all motion, including the photo hover zoom.
- [ ] Targets are at least 24 × 24 px (WCAG 2.5.8). The site aims for 44 px.

## After the sessions

1. Fix blocker and serious findings. Retest with the same participant if possible.
2. Update the accessibility statement (`/accessibility`) with the review date and any known limitations.
3. Thank participants and tell them what changed because of them.
