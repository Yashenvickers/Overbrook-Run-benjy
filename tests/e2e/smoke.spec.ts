import { test, expect } from "@playwright/test";

const PRIMARY_ROUTES = [
  "/",
  "/latest",
  "/music",
  "/culture",
  "/business",
  "/interviews",
  "/performances",
  "/watch",
  "/calendar",
  "/search",
  "/about",
  "/submit-music",
  "/request-interview",
  "/book-promotion",
  "/sponsor",
  "/newsletter",
  "/contact",
  "/privacy",
  "/terms",
  "/submission-terms",
];

test.describe("homepage", () => {
  test("renders the media homepage with hierarchy", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Preee TV/);
    await expect(page.getByRole("heading", { name: "The Latest" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Watch Preee TV" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Culture Calendar" })).toBeVisible();
  });

  test("lead story links to a working story page", async ({ page }) => {
    await page.goto("/");
    const lead = page.locator("main a[href^='/stories/']").first();
    const href = await lead.getAttribute("href");
    expect(href).toBeTruthy();
    await lead.click();
    await expect(page).toHaveURL(new RegExp(href!.replace(/\//g, "\\/")));
    await expect(page.locator("article h1").first()).toBeVisible();
  });
});

test.describe("navigation", () => {
  test("desktop nav works", async ({ page, isMobile }) => {
    test.skip(isMobile === true, "desktop only");
    await page.goto("/");
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Music" }).click();
    await expect(page).toHaveURL(/\/music/);
    await expect(page.getByRole("heading", { name: "Music", level: 1 })).toBeVisible();
  });

  test("mobile menu opens, closes, and navigates", async ({ page, isMobile }) => {
    test.skip(isMobile !== true, "mobile only");
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Open menu" });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Site menu" });
    await expect(dialog).toBeVisible();
    // close via Escape restores state
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    // navigate through the menu
    await trigger.click();
    await dialog.getByRole("link", { name: "Calendar" }).click();
    await expect(page).toHaveURL(/\/calendar/);
  });
});

test.describe("search", () => {
  test("returns seed results", async ({ page }) => {
    await page.goto("/search");
    await page.getByRole("searchbox").fill("streaming");
    await page.getByRole("button", { name: "Search" }).click();
    await expect(page).toHaveURL(/q=streaming/);
    await expect(page.getByRole("status")).toContainText(/result/);
    await expect(page.locator("main ol li").first()).toBeVisible();
  });
});

test.describe("watch", () => {
  test("episode page shows a player or a valid coming-soon state", async ({ page }) => {
    await page.goto("/watch");
    const card = page.locator("main a[href^='/watch/']").first();
    await card.click();
    await expect(page).toHaveURL(/\/watch\/.+/);
    const comingSoon = page.getByText("This episode premieres soon.");
    const player = page.getByRole("button", { name: /^Play / });
    await expect(comingSoon.or(player).first()).toBeVisible();
  });
});

test.describe("calendar", () => {
  test("category filter narrows the list", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByRole("heading", { name: "Culture Calendar", level: 1 })).toBeVisible();
    await page.getByRole("button", { name: "Preee TV", exact: true }).click();
    await expect(page.getByText("Release Radar: New Music Friday")).toHaveCount(0);
    await page.getByRole("button", { name: "All", exact: true }).click();
    await expect(page.getByText("Release Radar: New Music Friday").first()).toBeVisible();
  });

  test("event drawer opens with add-to-calendar", async ({ page }) => {
    await page.goto("/calendar");
    await page.getByRole("button", { name: /Preee TV Launch Week/ }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Add to calendar" })).toHaveAttribute(
      "href",
      /\/api\/calendar\/ics\//,
    );
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });
});

test.describe("routes and layout", () => {
  test("all primary routes return 200", async ({ request }) => {
    for (const route of PRIMARY_ROUTES) {
      const res = await request.get(route);
      expect(res.status(), `${route} should be 200`).toBe(200);
    }
  });

  test("unknown routes 404", async ({ request }) => {
    const res = await request.get("/this-page-does-not-exist");
    expect(res.status()).toBe(404);
  });

  test("no horizontal overflow at 375px", async ({ page, isMobile }) => {
    test.skip(isMobile !== true, "mobile only");
    for (const route of ["/", "/latest", "/calendar", "/watch", "/submit-music", "/stories/welcome-to-preee-tv"]) {
      await page.goto(route);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `${route} should not overflow horizontally`).toBeLessThanOrEqual(1);
    }
  });

  test("feed, sitemap and robots respond", async ({ request }) => {
    for (const route of ["/feed.xml", "/sitemap.xml", "/robots.txt"]) {
      const res = await request.get(route);
      expect(res.status(), route).toBe(200);
    }
  });
});
