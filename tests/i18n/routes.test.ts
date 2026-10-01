import { alternates, counterpartPath, hasLocale, href, localeFromPath, serviceAlternates, serviceHref, serviceSlugFromLocal } from "@/i18n/routes";

describe("i18n routing", () => {
  it("detects the language of a path", () => {
    expect(localeFromPath("/")).toBe("en");
    expect(localeFromPath("/essentials")).toBe("en");
    expect(localeFromPath("/es")).toBe("es");
    expect(localeFromPath("/es/servicios")).toBe("es");
  });

  it("builds links in the visitor's language, falling back to English", () => {
    expect(href("es", "gettingStarted", "#inquiry")).toBe("/es/como-empezar#inquiry");
    expect(href("es", "careers")).toBe("/careers");
    expect(hasLocale("careers", "es")).toBe(false);
    expect(hasLocale("faq", "es")).toBe(true);
  });

  it("maps service slugs both ways", () => {
    expect(serviceHref("es", "speech-therapy")).toBe("/es/servicios/terapia-del-habla-y-lenguaje");
    expect(serviceSlugFromLocal("es", "enfermeria")).toBe("nursing-care");
    expect(serviceSlugFromLocal("en", "enfermeria")).toBeUndefined();
  });

  it.each([
    ["/", "es", "/es"],
    ["/es", "en", "/"],
    ["/approach", "es", "/es/nuestro-enfoque"],
    ["/es/preguntas-frecuentes/", "en", "/faq"],
    ["/services/physical-therapy", "es", "/es/servicios/terapia-fisica"],
    ["/es/servicios/aulas-de-desarrollo?x=1", "en", "/services/developmental-classrooms"],
    ["/careers", "es", null],
    ["/nope", "es", null],
  ] as const)("finds the counterpart of %s in %s", (path, target, expected) => {
    expect(counterpartPath(path, target)).toBe(expected);
  });

  it("emits hreflang alternates only where a translation exists", () => {
    expect(alternates("faq", "es")).toEqual({
      canonical: "/es/preguntas-frecuentes",
      languages: { "en-US": "/faq", "es-US": "/es/preguntas-frecuentes", "x-default": "/faq" },
    });
    expect(alternates("referrals", "en").languages).not.toHaveProperty("es-US");
    expect(serviceAlternates("nursing-care", "en").languages["es-US"]).toBe("/es/servicios/enfermeria");
  });
});
