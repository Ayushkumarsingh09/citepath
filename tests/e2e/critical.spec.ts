import { test, expect } from "@playwright/test";

const base = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

test.describe("CitePath critical flows", () => {
  test("health endpoint", async ({ request }) => {
    const res = await request.get(`${base}/health`);
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.status).toBe("ok");
  });

  test("ready endpoint", async ({ request }) => {
    const res = await request.get(`${base}/ready`);
    expect(res.ok()).toBeTruthy();
  });

  test("login page renders", async ({ page }) => {
    await page.goto(`${base}/login`);
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
  });

  test("demo login → dashboard", async ({ page }) => {
    await page.goto(`${base}/login`);
    await page.locator('input[name="email"]').fill("demo@citepath.local");
    await page.locator('input[name="password"]').fill("demo-demo-demo");
    await page.getByRole("button", { name: /log in/i }).click();
    await page.waitForURL(/dashboard|onboarding/);
    await expect(page.locator("body")).toContainText(/CitePath|Dashboard|setup/i);
  });

  test("marketing home has CitePath brand", async ({ page }) => {
    await page.goto(`${base}/`);
    await expect(page.getByText("CitePath").first()).toBeVisible();
    await expect(page.getByRole("link", { name: /start free trial/i }).first()).toBeVisible();
  });
});
