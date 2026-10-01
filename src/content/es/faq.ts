import type { Faq, FaqGroupId } from "../faq";

/**
 * Spanish FAQs for families. The partner and job-seeker groups are answered on
 * English-only pages, so their Spanish entries point there.
 */
export const faqGroups: { id: FaqGroupId; label: string }[] = [
  { id: "families", label: "Para familias que están considerando STARS" },
  { id: "current", label: "Para familias actuales" },
  { id: "partners", label: "Para médicos y profesionales que refieren" },
  { id: "jobs", label: "Para personas que buscan empleo" },
];

export const faqs: Faq[] = [
  {
    id: "what-is-stars",
    group: "families",
    question: "¿Qué es exactamente STARS Academy?",
    answer: [
      "STARS es un programa de tratamiento diurno para el desarrollo infantil en Batesville. Los niños pasan el día con nosotros en aulas de desarrollo, y la terapia del habla y lenguaje, la terapia ocupacional, la terapia física y la enfermería ocurren durante ese mismo día, con un solo equipo que trabaja en conjunto.",
      "No es solo una guardería, y tampoco es una clínica a la que usted maneja para una cita aparte. Es ambas cosas, pensadas como una sola.",
    ],
  },
  {
    id: "ages",
    group: "families",
    question: "¿Qué edades atiende STARS?",
    answer: ["STARS atiende a niños desde el nacimiento hasta los seis años."],
  },
  {
    id: "qualify",
    group: "families",
    question: "¿Cómo sé si mi hijo califica?",
    answer: [
      "Su hijo es elegible si tiene seguro médico activo, califica para servicios de desarrollo y al menos uno de estos: terapia del habla y lenguaje, terapia ocupacional, terapia física o servicios de enfermería, y tiene el tratamiento recetado por su médico de cabecera.",
      "No tiene que resolverlo solo: llámenos o envíe una consulta y le guiaremos paso a paso.",
    ],
  },
  {
    id: "payment",
    group: "families",
    question: "¿Cómo se paga STARS? ¿Aceptan mi seguro?",
    answer: [
      "Los servicios de tratamiento diurno se pagan con fondos de Medicaid, incluidos ARKids First-A, SSI y TEFRA. STARS puede comunicarse con su proveedor de seguro para saber qué servicios de terapia cubre el plan de su hijo.",
    ],
  },
  {
    id: "doctor-referral",
    group: "families",
    question: "¿Necesito una referencia de nuestro médico?",
    answer: [
      "Sí. El tratamiento en STARS debe ser recetado por el médico de cabecera de su hijo. Si no está seguro de cómo empezar esa conversación, podemos ayudarle.",
    ],
  },
  {
    id: "daycare",
    group: "families",
    question: "¿STARS es una guardería?",
    answer: [
      "No exactamente. Los niños pasan el día con nosotros en aulas, así que puede parecer un preescolar o una guardería. Pero cada niño en STARS tiene un plan de desarrollo individual, y los terapeutas y enfermeros con licencia son parte del equipo todo el día.",
    ],
  },
  {
    id: "hours",
    group: "families",
    question: "¿Cuál es su horario?",
    answer: ["STARS está abierto de lunes a viernes, de 7:00 a. m. a 3:00 p. m."],
  },
  {
    id: "transportation",
    group: "families",
    question: "¿Ofrecen transporte?",
    answer: ["STARS tiene camionetas propias que llevan a los niños al centro y de regreso."],
  },
  {
    id: "spanish",
    group: "families",
    question: "¿Ofrecen servicios en español?",
    answer: ["Sí. Las evaluaciones y la terapia del habla y lenguaje se ofrecen en español."],
  },
  {
    id: "visit",
    group: "families",
    question: "¿Puedo visitar antes de decidir?",
    answer: [
      "¡Por supuesto! Se lo recomendamos. Una visita es la mejor forma de ver cómo funciona STARS y conocer a las personas que trabajarían con su hijo. Solicite una visita en línea o llámenos.",
    ],
  },
  {
    id: "how-long",
    group: "families",
    question: "¿Cuánto tiempo tarda empezar?",
    answer: ["Depende de las evaluaciones, la receta de su hijo y la verificación del seguro."],
  },
  {
    id: "absence",
    group: "current",
    question: "¿A quién aviso si mi hijo va a faltar?",
    answer: ["Llame a la línea principal: 870-793-3200."],
  },
  {
    id: "health-change",
    group: "current",
    question: "Cambiaron los medicamentos o las necesidades de salud de mi hijo. ¿Qué hago?",
    answer: [
      "Avísele al equipo de enfermería lo antes posible para que actualicen el plan de cuidado de su hijo y se coordinen con su proveedor de atención médica.",
    ],
  },
  {
    id: "who-refers",
    group: "partners",
    question: "¿Quién puede referir a un niño a STARS?",
    answer: [
      "Médicos, terapeutas, escuelas, programas de intervención temprana y otros profesionales pueden recomendar STARS a las familias, y las familias también pueden comunicarse directamente con nosotros. Para comenzar los servicios, el tratamiento debe ser recetado por el médico de cabecera del niño.",
    ],
  },
  {
    id: "medically-complex",
    group: "partners",
    question: "¿STARS puede atender a niños con necesidades médicas complejas?",
    answer: [
      "Sí. Contamos con enfermeros con licencia de tiempo completo que atienden de forma habitual necesidades como la alimentación por sonda, el cuidado de traqueostomía, el oxígeno suplementario, el cateterismo, el cuidado de ostomías y la epilepsia.",
    ],
  },
  {
    id: "degree",
    group: "jobs",
    question: "¿Necesito un título para trabajar en STARS?",
    answer: [
      "Depende del puesto. Los puestos de técnico de desarrollo, acompañante de camioneta y conductor de camioneta requieren diploma de preparatoria o GED. Las Especialistas en Desarrollo de la Primera Infancia necesitan un título universitario de cuatro años con énfasis en educación de la primera infancia. Los puestos de terapia y enfermería requieren licencia en su disciplina.",
      "La información sobre empleos y la solicitud están disponibles en inglés en nuestra página de empleos.",
    ],
  },
];
