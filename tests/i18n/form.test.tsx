import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InquiryForm } from "@/components/forms/InquiryForm";

describe("<InquiryForm locale=\"es\" />", () => {
  it("renders labels, options and notices in Spanish", () => {
    render(<InquiryForm locale="es" fetchImpl={vi.fn()} defaultReason="eligibility" />);
    expect(screen.getByLabelText(/su nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/edad del niño/i)).toBeInTheDocument();
    expect(screen.getByText(/no incluya datos médicos/i)).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /mensaje de texto/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /enviar mi solicitud/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/idioma preferido/i)).toHaveValue("es");
  });

  it("shows Spanish validation errors and tells the server the page language", async () => {
    const user = userEvent.setup();
    const fetchImpl = vi.fn(async () => Response.json({ ok: true, message: "Gracias." }));
    render(<InquiryForm locale="es" fetchImpl={fetchImpl as unknown as typeof fetch} />);

    await user.click(screen.getByRole("button", { name: /enviar mi solicitud/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/corrija lo siguiente/i);
    expect(fetchImpl).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText(/su nombre/i), "Ana López");
    await user.type(screen.getByLabelText(/^teléfono$/i), "870-555-0134");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /enviar mi solicitud/i }));
    expect(await screen.findByRole("status")).toHaveTextContent("Gracias.");
    const sent = JSON.parse((fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
    expect(sent).toMatchObject({ locale: "es", language: "es" });
  });
});
