import type { Locale, Widen } from "@/i18n/config";

/** Home page (3D scroll story) copy, English and Spanish side by side. */
const en = {
  metaTitle: "STARS Academy | Pediatric Therapy & Developmental Preschool in Batesville, AR",
  hero: {
    eyebrow: "Pediatric therapy & developmental preschool · Batesville, AR",
    titleBefore: "Therapy, learning and care,",
    titleEmphasis: "woven into",
    titleAfter: "one full day.",
    lede: "STARS Academy serves children from birth to age six who need extra support with development. Speech, occupational and physical therapy, licensed nursing care and developmental classrooms all happen here — together, with one team that knows your child.",
    primaryCta: "See if STARS is right for your child",
    secondaryCta: "Schedule a tour",
    preferTalk: "Prefer to talk? Call",
    teamLabel: "One team, on site",
    disciplines: ["Speech", "Occupational", "Physical", "Nursing", "Classrooms"],
  },
  pathways: {
    facts: [
      { k: "Serving families since", v: "2009" },
      { k: "Children from", v: "Birth to age 6" },
      { k: "Paid through", v: "Medicaid, incl. ARKids First-A, SSI & TEFRA" },
      { k: "Speech therapy", v: "In English & Spanish" },
    ],
    findYourWay: "Find your way",
  },
  what: {
    eyebrow: "What STARS is",
    titleA: "Not a daycare. Not a therapy clinic.",
    titleB: "Both, working as one.",
    lede: "Many families piece support together — a preschool in one place, therapy appointments somewhere else, medical instructions on a sheet of paper. At STARS, it all happens here, in one day, with one team that talks to each other about your child.",
    quoteA: "At STARS, these aren’t three separate places.",
    quoteB: "One day. One plan. One team.",
    illustration:
      "Illustration: three overlapping circles — developmental classroom, therapy and nursing. Where all three meet is your child.",
  },
  day: {
    eyebrow: "A day at STARS",
    title: "What “one full day” actually looks like.",
    lede: "Therapy isn’t a separate trip across town that has to fit around everything else. It’s part of how the whole day works.",
    now: "Right now at STARS",
    scheduleNote: "Every child’s schedule is individualized. Open",
  },
  services: {
    eyebrow: "Services",
    titleA: "Everything your child needs,",
    titleB: "under one roof.",
    lede: "Five disciplines, one coordinated plan. Each is led by professionals in that field — and they work together every day around the same child.",
  },
  approach: {
    eyebrow: "Our approach",
    title: "Children learn best when they feel safe, connected and understood.",
    ledeBefore: "So that’s where we start. Our culture is shaped by",
    ledeAfter:
      ", an Adult First mindset, and sensory-informed, neuroaffirming care. Here’s what that means — in everyday words.",
    readMore: "Read about our approach",
  },
  eligibility: {
    eyebrow: "For families",
    titleBefore: "Could STARS help",
    titleEmphasis: "your",
    titleAfter: "child?",
    lede: "STARS may be a good fit if your child is between birth and age six and…",
    payingLabel: "Paying for services:",
    payingBody: "We can check your child’s coverage for you. You don’t need a diagnosis to ask a question.",
    payingPrefix: "Services are paid for through",
    stepsTitle: "Getting started takes four steps",
    cta: "Start a conversation",
  },
  trust: {
    eyebrow: "Why families trust STARS",
    title: "An established team, rooted in this community.",
    valuesTitle: "Five values that guide how we work",
  },
  name: {
    eyebrow: "Our name is our promise",
    title: "Every child, every day.",
    lede: "Success looks different for every child — a first word, a first step, a calm goodbye at drop-off. We build it one block at a time.",
  },
  referrals: {
    eyebrow: "For physicians, therapists & schools",
    title: "A clear path to refer a child.",
    lede: "Everything you need before referring: who we serve, eligibility, the conditions our nurses and therapists routinely support, and exactly how to start.",
    criteriaTitle: "Referral criteria",
    criteriaIntro: "A child is eligible for services at STARS when they:",
    cta: "Start a referral",
    glance: "STARS at a glance",
    scope: "Clinical scope",
  },
  careers: {
    eyebrow: "Careers",
    titleA: "Do the work you trained for,",
    titleB: "with a team behind you.",
    lede: "Therapists, nurses and educators at STARS work side by side, every day, around the same children. If that’s the kind of practice you’ve been looking for, we’d love to meet you.",
    why: [
      {
        title: "A true interdisciplinary team",
        body: "Speech, occupational and physical therapists, nurses and classroom teams work under one roof, around the same children — every day.",
      },
      {
        title: "Time to really know each child",
        body: "Children spend the whole day at STARS. Your work carries over into real moments — play, meals, movement.",
      },
      {
        title: "A culture that takes care of adults, too",
        body: "Our Adult First mindset recognizes that caring well for children starts with the adults who do it.",
      },
    ],
    rolesTitle: "We hire for these roles on an ongoing basis",
    apply: "Apply now",
    explore: "Explore careers",
  },
  visit: {
    eyebrow: "Come see for yourself",
    titleA: "The best way to understand STARS is to",
    titleB: "walk through the door.",
    lede: "Tours are relaxed and there’s no commitment. You’ll see the classrooms and therapy spaces, meet our team and get your questions answered.",
    cta: "Schedule a tour",
    call: "Call us",
  },
} as const;

const es = {
  metaTitle: "STARS Academy | Terapia pediátrica y preescolar de desarrollo en Batesville, AR",
  hero: {
    eyebrow: "Terapia pediátrica y preescolar de desarrollo · Batesville, AR",
    titleBefore: "Terapia, aprendizaje y cuidado,",
    titleEmphasis: "integrados en",
    titleAfter: "un día completo.",
    lede: "STARS Academy atiende a niños desde el nacimiento hasta los seis años que necesitan apoyo adicional en su desarrollo. La terapia del habla y lenguaje, la terapia ocupacional y la terapia física, la enfermería con personal con licencia y las aulas de desarrollo ocurren aquí, juntas, con un solo equipo que conoce a su hijo.",
    primaryCta: "Vea si STARS es adecuado para su hijo",
    secondaryCta: "Programar una visita",
    preferTalk: "¿Prefiere hablar por teléfono? Llame al",
    teamLabel: "Un solo equipo, en el centro",
    disciplines: ["Habla", "Ocupacional", "Física", "Enfermería", "Aulas"],
  },
  pathways: {
    facts: [
      { k: "Al servicio de las familias desde", v: "2009" },
      { k: "Niños de", v: "0 a 6 años" },
      { k: "Se paga con", v: "Medicaid, incluidos ARKids First-A, SSI y TEFRA" },
      { k: "Terapia del habla", v: "En inglés y en español" },
    ],
    findYourWay: "Encuentre lo que busca",
  },
  what: {
    eyebrow: "Qué es STARS",
    titleA: "No es una guardería. No es una clínica de terapia.",
    titleB: "Es ambas cosas, trabajando como una sola.",
    lede: "Muchas familias arman el apoyo por partes: un preescolar en un lugar, citas de terapia en otro, instrucciones médicas en una hoja de papel. En STARS todo ocurre aquí, en un solo día, con un solo equipo que habla entre sí sobre su hijo.",
    quoteA: "En STARS, estos no son tres lugares distintos.",
    quoteB: "Un día. Un plan. Un equipo.",
    illustration:
      "Ilustración: tres círculos que se superponen: aula de desarrollo, terapia y enfermería. Donde se unen los tres está su hijo.",
  },
  day: {
    eyebrow: "Un día en STARS",
    title: "Cómo es en realidad “un día completo”.",
    lede: "La terapia no es un viaje aparte al otro lado de la ciudad que hay que acomodar entre todo lo demás. Es parte de cómo funciona todo el día.",
    now: "Ahora mismo en STARS",
    scheduleNote: "El horario de cada niño es individual. Horario:",
  },
  services: {
    eyebrow: "Servicios",
    titleA: "Todo lo que su hijo necesita,",
    titleB: "en un solo lugar.",
    lede: "Cinco disciplinas, un plan coordinado. Cada una la dirigen profesionales de su área, y trabajan juntos todos los días en torno al mismo niño.",
  },
  approach: {
    eyebrow: "Nuestro enfoque",
    title: "Los niños aprenden mejor cuando se sienten seguros, conectados y comprendidos.",
    ledeBefore: "Por eso empezamos ahí. Nuestra cultura se basa en",
    ledeAfter:
      ", la mentalidad “Adult First” (primero el adulto) y una atención sensorial y neuroafirmativa. Esto es lo que significa, en palabras sencillas.",
    readMore: "Conozca nuestro enfoque",
  },
  eligibility: {
    eyebrow: "Para familias",
    titleBefore: "¿Podría STARS ayudar a",
    titleEmphasis: "su",
    titleAfter: "hijo?",
    lede: "STARS puede ser una buena opción si su hijo tiene entre 0 y 6 años y…",
    payingLabel: "Cómo se pagan los servicios:",
    payingBody: "Podemos revisar la cobertura de su hijo por usted. No necesita un diagnóstico para hacernos una pregunta.",
    payingPrefix: "Los servicios se pagan con",
    stepsTitle: "Empezar lleva cuatro pasos",
    cta: "Iniciar una conversación",
  },
  trust: {
    eyebrow: "Por qué las familias confían en STARS",
    title: "Un equipo con trayectoria, con raíces en esta comunidad.",
    valuesTitle: "Cinco valores que guían nuestro trabajo",
  },
  name: {
    eyebrow: "Nuestro nombre es nuestra promesa",
    title: "Cada niño, cada día.",
    lede: "El éxito se ve diferente para cada niño: una primera palabra, un primer paso, una despedida tranquila al llegar. Lo construimos bloque a bloque.",
  },
  referrals: {
    eyebrow: "Para médicos, terapeutas y escuelas",
    title: "Un camino claro para referir a un niño.",
    lede: "Todo lo que necesita saber antes de referir: a quién atendemos, la elegibilidad, las condiciones que nuestros enfermeros y terapeutas atienden de forma habitual y cómo empezar.",
    criteriaTitle: "Criterios de referencia",
    criteriaIntro: "Un niño es elegible para los servicios de STARS cuando:",
    cta: "Información para referir (en inglés)",
    glance: "STARS de un vistazo",
    scope: "Alcance clínico",
  },
  careers: {
    eyebrow: "Empleos",
    titleA: "Haga el trabajo para el que se preparó,",
    titleB: "con un equipo que le respalda.",
    lede: "En STARS, terapeutas, enfermeros y educadores trabajan lado a lado, todos los días, en torno a los mismos niños. Si ese es el tipo de práctica que busca, nos encantaría conocerle.",
    why: [
      {
        title: "Un verdadero equipo interdisciplinario",
        body: "Terapeutas del habla, ocupacionales y físicos, enfermeros y equipos de aula trabajan bajo un mismo techo, en torno a los mismos niños, todos los días.",
      },
      {
        title: "Tiempo para conocer de verdad a cada niño",
        body: "Los niños pasan el día completo en STARS. Su trabajo se refleja en momentos reales: el juego, las comidas, el movimiento.",
      },
      {
        title: "Una cultura que también cuida a los adultos",
        body: "Nuestra mentalidad “Adult First” reconoce que cuidar bien a los niños empieza por los adultos que lo hacen.",
      },
    ],
    rolesTitle: "Contratamos para estos puestos de forma continua",
    apply: "Solicitar empleo (en inglés)",
    explore: "Ver empleos (en inglés)",
  },
  visit: {
    eyebrow: "Venga a conocernos",
    titleA: "La mejor manera de entender STARS es",
    titleB: "cruzar nuestra puerta.",
    lede: "Las visitas son tranquilas y sin compromiso. Verá las aulas y los espacios de terapia, conocerá a nuestro equipo y resolverá sus dudas.",
    cta: "Programar una visita",
    call: "Llámenos",
  },
} as const satisfies Widen<typeof en>;

export type HomeCopy = Widen<typeof en>;
export const homeCopy: Record<Locale, HomeCopy> = { en, es };
