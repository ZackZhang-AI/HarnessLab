import { expect, test } from "@playwright/test";

test("sample audit flow shows trace, findings, and exports", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "SQL injection risk" }).click();
  await page.getByRole("button", { name: "Run Audit" }).click();

  await expect(
    page.getByRole("heading", {
      name: "Possible SQL injection through string-built query",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByText("Harness Trace")).toBeVisible();
  await expect(page.getByText("Risk Score", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Export Markdown" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Export JSON" })).toBeEnabled();
});

test("provider switching and session restore remain usable", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "React auth bug" }).click();
  await page.getByLabel("Provider").selectOption("deepseek");
  await expect(page.getByText("DeepSeek requires DEEPSEEK_API_KEY on the server.")).toBeVisible();
  await page.getByLabel("Provider").selectOption("mock");
  await page.getByRole("button", { name: "Run Audit" }).click();
  await expect(
    page.getByRole("heading", { name: "Missing authorization boundary", exact: true }),
  ).toBeVisible();

  await page.reload();
  await expect(page.getByRole("button", { name: /Missing authorization boundary/ })).toBeVisible();
});

test("mobile layout keeps primary controls visible", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "HarnessLab" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Run Audit" })).toBeVisible();
  await expect(page.getByLabel("Code input")).toBeVisible();
});
