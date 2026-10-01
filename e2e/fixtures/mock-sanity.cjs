/**
 * E2E only — preloaded with `node --require` into the CMS-enabled build and
 * server. Answers requests to *.sanity.io with fixture content so the CMS
 * features can be tested without a real Sanity project. Never used in
 * production: nothing in src/ references it.
 */
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const realFetch = globalThis.fetch;
const IMG = (name, w, h) => ({
  url: `https://cdn.sanity.io/images/e2etest01/production/${name}-${w}x${h}.webp`,
  width: w,
  height: h,
  lqip: "data:image/webp;base64,UklGRhAAAABXRUJQVlA4IAQAAAAwAQCdASoBAAEAAQAcJaACdLoB+AAA/v8AAA==",
});
/** Bytes for any cdn.sanity.io image: one of the site's own photos. */
const PHOTO = readFileSync(join(__dirname, "..", "..", "public", "photos", "classroom-play.webp"));
const HOUR = 3600e3;
const iso = (offsetHours) => new Date(Date.now() + offsetHours * HOUR).toISOString();

const fixtures = () => ({
  announcement: [
    {
      id: "e2e-closure",
      kind: "closure",
      title: { en: "STARS is closed today due to icy roads.", es: "STARS está cerrado hoy por las carreteras con hielo." },
      body: { en: "Vans will not run. We expect to reopen tomorrow at 7:00 a.m.", es: "Las camionetas no saldrán. Esperamos abrir mañana a las 7:00 a. m." },
      startsAt: iso(-1),
      endsAt: iso(48),
      banner: true,
      link: { label: { en: "Details", es: "Detalles" }, href: "/families#announcements" },
      sendText: true,
      text: { en: "Closed today due to icy roads. Vans will not run.", es: "Cerrado hoy por el hielo. No habrá camionetas." },
    },
    { id: "e2e-event", kind: "event", title: { en: "Family open house on Friday", es: null }, body: null, startsAt: iso(-2), endsAt: null, banner: false, link: null },
    { id: "e2e-future", kind: "urgent", title: { en: "Scheduled for later", es: null }, body: null, startsAt: iso(72), endsAt: null, banner: true, link: null },
    { id: "e2e-unsafe", kind: "info", title: { en: "Unsafe link" }, startsAt: iso(-1), link: { label: { en: "x" }, href: "javascript:alert(1)" } },
  ],
  faq: [
    {
      key: "weather",
      group: "current",
      question: { en: "How will I know if STARS is closed for weather?", es: "¿Cómo sabré si STARS cierra por el clima?" },
      answer: {
        en: "We post closures at the top of this website by 6:00 a.m.\n\nWe also call families on the van routes.",
        es: "Publicamos los cierres en la parte superior de este sitio antes de las 6:00 a. m.\n\nTambién llamamos a las familias de las rutas de camioneta.",
      },
    },
    { key: "ages", group: "families", question: { en: "What ages does STARS serve?", es: null }, answer: { en: "Birth to age six.", es: null } },
    {
      key: "medically-complex",
      group: "partners",
      question: { en: "Can STARS serve medically complex children?", es: "¿STARS puede atender a niños con necesidades médicas complejas?" },
      answer: { en: "Yes.", es: "Sí." },
    },
  ],
  jobOpening: [
    { key: "e2e-slp", team: "Therapy", title: "Pediatric Speech-Language Pathologist", body: "Join our interdisciplinary team.", requirements: ["Arkansas SLP license"], position: "clinical" },
  ],
  testimonial: [
    { id: "e2e-t1", quote: { en: "STARS gave our son words — and gave us our mornings back.", es: "STARS le dio palabras a nuestro hijo y nos devolvió nuestras mañanas." }, attribution: { en: "Maria, parent of a 4-year-old", es: "María, madre de un niño de 4 años" }, consentOnFile: true },
    { id: "e2e-t2", quote: { en: "Published without consent", es: null }, attribution: { en: "x", es: null }, consentOnFile: false },
  ],
  teamMember: [
    { id: "e2e-tm1", name: "Jane Doe", credentials: "M.S., CCC-SLP", role: { en: "Clinical Director", es: "Directora clínica" }, bio: null, group: "leadership", speaksSpanish: false, photo: null },
    {
      id: "e2e-tm2",
      name: "Rosa Martínez",
      credentials: "M.S., CCC-SLP",
      role: { en: "Bilingual Speech-Language Pathologist", es: "Patóloga del habla y lenguaje bilingüe" },
      bio: { en: "Rosa evaluates and treats children in English and Spanish.", es: "Rosa evalúa y atiende a niños en inglés y en español." },
      group: "therapy",
      speaksSpanish: true,
      photo: IMG("e2e-rosa", 1200, 801),
    },
    { id: "e2e-tm3", name: "Sam Lee", credentials: "RN", role: { en: "Nurse", es: null }, bio: null, group: "nursing", speaksSpanish: false, photo: null },
  ],
  event: [
    {
      id: "e2e-ev1",
      slug: "fall-open-house",
      title: { en: "Fall open house", es: "Puertas abiertas de otoño" },
      summary: { en: "Tour the classrooms and meet our therapists. Children are welcome.", es: "Recorra los salones y conozca a nuestros terapeutas. Los niños son bienvenidos." },
      startsAt: iso(24 * 5),
      endsAt: iso(24 * 5 + 2),
      allDay: false,
      audience: "families",
      location: "main",
      locationDetail: null,
      registration: { kind: "call", href: null },
      spanishAvailable: true,
    },
    {
      id: "e2e-ev2",
      slug: "hiring-day",
      title: { en: "Hiring day for developmental technicians", es: null },
      summary: null,
      startsAt: iso(24 * 10),
      endsAt: null,
      allDay: true,
      audience: "jobs",
      location: "other",
      locationDetail: { en: "Batesville Community Center", es: null },
      registration: { kind: "link", href: "https://example.org/signup" },
      spanishAvailable: false,
    },
    { id: "e2e-ev-past", slug: "past-event", title: { en: "Already over", es: null }, startsAt: iso(-30), endsAt: iso(-28), audience: "families", location: "main" },
    { id: "e2e-ev-bad", slug: "Bad Slug!", title: { en: "Invalid", es: null }, startsAt: iso(5), audience: "families", location: "main" },
  ],
  resource: [
    {
      id: "e2e-r1",
      title: { en: "Feeding tips at home", es: "Consejos de alimentación en casa" },
      summary: { en: "Simple ideas from our feeding therapists.", es: "Ideas sencillas de nuestras terapeutas de alimentación." },
      topic: "at-home",
      publisher: "STARS Academy",
      link: { en: null, es: null },
      file: { en: "https://cdn.sanity.io/files/e2etest01/production/abc123.pdf", es: "https://cdn.sanity.io/files/e2etest01/production/def456.pdf" },
    },
    {
      id: "e2e-r2",
      title: { en: "Developmental milestones", es: null },
      summary: { en: "Checklists by age.", es: null },
      topic: "development",
      publisher: "CDC",
      link: { en: "https://www.cdc.gov/act-early/index.html", es: null },
      file: { en: null, es: null },
    },
    { id: "e2e-r-bad", title: { en: "Unsafe" }, summary: { en: "x" }, topic: "community", link: { en: "javascript:alert(1)" }, file: {} },
  ],
  galleryPhoto: [
    { id: "e2e-g1", image: IMG("e2e-class", 1200, 801), alt: { en: "Two children build a block tower with a teacher.", es: "Dos niños construyen una torre de bloques con una maestra." }, caption: { en: "Block play", es: "Juego con bloques" }, topic: "classrooms", consentOnFile: true },
    { id: "e2e-g2", image: IMG("e2e-outside", 1200, 801), alt: { en: "A child laughs on the playground slide.", es: null }, caption: null, topic: "outdoors", consentOnFile: true },
    { id: "e2e-g-noconsent", image: IMG("e2e-secret", 1200, 801), alt: { en: "NO CONSENT PHOTO", es: null }, caption: null, topic: "therapy", consentOnFile: false },
  ],
  siteSettings: {
    fax: "870-555-0100",
    email: "info@mystarsacademy.org",
    southCampus: { street: "123 Example Rd.", city: "Batesville", region: "AR", postalCode: "72501", note: { en: "Infant and toddler classrooms", es: null } },
    // An unapproved host (must be dropped) and an approved one (SECURE_FORM_HOSTS in playwright.config.ts).
    enrollmentFormEn: "https://lookalike-forms.test/stars-enroll",
    referralUploadUrl: "https://upload.securefiles.test/stars",
    directAddress: "referrals@direct.stars.test",
    textAlerts: { number: "870-555-0199", keyword: "stars" },
  },
});

globalThis.fetch = async (input, init) => {
  const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
  if (url.hostname === "cdn.sanity.io") {
    return new Response(PHOTO, { status: 200, headers: { "content-type": "image/webp", "cache-control": "public, max-age=31536000" } });
  }
  if (!url.hostname.endsWith(".sanity.io")) return realFetch(input, init);
  const type = (url.searchParams.get("query") || "").match(/_type == "(\w+)"/)?.[1];
  let result = fixtures()[type] ?? null;
  // Single-document lookups by ID (e.g. the text-alert endpoint re-reading a notice).
  const idParam = url.searchParams.get("$id");
  if (idParam && Array.isArray(result)) result = result.find((d) => d.id === JSON.parse(idParam)) ?? null;
  // Mirror the GROQ filter (the site also re-validates consent itself).
  // Testimonials mirror the GROQ consent filter. Gallery photos deliberately
  // don't, to prove the site's own validation drops a photo without consent.
  if (type === "testimonial") result = result.filter((t) => t.consentOnFile);
  return new Response(JSON.stringify({ result }), { status: 200, headers: { "content-type": "application/json" } });
};
