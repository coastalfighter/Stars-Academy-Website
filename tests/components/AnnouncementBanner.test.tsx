import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnnouncementBanner, DISMISS_PREFIX } from "@/components/cms/AnnouncementBanner";
import type { Announcement } from "@/cms/repository";

const closure: Announcement = {
  id: "ann-1",
  kind: "closure",
  title: { text: "STARS is closed today." },
  body: null,
  link: { label: { text: "Details", lang: "en-US" }, href: "/families#announcements" },
  startsAt: "2026-10-01T10:00:00Z",
  endsAt: null,
  banner: true,
};

describe("<AnnouncementBanner />", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.style.removeProperty("--announce-h");
    vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("announces the closure as a labelled region with its link", () => {
    render(<AnnouncementBanner announcement={closure} locale="es" />);
    const region = screen.getByRole("region", { name: "Aviso" });
    expect(region).toHaveTextContent("Cierre");
    expect(region).toHaveTextContent("STARS is closed today.");
    expect(screen.getByRole("link", { name: "Details" })).toHaveAttribute("lang", "en-US");
  });

  it("can be dismissed, remembers it, and releases its space", async () => {
    const user = userEvent.setup();
    render(<AnnouncementBanner announcement={closure} locale="en" />);
    await user.click(screen.getByRole("button", { name: /dismiss announcement/i }));
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    expect(window.localStorage.getItem(DISMISS_PREFIX + "ann-1")).toBe("1");
    expect(document.documentElement.style.getPropertyValue("--announce-h")).toBe("0px");
  });

  it("stays hidden for visitors who already dismissed it", () => {
    window.localStorage.setItem(DISMISS_PREFIX + "ann-1", "1");
    render(<AnnouncementBanner announcement={closure} locale="en" />);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });
});
