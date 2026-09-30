import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CALM_STORAGE_KEY, MotionProvider, useMotion } from "@/components/providers/MotionProvider";
import { CalmToggle } from "@/components/layout/CalmToggle";

function mockReducedMotion(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("reduce") ? matches : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

function Probe() {
  const { calm } = useMotion();
  return <p data-testid="probe">{calm ? "calm" : "rich"}</p>;
}

describe("Calm mode", () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete document.documentElement.dataset.calm;
  });

  it("defaults to the OS reduced-motion preference", async () => {
    mockReducedMotion(true);
    await act(async () => {
      render(
        <MotionProvider>
          <Probe />
        </MotionProvider>,
      );
    });
    expect(screen.getByTestId("probe")).toHaveTextContent("calm");
    expect(document.documentElement.dataset.calm).toBe("true");
  });

  it("toggles, persists the choice and exposes switch semantics", async () => {
    mockReducedMotion(false);
    const user = userEvent.setup();
    await act(async () => {
      render(
        <MotionProvider>
          <CalmToggle />
          <Probe />
        </MotionProvider>,
      );
    });
    const toggle = screen.getByRole("switch", { name: /calm mode/i });
    expect(toggle).toHaveAttribute("aria-checked", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(screen.getByTestId("probe")).toHaveTextContent("calm");
    expect(window.localStorage.getItem(CALM_STORAGE_KEY)).toBe("true");
  });

  it("honours a stored choice over the OS setting", async () => {
    mockReducedMotion(true);
    window.localStorage.setItem(CALM_STORAGE_KEY, "false");
    await act(async () => {
      render(
        <MotionProvider>
          <Probe />
        </MotionProvider>,
      );
    });
    expect(screen.getByTestId("probe")).toHaveTextContent("rich");
  });

  it("throws a helpful error outside the provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/MotionProvider/);
    spy.mockRestore();
  });
});
