import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InquiryForm } from "@/components/forms/InquiryForm";

function fillValid(user: ReturnType<typeof userEvent.setup>) {
  return (async () => {
    await user.type(screen.getByLabelText(/your name/i), "Jordan Parker");
    await user.type(screen.getByLabelText(/^phone$/i), "870-555-0134");
    await user.click(screen.getByRole("checkbox"));
  })();
}

describe("<InquiryForm />", () => {
  it("shows the no-PHI notice up front", () => {
    render(<InquiryForm fetchImpl={vi.fn()} />);
    expect(screen.getByText(/please don’t include medical details/i)).toBeInTheDocument();
  });

  it("shows an error summary and marks invalid fields without calling the API", async () => {
    const user = userEvent.setup();
    const fetchImpl = vi.fn();
    render(<InquiryForm fetchImpl={fetchImpl} />);
    await user.click(screen.getByRole("button", { name: /send my request/i }));

    const summary = await screen.findByRole("alert");
    expect(summary).toHaveTextContent(/please fix the following/i);
    expect(screen.getByLabelText(/your name/i)).toHaveAttribute("aria-invalid", "true");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("asks for an organization when a physician is selected", async () => {
    const user = userEvent.setup();
    render(<InquiryForm fetchImpl={vi.fn()} />);
    expect(screen.queryByLabelText(/practice, school or organization/i)).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText(/i am a/i), "physician");
    expect(screen.getByLabelText(/practice, school or organization/i)).toBeInTheDocument();
  });

  it("blocks messages that look like they contain PHI", async () => {
    const user = userEvent.setup();
    const fetchImpl = vi.fn();
    render(<InquiryForm fetchImpl={fetchImpl} />);
    await fillValid(user);
    await user.type(screen.getByLabelText(/anything you’d like us to know/i), "DOB 01/02/2022");
    await user.click(screen.getByRole("button", { name: /send my request/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/medical or identifying/i);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("submits valid data as JSON and shows a success state", async () => {
    const user = userEvent.setup();
    const fetchImpl = vi.fn(async () =>
      Response.json({ ok: true, message: "Thank you — our team will contact you within one business day." }),
    );
    render(<InquiryForm fetchImpl={fetchImpl as unknown as typeof fetch} defaultReason="eligibility" />);
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: /send my request/i }));

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(/one business day/i));
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/inquiry");
    const sent = JSON.parse(init.body as string);
    expect(sent).toMatchObject({ name: "Jordan Parker", reason: "eligibility", consent: true, website: "" });
  });

  it("surfaces server errors with the phone fallback", async () => {
    const user = userEvent.setup();
    const fetchImpl = vi.fn(async () =>
      Response.json({ ok: false, error: "Our online form is temporarily unavailable. Please call us at 870-793-3200." }, { status: 503 }),
    );
    render(<InquiryForm fetchImpl={fetchImpl as unknown as typeof fetch} />);
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: /send my request/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent("870-793-3200");
  });

  it("handles network failures", async () => {
    const user = userEvent.setup();
    const fetchImpl = vi.fn(async () => {
      throw new TypeError("network");
    });
    render(<InquiryForm fetchImpl={fetchImpl as unknown as typeof fetch} />);
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: /send my request/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/couldn’t reach our server/i);
  });
});
