import { expect, test } from "@playwright/test";

// These tests assume the database has been seeded (`npm run seed`).

test("home page renders hero, nav and footer", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
});

test("shop filters update the URL", async ({ page }) => {
  await page.goto("/shop");
  await page.getByLabel("Sort by").selectOption("price-low");
  await expect(page).toHaveURL(/sort=price-low/);
});

test("unknown route shows the 404 page", async ({ page }) => {
  const res = await page.goto("/this-page-does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.getByText("Lost in style")).toBeVisible();
});

test("admin and checkout require sign-in", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login/);
  await page.goto("/checkout");
  await expect(page).toHaveURL(/\/login/);
});

test("login form validates input", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("Enter a valid email address")).toBeVisible();
});

test("product page loads and shows the delivery check", async ({ page }) => {
  await page.goto("/shop");
  await page.locator("article a").first().click();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("Delivery & COD check")).toBeVisible();
});

test("compare page shows an empty state", async ({ page }) => {
  await page.goto("/compare");
  await expect(page.getByText("Nothing to compare yet")).toBeVisible();
});

test("dark mode toggle switches theme and remembers it", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /switch to dark mode/i }).first().click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("search tolerates typos", async ({ page }) => {
  const res = await page.request.get("/api/search?q=hoddie");
  expect(res.ok()).toBeTruthy();
  const data = await res.json();
  expect(data.products.length).toBeGreaterThan(0);
});

test("shared wishlist link 404s for unknown codes", async ({ page }) => {
  const res = await page.goto("/w/zzzzzz");
  expect(res?.status()).toBe(404);
});
