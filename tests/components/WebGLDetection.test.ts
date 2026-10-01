import { FORCE_3D_STORAGE_KEY, detectWebGL, isSoftwareRenderer } from "@/components/providers/MotionProvider";

type FakeGL = {
  RENDERER: number;
  getExtension: (name: string) => unknown;
  getParameter: (p: number) => unknown;
};

const UNMASKED = 0x9246;

function stubContext(renderer: string | null) {
  const loseContext = vi.fn();
  const gl: FakeGL = {
    RENDERER: 0x1f01,
    getExtension: (name) =>
      name === "WEBGL_debug_renderer_info" ? { UNMASKED_RENDERER_WEBGL: UNMASKED } : name === "WEBGL_lose_context" ? { loseContext } : null,
    getParameter: (p) => (p === UNMASKED ? renderer : null),
  };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(((type: string) =>
    renderer === null ? null : type === "webgl2" ? gl : null) as unknown as HTMLCanvasElement["getContext"]);
  return { loseContext };
}

describe("isSoftwareRenderer", () => {
  it.each([
    "ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)",
    "llvmpipe (LLVM 15.0.7, 256 bits)",
    "Mesa softpipe",
    "Microsoft Basic Render Driver",
  ])("flags %s", (r) => expect(isSoftwareRenderer(r)).toBe(true));

  it.each([
    "ANGLE (Apple, ANGLE Metal Renderer: Apple M2, Unspecified Version)",
    "ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)",
    "Adreno (TM) 730",
    "Mali-G78",
  ])("accepts %s", (r) => expect(isSoftwareRenderer(r)).toBe(false));
});

describe("detectWebGL", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it("is false without a WebGL context", () => {
    stubContext(null);
    expect(detectWebGL()).toBe(false);
  });

  it("is true on a hardware renderer and releases the probe context", () => {
    const { loseContext } = stubContext("Adreno (TM) 730");
    expect(detectWebGL()).toBe(true);
    expect(loseContext).toHaveBeenCalledOnce();
  });

  it("is false on a software renderer unless the QA override is set", () => {
    stubContext("SwiftShader driver");
    expect(detectWebGL()).toBe(false);
    window.localStorage.setItem(FORCE_3D_STORAGE_KEY, "true");
    expect(detectWebGL()).toBe(true);
  });

  it("is false if probing throws", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(detectWebGL()).toBe(false);
  });
});
