# Playwright E2E Testing Guide

This project uses Playwright for end-to-end testing.

## Setup

Playwright is already installed. If you need to reinstall browsers:

```bash
npx playwright install chromium firefox
```

Note: WebKit is not supported on mac12, so we only use Chromium and Firefox.

## Running Tests

### Run all tests (headless mode)
```bash
npm run test:e2e
```

### Run tests with UI mode (recommended for development)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Debug tests
```bash
npm run test:e2e:debug
```

### View last test report
```bash
npm run test:e2e:report
```

## Test Structure

Tests are located in the `tests/` directory:

- `tests/example.spec.ts` - Basic navigation test
- `tests/auth.spec.ts` - Authentication tests
- `tests/inventory.spec.ts` - Inventory management tests
- `tests/purchase-orders.spec.ts` - Purchase order tests

## Writing Tests

### Basic test structure:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/your-page');
    await expect(page.locator('h1')).toContainText('Expected Text');
  });
});
```

### Authentication helper:

Most tests require authentication. Update the `login()` helper in each test file with valid credentials:

```typescript
async function login(page) {
  await page.goto('/');
  await page.fill('input[type="email"]', 'your-email@example.com');
  await page.fill('input[type="password"]', 'your-password');
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/);
}
```

## Configuration

The Playwright configuration is in `playwright.config.ts`:

- Base URL: `http://localhost:3000`
- Test directory: `./tests`
- Browsers: Chromium, Firefox
- Auto-starts dev server before tests
- Screenshots on failure
- Trace on first retry

## Current Test Status

Most tests are marked with `test.skip()` because they require:
1. Valid login credentials
2. Test data in the database

To enable tests:
1. Update the `login()` helper with valid credentials
2. Remove `test.skip()` and change to `test()`
3. Ensure test data exists in your database

## Tips

- Use UI mode (`npm run test:e2e:ui`) for the best development experience
- Tests run in parallel by default
- The dev server starts automatically when running tests
- Test results are saved in `test-results/`
- HTML reports are saved in `playwright-report/`

## CI/CD

In CI environments:
- Tests retry up to 2 times on failure
- Only 1 worker runs at a time
- Existing server is not reused

## Troubleshooting

### Port already in use
If port 3000 is already in use, stop your dev server before running tests. Playwright will start its own instance.

### Tests timing out
Increase timeout in `playwright.config.ts`:
```typescript
use: {
  timeout: 30000, // 30 seconds
}
```

### Browser not found
Reinstall browsers:
```bash
npx playwright install
```
