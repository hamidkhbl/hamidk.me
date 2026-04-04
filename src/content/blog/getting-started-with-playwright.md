---
title: "Getting Started with Playwright for E2E Testing"
description: "A practical guide to setting up Playwright, writing your first tests, and integrating with CI/CD pipelines."
pubDate: 2024-03-15
tags: ["playwright", "typescript", "e2e", "automation"]
category: "automation/playwright"
draft: false
---

Playwright has quickly become my go-to tool for end-to-end testing. It's fast, reliable across browsers, and has excellent TypeScript support out of the box. Here's how I set it up for a new project.

## Why Playwright over Selenium or Cypress?

I've used all three extensively. Here's my honest take:

- **Selenium** — battle-tested, language-agnostic, but brittle and slow without careful engineering
- **Cypress** — great DX, but limited to Chromium and can't handle multi-tab scenarios
- **Playwright** — fast, multi-browser, full-featured, and Microsoft-backed with active development

For most modern web apps, Playwright wins.

## Setting up

```bash
npm init playwright@latest
```

This scaffolds the project with example tests, a config, and installs browser binaries. The generated `playwright.config.ts` is well-commented — read it.

## Writing your first test

```typescript
import { test, expect } from '@playwright/test';

test('user can log in', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByText('Welcome back')).toBeVisible();
});
```

Notice `getByRole` and `getByLabel` — these are accessibility-aware locators. They're more resilient than CSS selectors and test what users actually see.

## Page Object Model

Don't write all your logic in test files. Encapsulate page interactions:

```typescript
// pages/LoginPage.ts
import { Page } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async login(email: string, password: string) {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }
}
```

## Running in CI

Playwright integrates cleanly with GitHub Actions:

```yaml
- name: Install Playwright browsers
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npx playwright test

- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

The `if: always()` ensures you get the HTML report even on failure — crucial for debugging in CI.

## What's next

In the next post, I'll cover parallel execution, test isolation strategies, and how to handle flaky tests without just slapping a `waitForTimeout` everywhere.
