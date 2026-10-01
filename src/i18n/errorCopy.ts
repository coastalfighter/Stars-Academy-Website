/**
 * Copy for the error pages, in its own module: error boundaries are client
 * components bundled with every page, so they import this instead of the
 * full UI dictionaries. The dictionaries re-export it as `serverError`.
 */
export const errorCopy = {
  en: {
    title: "Something went wrong on our side.",
    body: "Sorry about that. Please try again. If it keeps happening, call us and we’ll help right away:",
    retry: "Try again",
    home: "Back to home",
  },
  es: {
    title: "Algo salió mal de nuestro lado.",
    body: "Lo sentimos. Vuelva a intentarlo. Si sigue pasando, llámenos y le ayudaremos de inmediato:",
    retry: "Intentar de nuevo",
    home: "Volver al inicio",
  },
} as const;
