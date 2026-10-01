import { expect, test } from "@playwright/test";
import { sitemapPaths } from "./helpers";

/**
 * Layout sweep: every page in the sitemap, at phone, tablet and desktop widths.
 * Catches what axe can't: sideways scrolling, text from two elements drawn on
 * top of each other, text cut off by a container, and button labels that wrap
 * onto a second line at desktop widths.
 */

const WIDTHS = [1440, 1024, 768, 390, 320] as const;

type Finding = string;

/** Runs in the page. Plain JavaScript only: it is serialized into the browser. */
function findLayoutProblems(): Finding[] {
  const out: Finding[] = [];
  const vw = window.innerWidth;

  if (document.documentElement.scrollWidth > vw + 1) {
    const culprit = [...document.querySelectorAll<HTMLElement>("body *")].find((e) => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.right > vw + 1 && getComputedStyle(e).position !== "fixed";
    });
    out.push(`scrolls sideways (${document.documentElement.scrollWidth}px): ${culprit?.tagName ?? "?"}.${String(culprit?.className ?? "").slice(0, 80)}`);
  }

  const shown = (el: Element): boolean => {
    for (let e: Element | null = el; e && e !== document.body; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) < 0.05) return false;
      if (e.classList.contains("sr-only") || e.classList.contains("-left-[9999px]")) return false;
    }
    // Content of a closed <details> keeps layout boxes in Chromium but isn't drawn.
    const details = el.closest("details");
    return !details || details.open || Boolean(el.closest("summary"));
  };

  type Box = { el: Element; left: number; right: number; top: number; bottom: number; text: string; fixed: boolean };
  const boxes: Box[] = [];
  const clipped = new Set<string>();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const text = node.textContent?.trim() ?? "";
    const el = node.parentElement;
    if (!text || !el || el.closest("script,style,noscript,[hidden]") || !shown(el)) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    for (const raw of range.getClientRects()) {
      if (raw.width <= 1 || raw.height <= 1) continue;
      let r = { left: raw.left, right: raw.right, top: raw.top, bottom: raw.bottom };
      for (let e: Element | null = el; e && e !== document.body; e = e.parentElement) {
        const cs = getComputedStyle(e);
        if (/(hidden|clip)/.test(cs.overflowX + cs.overflowY)) {
          const c = e.getBoundingClientRect();
          r = { left: Math.max(r.left, c.left), right: Math.min(r.right, c.right), top: Math.max(r.top, c.top), bottom: Math.min(r.bottom, c.bottom) };
        }
      }
      if (r.right - r.left <= 1 || r.bottom - r.top <= 1) continue;
      const visible = (r.right - r.left) * (r.bottom - r.top);
      if (visible < raw.width * raw.height * 0.9) clipped.add(`text cut off: "${text.slice(0, 50)}"`);
      boxes.push({ el, ...r, text: text.slice(0, 50), fixed: Boolean(el.closest("header.fixed, [class*=' fixed']")) });
    }
  }
  out.push(...clipped);

  // Lines of the same heading or paragraph may touch (tight display leading); different blocks must not.
  const block = (e: Element) => e.closest("h1,h2,h3,h4,p,li,blockquote,a,button,label,dt,dd");
  const overlaps = new Set<string>();
  for (let i = 0; i < boxes.length; i += 1) {
    for (let j = i + 1; j < boxes.length; j += 1) {
      const a = boxes[i]!;
      const b = boxes[j]!;
      if (a.el === b.el || a.fixed !== b.fixed) continue;
      const blk = block(a.el);
      if (blk && blk === block(b.el)) continue;
      const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (ox > 3 && oy > 4) overlaps.add(`text overlaps: "${a.text}" and "${b.text}"`);
    }
  }
  out.push(...overlaps);

  if (vw >= 1024) {
    for (const el of document.querySelectorAll("a.rounded-full, button.rounded-full")) {
      if (!shown(el)) continue;
      const tops: number[] = [];
      const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      while (tw.nextNode()) {
        const t = tw.currentNode;
        if (!t.textContent?.trim() || t.parentElement?.closest(".sr-only")) continue;
        const rg = document.createRange();
        rg.selectNodeContents(t);
        for (const r of rg.getClientRects()) if (r.width > 2) tops.push(Math.round(r.top / 8));
      }
      if (new Set(tops).size > 1) out.push(`button label wraps: "${(el as HTMLElement).innerText.trim().slice(0, 50)}"`);
    }
  }
  return out;
}

test.describe("layout sweep", () => {
  test.skip(({ isMobile }) => isMobile, "Sets its own viewport widths; one pass is enough.");

  test("no page scrolls sideways, overlaps text, cuts text off or wraps a button", async ({ page, request }) => {
    test.setTimeout(600_000);
    // Reduced motion shows every section in its final position.
    await page.emulateMedia({ reducedMotion: "reduce" });
    const paths = await sitemapPaths(request);
    const problems: string[] = [];
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of paths) {
        await page.goto(path, { waitUntil: "networkidle" });
        for (const finding of await page.evaluate(findLayoutProblems)) problems.push(`${width}px ${path}: ${finding}`);
      }
    }
    expect(problems, problems.join("\n")).toEqual([]);
  });
});
