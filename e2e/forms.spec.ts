import { createHmac } from "node:crypto";
import { expect, test } from "@playwright/test";
import { RECEIVER_URL, WEBHOOK_SECRET } from "./env";
import { waitPastBotCheck } from "./helpers";

type Delivery = { body: string; signature: string | null };

async function deliveryFor(request: import("@playwright/test").APIRequestContext, name: string): Promise<Delivery> {
  let found: Delivery | undefined;
  await expect
    .poll(async () => {
      const all = (await (await request.get(`${RECEIVER_URL}/received`)).json()) as Delivery[];
      found = all.find((d) => d.body.includes(name));
      return Boolean(found);
    }, { timeout: 10_000 })
    .toBe(true);
  return found!;
}

test("validation errors are announced and fields marked", async ({ page }) => {
  await page.goto("/schedule-a-tour");
  await page.getByRole("button", { name: /send my request/i }).click();
  const summary = page.getByRole("alert").first();
  await expect(summary).toBeFocused();
  await expect(summary).toContainText("Please fix the following");
  await expect(page.getByLabel("Your name")).toHaveAttribute("aria-invalid", "true");
});

test("messages that look like health information are blocked", async ({ page }) => {
  await page.goto("/es/como-empezar");
  await page.getByLabel("Su nombre").fill("Ana López");
  await page.getByLabel("Teléfono", { exact: true }).fill("870-555-0134");
  await page.getByLabel(/algo más que quiera contarnos/i).fill("Fecha de nacimiento 04/12/2022");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Enviar mi consulta" }).click();
  await expect(page.getByRole("alert").first()).toContainText("fecha de nacimiento");
});

// @local: needs the webhook receiver, and must never send a real inquiry from a preview run.
test("a Spanish inquiry is delivered, signed, in the family's language", { tag: "@local" }, async ({ page, request }, testInfo) => {
  const name = `Ana E2E ${testInfo.project.name} ${Date.now()}`;
  await page.goto("/es/programar-visita");
  await page.getByLabel("Su nombre").fill(name);
  await page.getByLabel("Teléfono", { exact: true }).fill("870-555-0134");
  await page.getByLabel("Edad del niño o la niña").selectOption("2");
  await page.getByRole("radio", { name: "Mensaje de texto" }).check();
  await page.getByRole("checkbox").check();
  await waitPastBotCheck(page);
  await page.getByRole("button", { name: "Enviar mi solicitud" }).click();

  await expect(page.getByRole("status")).toContainText("Gracias");

  const delivery = await deliveryFor(request, name);
  const expected = createHmac("sha256", WEBHOOK_SECRET).update(delivery.body).digest("hex");
  expect(delivery.signature).toBe(expected);
  const { data } = JSON.parse(delivery.body);
  expect(data).toMatchObject({ name, language: "es", siteLanguage: "es", preferredContact: "text", childAge: "2 years" });
  // Bot-check fields never leave the server.
  expect(data).not.toHaveProperty("website");
  expect(data).not.toHaveProperty("startedAt");
});

test("job applications pre-select the role from the job card", async ({ page }) => {
  await page.goto("/careers");
  await page.getByRole("link", { name: /Apply for Van Driver/ }).click();
  await expect(page).toHaveURL(/position=van-driver/);
  await expect(page.getByLabel("Position")).toHaveValue("van-driver");
});

test.describe("API hardening", () => {
  test.skip(({ isMobile }) => isMobile);

  test("rejects cross-site posts and malformed bodies", async ({ request }) => {
    const cross = await request.post("/api/inquiry", { headers: { origin: "https://evil.example" }, data: {} });
    expect(cross.status()).toBe(403);
    const bad = await request.post("/api/inquiry", { headers: { "content-type": "text/plain" }, data: "x" });
    expect(bad.status()).toBe(415);
    const invalid = await request.post("/api/inquiry", { data: { locale: "es", name: "" } });
    expect(invalid.status()).toBe(422);
    expect((await invalid.json()).error).toMatch(/revise los campos/);
  });
});
