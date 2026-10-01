import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorView } from "@/views/ErrorView";
import { resetClientReports } from "@/lib/observability/clientReport";

describe("ErrorView", () => {
  beforeEach(() => {
    resetClientReports();
    Object.defineProperty(navigator, "sendBeacon", { value: vi.fn(() => true), configurable: true });
  });

  it("explains, offers the phone number and a retry, and focuses the heading", async () => {
    const retry = vi.fn();
    render(<ErrorView locale="en" error={Object.assign(new Error("boom"), { digest: "abc123" })} retry={retry} />);
    const heading = screen.getByRole("heading", { level: 1, name: /something went wrong/i });
    expect(heading).toHaveFocus();
    expect(screen.getByRole("link", { name: "870-793-3200" })).toHaveAttribute("href", expect.stringMatching(/^tel:/));
    expect(screen.getByText("abc123")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it("speaks Spanish on the Spanish site and reports the failure once", async () => {
    render(<ErrorView locale="es" error={new Error("boom")} retry={() => undefined} />);
    expect(screen.getByRole("button", { name: "Intentar de nuevo" })).toBeInTheDocument();
    const beacon = navigator.sendBeacon as unknown as ReturnType<typeof vi.fn>;
    expect(beacon).toHaveBeenCalledOnce();
    const [url, blob] = beacon.mock.calls[0] as [string, Blob];
    expect(url).toBe("/api/client-error");
    expect(JSON.parse(await blob.text())).toMatchObject({ kind: "boundary", message: "boom", locale: "es", path: "/" });
  });
});
