/**
 * Organization-wide facts. Every value here was taken from the current
 * STARS Academy website; items that the client has not yet confirmed are
 * tracked in docs/CONTENT-CHECKLIST.md rather than rendered as placeholders.
 */
export const site = {
  name: "STARS Academy",
  legalName: "MKJD, LLC dba STARS Academy",
  tagline: "Therapy, learning and care for young children — woven into one full day.",
  acronym: ["Striving", "To", "Achieve", "Real", "Success"] as const,
  description:
    "STARS Academy is a pediatric developmental day treatment program in Batesville, Arkansas. Speech, occupational and physical therapy, licensed nursing care and developmental classrooms for children from birth to age six — together, with one team.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.mystarsacademy.org",
  founded: 2009,
  phone: {
    display: "870-793-3200",
    href: "tel:+18707933200",
    e164: "+18707933200",
  },
  hours: {
    display: "Monday – Friday, 7:00 a.m. – 3:00 p.m.",
    short: "Weekdays 7:00 a.m.–3:00 p.m.",
    opens: "07:00",
    closes: "15:00",
  },
  address: {
    street: "200 General St.",
    city: "Batesville",
    region: "AR",
    postalCode: "72501",
    country: "US",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=200+General+St.,+Batesville,+AR+72501",
  },
  social: {
    facebook: "https://www.facebook.com/mystarsacademy/",
    instagram: "https://www.instagram.com/mystarsacademy/",
  },
  /** Secure, externally hosted forms (Adobe Sign) used by the current site. */
  secureForms: {
    enrollmentPacket:
      "https://na4.documents.adobe.com/public/esignWidget?wid=CBFCIBAA3AAABLblqZhACX2ZpXOJn_gHX7sIR_bcsOkK9_GYNEDGClHSud3fLZXWrK1COPp9ZxumVs-XZ7Gg*",
    employmentApplication:
      "https://na4.documents.adobe.com/public/esignWidget?wid=CBFCIBAA3AAABLblqZhCMwQ2jnd6xwJVEtTjA4cAO3e9AMU9yotSxgFUvjDH89-se2zjb3BVDgbtudWBzcEo*",
  },
  consciousDisciplineUrl: "https://consciousdiscipline.com/",
  ages: "Birth to age 6",
  funding: "Medicaid, including ARKids First-A, SSI and TEFRA",
  stats: [
    { value: 2009, label: "Founded — locally owned and operated", suffix: "" },
    { value: 140, label: "Children currently served (approx.)", suffix: "" },
    { value: 85, label: "Teachers, therapists, nurses and staff (approx.)", suffix: "" },
    { value: 2, label: "Family-friendly Batesville facilities", suffix: "" },
  ],
} as const;

export type NavItem = { label: string; href: string; description?: string };

export const primaryNav: NavItem[] = [
  { label: "Our approach", href: "/approach" },
  { label: "Services", href: "/services" },
  { label: "Getting started", href: "/getting-started" },
  { label: "Referral partners", href: "/referrals" },
  { label: "Careers", href: "/careers" },
];

export const utilityNav: NavItem[] = [
  { label: "Current families", href: "/families" },
  { label: "About", href: "/about-us" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact-us" },
];

export const pathways: { audience: string; action: string; href: string }[] = [
  { audience: "Parents & caregivers", action: "Explore STARS for my child", href: "/getting-started" },
  { audience: "Current STARS families", action: "Find family information", href: "/families" },
  { audience: "Physicians & schools", action: "Refer a child", href: "/referrals" },
  { audience: "Therapists, nurses & educators", action: "Work at STARS", href: "/careers" },
];

export const pillars = [
  {
    n: "01",
    title: "A developmental preschool",
    body: "Warm, well-run classrooms for infants, toddlers and preschoolers — built so every child learns at their own pace.",
  },
  {
    n: "02",
    title: "A pediatric therapy team",
    body: "Licensed speech, occupational and physical therapists who work with your child during the day, not across town.",
  },
  {
    n: "03",
    title: "On-site licensed nurses",
    body: "Full-time nurses who manage medications, feedings and complex medical needs so children can join in fully.",
  },
] as const;

export const dayTimeline = [
  {
    time: "7:00 a.m.",
    hour: 7,
    title: "Arrive & connect",
    body: "Familiar faces greet each child. A calm, predictable start helps them feel safe enough to learn.",
  },
  {
    time: "Morning",
    hour: 9,
    title: "Learn through play",
    body: "Circle time, centers and sensory play — each set up around the skills in your child’s plan.",
  },
  {
    time: "Through the day",
    hour: 11,
    title: "Therapy, woven in",
    body: "Therapists work one-on-one and in the classroom, so new skills show up in real moments.",
  },
  {
    time: "Midday",
    hour: 12.5,
    title: "Care & nourishment",
    body: "Nurses handle medications and feedings on site; mealtimes become practice for independence.",
  },
  {
    time: "3:00 p.m.",
    hour: 15,
    title: "Head home",
    body: "Children leave with a full day of learning — and families stay in the loop about their progress.",
  },
] as const;

export const approachPrinciples = [
  {
    title: "Connection comes first",
    body: "Children learn from people they trust. Relationships are the foundation for everything else we do.",
  },
  {
    title: "Calm adults help children calm",
    body: "Our “Adult First” mindset means staff learn to manage their own stress so they can steady the children in their care.",
  },
  {
    title: "Every sense matters",
    body: "Some children feel sound, touch and movement more or less intensely. We notice, and plan for it.",
  },
  {
    title: "Different, not less",
    body: "We’re neuroaffirming: we build on each child’s strengths and support what’s hard, without trying to make them “typical.”",
  },
] as const;

export const fitSignals = [
  "is behind in talking, moving, playing or self-care",
  "has a diagnosis such as autism, Down syndrome, cerebral palsy, or a history of prematurity",
  "has medical needs that make a typical preschool or daycare hard",
  "has been recommended for therapy by a doctor, therapist or school",
] as const;

export const enrollmentSteps = [
  { title: "Reach out", body: "Call or send an inquiry. We’ll listen and answer your questions." },
  { title: "Visit", body: "Tour STARS and meet the team who would work with your child." },
  { title: "Evaluation & prescription", body: "Your child is evaluated, and their doctor prescribes treatment." },
  { title: "First day", body: "We verify coverage, build a plan together and welcome your child." },
] as const;

export const referralFacts = [
  { label: "Program", value: "Pediatric developmental day treatment — full-day, center-based" },
  { label: "Ages", value: "Birth to 6 years" },
  { label: "Services", value: "Speech, OT, PT, nursing, developmental classrooms" },
  { label: "Requires", value: "Prescription from the child’s primary care physician" },
  { label: "Funding", value: "Medicaid, including ARKids First-A, SSI, TEFRA" },
  { label: "Languages", value: "Speech-language evaluation and therapy available in Spanish" },
] as const;

export const referralCriteria = [
  "Have active health insurance (Medicaid funding, including ARKids First-A, SSI and TEFRA).",
  "Qualify in developmental services and at least one of: speech therapy, occupational therapy, physical therapy or nursing services.",
  "Have treatment prescribed by their primary care physician.",
] as const;

export const careerRoles = [
  {
    team: "Classroom",
    title: "Early Childhood Developmental Specialist",
    requirement: "Four-year degree with an emphasis in early childhood education",
  },
  {
    team: "Classroom",
    title: "Early Childhood Developmental Technician",
    requirement: "High school diploma or GED · pre-employment drug screen",
  },
  {
    team: "Therapy & nursing",
    title: "SLPs, OTs, PTs, assistants & licensed nurses",
    requirement: "Current Arkansas licensure for your discipline",
  },
  {
    team: "Transportation",
    title: "Van Driver & Van Rider",
    requirement: "High school diploma or GED · drivers 25+ · drug screen",
  },
] as const;

export const values = [
  { name: "Positivity", body: "We celebrate a culture of love, hope, and compassion which drives our success." },
  { name: "Purpose", body: "We provide superior quality care while working as a team to fuel success." },
  { name: "Communication", body: "We strive for transparency that encourages sharing information which leads to success." },
  { name: "Empowerment", body: "We equip our patients and staff with the tools necessary to achieve success." },
  { name: "Adaptability", body: "We dedicate ourselves to overcome challenges and obstacles with a positive attitude to deliver success." },
] as const;

export const nondiscriminationSummary =
  "In accordance with Federal civil rights law and U.S. Department of Agriculture (USDA) civil rights regulations and policies, this institution is prohibited from discriminating based on race, color, national origin, sex (including gender identity and sexual orientation), disability, age, or reprisal or retaliation for prior civil rights activity in any program or activity conducted or funded by USDA.";
