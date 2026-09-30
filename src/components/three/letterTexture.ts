import { CanvasTexture, SRGBColorSpace } from "three";

/**
 * Draws a single glyph onto a transparent canvas texture. Uses the site's
 * display font (exposed by next/font as a CSS variable) so the STARS blocks
 * match the typography, falling back to Georgia.
 */
export function createLetterTexture(letter: string, color: string, size = 256): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const family =
      getComputedStyle(document.documentElement).getPropertyValue("--font-fraunces").trim() || "Georgia, serif";
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `600 ${Math.round(size * 0.68)}px ${family}`;
    ctx.fillText(letter, size / 2, size / 2 + size * 0.04);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
