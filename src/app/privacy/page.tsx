import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";
import { LegalPage } from "@/components/page/LegalPage";

export const metadata: Metadata = {
  title: "Website Privacy Notice",
  description: "How the STARS Academy website collects and uses information.",
  alternates: { canonical: "/privacy" },
};

/**
 * Describes what this website actually does (see lib/inquiry and the
 * calm-mode preference). Must be reviewed by STARS' compliance advisor before
 * launch — tracked in docs/CONTENT-CHECKLIST.md.
 */
export default function PrivacyPage() {
  return (
    <LegalPage
      slug="privacy"
      crumb="Privacy"
      eyebrow="Privacy"
      title="Website privacy notice"
      lede="How this website collects and uses information. It covers the website only — not STARS’ HIPAA Notice of Privacy Practices."
    >
      <h2>Information you choose to send us</h2>
      <p>
        When you use a form on this website — for example to request a tour, send an enrollment inquiry, make a
        referral, contact us, or tell us about your interest in a job — we collect the information you enter, such
        as your name, phone number, email address and message. We use it only to respond to your request.
      </p>
      <p>
        Please do not send diagnoses, medical records or other health information through website forms. Our team
        will arrange a secure way to share that information when it is needed. Our forms are designed to reject
        messages that appear to contain dates of birth, Social Security numbers or insurance numbers.
      </p>

      <h2>How information is delivered and shared</h2>
      <p>
        Form submissions are sent securely to STARS staff and are not stored in a database on this website. Standard
        server logs kept by our hosting provider may briefly record technical details such as IP addresses to keep
        the site secure and prevent abuse. We do not sell personal information.
      </p>

      <h2>Cookies, analytics and preferences</h2>
      <p>
        This website does not use advertising or analytics trackers. If you turn on <strong>Calm mode</strong>, your
        browser remembers that choice on your own device so the site stays calm on your next visit. You can clear it
        at any time in your browser settings.
      </p>

      <h2>Links to other services</h2>
      <p>
        Some links open services run by others — for example our secure enrollment and employment forms on Adobe
        Sign, Google Maps, Facebook and Instagram. Their own privacy policies apply there.
      </p>

      <h2>Your health information</h2>
      <p>
        How STARS uses and protects health information about children in our care is described in our HIPAA Notice of
        Privacy Practices, available from our office.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this notice? Call us at <a href={site.phone.href}>{site.phone.display}</a> or use our{" "}
        <Link href="/contact-us">contact form</Link>.
      </p>
    </LegalPage>
  );
}
