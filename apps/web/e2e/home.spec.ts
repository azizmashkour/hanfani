import { test, expect } from "@playwright/test";

test("homepage loads and displays heading", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
