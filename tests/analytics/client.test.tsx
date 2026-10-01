import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { eventForClick, resetAnalyticsClient, setAnalyticsEnabled, setOptedOut, track, trackPageview, trackingAllowed } from "@/lib/analytics/client";
import { AnalyticsOptOut } from "@/components/analytics/AnalyticsOptOut";
import { OPT_OUT_KEY } from "@/lib/analytics/protocol";

let sent: Record<string, unknown>[] = [];

beforeEach(() => {
  resetAnalyticsClient();
  window.localStorage.clear();
  sent = [];
  Object.defineProperty(navigator, "sendBeacon", {
    configurable: true,
    value: vi.fn((_url: string, blob: Blob) => {
      void blob.text().then((t) => sent.push(JSON.parse(t) as Record<string, unknown>));
      return true;
    }),
  });
  Object.defineProperty(navigator, "webdriver", { configurable: true, value: false });
  Object.defineProperty(navigator, "doNotTrack", { configurable: true, value: null });
  Object.defineProperty(navigator, "globalPrivacyControl", { configurable: true, value: undefined });
});

const flush = () => new Promise((r) => setTimeout(r, 0));

describe("tracking consent", () => {
  it("is off until the site enables it", () => {
    expect(trackingAllowed()).toBe(false);
    setAnalyticsEnabled(true);
    expect(trackingAllowed()).toBe(true);
  });

  it.each([
    ["Global Privacy Control", () => Object.defineProperty(navigator, "globalPrivacyControl", { configurable: true, value: true })],
    ["Do Not Track", () => Object.defineProperty(navigator, "doNotTrack", { configurable: true, value: "1" })],
    ["automated browsers", () => Object.defineProperty(navigator, "webdriver", { configurable: true, value: true })],
    ["the visitor's opt-out", () => setOptedOut(true)],
  ])("respects %s", async (_name, apply) => {
    setAnalyticsEnabled(true);
    apply();
    trackPageview();
    track("phone_click");
    await flush();
    expect(sent).toEqual([]);
  });
});

describe("beacons", () => {
  it("marks the first view as a visit, with referrer and campaign, and later views not", async () => {
    setAnalyticsEnabled(true);
    Object.defineProperty(document, "referrer", { configurable: true, value: "https://www.google.com/search?q=stars" });
    window.history.replaceState(null, "", "/?utm_source=flyer&utm_medium=print&utm_campaign=fall&name=jane");
    trackPageview();
    window.history.replaceState(null, "", "/faq");
    trackPageview();
    await flush();
    expect(sent[0]).toEqual({ k: "pv", p: "/", w: window.innerWidth, e: 1, r: "www.google.com", us: "flyer", um: "print", uc: "fall" });
    expect(sent[1]).toEqual({ k: "pv", p: "/faq", w: window.innerWidth, e: 0 });
    // Only the pathname leaves the browser, never the query string.
    expect(JSON.stringify(sent)).not.toContain("jane");
  });

  it("drops details outside an event's allowlist", async () => {
    setAnalyticsEnabled(true);
    track("language_switch", "es");
    track("phone_click", "870-555-0134");
    await flush();
    expect(sent).toEqual([
      { k: "ev", p: "/faq", n: "language_switch", d: "es" },
      { k: "ev", p: "/faq", n: "phone_click" },
    ]);
  });

  it("classifies clicks", () => {
    document.body.innerHTML = `
      <a id="tel" href="tel:+18707933200"><span id="inner">Call</span></a>
      <a id="mail" href="mailto:info@example.org">Email</a>
      <a id="map" href="https://www.google.com/maps/search/?api=1&query=x">Map</a>
      <a id="lang" href="/es" data-track="language_switch:es">Español</a>
      <a id="plain" href="/faq">FAQ</a>`;
    const at = (id: string) => eventForClick(document.getElementById(id));
    expect(at("inner")).toEqual({ name: "phone_click" });
    expect(at("mail")).toEqual({ name: "email_click" });
    expect(at("map")).toEqual({ name: "directions_click" });
    expect(at("lang")).toEqual({ name: "language_switch", detail: "es" });
    expect(at("plain")).toBeNull();
  });
});

describe("AnalyticsOptOut", () => {
  const copy = { title: "Counting", on: "Counting is on.", off: "Counting is off.", browserOff: "Your browser opts out.", switchLabel: "Count my visits" };

  it("switches counting off and back on for this browser", async () => {
    await act(async () => {
      render(<AnalyticsOptOut copy={copy} />);
    });
    const toggle = screen.getByRole("switch", { name: "Count my visits" });
    expect(toggle).toHaveAttribute("aria-checked", "true");
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(window.localStorage.getItem(OPT_OUT_KEY)).toBe("true");
    expect(screen.getByRole("status")).toHaveTextContent("Counting is off.");
    await userEvent.click(toggle);
    expect(window.localStorage.getItem(OPT_OUT_KEY)).toBeNull();
  });

  it("explains instead of offering a switch when the browser sends GPC", async () => {
    Object.defineProperty(navigator, "globalPrivacyControl", { configurable: true, value: true });
    await act(async () => {
      render(<AnalyticsOptOut copy={copy} />);
    });
    expect(screen.queryByRole("switch")).toBeNull();
    expect(screen.getByText("Your browser opts out.")).toBeInTheDocument();
  });
});
