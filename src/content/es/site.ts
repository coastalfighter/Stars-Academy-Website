import type { Widen } from "@/i18n/config";
import * as en from "../site";

/**
 * Spanish organization facts. Contact details, URLs and numbers are shared
 * with English; only human-language strings are translated.
 * Register: formal "usted", neutral U.S. Spanish. Pending professional
 * health-care translation review (docs/CONTENT-CHECKLIST.md).
 */
export const site = {
  ...en.site,
  tagline: "Terapia, aprendizaje y cuidado para niños pequeños, integrados en un día completo.",
  /** The acronym is the organization's name; it stays in English with a Spanish gloss. */
  acronymMeaning: "Esforzarnos para lograr un éxito verdadero",
  description:
    "STARS Academy es un programa de tratamiento diurno para el desarrollo infantil en Batesville, Arkansas. Terapia del habla y lenguaje, terapia ocupacional y terapia física, atención de enfermería con personal con licencia y aulas de desarrollo para niños desde el nacimiento hasta los seis años, todo junto y con un solo equipo.",
  hours: {
    ...en.site.hours,
    display: "Lunes a viernes, de 7:00 a. m. a 3:00 p. m.",
    short: "Lunes a viernes, de 7:00 a. m. a 3:00 p. m.",
  },
  ages: "Desde el nacimiento hasta los 6 años",
  funding: "Medicaid, incluidos ARKids First-A, SSI y TEFRA",
  stats: [
    { value: 2009, label: "Año de fundación · de propiedad y administración local", suffix: "" },
    { value: 140, label: "Niños atendidos actualmente (aprox.)", suffix: "" },
    { value: 85, label: "Maestros, terapeutas, enfermeros y personal (aprox.)", suffix: "" },
    { value: 2, label: "Instalaciones en Batesville pensadas para las familias", suffix: "" },
  ],
} satisfies Widen<typeof en.site> & { acronymMeaning: string };

export const pathways = [
  { audience: "Madres, padres y cuidadores", action: "Conocer STARS para mi hijo", key: "gettingStarted" },
  { audience: "Familias actuales de STARS", action: "Información para familias", key: "families" },
  { audience: "¿Tiene preguntas?", action: "Ver preguntas frecuentes", key: "faq" },
  { audience: "¿Quiere conocernos?", action: "Programar una visita", key: "tour" },
] as const;

export const pillars = [
  {
    n: "01",
    title: "Un preescolar de desarrollo",
    body: "Aulas cálidas y bien organizadas para bebés, niños pequeños y preescolares, pensadas para que cada niño aprenda a su propio ritmo.",
  },
  {
    n: "02",
    title: "Un equipo de terapia pediátrica",
    body: "Terapeutas del habla y lenguaje, ocupacionales y físicos con licencia que trabajan con su hijo durante el día, no al otro lado de la ciudad.",
  },
  {
    n: "03",
    title: "Enfermeros con licencia en el centro",
    body: "Enfermeros de tiempo completo que administran medicamentos, alimentación y necesidades médicas complejas para que los niños puedan participar plenamente.",
  },
] satisfies Widen<typeof en.pillars>;

export const dayTimeline = [
  {
    time: "7:00 a. m.",
    hour: 7,
    title: "Llegar y conectar",
    body: "Caras conocidas reciben a cada niño. Un inicio tranquilo y predecible les ayuda a sentirse seguros para aprender.",
  },
  {
    time: "En la mañana",
    hour: 9,
    title: "Aprender jugando",
    body: "Círculo, centros de actividades y juego sensorial, cada uno organizado en torno a las habilidades del plan de su hijo.",
  },
  {
    time: "Durante el día",
    hour: 11,
    title: "La terapia, integrada",
    body: "Los terapeutas trabajan de forma individual y en el aula, para que las nuevas habilidades aparezcan en momentos reales.",
  },
  {
    time: "Al mediodía",
    hour: 12.5,
    title: "Cuidado y alimentación",
    body: "Los enfermeros se encargan de los medicamentos y la alimentación en el centro; la hora de comer se convierte en práctica de independencia.",
  },
  {
    time: "3:00 p. m.",
    hour: 15,
    title: "De regreso a casa",
    body: "Los niños se van a casa después de un día completo de aprendizaje, y las familias se mantienen informadas sobre su progreso.",
  },
] satisfies Widen<typeof en.dayTimeline>;

export const approachPrinciples = [
  {
    title: "Primero, la conexión",
    body: "Los niños aprenden de las personas en quienes confían. Las relaciones son la base de todo lo que hacemos.",
  },
  {
    title: "Adultos en calma ayudan a los niños a calmarse",
    body: "Nuestra mentalidad “Adult First” (primero el adulto) significa que el personal aprende a manejar su propio estrés para poder dar estabilidad a los niños que cuida.",
  },
  {
    title: "Todos los sentidos importan",
    body: "Algunos niños sienten el sonido, el tacto y el movimiento con más o menos intensidad. Lo notamos y lo planificamos.",
  },
  {
    title: "Diferente, no menos",
    body: "Somos neuroafirmativos: partimos de las fortalezas de cada niño y apoyamos lo que le cuesta, sin intentar que parezca “típico”.",
  },
] satisfies Widen<typeof en.approachPrinciples>;

export const fitSignals = [
  "va atrasado en hablar, moverse, jugar o valerse por sí mismo",
  "tiene un diagnóstico como autismo, síndrome de Down, parálisis cerebral o antecedentes de nacimiento prematuro",
  "tiene necesidades médicas que dificultan asistir a un preescolar o guardería común",
  "un médico, terapeuta o escuela le ha recomendado terapia",
] satisfies Widen<typeof en.fitSignals>;

export const enrollmentSteps = [
  { title: "Comuníquese", body: "Llámenos o envíe una consulta. Le escucharemos y responderemos sus preguntas." },
  { title: "Visítenos", body: "Recorra STARS y conozca al equipo que trabajaría con su hijo." },
  { title: "Evaluación y receta", body: "Se evalúa a su hijo y su médico receta el tratamiento." },
  { title: "Primer día", body: "Verificamos la cobertura, preparamos un plan juntos y le damos la bienvenida a su hijo." },
] satisfies Widen<typeof en.enrollmentSteps>;

export const referralFacts = [
  { label: "Programa", value: "Tratamiento diurno para el desarrollo infantil: día completo, en el centro" },
  { label: "Edades", value: "Desde el nacimiento hasta los 6 años" },
  { label: "Servicios", value: "Habla y lenguaje, terapia ocupacional, terapia física, enfermería y aulas de desarrollo" },
  { label: "Requisito", value: "Receta del médico de cabecera del niño" },
  { label: "Financiamiento", value: "Medicaid, incluidos ARKids First-A, SSI y TEFRA" },
  { label: "Idiomas", value: "Evaluación y terapia del habla y lenguaje disponibles en español" },
] satisfies Widen<typeof en.referralFacts>;

export const referralCriteria = [
  "Tener seguro médico activo (financiamiento de Medicaid, incluidos ARKids First-A, SSI y TEFRA).",
  "Calificar para servicios de desarrollo y al menos uno de estos: terapia del habla y lenguaje, terapia ocupacional, terapia física o servicios de enfermería.",
  "Tener el tratamiento recetado por su médico de cabecera.",
] satisfies Widen<typeof en.referralCriteria>;

export const careerRoles = [
  {
    team: "Aula",
    title: "Especialista en Desarrollo de la Primera Infancia",
    requirement: "Título universitario de cuatro años con énfasis en educación de la primera infancia",
  },
  {
    team: "Aula",
    title: "Técnico en Desarrollo de la Primera Infancia",
    requirement: "Diploma de preparatoria o GED · prueba de drogas previa al empleo",
  },
  {
    team: "Terapia y enfermería",
    title: "Terapeutas del habla, ocupacionales y físicos, asistentes y enfermeros con licencia",
    requirement: "Licencia vigente de Arkansas en su disciplina",
  },
  {
    team: "Transporte",
    title: "Conductor y acompañante de camioneta",
    requirement: "Diploma de preparatoria o GED · conductores de 25 años o más · prueba de drogas",
  },
] satisfies Widen<typeof en.careerRoles>;

export const values = [
  { name: "Positividad", body: "Celebramos una cultura de amor, esperanza y compasión que impulsa nuestro éxito." },
  { name: "Propósito", body: "Brindamos una atención de calidad superior y trabajamos en equipo para impulsar el éxito." },
  { name: "Comunicación", body: "Buscamos la transparencia que fomenta compartir información y conduce al éxito." },
  { name: "Empoderamiento", body: "Damos a nuestros pacientes y a nuestro personal las herramientas necesarias para lograr el éxito." },
  { name: "Adaptabilidad", body: "Nos dedicamos a superar desafíos y obstáculos con una actitud positiva para lograr el éxito." },
] satisfies Widen<typeof en.values>;

/**
 * Translation of the short-form USDA statement. The official Spanish USDA
 * statement must replace this once provided by the sponsoring agency.
 */
export const nondiscriminationSummary =
  "De acuerdo con la ley federal de derechos civiles y los reglamentos y políticas de derechos civiles del Departamento de Agricultura de los EE. UU. (USDA), se prohíbe a esta institución discriminar por motivos de raza, color, origen nacional, sexo (incluidas la identidad de género y la orientación sexual), discapacidad, edad, o en represalia o venganza por actividades previas de derechos civiles, en cualquier programa o actividad realizada o financiada por el USDA.";
