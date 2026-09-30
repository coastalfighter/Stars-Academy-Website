import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";
import { LegalPage } from "@/components/page/LegalPage";

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description: "STARS Academy wants every family, partner and job seeker to be able to use this website.",
  alternates: { canonical: "/accessibility" },
};

export default function AccessibilityPage() {
  return (
    <LegalPage
      slug="accessibility"
      crumb="Accessibility"
      eyebrow="Accessibility"
      title="Accessibility statement"
      lede="STARS Academy wants every family, partner and job seeker to be able to use this website."
    >
      <h2>Our commitment</h2>
      <p>We designed this website to meet the Web Content Accessibility Guidelines (WCAG) 2.2, Level AA. That includes:</p>
      <ul>
        <li>Text and interface colors with sufficient contrast.</li>
        <li>Full keyboard navigation, with visible focus indicators and a “skip to main content” link.</li>
        <li>Page structure, headings and labels that work with screen readers.</li>
        <li>Forms with clear labels, instructions and error messages.</li>
        <li>Layouts that adapt to phones, tablets, desktop and browser zoom up to 400%.</li>
        <li>Reduced motion for visitors who prefer it.</li>
      </ul>

      <h2>Calm mode</h2>
      <p>
        Some visitors — and some of the children beside them — find movement on screen overwhelming. The{" "}
        <strong>Calm mode</strong> switch at the top of every page turns off animation, smooth scrolling and 3D
        effects. It turns on automatically if your device is set to reduce motion, and the site remembers your
        choice.
      </p>

      <h2>Ongoing work</h2>
      <p>
        Accessibility is ongoing. We test new content as it is added and review the site regularly. Some linked
        content hosted by other services (such as our secure application forms) may not be fully within our control.
      </p>

      <h2>Tell us about a barrier</h2>
      <p>
        If anything on this site is difficult to use, please call us at <a href={site.phone.href}>{site.phone.display}</a>{" "}
        or use our <Link href="/contact-us">contact form</Link>. We’ll work to provide the information you need in a
        format that works for you.
      </p>
    </LegalPage>
  );
}
