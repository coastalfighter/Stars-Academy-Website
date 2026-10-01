import type { RouteKey } from "@/i18n/routes";
import type { ResourceTopic } from "@/cms/schemas";

/**
 * Resource library shipped with the site, used until staff add resources in
 * the CMS. External links were checked when added (`npm run check:links`
 * re-checks them); see docs/CONTENT-CHECKLIST.md for the ones to confirm.
 */
export type BundledResource = {
  id: string;
  topic: ResourceTopic;
  publisher: string;
  title: { en: string; es: string };
  summary: { en: string; es: string };
  /** A page on this site (resolved per language) or external URLs per language. */
  target: { route: RouteKey } | { en: string | null; es: string | null };
};

export const bundledResources: BundledResource[] = [
  {
    id: "stars-getting-started",
    topic: "getting-started",
    publisher: "STARS Academy",
    title: { en: "How enrollment works", es: "Cómo funciona la inscripción" },
    summary: {
      en: "The steps from your first call to your child’s first day: eligibility, the doctor’s prescription, evaluations and transportation.",
      es: "Los pasos desde su primera llamada hasta el primer día de su hijo: requisitos, la receta del médico, las evaluaciones y el transporte.",
    },
    target: { route: "gettingStarted" },
  },
  {
    id: "stars-faq",
    topic: "getting-started",
    publisher: "STARS Academy",
    title: { en: "Questions families ask us", es: "Preguntas que nos hacen las familias" },
    summary: {
      en: "Ages served, hours, insurance, transportation, Spanish-language therapy and more.",
      es: "Edades que atendemos, horario, seguro médico, transporte, terapia en español y más.",
    },
    target: { route: "faq" },
  },
  {
    id: "cdc-act-early",
    topic: "development",
    publisher: "CDC",
    title: { en: "Learn the Signs. Act Early.", es: "Aprenda los signos. Reaccione pronto." },
    summary: {
      en: "Free milestone checklists from 2 months to 5 years, and tips for talking with your child’s doctor if you have concerns.",
      es: "Listas gratuitas de indicadores del desarrollo de 2 meses a 5 años, y consejos para hablar con el médico de su hijo si tiene inquietudes.",
    },
    target: { en: "https://www.cdc.gov/act-early/index.html", es: "https://www.cdc.gov/act-early/es/index.html" },
  },
  {
    id: "aap-healthychildren",
    topic: "at-home",
    publisher: "American Academy of Pediatrics",
    title: { en: "HealthyChildren.org", es: "HealthyChildren.org en español" },
    summary: {
      en: "Pediatrician-reviewed guidance on development, play, feeding, sleep and everyday health.",
      es: "Información revisada por pediatras sobre desarrollo, juego, alimentación, sueño y salud diaria.",
    },
    target: {
      en: "https://www.healthychildren.org/English/Pages/default.aspx",
      es: "https://www.healthychildren.org/Spanish/Paginas/default.aspx",
    },
  },
  {
    id: "arkids-first",
    topic: "insurance",
    publisher: "Arkansas Department of Human Services",
    title: { en: "ARKids First", es: "ARKids First" },
    summary: {
      en: "Arkansas health coverage for children, which can pay for day treatment and therapy at STARS.",
      es: "Cobertura de salud de Arkansas para niños, que puede pagar el tratamiento diurno y las terapias en STARS.",
    },
    target: { en: "https://humanservices.arkansas.gov/about-dhs/dms/ar-kids", es: null },
  },
  {
    id: "arkansas-211",
    topic: "community",
    publisher: "Arkansas 211",
    title: { en: "Arkansas 211", es: "Arkansas 211" },
    summary: {
      en: "Free, confidential help finding local services: food, housing, utilities, child care and more. Call 211.",
      es: "Ayuda gratuita y confidencial para encontrar servicios locales: comida, vivienda, servicios públicos, cuidado infantil y más. Llame al 211.",
    },
    target: { en: "https://arkansas211.org/", es: null },
  },
];
