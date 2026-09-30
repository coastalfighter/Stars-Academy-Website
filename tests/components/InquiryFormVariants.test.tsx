import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InquiryForm } from "@/components/forms/InquiryForm";

describe("<InquiryForm /> variants", () => {
  it("shows enrollment questions for families asking about eligibility", async () => {
    const user = userEvent.setup();
    render(<InquiryForm fetchImpl={vi.fn()} defaultReason="eligibility" />);
    expect(screen.getByLabelText(/child’s age/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/primary care doctor/i)).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText(/i am a/i), "physician");
    expect(screen.queryByLabelText(/child’s age/i)).not.toBeInTheDocument();
  });

  it("hides the audience and reason questions when they are fixed", () => {
    render(<InquiryForm fetchImpl={vi.fn()} audiences={["job-seeker"]} reasons={["careers"]} />);
    expect(screen.queryByLabelText(/i am a/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/how can we help/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/position/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/earliest start date/i)).toBeInTheDocument();
  });

  it("preselects the role from a job card", () => {
    render(<InquiryForm fetchImpl={vi.fn()} audiences={["job-seeker"]} reasons={["careers"]} defaultPosition="van-driver" />);
    expect(screen.getByLabelText(/position/i)).toHaveValue("van-driver");
  });

  it("requires a position before submitting a job inquiry", async () => {
    const user = userEvent.setup();
    const fetchImpl = vi.fn();
    render(<InquiryForm fetchImpl={fetchImpl} audiences={["job-seeker"]} reasons={["careers"]} />);
    await user.type(screen.getByLabelText(/your name/i), "Sam Rivera");
    await user.type(screen.getByLabelText(/^phone$/i), "870-555-0134");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /send my request/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/choose the role/i);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("sends the chosen fields and shows the success note", async () => {
    const user = userEvent.setup();
    const fetchImpl = vi.fn(async () => Response.json({ ok: true, message: "Thank you." }));
    render(
      <InquiryForm
        fetchImpl={fetchImpl as unknown as typeof fetch}
        audiences={["job-seeker"]}
        reasons={["careers"]}
        submitLabel="Send my information"
        successNote={<p>Please complete the official application.</p>}
      />,
    );
    await user.type(screen.getByLabelText(/your name/i), "Sam Rivera");
    await user.selectOptions(screen.getByLabelText(/position/i), "ecds");
    await user.type(screen.getByLabelText(/^phone$/i), "870-555-0134");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /send my information/i }));
    expect(await screen.findByText(/official application/i)).toBeInTheDocument();
    const sent = JSON.parse((fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
    expect(sent).toMatchObject({ audience: "job-seeker", reason: "careers", position: "ecds" });
  });
});
