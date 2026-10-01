import { render, screen } from "@testing-library/react";
import { SecureReferral } from "@/components/enroll/SecureReferral";
import { TextAlertsSignup } from "@/components/enroll/TextAlertsSignup";
import type { SecureChannels } from "@/cms/repository";

const base: SecureChannels = {
  enrollmentForm: { href: "https://na4.documents.adobe.com/x", lang: null },
  referralUpload: null,
  directAddress: null,
  fax: null,
  textAlerts: null,
};

describe("secure referral panel", () => {
  it("offers only configured channels, and always the phone", () => {
    const { unmount } = render(<SecureReferral channels={base} />);
    expect(screen.queryByRole("heading", { name: "Upload securely" })).toBeNull();
    expect(screen.getByRole("heading", { name: "Call our intake team" })).toBeInTheDocument();
    unmount();
    render(<SecureReferral channels={{ ...base, referralUpload: "https://upload.securefiles.test/stars", directAddress: "referrals@direct.stars.test", fax: "870-555-0100" }} />);
    expect(screen.getByRole("link", { name: /Upload securely/ })).toHaveAttribute("href", "https://upload.securefiles.test/stars");
    expect(screen.getByText("referrals@direct.stars.test")).toBeInTheDocument();
    expect(screen.getByText("870-555-0100")).toBeInTheDocument();
  });
});

describe("text alerts sign-up", () => {
  it("shows the keyword, an sms: link and the consent terms", () => {
    render(<TextAlertsSignup alerts={{ number: "870-555-0199", keyword: "STARS", smsHref: "sms:8705550199?body=STARS" }} locale="es" />);
    expect(screen.getByRole("heading", { name: /mensaje de texto cuando STARS cierre/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Enviar STARS para inscribirse" })).toHaveAttribute("href", "sms:8705550199?body=STARS");
    expect(screen.getByText(/Responda STOP para cancelar/)).toBeInTheDocument();
    expect(screen.getByText(/no este sitio web/)).toBeInTheDocument();
  });
});
