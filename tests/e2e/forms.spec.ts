import { test, expect, type Page } from "@playwright/test";

async function expectValidationErrors(page: Page) {
  await expect(page.getByRole("alert").first()).toBeVisible();
}

test.describe("newsletter", () => {
  test("validates and completes in demo mode", async ({ page }) => {
    await page.goto("/newsletter");
    const form = page.locator("main form").first();
    await form.getByRole("button", { name: "Join" }).click();
    await expect(page.getByRole("alert").first()).toContainText(/valid email/i);
    await form.getByLabel("Email address").fill("fan@example.com");
    await form.getByRole("button", { name: "Join" }).click();
    await expect(page.getByRole("status").first()).toContainText(/on the list/i);
  });
});

test.describe("submit music", () => {
  test("validates required fields", async ({ page }) => {
    await page.goto("/submit-music");
    await page.getByRole("button", { name: "Submit your music" }).click();
    await expectValidationErrors(page);
    await expect(page.getByText("Artist / band name is required.").first()).toBeVisible();
  });

  test("completes in demo mode", async ({ page }) => {
    await page.goto("/submit-music");
    await page.locator("main").getByLabel(/Artist \/ band name/).fill("Test Artist");
    await page.locator("main").getByLabel(/Your name/).fill("Alex Doe");
    await page.locator("main").getByLabel(/^Email/).fill("artist@example.com");
    await page.locator("main").getByLabel(/^Genre/).fill("Alt R&B");
    await page.locator("main").getByLabel(/Song link/).fill("https://example.com/song");
    await page.locator("main").getByLabel(/Release status/).selectOption("released");
    await page.locator("main").getByLabel(/Tell us about the record/).fill("A record made in a bedroom over one winter.");
    await page.locator("main").getByRole("checkbox").last().check();
    await page.getByRole("button", { name: "Submit your music" }).click();
    await expect(page.getByRole("status")).toContainText(/Received/i);
  });
});

test.describe("request interview", () => {
  test("validates then completes in demo mode", async ({ page }) => {
    await page.goto("/request-interview");
    await page.getByRole("button", { name: "Send interview request" }).click();
    await expectValidationErrors(page);

    await page.locator("main").getByLabel(/Your name/).fill("Jordan PR");
    await page.locator("main").getByLabel(/^Email/).fill("pr@example.com");
    await page.locator("main").getByLabel(/Your role/).selectOption("publicist");
    await page.locator("main").getByLabel(/Artist \/ guest name/).fill("Test Guest");
    await page.locator("main").getByLabel(/^Links/).fill("https://example.com/artist");
    await page.locator("main").getByLabel(/The pitch/).fill("A conversation about the second album nobody expected.");
    await page.locator("main").getByRole("checkbox").last().check();
    await page.getByRole("button", { name: "Send interview request" }).click();
    await expect(page.getByRole("status")).toContainText(/received/i);
  });
});

test.describe("book promotion", () => {
  test("validates then completes in demo mode", async ({ page }) => {
    await page.goto("/book-promotion");
    await page.getByRole("button", { name: "Send promotion inquiry" }).click();
    await expectValidationErrors(page);

    await page.locator("main").getByLabel(/Your name/).fill("Sam Label");
    await page.locator("main").getByLabel(/^Email/).fill("label@example.com");
    await page.locator("main").getByLabel(/Artist \/ brand being promoted/).fill("Test Act");
    await page.locator("main").getByLabel(/Campaign type/).selectOption("single");
    await page.locator("main").getByLabel(/Budget range/).selectOption("1k_5k");
    await page.locator("main").getByLabel(/Campaign goals/).fill("Awareness for the new single in two key markets.");
    await page.locator("main").getByRole("checkbox").last().check();
    await page.getByRole("button", { name: "Send promotion inquiry" }).click();
    await expect(page.getByRole("status")).toContainText(/received/i);
  });
});

test.describe("sponsor", () => {
  test("validates then completes in demo mode", async ({ page }) => {
    await page.goto("/sponsor");
    await page.getByRole("button", { name: "Start the conversation" }).click();
    await expectValidationErrors(page);

    await page.locator("main").getByLabel(/Your name/).fill("Taylor Brand");
    await page.locator("main").getByLabel(/^Email/).fill("brand@example.com");
    await page.locator("main").getByLabel(/Company \/ brand/).fill("Acme Audio");
    await page.locator("main").getByLabel(/Budget range/).selectOption("5k_25k");
    await page.locator("main").getByRole("checkbox", { name: /Series sponsorship/ }).check();
    await page.locator("main").getByLabel(/Your message/).fill("We want to back a performance series next quarter.");
    await page.locator("main").getByRole("checkbox").last().check();
    await page.getByRole("button", { name: "Start the conversation" }).click();
    await expect(page.getByRole("status")).toContainText(/Thanks/i);
  });
});
