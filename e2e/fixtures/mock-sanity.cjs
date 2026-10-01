/**
 * E2E only — preloaded with `node --require` into the CMS-enabled build and
 * server. Answers requests to *.sanity.io with fixture content so the CMS
 * features can be tested without a real Sanity project. Never used in
 * production: nothing in src/ references it.
 */
const realFetch = globalThis.fetch;
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
  teamMember: [{ id: "e2e-tm1", name: "Jane Doe", credentials: "M.S., CCC-SLP", role: { en: "Clinical Director", es: "Directora clínica" }, bio: null }],
  siteSettings: {
    fax: "870-555-0100",
    email: "info@mystarsacademy.org",
    southCampus: { street: "123 Example Rd.", city: "Batesville", region: "AR", postalCode: "72501", note: { en: "Infant and toddler classrooms", es: null } },
  },
});

globalThis.fetch = async (input, init) => {
  const url = new URL(typeof input === "string" ? input : input.url);
  if (!url.hostname.endsWith(".sanity.io")) return realFetch(input, init);
  const type = (url.searchParams.get("query") || "").match(/_type == "(\w+)"/)?.[1];
  let result = fixtures()[type] ?? null;
  // Mirror the GROQ filter (the site also re-validates consent itself).
  if (type === "testimonial") result = result.filter((t) => t.consentOnFile);
  return new Response(JSON.stringify({ result }), { status: 200, headers: { "content-type": "application/json" } });
};
