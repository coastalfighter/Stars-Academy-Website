import type { Locale, Widen } from "@/i18n/config";

const en = {
  metaTitle: "Our Approach — Relationships, Regulation & Neuroaffirming Care",
  metaDescription:
    "How STARS Academy works with children: connection first, regulation, Conscious Discipline, an Adult First mindset, and sensory-informed, neuroaffirming care — in everyday words.",
  crumb: "Our approach",
  eyebrow: "Our approach",
  title: "Children learn best when they feel safe, connected and understood.",
  lede: "That single idea shapes everything at STARS — how our classrooms run, how therapists work, and how we support our own team. Here’s what our approach means, without the jargon.",
  inShort: "In short",
  shortA: "We start with",
  shortConnection: "connection",
  shortB: ", help children find",
  shortCalm: "calm",
  shortC: ", respect how each child’s brain and body work — and then build skills from there.",
  pillarsEyebrow: "Six ideas",
  pillarsTitle: "What guides our work",
  topicsLabel: "Approach topics",
  looksLike: "What it can look like",
  familiesEyebrow: "For families",
  familiesTitle: "What this means for your child",
  familiesCta: "Is STARS right for my child?",
  teamEyebrow: "For our team",
  teamTitle: "What this means if you work here",
  teamLede:
    "Adult First isn’t just for classrooms. It shapes how we support our own people — because regulated adults are the foundation of everything we do for children.",
  teamCta: "Careers at STARS",
  nextTitle: "See our approach in action.",
  nextBody: "The best way to understand how STARS feels is to visit. Come see the classrooms, meet the team and ask anything.",
  nextTour: "Schedule a tour",
  nextServices: "Explore services",
  related: [
    { title: "Getting started", body: "Eligibility, funding and the steps to enroll." },
    { title: "About STARS", body: "Our story, vision and values." },
  ],
} as const;

const es = {
  metaTitle: "Nuestro enfoque: relaciones, autorregulación y atención neuroafirmativa",
  metaDescription:
    "Cómo trabaja STARS Academy con los niños: primero la conexión, la autorregulación, Conscious Discipline, la mentalidad “Adult First” y una atención sensorial y neuroafirmativa, en palabras sencillas.",
  crumb: "Nuestro enfoque",
  eyebrow: "Nuestro enfoque",
  title: "Los niños aprenden mejor cuando se sienten seguros, conectados y comprendidos.",
  lede: "Esa sola idea da forma a todo en STARS: cómo funcionan nuestras aulas, cómo trabajan los terapeutas y cómo apoyamos a nuestro propio equipo. Esto es lo que significa nuestro enfoque, sin tecnicismos.",
  inShort: "En pocas palabras",
  shortA: "Empezamos por la",
  shortConnection: "conexión",
  shortB: ", ayudamos a los niños a encontrar la",
  shortCalm: "calma",
  shortC: ", respetamos cómo funcionan el cerebro y el cuerpo de cada niño, y desde ahí desarrollamos habilidades.",
  pillarsEyebrow: "Seis ideas",
  pillarsTitle: "Lo que guía nuestro trabajo",
  topicsLabel: "Temas de nuestro enfoque",
  looksLike: "Cómo se ve en la práctica",
  familiesEyebrow: "Para familias",
  familiesTitle: "Qué significa esto para su hijo",
  familiesCta: "¿Es STARS adecuado para mi hijo?",
  teamEyebrow: "Para nuestro equipo",
  teamTitle: "Qué significa esto si trabaja aquí",
  teamLede:
    "“Adult First” no es solo para las aulas. También define cómo apoyamos a nuestro personal, porque los adultos en calma son la base de todo lo que hacemos por los niños.",
  teamCta: "Empleos en STARS (en inglés)",
  nextTitle: "Vea nuestro enfoque en acción.",
  nextBody: "La mejor manera de entender cómo se siente STARS es visitarnos. Venga a ver las aulas, conozca al equipo y pregunte lo que quiera.",
  nextTour: "Programar una visita",
  nextServices: "Ver los servicios",
  related: [
    { title: "Cómo empezar", body: "Elegibilidad, financiamiento y los pasos para inscribirse." },
    { title: "Sobre STARS", body: "Nuestra historia, visión y valores." },
  ],
} as const satisfies Widen<typeof en>;

export const approachCopy: Record<Locale, Widen<typeof en>> = { en, es };
