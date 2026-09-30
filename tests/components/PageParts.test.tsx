import { render, screen } from "@testing-library/react";
import { FaqList } from "@/components/page/FaqList";
import { Breadcrumbs } from "@/components/page/Breadcrumbs";
import { StepList } from "@/components/page/Lists";
import { faqsByGroup } from "@/content/faq";

describe("page building blocks", () => {
  it("renders FAQs as native disclosure widgets with optional JSON-LD", () => {
    const { container } = render(<FaqList items={faqsByGroup("partners")} schema />);
    expect(container.querySelectorAll("details")).toHaveLength(faqsByGroup("partners").length);
    expect(screen.getByText(/who can refer a child/i).closest("summary")).not.toBeNull();
    const ld = container.querySelector('script[type="application/ld+json"]');
    expect(JSON.parse(ld?.textContent ?? "{}")["@type"]).toBe("FAQPage");
  });

  it("renders a breadcrumb trail marking the current page", () => {
    const { container } = render(<Breadcrumbs items={[{ label: "Careers", href: "/careers" }, { label: "Apply", href: "/careers/apply" }]} />);
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByText("Apply")).toHaveAttribute("aria-current", "page");
    const ld = JSON.parse(container.querySelector('script[type="application/ld+json"]')?.textContent ?? "{}");
    expect(ld.itemListElement).toHaveLength(3);
  });

  it("numbers steps for screen readers", () => {
    render(<StepList steps={[{ title: "Reach out", body: "Call us." }, { title: "Visit", body: "Tour." }]} />);
    expect(screen.getByRole("heading", { name: /step 2:\s*visit/i })).toBeInTheDocument();
  });
});
