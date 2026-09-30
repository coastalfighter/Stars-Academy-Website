import type { Metadata } from "next";
import { nondiscriminationSummary } from "@/content/site";
import { LegalPage } from "@/components/page/LegalPage";

export const metadata: Metadata = {
  title: "Nondiscrimination Statement",
  description: "STARS Academy’s USDA nondiscrimination statement.",
  alternates: { canonical: "/nondiscrimination" },
};

/**
 * The complete USDA statement (with program-information and complaint-filing
 * instructions) must be inserted exactly as provided by STARS' sponsoring
 * agency — tracked in docs/CONTENT-CHECKLIST.md. Legal text is not paraphrased.
 */
export default function NondiscriminationPage() {
  return (
    <LegalPage slug="nondiscrimination" crumb="Nondiscrimination" eyebrow="Nondiscrimination" title="Nondiscrimination statement">
      <p>STARS Academy participates in programs funded by the U.S. Department of Agriculture.</p>
      <p>{nondiscriminationSummary}</p>
      <p>
        <strong>This institution is an equal opportunity provider.</strong>
      </p>
    </LegalPage>
  );
}
