import {
  activeIndex,
  band,
  CAMERA_PATH,
  CHAPTERS,
  clamp,
  computeChapterProgress,
  damp,
  dayHourAt,
  dayIndexAt,
  formatHour,
  localProgress,
  responsiveCamera,
  sampleKeyframes,
  serviceIndexAt,
  SERVICES_CHAPTER,
  smoothstep,
  sunPosition,
} from "@/lib/scroll/timeline";

describe("math helpers", () => {
  it("clamps", () => {
    expect(clamp(-1)).toBe(0);
    expect(clamp(2)).toBe(1);
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("smoothstep is 0/1 outside edges and 0.5 at the midpoint", () => {
    expect(smoothstep(0, 1, -1)).toBe(0);
    expect(smoothstep(0, 1, 2)).toBe(1);
    expect(smoothstep(0, 1, 0.5)).toBeCloseTo(0.5);
    expect(smoothstep(1, 1, 0.5)).toBe(0);
  });

  it("damp converges towards the target and is frame-rate independent", () => {
    const oneStep = damp(0, 1, 5, 0.1);
    let twoSteps = damp(0, 1, 5, 0.05);
    twoSteps = damp(twoSteps, 1, 5, 0.05);
    expect(oneStep).toBeCloseTo(twoSteps, 10);
    expect(damp(0, 1, 5, 0)).toBe(0);
    expect(damp(0, 1, 5, 100)).toBeCloseTo(1);
  });

  it("band rises, holds and falls", () => {
    expect(band(0, 1, 2, 0.5)).toBe(0);
    expect(band(1.5, 1, 2, 0.5)).toBe(1);
    expect(band(3, 1, 2, 0.5)).toBe(0);
    expect(band(0.75, 1, 2, 0.5)).toBeCloseTo(0.5);
    expect(band(1, 1, 2, 0)).toBe(1);
    expect(band(2.1, 1, 2, 0)).toBe(0);
  });

  it("activeIndex divides progress into equal steps", () => {
    expect(activeIndex(0, 5)).toBe(0);
    expect(activeIndex(0.21, 5)).toBe(1);
    expect(activeIndex(0.999, 5)).toBe(4);
    expect(activeIndex(1, 5)).toBe(4);
    expect(activeIndex(0.5, 0)).toBe(-1);
  });
});

describe("computeChapterProgress", () => {
  const rects = [
    { top: 0, height: 1000 },
    { top: 1000, height: 2000 },
    { top: 3500, height: 500 }, // gap 3000–3500
  ];

  it("returns 0 with no chapters", () => {
    expect(computeChapterProgress(100, 800, [])).toBe(0);
  });

  it("maps the reading line into chapter index + fraction", () => {
    // probe = scrollY + 400
    expect(computeChapterProgress(0, 800, rects)).toBeCloseTo(0.4);
    expect(computeChapterProgress(600, 800, rects)).toBeCloseTo(1);
    expect(computeChapterProgress(1600, 800, rects)).toBeCloseTo(1.5);
  });

  it("holds at the boundary inside gaps and caps at N after the end", () => {
    expect(computeChapterProgress(2800, 800, rects)).toBe(2); // probe 3200 in the gap
    expect(computeChapterProgress(3350, 800, rects)).toBeCloseTo(2.5);
    expect(computeChapterProgress(10_000, 800, rects)).toBe(3);
  });

  it("is monotonic as the page scrolls", () => {
    let last = -1;
    for (let y = 0; y < 4500; y += 50) {
      const p = computeChapterProgress(y, 800, rects);
      expect(p).toBeGreaterThanOrEqual(last);
      last = p;
    }
  });
});

describe("chapters", () => {
  it("defines the seven story chapters in order", () => {
    expect(CHAPTERS).toEqual(["hero", "care", "day", "services", "approach", "stars", "visit"]);
    expect(localProgress(3.25, SERVICES_CHAPTER)).toBeCloseTo(0.25);
    expect(localProgress(1, SERVICES_CHAPTER)).toBe(0);
  });

  it("serviceIndexAt walks through all five services inside the services chapter", () => {
    const seen = new Set<number>();
    for (let p = 3; p <= 4; p += 0.01) seen.add(serviceIndexAt(p, 5));
    expect([...seen].sort()).toEqual([0, 1, 2, 3, 4]);
    expect(serviceIndexAt(0, 5)).toBe(0);
    expect(serviceIndexAt(6, 5)).toBe(4);
  });

  it("dayIndexAt covers each moment of the day", () => {
    expect(dayIndexAt(2.05, 5)).toBe(0);
    expect(dayIndexAt(2.5, 5)).toBe(2);
    expect(dayIndexAt(2.99, 5)).toBe(4);
  });
});

describe("day helpers", () => {
  it("maps progress to STARS opening hours 7:00–15:00", () => {
    expect(dayHourAt(0)).toBe(7);
    expect(dayHourAt(0.5)).toBe(11);
    expect(dayHourAt(1)).toBe(15);
  });

  it("formats hours in the site's a.m./p.m. style", () => {
    expect(formatHour(7)).toBe("7:00 a.m.");
    expect(formatHour(12.5)).toBe("12:30 p.m.");
    expect(formatHour(15)).toBe("3:00 p.m.");
  });

  it("puts the sun left at dawn, highest at 11:00 and right at 3 p.m.", () => {
    const dawn = sunPosition(7);
    const zenith = sunPosition(11);
    const dusk = sunPosition(15);
    expect(dawn[0]).toBeLessThan(0);
    expect(dusk[0]).toBeGreaterThan(0);
    expect(zenith[1]).toBeGreaterThan(dawn[1]);
    expect(zenith[0]).toBeCloseTo(0);
  });
});

describe("camera", () => {
  it("returns exact keys at key positions and clamps outside the range", () => {
    const first = CAMERA_PATH[0]!;
    const last = CAMERA_PATH[CAMERA_PATH.length - 1]!;
    expect(sampleKeyframes(-5, CAMERA_PATH).position).toEqual(first.position);
    expect(sampleKeyframes(99, CAMERA_PATH).target).toEqual(last.target);
    const atKey = sampleKeyframes(2, CAMERA_PATH).position;
    CAMERA_PATH[2]!.position.forEach((v, i) => expect(atKey[i]).toBeCloseTo(v));
  });

  it("interpolates between keys", () => {
    const mid = sampleKeyframes(0.5, CAMERA_PATH);
    const a = CAMERA_PATH[0]!.position[2];
    const b = CAMERA_PATH[1]!.position[2];
    expect(mid.position[2]).toBeCloseTo((a + b) / 2);
  });

  it("falls back to a default when there are no keys", () => {
    expect(sampleKeyframes(1, [])).toEqual({ position: [0, 0, 8], target: [0, 0, 0] });
  });

  it("centres the subject and pulls back on portrait screens", () => {
    const sample = sampleKeyframes(0, CAMERA_PATH);
    expect(responsiveCamera(sample, 1.6)).toEqual(sample);
    const portrait = responsiveCamera(sample, 0.5);
    expect(portrait.target[0]).toBeCloseTo(0);
    expect(portrait.position[2]).toBeGreaterThan(sample.position[2]);
  });
});
