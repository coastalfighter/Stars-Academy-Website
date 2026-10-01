import { Figtree, Fraunces } from "next/font/google";

/** Self-hosted by next/font. The Latin subset covers Spanish (á é í ó ú ü ñ ¿ ¡). */
export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["SOFT", "opsz"],
  display: "swap",
});

export const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});
