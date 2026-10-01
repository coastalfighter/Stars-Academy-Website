import type { Widen } from "@/i18n/config";
import * as en from "../pages";
import type { ApproachPillar, Step } from "../pages";

/**
 * Spanish copy for the secondary pages that exist in Spanish. Lists used only
 * by English-only pages (referrals, careers) are not translated.
 */

export const approachPillars: ApproachPillar[] = [
  {
    id: "relationships",
    name: "Relaciones y conexión",
    title: "Los niños aprenden de las personas en quienes confían.",
    body: "Antes de que un niño pueda trabajar en una nueva habilidad, necesita sentirse seguro con el adulto que tiene al lado. Primero invertimos en las relaciones —aprendemos las señales, lo que reconforta y los intereses de cada niño— porque la conexión es lo que hace posible el aprendizaje.",
    looksLike: [
      "Saludar a cada niño por su nombre, a la altura de sus ojos.",
      "Quedarse con un niño durante un momento difícil en lugar de alejarlo.",
    ],
  },
  {
    id: "regulation",
    name: "Autorregulación",
    title: "Un cuerpo y una mente en calma están listos para aprender.",
    body: "“Autorregulación” significa poder volver a la calma después del estrés, la emoción o la frustración. Los niños pequeños todavía no pueden hacerlo solos: toman prestada la calma de los adultos que los rodean. Les ayudamos a desarrollar esa habilidad paso a paso.",
    looksLike: [
      "Espacios para calmarse en las aulas.",
      "Rutinas de respiración y movimiento.",
      "Adultos que se mantienen estables cuando un niño está alterado.",
    ],
  },
  {
    id: "conscious-discipline",
    name: "Conscious Discipline",
    title: "Un enfoque compartido sobre las emociones, el comportamiento y la pertenencia.",
    body: "Conscious Discipline es un enfoque de aprendizaje socioemocional muy usado en escuelas y programas de primera infancia. Da a adultos y niños un conjunto común de habilidades para mantener la calma, resolver problemas y cuidarse unos a otros, y ve los conflictos diarios como oportunidades para enseñar, no para castigar.",
    looksLike: [
      "Rutinas en el aula que crean un sentido de familia.",
      "Ayudar a los niños a ponerle nombre a lo que sienten.",
      "Enseñar qué hacer en lugar de solo decir “no”.",
    ],
    link: { label: "Más información en consciousdiscipline.com (en inglés)", href: "https://consciousdiscipline.com/" },
  },
  {
    id: "adult-first",
    name: "Adult First (primero el adulto)",
    title: "Los adultos manejan primero sus propias emociones.",
    body: "Los niños imitan a los adultos que los rodean. La mentalidad “Adult First” significa que nuestro personal practica reconocer y manejar su propio estrés, para responder a los niños con paciencia en lugar de reaccionar. También define cómo apoyamos a nuestro equipo.",
    looksLike: [
      "Una maestra que respira antes de responder.",
      "Líderes que dan espacio al personal para recuperarse.",
      "Un ambiente más tranquilo para todos.",
    ],
  },
  {
    id: "sensory-informed",
    name: "Atención sensorial",
    title: "Todos los sentidos importan.",
    body: "Algunos niños viven el sonido, la luz, el tacto, el sabor o el movimiento con más intensidad que otros, o buscan más de ello. Lo que puede parecer “mal comportamiento” muchas veces es el cuerpo de un niño pidiendo ayuda. Notamos esas necesidades y las planificamos.",
    looksLike: [
      "Juego sensorial incluido en cada día.",
      "Pausas para moverse.",
      "Ajustar la luz, el ruido o el lugar para sentarse para un niño que lo necesita.",
    ],
  },
  {
    id: "neuroaffirming",
    name: "Neuroafirmación",
    title: "Diferente, no menos.",
    body: "El cerebro de cada niño funciona de maneras distintas. Un enfoque neuroafirmativo respeta esas diferencias —incluidos los niños autistas y los niños con otras diferencias del desarrollo— y parte de las fortalezas de cada niño, en lugar de intentar que parezca “típico”.",
    looksLike: [
      "Respetar la forma de comunicarse de cada niño, ya sea con palabras, imágenes o un dispositivo.",
      "Fijar metas centradas en la independencia y la alegría, no en la conformidad.",
    ],
  },
];

export const approachForFamilies = [
  "A su hijo se le conoce como una persona completa, no como una lista de metas.",
  "Los momentos difíciles se atienden con paciencia y enseñanza, no con castigos.",
  "Se entienden y se apoyan las diferencias sensoriales y de comunicación.",
  "El progreso se mide según lo que importa en la vida diaria de su familia.",
] satisfies Widen<typeof en.approachForFamilies>;

export const aboutStory = [
  "STARS Academy se fundó en 2009 como una clínica de terapia y preescolar de desarrollo de propiedad y administración local. Hoy tenemos dos instalaciones en Batesville pensadas para las familias y un equipo con gran preparación, experiencia y diversidad.",
  "El trabajo en equipo es parte central de quienes somos. Celebramos nuestra cultura con las personas a quienes servimos y con quienes trabajan a nuestro lado, y creemos que, juntos, podemos cumplir y superar las necesidades y expectativas de cada niño.",
  "Con los años, nuestro trabajo se ha formado con lo que hemos aprendido de los propios niños: que prosperan cuando se sienten seguros, conectados y comprendidos. Esa convicción hoy guía todo, desde nuestras aulas hasta la forma en que apoyamos a nuestro equipo.",
] satisfies Widen<typeof en.aboutStory>;

export const aboutVision =
  "STARS Academy cree que en cada día hay algo bueno. Ofrecemos un ambiente terapéutico de calidad superior que fomenta el tratamiento individual de cada niño y cada familia, y construye la base de su futura historia de éxito.";

export const togetherReasons: Step[] = [
  {
    title: "Un solo plan, metas compartidas",
    body: "Maestros, terapeutas y enfermeros trabajan con la misma comprensión de su hijo, para que todos vayan en la misma dirección.",
  },
  {
    title: "Habilidades practicadas todo el día",
    body: "Una palabra nueva de la terapia del habla se usa a la hora de la merienda. Una estrategia para calmarse de la terapia ocupacional se usa en una transición difícil. La práctica ocurre en momentos reales.",
  },
  {
    title: "Menos idas y vueltas",
    body: "En lugar de manejar entre un preescolar y citas de terapia por separado, la atención de su hijo ocurre aquí, durante el día.",
  },
];

export const goodFitSignals = [
  "Su hijo tiene entre 0 y 6 años.",
  "Su hijo va atrasado en hablar, comprender, moverse, jugar o valerse por sí mismo.",
  "Su hijo tiene un diagnóstico como autismo, síndrome de Down o parálisis cerebral, o nació prematuro.",
  "Su hijo tiene necesidades médicas —como alimentación por sonda, tratamientos respiratorios o convulsiones— que dificultan asistir a un preescolar o guardería común.",
  "Un médico, terapeuta, escuela o programa de intervención temprana le ha sugerido servicios de desarrollo.",
] satisfies Widen<typeof en.goodFitSignals>;

export const eligibilityFactors: Step[] = [
  {
    title: "Seguro médico activo",
    body: "El tratamiento diurno se paga con fondos de Medicaid, incluidos ARKids First-A, SSI y TEFRA. Podemos revisar la cobertura de su hijo.",
  },
  {
    title: "Una evaluación que califique",
    body: "Su hijo califica para servicios de desarrollo y al menos uno de estos: terapia del habla y lenguaje, terapia ocupacional, terapia física o servicios de enfermería.",
  },
  {
    title: "Una receta del médico de su hijo",
    body: "El tratamiento debe ser recetado por el médico de cabecera de su hijo.",
  },
];

export const firstCallToFirstDay: Step[] = [
  { title: "Comuníquese", body: "Llámenos o envíe una consulta abajo. Cuéntenos un poco sobre su hijo; le escucharemos y responderemos sus preguntas." },
  { title: "Visite STARS", body: "Recorra las aulas y los espacios de terapia y conozca a las personas que trabajarían con su hijo." },
  { title: "Evaluación", body: "Se evalúa el desarrollo de su hijo para ver dónde le ayudaría el apoyo." },
  { title: "Receta", body: "El médico de cabecera de su hijo revisa los resultados y receta el tratamiento en STARS." },
  { title: "Bienvenido a STARS", body: "Revisamos la cobertura de su hijo, preparamos un plan individual con usted y fijamos el primer día." },
];

export const familyTopics = [
  {
    id: "hours",
    title: "Horario y cierres",
    body: ["STARS está abierto de lunes a viernes, de 7:00 a. m. a 3:00 p. m."],
  },
  {
    id: "absences",
    title: "Ausencias",
    body: ["Si su hijo va a faltar, avísenos lo antes posible llamando al 870-793-3200."],
  },
  {
    id: "transportation",
    title: "Transporte",
    body: [
      "STARS tiene camionetas propias que llevan a los niños al centro y de regreso. Los conductores y los acompañantes trabajan juntos para mantener a los niños seguros durante el trayecto.",
    ],
  },
  {
    id: "health",
    title: "Salud y medicamentos",
    body: [
      "Nuestros enfermeros con licencia coordinan la atención de su hijo con usted y con el proveedor de atención médica de su hijo.",
      "Si cambian los medicamentos, la dieta o las necesidades de salud de su hijo, avísele al equipo de enfermería lo antes posible para que actualicen el plan de cuidado.",
    ],
  },
  {
    id: "kindergarten",
    title: "Transición al kínder",
    body: [
      "Queremos que cada niño salga de STARS listo para el kínder. Nuestro equipo trabaja con los padres y los distritos escolares locales para que el paso a la escuela pública sea lo más fácil posible.",
    ],
  },
] satisfies Widen<typeof en.familyTopics>;

export const whoHandlesWhat = [
  { team: "Familias nuevas e inscripción", body: "Preguntas sobre elegibilidad, visitas y cómo empezar.", key: "gettingStarted" },
  { team: "Médicos y otros profesionales que refieren", body: "Referencias, recetas y coordinación de la atención (página en inglés).", key: "referrals" },
  { team: "Familias actuales", body: "Asistencia, transporte y preguntas del día a día.", key: "families" },
  { team: "Empleos y recursos humanos", body: "Puestos disponibles, solicitudes y entrevistas (página en inglés).", key: "careers" },
] as const;
