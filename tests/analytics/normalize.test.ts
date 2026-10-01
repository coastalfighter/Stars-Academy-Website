import { channelFor, dayKey, dayRange, deviceFor, incrementsFor, isBot, optedOutByHeader, pageFromPath, referrerHost, token } from "@/lib/analytics/normalize";

describe("pageFromPath", () => {
  it("maps known pages in both languages, including services", () => {
    expect(pageFromPath("/")).toEqual({ key: "home", locale: "en" });
    expect(pageFromPath("/es/preguntas-frecuentes/")).toEqual({ key: "faq", locale: "es" });
    expect(pageFromPath("/services/speech-therapy?x=1")).toEqual({ key: "service:speech-therapy", locale: "en" });
    expect(pageFromPath("/es/servicios/enfermeria")).toEqual({ key: "service:nursing-care", locale: "es" });
  });

  it("never stores unknown paths verbatim", () => {
    expect(pageFromPath("/wp-admin/../secret?name=Jane")).toEqual({ key: "other", locale: "en" });
    expect(pageFromPath("/es/no-existe")).toEqual({ key: "other", locale: "es" });
  });
});

describe("dimensions", () => {
  it("sanitises tokens and hosts", () => {
    expect(token(" Fall Open House! ")).toBe("fall-open-house");
    expect(token("x".repeat(80))).toHaveLength(40);
    expect(token(42)).toBe("");
    expect(referrerHost("www.Google.com")).toBe("google.com");
    expect(referrerHost("m.facebook.com")).toBe("facebook.com");
    expect(referrerHost("not a host")).toBe("");
    expect(referrerHost("<script>.com")).toBe("");
  });

  it("classifies channels", () => {
    expect(channelFor("", "", "")).toBe("direct");
    expect(channelFor("google.com", "", "")).toBe("search");
    expect(channelFor("duckduckgo.com", "", "")).toBe("search");
    expect(channelFor("facebook.com", "", "")).toBe("social");
    expect(channelFor("mail.google.com", "", "")).toBe("email");
    expect(channelFor("arkansas-pediatrics.example", "", "")).toBe("referral");
    expect(channelFor("google.com", "flyer", "print")).toBe("campaign");
    expect(channelFor("", "newsletter", "email")).toBe("email");
  });

  it("buckets devices by viewport width", () => {
    expect(deviceFor(390)).toBe("mobile");
    expect(deviceFor(800)).toBe("tablet");
    expect(deviceFor(1440)).toBe("desktop");
    expect(deviceFor("x")).toBe("desktop");
  });

  it("recognises bots and privacy signals", () => {
    expect(isBot("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe(true);
    expect(isBot("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 HeadlessChrome/141.0 Safari/537.36")).toBe(true);
    expect(isBot(null)).toBe(true);
    expect(isBot("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile Safari/604.1")).toBe(false);
    expect(optedOutByHeader(new Headers({ "sec-gpc": "1" }))).toBe(true);
    expect(optedOutByHeader(new Headers({ dnt: "1" }))).toBe(true);
    expect(optedOutByHeader(new Headers())).toBe(false);
  });
});

describe("incrementsFor", () => {
  it("counts a landing page view as a visit with its source and campaign", () => {
    expect(incrementsFor({ k: "pv", p: "/es", w: 390, e: 1, r: "www.google.com", us: "Flyer", um: "print", uc: "Fall Open House" })).toEqual([
      { metric: "pv", field: "home|es" },
      { metric: "dev", field: "mobile" },
      { metric: "entry", field: "campaign|flyer|es" },
      { metric: "camp", field: "fall-open-house|flyer" },
    ]);
  });

  it("counts later views without a visit", () => {
    expect(incrementsFor({ k: "pv", p: "/faq", w: 1400, e: 0, r: "google.com" })).toEqual([
      { metric: "pv", field: "faq|en" },
      { metric: "dev", field: "desktop" },
    ]);
  });

  it("only accepts known events and allowlisted details", () => {
    expect(incrementsFor({ k: "ev", p: "/contact-us", n: "phone_click", d: "anything" })).toEqual([{ metric: "ev", field: "phone_click|-|contact|en" }]);
    expect(incrementsFor({ k: "ev", p: "/", n: "language_switch", d: "es" })).toEqual([{ metric: "ev", field: "language_switch|es|home|en" }]);
    expect(incrementsFor({ k: "ev", p: "/", n: "keystroke" })).toBeNull();
  });

  it("rejects malformed beacons", () => {
    for (const bad of [null, [], "x", { k: "pv" }, { k: "pv", p: "https://evil.test/" }, { k: "pv", p: `/${"a".repeat(400)}` }, { k: "zz", p: "/" }]) {
      expect(incrementsFor(bad)).toBeNull();
    }
  });
});

describe("days", () => {
  it("uses the clinic's calendar day", () => {
    // 03:00 UTC on Oct 2 is still Oct 1 in Arkansas.
    expect(dayKey(Date.UTC(2026, 9, 2, 3))).toBe("2026-10-01");
    expect(dayKey(Date.UTC(2026, 9, 2, 6))).toBe("2026-10-02");
  });

  it("lists consecutive days across month and DST boundaries", () => {
    expect(dayRange("2026-11-02", 4)).toEqual(["2026-10-30", "2026-10-31", "2026-11-01", "2026-11-02"]);
  });
});
