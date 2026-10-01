import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { evaluate, EMPTY_ANSWERS } from "@/lib/enroll/eligibility";
import { EligibilityCheck } from "@/components/enroll/EligibilityCheck";

describe("eligibility rules", () => {
  it.each([
    [{ age: "under3", coverage: "medicaid", doctor: "yes" }, { kind: "fit", reasons: [] }],
    [{ age: "3to6", coverage: "ssiTefra", doctor: "yes" }, { kind: "fit", reasons: [] }],
    [{ age: "3to6", coverage: "private", doctor: "yes" }, { kind: "talk", reasons: ["private"] }],
    [{ age: "under3", coverage: "none", doctor: "no" }, { kind: "talk", reasons: ["none", "doctor"] }],
    [{ age: "under3", coverage: "medicaid", doctor: "unsure" }, { kind: "talk", reasons: ["doctor"] }],
    [{ age: "over6", coverage: "medicaid", doctor: "yes" }, { kind: "age", reasons: [] }],
  ] as const)("%o → %o", (answers, outcome) => {
    expect(evaluate({ ...EMPTY_ANSWERS, ...answers })).toEqual(outcome);
  });
});

const links = {
  secureHref: "https://na4.documents.adobe.com/public/esignWidget?wid=x",
  secureLang: null,
  phoneHref: "tel:+18707933200",
  phoneDisplay: "870-793-3200",
  askHref: "/getting-started#inquiry",
  arkidsHref: "/resources#topic-insurance",
  services: { speech: "/services/speech-therapy", movement: "/services/physical-therapy", daily: "/services/occupational-therapy", medical: "/services/nursing-care" },
};

describe("<EligibilityCheck />", () => {
  it("walks through the questions and hands off to the secure form, sending nothing", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const user = userEvent.setup();
    render(<EligibilityCheck locale="en" links={links} />);
    expect(screen.getByText("Question 1 of 4")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Please choose an answer");

    await user.click(screen.getByLabelText("3 to 6 years old"));
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("heading", { name: "What health coverage does your child have?" })).toHaveFocus();
    await user.click(screen.getByLabelText("Medicaid or ARKids First"));
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByLabelText("Yes"));
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByLabelText("Talking, understanding or eating"));
    await user.click(screen.getByRole("button", { name: "See what’s next" }));

    expect(screen.getByRole("heading", { name: "STARS looks like a good fit." })).toHaveFocus();
    const secure = screen.getByRole("link", { name: /Start secure enrollment/ });
    expect(secure).toHaveAttribute("href", links.secureHref);
    expect(secure).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("link", { name: "Speech therapy" })).toHaveAttribute("href", "/services/speech-therapy");
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("points over-age children elsewhere, in Spanish", async () => {
    const user = userEvent.setup();
    render(<EligibilityCheck locale="es" links={links} />);
    await user.click(screen.getByLabelText("7 años o más"));
    for (const answer of ["Medicaid o ARKids First", "Sí"]) {
      await user.click(screen.getByRole("button", { name: "Siguiente" }));
      await user.click(screen.getByLabelText(answer));
    }
    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    await user.click(screen.getByRole("button", { name: "Ver el siguiente paso" }));
    expect(screen.getByRole("heading", { name: /desde el nacimiento hasta los seis años/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /inscripción segura/ })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Empezar de nuevo" }));
    expect(screen.getByText("Pregunta 1 de 4")).toBeInTheDocument();
  });
});
