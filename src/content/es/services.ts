import type { Service } from "../services";

/**
 * Spanish service content. `slug` is the stable (English) id; Spanish URLs
 * come from SERVICE_SLUGS in src/i18n/routes.ts. Clinical terms follow common
 * U.S. Spanish usage in pediatric therapy; pending translator review.
 */
export const services: Service[] = [
  {
    slug: "developmental-classrooms",
    name: "Aulas de desarrollo",
    short: "Aprendizaje, juego, rutinas y preparación para el kínder",
    color: "#f28fe0",
    eyebrow: "Aulas de desarrollo",
    headline: "Un día de preescolar pensado según cómo crecen los niños.",
    intro:
      "Las aulas de STARS se ven y se sienten como un preescolar cálido y bien organizado. La diferencia es que cada parte del día —el juego, las comidas, las rutinas, incluso el camino por el pasillo— se planifica según las metas de desarrollo de cada niño, con terapeutas y enfermeros como parte del equipo.",
    what:
      "Nuestras aulas son espacios de aprendizaje adecuados al desarrollo para bebés, niños pequeños y preescolares. Cada salón está organizado para que los niños aprendan y jueguen a su propio ritmo, con juego activo, juego tranquilo y juego sensorial a lo largo del día.",
    whoFor:
      "Niños desde el nacimiento hasta los seis años que califican para servicios de desarrollo y se benefician de aprender en grupo, con apoyo adicional cerca.",
    signals: [
      "Su hijo va atrasado en comparación con otros niños de su edad para hablar, moverse, jugar o valerse por sí mismo.",
      "Los lugares en grupo, como la guardería o el cuarto de niños de la iglesia, han sido difíciles para su hijo.",
      "Un médico, terapeuta o especialista le ha recomendado servicios de desarrollo.",
      "Usted quiere que su hijo empiece el kínder con confianza y con el apoyo ya establecido.",
    ],
    provides: [
      "Aulas para bebés, niños pequeños y preescolares",
      "Cada equipo de aula está dirigido por una Especialista en Desarrollo de la Primera Infancia con título universitario de cuatro años en educación de la primera infancia",
      "Técnicos de desarrollo que apoyan a los niños durante todo el día",
      "Juego activo, tranquilo y sensorial diseñado para desarrollar habilidades motoras, de lenguaje, sociales y de cuidado personal",
      "Terapia y enfermería que ocurren junto con el día en el aula, no en otro edificio",
      "Planificación de la transición al kínder con su familia y su distrito escolar local",
    ],
    steps: [
      {
        title: "Llegada y conexión",
        body: "Adultos conocidos reciben a los niños y los ayudan a comenzar el día con calma. Un inicio tranquilo y predecible ayuda a cada niño a sentirse seguro para aprender.",
      },
      {
        title: "Juego con propósito",
        body: "Los centros, el círculo y el juego al aire libre se organizan para que cada niño practique las habilidades de su plan, ya sea trepar, apilar, pedir su turno o probar un alimento nuevo.",
      },
      {
        title: "La terapia, integrada",
        body: "Los terapeutas del habla, ocupacionales y físicos trabajan con los niños de forma individual y en el aula, para que las nuevas habilidades se practiquen en momentos reales.",
      },
      {
        title: "Cuidado durante todo el día",
        body: "Nuestros enfermeros con licencia se encargan de los medicamentos, la alimentación y las necesidades de salud en el centro, para que los niños con necesidades médicas participen plenamente.",
      },
    ],
    expectations: [
      "Un ritmo diario predecible que ayuda a los niños a sentirse seguros.",
      "Adultos que notan lo que su hijo comunica, con o sin palabras.",
      "Información frecuente sobre el día y el progreso de su hijo.",
      "Apoyo para prepararse para el kínder, incluida la coordinación con su distrito escolar.",
    ],
    connects: [
      { with: "speech-therapy", body: "Los terapeutas del habla ayudan a los niños a usar palabras y herramientas de comunicación nuevas en momentos reales del aula." },
      { with: "occupational-therapy", body: "Los terapeutas ocupacionales ayudan a crear rutinas adaptadas a las necesidades sensoriales y a desarrollar habilidades de cuidado personal, como comer y vestirse." },
      { with: "physical-therapy", body: "Los terapeutas físicos ayudan a los niños a participar en las actividades del aula y del patio de forma segura e independiente." },
    ],
  },
  {
    slug: "speech-therapy",
    name: "Terapia del habla y lenguaje",
    short: "Hablar, comprender, conectar con otros, comer y tragar",
    color: "#b67cf5",
    eyebrow: "Terapia del habla y lenguaje",
    headline: "Ayudamos a los niños a hacerse entender, y a entender el mundo que les rodea.",
    intro:
      "La comunicación es la forma en que los niños piden lo que necesitan, hacen amigos y aprenden. Nuestros terapeutas pediátricos del habla y lenguaje ayudan a niños desde bebés hasta los seis años a hablar, comprender, conectar con otros, y comer y tragar.",
    what:
      "La terapia del habla y lenguaje apoya todos los aspectos de la comunicación: comprender palabras, usar palabras, los sonidos del habla, la comunicación social y las habilidades de la boca necesarias para comer y tragar. Para los niños que todavía no usan palabras, también puede incluir sistemas con imágenes o tecnología de asistencia que les dan una voz.",
    whoFor:
      "Bebés, niños pequeños y preescolares hasta los seis años con dificultades en el habla, el lenguaje, la comunicación social o la alimentación, incluidos niños con retrasos del desarrollo, autismo, pérdida auditiva, síndrome de Down y otros diagnósticos.",
    signals: [
      "Su hijo no dice tantas palabras como otros niños de su edad, o todavía no combina palabras.",
      "A las personas fuera de su familia les cuesta entender a su hijo.",
      "Su hijo se frustra porque no puede decirle lo que quiere.",
      "Su hijo tiene dificultad para comer, beber o tragar.",
      "A su hijo le cuesta jugar o esperar su turno con otros niños.",
    ],
    provides: [
      "Terapia individual en salas de tratamiento privadas, para que los niños puedan concentrarse",
      "Evaluaciones y terapia en español",
      "Un plan de tratamiento individual preparado con su familia y todo el equipo de STARS de su hijo",
      "Apoyos y dispositivos de tecnología de asistencia, y comunicación con imágenes como PECS",
      "Terapeutas con amplia formación pediátrica y experiencia con una gran variedad de necesidades",
    ],
    steps: [
      {
        title: "Evaluación",
        body: "Un terapeuta del habla y lenguaje conoce a su hijo por medio del juego y de pruebas estandarizadas para entender sus fortalezas y dónde le ayudaría el apoyo.",
      },
      {
        title: "Un plan hecho en conjunto",
        body: "El terapeuta de su hijo trabaja con usted y con el resto del equipo de STARS —maestros, terapeutas ocupacionales y físicos, y enfermeros— para fijar metas importantes en la vida diaria.",
      },
      {
        title: "Sesiones de terapia",
        body: "Los niños trabajan de forma individual con su terapeuta en una sala privada durante el día en STARS.",
      },
      {
        title: "Práctica durante todo el día",
        body: "Como los terapeutas y los maestros trabajan juntos, las palabras y herramientas que su hijo aprende en terapia se practican en el aula, en el almuerzo y en el patio.",
      },
    ],
    expectations: [
      "Sesiones que se sienten como juego, porque el juego es la mejor forma de aprender para los niños pequeños.",
      "Un terapeuta que le explica en qué están trabajando y cómo puede ayudar en casa.",
      "Revisiones del progreso y metas actualizadas a medida que su hijo crece.",
    ],
    connects: [
      { with: "developmental-classrooms", body: "Los maestros usan en el aula las mismas herramientas de comunicación que su hijo practica en terapia." },
      { with: "occupational-therapy", body: "Los terapeutas ocupacionales colaboran en las habilidades de alimentación, sensoriales y de juego que influyen en la comunicación." },
      { with: "nursing-care", body: "Los enfermeros coordinan los planes de alimentación y deglución." },
    ],
    scope: [
      "Retrasos del desarrollo",
      "Trastorno del espectro autista",
      "Trastornos del lenguaje receptivo y expresivo",
      "Trastornos del lenguaje social y pragmático, y desarrollo socioemocional",
      "Apraxia infantil del habla",
      "Trastornos de la fluidez",
      "Discapacidad auditiva",
      "Trastornos de la alimentación y la deglución",
      "Síndrome de Down",
      "Discapacidades cognitivas y dificultades de aprendizaje",
    ],
  },
  {
    slug: "occupational-therapy",
    name: "Terapia ocupacional",
    short: "Necesidades sensoriales, emociones intensas, cuidado personal y uso de las manos",
    color: "#6f7df5",
    eyebrow: "Terapia ocupacional",
    headline: "El juego es el trabajo de la infancia. Ayudamos a los niños a hacerlo bien.",
    intro:
      "La terapia ocupacional ayuda a los niños con las habilidades diarias que les permiten participar en la vida: manejar emociones intensas y ambientes con mucho estímulo, comer y vestirse por sí mismos, usar las manos y jugar con otros.",
    what:
      "Para los niños pequeños, “ocupación” significa las cosas que hacen todo el día: jugar, comer, vestirse, explorar y llevarse bien con otros. Los terapeutas ocupacionales ayudan a los niños a desarrollar las habilidades detrás de esas actividades, con especial atención a cómo responden su cuerpo y sus sentidos al mundo.",
    whoFor:
      "Niños desde el nacimiento hasta los seis años que tienen dificultades con el procesamiento sensorial, el cuidado personal, la motricidad fina o la coordinación, o para manejar sus emociones y las transiciones.",
    signals: [
      "Los sonidos, texturas, la ropa o las multitudes parecen abrumar a su hijo, o su hijo busca movimiento y contacto constantemente.",
      "Las crisis, las transiciones o calmarse son especialmente difíciles.",
      "Le cuesta usar las manos para cosas como agarrar, apilar o garabatear.",
      "Su hijo necesita mucha ayuda para vestirse, comer u otras tareas de cuidado personal para su edad.",
    ],
    provides: [
      "Terapia ocupacional individual basada en las fortalezas y necesidades de su hijo",
      "Apoyo para el procesamiento sensorial, con técnicas de integración sensorial y enfoques neurológicos",
      "Ayuda con habilidades de cuidado personal, como comer y vestirse",
      "Desarrollo de la motricidad fina y de la coordinación visomotora para agarrar, jugar y empezar a dibujar",
      "Apoyo socioemocional que ayuda a los niños a reconocer y manejar emociones intensas",
      "Colaboración cercana con su familia, los maestros, otros terapeutas y los médicos de su hijo",
    ],
    steps: [
      {
        title: "Evaluación",
        body: "Un terapeuta ocupacional observa a su hijo mientras juega y en sus rutinas diarias, y usa herramientas estandarizadas para entender cómo procesa la información sensorial y cómo usa su cuerpo.",
      },
      {
        title: "Un plan individual",
        body: "Las metas se basan en lo que es importante para su familia: una mañana más tranquila, vestirse con menos ayuda, jugar junto a otros niños.",
      },
      {
        title: "Terapia por medio del juego",
        body: "Las sesiones usan movimiento, texturas, juegos y actividades para desarrollar habilidades de forma natural y motivadora.",
      },
      {
        title: "Apoyo durante todo el día",
        body: "Los terapeutas comparten estrategias con los equipos del aula para que los apoyos sensoriales y las rutinas para calmarse formen parte de todo el día de su hijo.",
      },
    ],
    expectations: [
      "Un terapeuta que ve el comportamiento como comunicación y le ayuda a entender lo que el cuerpo de su hijo le está diciendo.",
      "Ideas prácticas que puede usar en casa.",
      "Un progreso que se nota en la vida diaria, no solo en la sala de terapia.",
    ],
    connects: [
      { with: "developmental-classrooms", body: "Los terapeutas ayudan a crear rutinas de aula adaptadas a las necesidades sensoriales y espacios para calmarse." },
      { with: "speech-therapy", body: "Los terapeutas del habla colaboran en las habilidades socioemocionales y de autorregulación que hacen posible la comunicación." },
      { with: "physical-therapy", body: "Los terapeutas físicos trabajan la fuerza y la coordinación que sostienen la motricidad fina." },
    ],
    scope: [
      "Procesamiento sensorial",
      "Habilidades socioemocionales y autorregulación",
      "Habilidades de cuidado personal",
      "Motricidad fina y coordinación visomotora",
      "Coordinación motora",
    ],
  },
  {
    slug: "physical-therapy",
    name: "Terapia física",
    short: "Gatear, caminar, equilibrio, fuerza y equipo de apoyo",
    color: "#3aa6e0",
    eyebrow: "Terapia física",
    headline: "Ayudamos a los niños a moverse, explorar y llegar más lejos.",
    intro:
      "Nuestros terapeutas físicos ayudan a los niños a desarrollar la fuerza, el equilibrio y la coordinación para explorar su mundo con la mayor independencia posible: desde rodar y gatear hasta caminar, trepar y seguir el ritmo de sus amigos.",
    what:
      "La terapia física pediátrica apoya la forma en que los niños se mueven: etapas del desarrollo como sentarse, gatear y caminar, además del equilibrio, la coordinación, la fuerza y la planificación motora. También incluye ayudar a las familias a encontrar el equipo de adaptación adecuado.",
    whoFor:
      "Niños desde el nacimiento hasta los seis años que van atrasados en sus etapas motoras o que tienen condiciones que afectan el movimiento, como parálisis cerebral, tono muscular bajo o nacimiento prematuro.",
    signals: [
      "Su hijo tarda en sentarse, gatear, pararse o caminar.",
      "Su hijo parece rígido o muy flojo, o usa más un lado del cuerpo.",
      "Su hijo se cae con frecuencia o tiene problemas de equilibrio y coordinación.",
      "Su hijo necesita equipo como órtesis, un bipedestador o una silla de ruedas, o usted no está seguro de qué le ayudaría.",
    ],
    provides: [
      "Terapia física individual con terapeutas físicos con licencia",
      "Un gimnasio de terapia dedicado para desarrollar fuerza, movimiento y habilidades para la vida diaria",
      "Trabajo en habilidades del desarrollo, planificación motora, equilibrio, coordinación y manipulación",
      "Evaluación para órtesis y equipo de adaptación, como sillas de ruedas, andaderas de marcha y bipedestadores",
      "Coordinación con su familia, los médicos, los enfermeros, los maestros y otros terapeutas",
    ],
    steps: [
      {
        title: "Evaluación",
        body: "Un terapeuta físico evalúa cómo se mueve, juega y se desplaza su hijo, y habla con usted sobre sus metas.",
      },
      {
        title: "Un plan individual",
        body: "El plan de su hijo se centra en las habilidades de movimiento que harán la mayor diferencia en su vida diaria.",
      },
      {
        title: "Terapia en el gimnasio, y más allá",
        body: "Los niños trabajan en gatear, caminar, el equilibrio y la coordinación en el gimnasio de terapia, y los terapeutas ayudan a llevar esas habilidades al aula y al patio.",
      },
      {
        title: "Equipo y seguimiento",
        body: "Cuando un niño necesita órtesis o equipo de adaptación, los terapeutas evalúan la necesidad y se coordinan con las familias y los médicos.",
      },
    ],
    expectations: [
      "Sesiones basadas en juegos y movimientos que su hijo disfruta.",
      "Un terapeuta que se comunica con usted y, cuando es necesario, con los médicos de su hijo.",
      "Orientación sobre posiciones, equipo y actividades que puede usar en casa.",
    ],
    connects: [
      { with: "developmental-classrooms", body: "Los terapeutas ayudan a los niños a participar en las actividades del aula y del patio de forma segura e independiente." },
      { with: "occupational-therapy", body: "Los terapeutas ocupacionales aprovechan la fuerza y la coordinación física para la motricidad fina y el cuidado personal." },
      { with: "nursing-care", body: "Los enfermeros coordinan la atención de los niños con condiciones médicas que afectan el movimiento." },
    ],
    scope: [
      "Habilidades motoras del desarrollo: rodar, sentarse, gatear, pararse y caminar",
      "Planificación motora, equilibrio, coordinación y habilidades de manipulación",
      "Fuerza y movilidad funcional para las actividades diarias",
      "Evaluación para órtesis y equipo de adaptación, como sillas de ruedas, andaderas de marcha y bipedestadores",
    ],
  },
  {
    slug: "nursing-care",
    name: "Enfermería",
    short: "Medicamentos, alimentación, necesidades respiratorias y médicas complejas",
    color: "#d6418f",
    eyebrow: "Enfermería en el centro",
    headline: "Las necesidades médicas no deberían impedir que un niño aprenda y juegue.",
    intro:
      "STARS cuenta con enfermeros con licencia de tiempo completo en nuestras instalaciones. Atienden desde una rodilla raspada hasta niños con necesidades médicas complejas, para que todos los niños puedan participar en el día completo en STARS.",
    what:
      "Nuestro equipo de enfermería cuida la salud de cada niño durante todo el día, en colaboración con las familias, los terapeutas, los maestros y el propio proveedor de atención médica de cada niño. Creemos que los niños con retrasos del desarrollo o condiciones crónicas están sanos mientras aprenden a prosperar con sus necesidades particulares.",
    whoFor:
      "Todos los niños de STARS, y en especial los que necesitan medicamentos, alimentación, apoyo respiratorio u otra atención médica durante el día.",
    signals: [
      "Su hijo necesita medicamentos, tratamientos respiratorios u otros cuidados durante el día.",
      "Su hijo tiene necesidades de alimentación como alimentación por sonda, líquidos espesados o alergias a alimentos.",
      "Su hijo tiene una condición médica crónica o compleja, y a usted le preocupa que un preescolar o guardería común no pueda cuidarlo de forma segura.",
    ],
    provides: [
      "Enfermeros con licencia de tiempo completo en nuestras instalaciones",
      "Administración de medicamentos y tratamientos respiratorios",
      "Atención de necesidades complejas, incluida la alimentación por sonda, el cuidado de traqueostomía, el oxígeno suplementario, el cateterismo y el cuidado de ostomías",
      "Coordinación con los médicos y especialistas de su hijo",
      "Comunicación frecuente con las familias sobre la salud y el bienestar",
    ],
    steps: [
      {
        title: "Evaluación de salud al ingresar",
        body: "Cuando su hijo se inscribe, nuestros enfermeros revisan con usted y con los proveedores de su hijo el historial de salud, los medicamentos y los planes de cuidado.",
      },
      {
        title: "Un plan de cuidado coordinado",
        body: "Los enfermeros comparten con los maestros y terapeutas lo que necesitan saber, para que todas las personas que trabajan con su hijo entiendan sus necesidades de salud.",
      },
      {
        title: "Cuidado durante todo el día",
        body: "Los enfermeros brindan atención programada y según sea necesaria en el centro, y se comunican con usted sobre cualquier cosa importante.",
      },
    ],
    expectations: [
      "Enfermeros que conocen a su hijo, no solo su expediente.",
      "Comunicación clara y frecuente, especialmente para niños con condiciones crónicas o agudas.",
      "Un equipo que se coordina con todo el equipo de atención médica de su hijo.",
    ],
    connects: [
      { with: "developmental-classrooms", body: "La enfermería permite que los niños con necesidades médicas participen plenamente en la vida del aula." },
      { with: "speech-therapy", body: "Los enfermeros y los terapeutas del habla coordinan los planes de alimentación y deglución." },
      { with: "physical-therapy", body: "Los enfermeros y los terapeutas físicos coordinan la atención de los niños con condiciones que afectan el movimiento." },
    ],
    scope: [
      "Necesidades de nutrición, incluidas la alimentación por sonda, los líquidos espesados y las alergias a alimentos",
      "Condiciones respiratorias, incluida la enfermedad respiratoria crónica",
      "Tratamientos respiratorios y oxígeno suplementario",
      "Cuidado de traqueostomía",
      "Administración de medicamentos",
      "Cateterismo",
      "Cuidado de ostomías",
      "Epilepsia",
      "Parálisis cerebral",
      "Bebés y niños pequeños que nacieron prematuros",
      "Verificación de vacunas",
    ],
  },
];
