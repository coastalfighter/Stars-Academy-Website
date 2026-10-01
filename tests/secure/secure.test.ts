import { DIRECT_ADDRESS, isApprovedSecureUrl, secureHosts } from "@/lib/secure/hosts";
import { getSecureChannels, smsHref } from "@/cms/repository";
import { site } from "@/content/site";

const env = (e: Record<string, string> = {}) => e as unknown as NodeJS.ProcessEnv;

describe("secure form host allowlist", () => {
  const hosts = secureHosts(env({ SECURE_FORM_HOSTS: "forms.hipaa-forms.test, .securefiles.test, not a host" }));

  it("always allows Adobe Sign and adds valid configured hosts", () => {
    expect(hosts).toEqual([".documents.adobe.com", "forms.hipaa-forms.test", ".securefiles.test"]);
    expect(isApprovedSecureUrl(site.secureForms.enrollmentPacket, hosts)).toBe(true);
  });

  it("matches exact hosts and subdomains of dotted entries only", () => {
    expect(isApprovedSecureUrl("https://forms.hipaa-forms.test/stars/enroll", hosts)).toBe(true);
    expect(isApprovedSecureUrl("https://other.hipaa-forms.test/x", hosts)).toBe(false);
    expect(isApprovedSecureUrl("https://upload.securefiles.test/x", hosts)).toBe(true);
    expect(isApprovedSecureUrl("https://securefiles.test/x", hosts)).toBe(true);
  });

  it.each([
    "http://forms.hipaa-forms.test/x",
    "https://forms.hipaa-forms.test.evil.test/x",
    "https://evilsecurefiles.test/x",
    "https://user:pass@forms.hipaa-forms.test/x",
    "https://forms.hipaa-forms.test:8443/x",
    "javascript:alert(1)",
    "not a url",
  ])("rejects %s", (url) => expect(isApprovedSecureUrl(url, hosts)).toBe(false));

  it("recognises Direct secure messaging addresses", () => {
    expect(DIRECT_ADDRESS.test("referrals@direct.mystarsacademy.org")).toBe(true);
    expect(DIRECT_ADDRESS.test("intake@stars.directtrust.example")).toBe(true);
    expect(DIRECT_ADDRESS.test("info@mystarsacademy.org")).toBe(false);
  });
});

describe("getSecureChannels", () => {
  function serve(settings: Record<string, unknown> | null) {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ result: settings }), { status: 200 })),
    );
  }
  beforeEach(() => {
    vi.stubEnv("SANITY_PROJECT_ID", "abc123");
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("falls back to the Adobe Sign packet without CMS settings", async () => {
    vi.unstubAllEnvs();
    const c = await getSecureChannels("en", { env: env() });
    expect(c).toMatchObject({ enrollmentForm: { href: site.secureForms.enrollmentPacket, lang: null }, referralUpload: null, directAddress: null, textAlerts: null });
  });

  it("uses approved CMS links, falling back across languages", async () => {
    serve({ enrollmentFormEn: "https://forms.hipaa-forms.test/en", referralUploadUrl: "https://upload.securefiles.test/stars" });
    const c = await getSecureChannels("es", { env: env({ SECURE_FORM_HOSTS: "forms.hipaa-forms.test,.securefiles.test" }), report: vi.fn() });
    expect(c.enrollmentForm).toEqual({ href: "https://forms.hipaa-forms.test/en", lang: "en-US" });
    expect(c.referralUpload).toBe("https://upload.securefiles.test/stars");
  });

  it("drops and reports links to unapproved sites (a hijacked CMS can't redirect families)", async () => {
    serve({ enrollmentFormEn: "https://lookalike-forms.test/stars", referralUploadUrl: "https://upload.securefiles.test/stars" });
    const report = vi.fn();
    const c = await getSecureChannels("en", { env: env(), report });
    expect(c.enrollmentForm.href).toBe(site.secureForms.enrollmentPacket);
    expect(c.referralUpload).toBeNull();
    expect(report).toHaveBeenCalledWith("enrollmentFormEn", "https://lookalike-forms.test/stars");
    expect(report).toHaveBeenCalledWith("referralUploadUrl", "https://upload.securefiles.test/stars");
  });

  it("keeps other settings when one secure field is malformed", async () => {
    serve({ fax: "870-555-0100", enrollmentFormEn: "javascript:alert(1)", directAddress: "not-direct@example.org", textAlerts: { number: "870-555-0199", keyword: "stars" } });
    const c = await getSecureChannels("en", { env: env(), report: vi.fn() });
    expect(c).toMatchObject({ fax: "870-555-0100", directAddress: null, textAlerts: { number: "870-555-0199", keyword: "STARS", smsHref: "sms:8705550199?body=STARS" } });
  });

  it("builds sms: links phones understand", () => {
    expect(smsHref("(870) 555-0199", "STARS")).toBe("sms:8705550199?body=STARS");
    expect(smsHref("+1 870 555 0199", "JOIN NOW")).toBe("sms:+18705550199?body=JOIN%20NOW");
  });
});
