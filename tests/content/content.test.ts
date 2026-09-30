import { services, getService } from "@/content/services";
import { site, dayTimeline } from "@/content/site";

describe("content integrity", () => {
  it("has the five STARS disciplines with unique slugs", () => {
    expect(services).toHaveLength(5);
    expect(new Set(services.map((s) => s.slug)).size).toBe(5);
  });

  it("gives every service a valid hex color for the 3D star", () => {
    for (const s of services) expect(s.color).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("only cross-links to services that exist (and never to itself)", () => {
    for (const s of services) {
      for (const c of s.connects) {
        expect(getService(c.with)).toBeDefined();
        expect(c.with).not.toBe(s.slug);
      }
    }
  });

  it("keeps the day timeline in chronological order within opening hours", () => {
    const hours = dayTimeline.map((d) => d.hour);
    expect([...hours].sort((a, b) => a - b)).toEqual(hours);
    expect(Math.min(...hours)).toBeGreaterThanOrEqual(7);
    expect(Math.max(...hours)).toBeLessThanOrEqual(15);
  });

  it("uses a dialable phone link", () => {
    expect(site.phone.href).toBe("tel:+18707933200");
  });
});
