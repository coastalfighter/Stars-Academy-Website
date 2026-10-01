import type { Locale, Widen } from "@/i18n/config";

const en = {
  metaTitle: "About STARS — Locally Owned in Batesville Since 2009",
  metaDescription:
    "STARS Academy is a locally owned therapy clinic and developmental preschool in Batesville, Arkansas — about 85 people serving about 140 children and their families.",
  crumb: "About",
  eyebrow: "About STARS",
  title: "Locally owned. Deeply rooted. Built around children.",
  lede: "Since 2009, STARS Academy has grown from a Batesville therapy clinic and developmental preschool into a team of about 85 people serving about 140 children and their families.",
  storyEyebrow: "Our story",
  storyTitle: "We are family.",
  nameEyebrow: "Our name",
  nameTitle: "What STARS stands for.",
  nameLede: "Our name is also our promise to every child and family.",
  visionEyebrow: "Our vision",
  visionTitle: "Something good in every day.",
  valuesTitle: "Five values that guide how we work",
  facilitiesEyebrow: "Our facilities",
  facilitiesTitle: "Two family-friendly facilities in Batesville.",
  facilitiesLede: "Visit our main campus to see the classrooms, private therapy rooms and therapy gym.",
  facebook: "STARS on Facebook",
  instagram: "STARS on Instagram",
  nextTitle: "Get to know us in person.",
  nextBody: "Visit STARS, meet our team and see how we work with children every day.",
  nextTour: "Schedule a tour",
  related: [
    { title: "Careers at STARS", body: "Do the work you trained for, with a team behind you." },
    { title: "Our approach", body: "The philosophy behind the work." },
  ],
} as const;

const es = {
  metaTitle: "Sobre STARS: de propiedad local en Batesville desde 2009",
  metaDescription:
    "STARS Academy es una clínica de terapia y preescolar de desarrollo de propiedad local en Batesville, Arkansas: unas 85 personas que atienden a unos 140 niños y sus familias.",
  crumb: "Sobre STARS",
  eyebrow: "Sobre STARS",
  title: "De propiedad local. Con raíces profundas. Pensado para los niños.",
  lede: "Desde 2009, STARS Academy ha pasado de ser una clínica de terapia y preescolar de desarrollo en Batesville a un equipo de unas 85 personas que atiende a unos 140 niños y sus familias.",
  storyEyebrow: "Nuestra historia",
  storyTitle: "Somos familia.",
  nameEyebrow: "Nuestro nombre",
  nameTitle: "Qué significa STARS.",
  nameLede: "Nuestro nombre también es nuestra promesa a cada niño y cada familia.",
  visionEyebrow: "Nuestra visión",
  visionTitle: "Algo bueno en cada día.",
  valuesTitle: "Cinco valores que guían nuestro trabajo",
  facilitiesEyebrow: "Nuestras instalaciones",
  facilitiesTitle: "Dos instalaciones en Batesville pensadas para las familias.",
  facilitiesLede: "Visite nuestro centro principal para ver las aulas, las salas privadas de terapia y el gimnasio de terapia.",
  facebook: "STARS en Facebook",
  instagram: "STARS en Instagram",
  nextTitle: "Conózcanos en persona.",
  nextBody: "Visite STARS, conozca a nuestro equipo y vea cómo trabajamos con los niños todos los días.",
  nextTour: "Programar una visita",
  related: [
    { title: "Empleos en STARS (en inglés)", body: "Haga el trabajo para el que se preparó, con un equipo que le respalda." },
    { title: "Nuestro enfoque", body: "La filosofía detrás de nuestro trabajo." },
  ],
} as const satisfies Widen<typeof en>;

export const aboutCopy: Record<Locale, Widen<typeof en>> = { en, es };
