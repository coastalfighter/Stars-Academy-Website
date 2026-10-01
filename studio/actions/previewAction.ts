import { useState } from "react";
import { useClient, type DocumentActionComponent } from "sanity";

/** Where each kind of content appears on the website. */
const PREVIEW_PATH: Record<string, string> = {
  announcement: "/families#announcements",
  faq: "/faq",
  jobOpening: "/careers",
  testimonial: "/",
  teamMember: "/about-us",
  siteSettings: "/contact-us",
};

const SITE_URL = (process.env.SANITY_STUDIO_SITE_URL || "https://www.mystarsacademy.org").replace(/\/$/, "");
const SECRET_TTL_MS = 60 * 60 * 1000;

function randomSecret(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * "Preview on website": stores a one-hour secret under a private ID path
 * (only signed-in editors can write it; public reads can't see it), then
 * opens the site's draft-mode route, which verifies the secret server-side.
 */
export const previewAction: DocumentActionComponent = (props) => {
  const client = useClient({ apiVersion: "2025-02-19" });
  const [busy, setBusy] = useState(false);
  const path = PREVIEW_PATH[props.type];
  if (!path) return null;

  return {
    label: busy ? "Opening preview…" : "Preview on website",
    disabled: busy,
    onHandle: async () => {
      setBusy(true);
      // Open the tab synchronously so pop-up blockers allow it, then navigate it.
      const tab = window.open("about:blank", "_blank");
      try {
        const secret = randomSecret();
        await client.create({
          _id: `previewSecret.${secret.slice(0, 16)}`,
          _type: "previewSecret",
          secret,
          expiresAt: new Date(Date.now() + SECRET_TTL_MS).toISOString(),
        });
        const url = `${SITE_URL}/api/draft-mode/enable?secret=${encodeURIComponent(secret)}&redirect=${encodeURIComponent(path)}`;
        if (tab) tab.location.href = url;
        else window.location.href = url;
      } catch (error) {
        tab?.close();
        console.error("Could not start preview", error);
      } finally {
        setBusy(false);
        props.onComplete();
      }
    },
  };
};
