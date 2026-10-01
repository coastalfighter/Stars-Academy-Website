import { arrival, fitScale, halfHeight, screenToWorld, slotPresence, sunArc } from "@/lib/scene/slots";

const vp = { width: 1600, height: 800 };

describe("screenToWorld", () => {
  it("maps the viewport centre to the origin", () => {
    const box = screenToWorld({ left: 700, top: 300, width: 200, height: 200 }, vp);
    expect(box.x).toBeCloseTo(0);
    expect(box.y).toBeCloseTo(0);
  });

  it("maps the full viewport to the full visible plane", () => {
    const hh = halfHeight();
    const box = screenToWorld({ left: 0, top: 0, width: 1600, height: 800 }, vp);
    expect(box.height).toBeCloseTo(2 * hh);
    expect(box.width).toBeCloseTo(2 * hh * 2);
  });

  it("puts a right-hand box on the right and a top box at the top", () => {
    const right = screenToWorld({ left: 1000, top: 300, width: 400, height: 200 }, vp);
    const top = screenToWorld({ left: 700, top: 0, width: 200, height: 100 }, vp);
    expect(right.x).toBeGreaterThan(0);
    expect(top.y).toBeGreaterThan(0);
  });

  it("keeps squares square in world units", () => {
    const box = screenToWorld({ left: 100, top: 100, width: 300, height: 300 }, vp);
    expect(box.width).toBeCloseTo(box.height);
  });
});

describe("fitScale", () => {
  it("fits by the tighter dimension", () => {
    expect(fitScale({ x: 0, y: 0, width: 4, height: 2 }, 1, 1)).toBe(2);
    expect(fitScale({ x: 0, y: 0, width: 4, height: 8 }, 2, 2)).toBe(2);
  });
});

describe("slotPresence", () => {
  it("is 0 for hidden or off-screen slots", () => {
    expect(slotPresence({ left: 0, top: 0, width: 0, height: 0 }, vp)).toBe(0);
    expect(slotPresence({ left: 0, top: 900, width: 100, height: 100 }, vp)).toBe(0);
    expect(slotPresence({ left: 0, top: -300, width: 100, height: 100 }, vp)).toBe(0);
  });

  it("is 1 when fully on screen and in between while entering", () => {
    expect(slotPresence({ left: 0, top: 100, width: 100, height: 100 }, vp)).toBe(1);
    const half = slotPresence({ left: 0, top: 750, width: 100, height: 100 }, vp);
    expect(half).toBeGreaterThan(0);
    expect(half).toBeLessThan(1);
  });

  it("treats a slot taller than the viewport as fully present when it fills the screen", () => {
    expect(slotPresence({ left: 0, top: -100, width: 100, height: 1200 }, vp)).toBe(1);
  });
});

describe("arrival", () => {
  it("runs from 0 to 1 as the slot rises through the viewport", () => {
    expect(arrival({ left: 0, top: 800, width: 10, height: 10 }, vp)).toBe(0);
    expect(arrival({ left: 0, top: 200, width: 10, height: 10 }, vp)).toBe(1);
    const mid = arrival({ left: 0, top: 560, width: 10, height: 10 }, vp);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(1);
  });
});

describe("sunArc", () => {
  it("rises on the left, peaks at midday and sets on the right, inside the slot", () => {
    const dawn = sunArc(0);
    const noon = sunArc(0.5);
    const dusk = sunArc(1);
    expect(dawn.u).toBeLessThan(noon.u);
    expect(noon.u).toBeLessThan(dusk.u);
    expect(noon.v).toBeGreaterThan(dawn.v);
    expect(noon.v).toBeGreaterThan(dusk.v);
    for (const s of [dawn, noon, dusk, sunArc(-1), sunArc(2)]) {
      expect(s.u).toBeGreaterThanOrEqual(0);
      expect(s.u).toBeLessThanOrEqual(1);
      expect(s.v).toBeGreaterThanOrEqual(0);
      expect(s.v).toBeLessThanOrEqual(1);
    }
  });
});
