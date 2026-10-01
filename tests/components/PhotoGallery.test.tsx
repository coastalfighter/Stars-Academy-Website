import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PhotoGallery, type GalleryGroup } from "@/components/community/PhotoGallery";

// jsdom has no modal dialog support; emulate the parts the viewer relies on.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});

const groups: GalleryGroup[] = [
  {
    id: "classrooms",
    title: "Classrooms",
    items: [
      { id: "a", src: "/photos/a.webp", width: 1200, height: 800, blurDataURL: null, alt: "Children stack blocks", caption: "Block play", captionLang: undefined },
      { id: "b", src: "/photos/b.webp", width: 1200, height: 800, blurDataURL: null, alt: "Story time", caption: null },
    ],
  },
  { id: "outdoors", title: "Outdoors", items: [{ id: "c", src: "/photos/c.webp", width: 1200, height: 800, blurDataURL: null, alt: "Playground", caption: null }] },
];
const copy = { open: "View larger", close: "Close", previous: "Previous photo", next: "Next photo", counter: "Photo {n} of {total}" };

describe("<PhotoGallery />", () => {
  it("links each thumbnail to a large same-origin image (works without JavaScript)", () => {
    render(<PhotoGallery groups={groups} copy={copy} />);
    expect(screen.getByRole("heading", { name: "Classrooms" })).toBeInTheDocument();
    const links = screen.getAllByRole("link", { name: /View larger/ });
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveAttribute("href", "/_next/image?url=%2Fphotos%2Fa.webp&w=1920&q=75");
    expect(screen.getByAltText("Children stack blocks")).toBeInTheDocument();
  });

  it("opens a viewer, moves with buttons and arrow keys across groups, and returns focus on close", async () => {
    const user = userEvent.setup();
    render(<PhotoGallery groups={groups} copy={copy} />);
    const first = screen.getAllByRole("link", { name: /View larger/ })[0]!;
    await user.click(first);
    const dialog = document.querySelector("dialog")!;
    expect(dialog).toHaveAttribute("open");
    expect(screen.getByText("Photo 1 of 3")).toBeInTheDocument();
    expect(dialog).toHaveTextContent("Block play");

    await user.click(screen.getByRole("button", { name: /Next photo/ }));
    expect(screen.getByText("Photo 2 of 3")).toBeInTheDocument();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByText("Photo 3 of 3")).toBeInTheDocument();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByText("Photo 1 of 3")).toBeInTheDocument();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByText("Photo 3 of 3")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(dialog).not.toHaveAttribute("open");
    expect(first).toHaveFocus();
  });
});
