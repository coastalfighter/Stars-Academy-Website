import type { Locale, Widen } from "@/i18n/config";

/**
 * Policy pages. The privacy notice describes what this website actually does
 * (see src/lib/inquiry); both languages require compliance review before
 * launch (docs/CONTENT-CHECKLIST.md).
 */
const en = {
  privacy: {
    metaTitle: "Website Privacy Notice",
    metaDescription: "How the STARS Academy website collects and uses information.",
    crumb: "Privacy",
    eyebrow: "Privacy",
    title: "Website privacy notice",
    lede: "How this website collects and uses information. It covers the website only — not STARS’ HIPAA Notice of Privacy Practices.",
    sections: [
      {
        title: "Information you choose to send us",
        body: [
          "When you use a form on this website — for example to request a tour, send an enrollment inquiry, make a referral, contact us, or tell us about your interest in a job — we collect the information you enter, such as your name, phone number, email address and message. We use it only to respond to your request.",
          "Please do not send diagnoses, medical records or other health information through website forms. Our team will arrange a secure way to share that information when it is needed. Our forms are designed to reject messages that appear to contain dates of birth, Social Security numbers or insurance numbers.",
        ],
      },
      {
        title: "How information is delivered and shared",
        body: [
          "Form submissions are sent securely to STARS staff and are not stored in a database on this website. Standard server logs kept by our hosting provider may briefly record technical details such as IP addresses to keep the site secure and prevent abuse. We do not sell personal information.",
        ],
      },
      {
        title: "Cookies and preferences",
        body: [
          "This website does not use cookies for visitors, and it has no advertising trackers. If you turn on Calm mode, your browser remembers that choice on your own device so the site stays calm on your next visit. You can clear it at any time in your browser settings.",
        ],
      },
      {
        title: "How we measure the website",
        body: [
          "To understand which pages help families and which ways of finding us work, the website counts visits in a privacy-friendly way. It runs on our own website, not through Google, Facebook or any other company, and the totals are stored with our hosting providers only.",
          "What is counted: which page was viewed, the type of device (phone, tablet or computer), the language of the page, the website or campaign link that brought you here, and taps on our phone number, email address or directions. When a form is sent, we also count the type of request and your answer to “How did you hear about STARS?” — never your name, contact details or message.",
          "What is not collected: no cookies, no IP addresses, no visitor IDs or device fingerprints, and nothing that connects one page you view to another. Each view only adds one to a daily total, so we cannot tell who visited or follow anyone’s path through the site. Totals are kept for 13 months.",
          "If your browser sends Global Privacy Control or Do Not Track, nothing is counted. You can also switch counting off for this browser below.",
        ],
      },
      {
        title: "Links to other services",
        body: [
          "Some links open services run by others — for example our secure enrollment and employment forms on Adobe Sign, Google Maps, Facebook and Instagram. Their own privacy policies apply there.",
        ],
      },
      {
        title: "Your health information",
        body: [
          "How STARS uses and protects health information about children in our care is described in our HIPAA Notice of Privacy Practices, available from our office.",
        ],
      },
    ],
    optOut: {
      title: "Website counting in this browser",
      on: "Counting is on for this browser.",
      off: "Counting is off for this browser.",
      browserOff: "Your browser asks websites not to track you (Global Privacy Control or Do Not Track), so nothing is counted.",
      switchLabel: "Count my visits anonymously",
    },
    contactTitle: "Contact",
    contactBefore: "Questions about this notice? Call us at",
    contactMiddle: "or use our",
    contactLink: "contact form",
  },
  accessibility: {
    metaTitle: "Accessibility Statement",
    metaDescription: "STARS Academy wants every family, partner and job seeker to be able to use this website.",
    crumb: "Accessibility",
    eyebrow: "Accessibility",
    title: "Accessibility statement",
    lede: "STARS Academy wants every family, partner and job seeker to be able to use this website.",
    commitmentTitle: "Our commitment",
    commitmentIntro: "We designed this website to meet the Web Content Accessibility Guidelines (WCAG) 2.2, Level AA. That includes:",
    commitments: [
      "Text and interface colors with sufficient contrast.",
      "Full keyboard navigation, with visible focus indicators and a “skip to main content” link.",
      "Page structure, headings and labels that work with screen readers.",
      "Forms with clear labels, instructions and error messages.",
      "Layouts that adapt to phones, tablets, desktop and browser zoom up to 400%.",
      "Reduced motion for visitors who prefer it.",
      "The full family-facing site in English and Spanish.",
    ],
    calmTitle: "Calm mode",
    calmBody:
      "Some visitors — and some of the children beside them — find movement on screen overwhelming. The Calm mode switch at the top of every page turns off animation, smooth scrolling and 3D effects. It turns on automatically if your device is set to reduce motion, and the site remembers your choice.",
    ongoingTitle: "Ongoing work",
    ongoingBody:
      "Accessibility is ongoing. We test new content as it is added and review the site regularly. Some linked content hosted by other services (such as our secure application forms) may not be fully within our control.",
    barrierTitle: "Tell us about a barrier",
    barrierBefore: "If anything on this site is difficult to use, please call us at",
    barrierMiddle: "or use our",
    barrierLink: "contact form",
    barrierAfter: ". We’ll work to provide the information you need in a format that works for you.",
  },
  nondiscrimination: {
    metaTitle: "Nondiscrimination Statement",
    metaDescription: "STARS Academy’s USDA nondiscrimination statement.",
    crumb: "Nondiscrimination",
    eyebrow: "Nondiscrimination",
    title: "Nondiscrimination statement",
    intro: "STARS Academy participates in programs funded by the U.S. Department of Agriculture.",
    equalOpportunity: "This institution is an equal opportunity provider.",
    translationNote: "",
  },
} as const;

const es = {
  privacy: {
    metaTitle: "Aviso de privacidad del sitio web",
    metaDescription: "Cómo el sitio web de STARS Academy recopila y usa la información.",
    crumb: "Privacidad",
    eyebrow: "Privacidad",
    title: "Aviso de privacidad del sitio web",
    lede: "Cómo este sitio web recopila y usa la información. Se refiere solo al sitio web, no al Aviso de Prácticas de Privacidad de HIPAA de STARS.",
    sections: [
      {
        title: "Información que usted decide enviarnos",
        body: [
          "Cuando usa un formulario de este sitio web —por ejemplo, para solicitar una visita, enviar una consulta de inscripción, hacer una referencia, contactarnos o contarnos su interés en un empleo— recopilamos la información que usted escribe, como su nombre, número de teléfono, correo electrónico y mensaje. La usamos solo para responder a su solicitud.",
          "Por favor, no envíe diagnósticos, expedientes médicos ni otra información de salud por medio de los formularios del sitio web. Nuestro equipo organizará una forma segura de compartir esa información cuando sea necesario. Nuestros formularios están diseñados para rechazar mensajes que parecen contener fechas de nacimiento, números de Seguro Social o números de seguro.",
        ],
      },
      {
        title: "Cómo se entrega y se comparte la información",
        body: [
          "Los formularios enviados llegan de forma segura al personal de STARS y no se guardan en una base de datos de este sitio web. Los registros habituales del servidor de nuestro proveedor de alojamiento pueden guardar por poco tiempo datos técnicos, como direcciones IP, para mantener el sitio seguro y evitar abusos. No vendemos información personal.",
        ],
      },
      {
        title: "Cookies y preferencias",
        body: [
          "Este sitio web no usa cookies para los visitantes y no tiene rastreadores de publicidad. Si activa el modo calma, su navegador recuerda esa elección en su propio dispositivo para que el sitio siga en calma en su próxima visita. Puede borrarla en cualquier momento desde la configuración de su navegador.",
        ],
      },
      {
        title: "Cómo medimos el sitio web",
        body: [
          "Para saber qué páginas ayudan a las familias y cómo nos encuentran, el sitio web cuenta las visitas de una forma que protege su privacidad. Funciona en nuestro propio sitio, no a través de Google, Facebook ni otra empresa, y los totales se guardan solo con nuestros proveedores de alojamiento.",
          "Lo que se cuenta: qué página se vio, el tipo de dispositivo (teléfono, tableta o computadora), el idioma de la página, el sitio web o enlace de campaña que le trajo aquí, y los toques en nuestro número de teléfono, correo electrónico o indicaciones para llegar. Cuando se envía un formulario, también contamos el tipo de solicitud y su respuesta a “¿Cómo se enteró de STARS?”, nunca su nombre, sus datos de contacto ni su mensaje.",
          "Lo que no se recopila: ninguna cookie, ninguna dirección IP, ningún identificador de visitante ni huella del dispositivo, y nada que conecte una página que usted ve con otra. Cada visita solo suma uno a un total diario, así que no podemos saber quién nos visitó ni seguir el recorrido de nadie por el sitio. Los totales se guardan durante 13 meses.",
          "Si su navegador envía Control Global de Privacidad (GPC) o No Rastrear (DNT), no se cuenta nada. También puede desactivar el conteo para este navegador aquí abajo.",
        ],
      },
      {
        title: "Enlaces a otros servicios",
        body: [
          "Algunos enlaces abren servicios administrados por otras empresas, por ejemplo nuestros formularios seguros de inscripción y de empleo en Adobe Sign, Google Maps, Facebook e Instagram. En esos sitios se aplican sus propias políticas de privacidad.",
        ],
      },
      {
        title: "Su información de salud",
        body: [
          "La forma en que STARS usa y protege la información de salud de los niños que atendemos se describe en nuestro Aviso de Prácticas de Privacidad de HIPAA, disponible en nuestra oficina.",
        ],
      },
    ],
    optOut: {
      title: "Conteo del sitio web en este navegador",
      on: "El conteo está activado para este navegador.",
      off: "El conteo está desactivado para este navegador.",
      browserOff: "Su navegador pide a los sitios web que no le rastreen (Control Global de Privacidad o No Rastrear), así que no se cuenta nada.",
      switchLabel: "Contar mis visitas de forma anónima",
    },
    contactTitle: "Contacto",
    contactBefore: "¿Tiene preguntas sobre este aviso? Llámenos al",
    contactMiddle: "o use nuestro",
    contactLink: "formulario de contacto",
  },
  accessibility: {
    metaTitle: "Declaración de accesibilidad",
    metaDescription: "STARS Academy quiere que todas las familias, profesionales y personas que buscan empleo puedan usar este sitio web.",
    crumb: "Accesibilidad",
    eyebrow: "Accesibilidad",
    title: "Declaración de accesibilidad",
    lede: "STARS Academy quiere que todas las familias, profesionales y personas que buscan empleo puedan usar este sitio web.",
    commitmentTitle: "Nuestro compromiso",
    commitmentIntro: "Diseñamos este sitio web para cumplir con las Pautas de Accesibilidad para el Contenido Web (WCAG) 2.2, nivel AA. Esto incluye:",
    commitments: [
      "Colores de texto y de la interfaz con suficiente contraste.",
      "Navegación completa con el teclado, con indicadores de foco visibles y un enlace para “saltar al contenido principal”.",
      "Estructura de página, encabezados y etiquetas que funcionan con lectores de pantalla.",
      "Formularios con etiquetas, instrucciones y mensajes de error claros.",
      "Diseños que se adaptan a teléfonos, tabletas, computadoras y al zoom del navegador de hasta 400 %.",
      "Movimiento reducido para quienes lo prefieren.",
      "Todo el sitio para familias en inglés y en español.",
    ],
    calmTitle: "Modo calma",
    calmBody:
      "A algunas personas —y a algunos de los niños que están a su lado— el movimiento en la pantalla les resulta abrumador. El interruptor de modo calma, en la parte superior de cada página, desactiva las animaciones, el desplazamiento suave y los efectos 3D. Se activa automáticamente si su dispositivo está configurado para reducir el movimiento, y el sitio recuerda su elección.",
    ongoingTitle: "Trabajo continuo",
    ongoingBody:
      "La accesibilidad es un trabajo continuo. Revisamos el contenido nuevo a medida que se agrega y revisamos el sitio con regularidad. Parte del contenido enlazado que está alojado en otros servicios (como nuestros formularios seguros de solicitud) puede no estar totalmente bajo nuestro control.",
    barrierTitle: "Infórmenos sobre una barrera",
    barrierBefore: "Si algo en este sitio es difícil de usar, llámenos al",
    barrierMiddle: "o use nuestro",
    barrierLink: "formulario de contacto",
    barrierAfter: ". Haremos lo posible por darle la información que necesita en un formato que le funcione.",
  },
  nondiscrimination: {
    metaTitle: "Declaración de no discriminación",
    metaDescription: "Declaración de no discriminación del USDA de STARS Academy.",
    crumb: "No discriminación",
    eyebrow: "No discriminación",
    title: "Declaración de no discriminación",
    intro: "STARS Academy participa en programas financiados por el Departamento de Agricultura de los EE. UU.",
    equalOpportunity: "Esta institución es un proveedor que ofrece igualdad de oportunidades.",
    translationNote:
      "Esta es una traducción de la versión abreviada de la declaración. La versión oficial en español del USDA se publicará aquí en cuanto la proporcione nuestra agencia patrocinadora.",
  },
} as const satisfies Widen<typeof en>;

export const legalCopy: Record<Locale, Widen<typeof en>> = { en, es };
