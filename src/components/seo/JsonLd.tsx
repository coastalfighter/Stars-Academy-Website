import { site } from "@/content/site";
import { services } from "@/content/services";

/** Serialises JSON-LD safely (prevents `</script>` breakout). */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

/** schema.org description of STARS as a pediatric medical clinic. */
export function organizationSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": ["MedicalClinic", "Preschool"],
    "@id": `${site.url}/#organization`,
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    logo: `${site.url}/favicon.svg`,
    image: `${site.url}/photos/classroom-play.webp`,
    description: site.description,
    foundingDate: String(site.founded),
    telephone: site.phone.e164,
    medicalSpecialty: ["Pediatric", "SpeechPathology", "PhysicalTherapy", "OccupationalTherapy", "Nursing"],
    availableService: services.map((s) => ({
      "@type": "MedicalTherapy",
      name: s.name,
      description: s.what,
      url: `${site.url}/services/${s.slug}`,
    })),
    audience: { "@type": "PeopleAudience", suggestedMinAge: 0, suggestedMaxAge: 6 },
    knowsLanguage: ["en", "es"],
    paymentAccepted: "Medicaid (ARKids First-A, SSI, TEFRA)",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: site.hours.opens,
        closes: site.hours.closes,
      },
    ],
  };
}
