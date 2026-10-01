import { expect, test } from "@playwright/test";

test("the language switcher keeps visitors on the same page", async ({ page }) => {
  await page.goto("/services/occupational-therapy");
  await page.getByRole("link", { name: "Ver esta página en español" }).click();
  await expect(page).toHaveURL(/\/es\/servicios\/terapia-ocupacional$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es-US");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("juego");

  await page.getByRole("link", { name: "View this page in English" }).click();
  await expect(page).toHaveURL(/\/services\/occupational-therapy$/);
});

test("English-only pages send Spanish readers to the Spanish home page", async ({ page }) => {
  await page.goto("/careers");
  const link = page.getByRole("link", { name: "Ir al sitio en español" });
  await expect(link).toHaveAttribute("href", "/es");
});

test("pages declare their translations for search engines", async ({ page }) => {
  await page.goto("/es/preguntas-frecuentes");
  await expect(page.locator('link[rel="alternate"][hreflang="en-US"]')).toHaveAttribute("href", /\/faq$/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/es\/preguntas-frecuentes$/);
});

test("links from Spanish pages to English-only pages say so", async ({ page }) => {
  await page.goto("/es/contacto");
  await expect(page.getByRole("main").getByRole("link", { name: /Empleos \(en inglés\)/ })).toHaveAttribute("hreflang", "en-US");
});
