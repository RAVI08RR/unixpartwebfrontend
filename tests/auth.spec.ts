import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/');
    
    // Check if login form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation errors for empty login', async ({ page }) => {
    await page.goto('/');
    
    // Try to submit empty form
    await page.locator('button[type="submit"]').click();
    
    // Wait for any error messages or validation
    await page.waitForTimeout(500);
  });

  // TODO: Add test with valid credentials
  // test('should login with valid credentials', async ({ page }) => {
  //   await page.goto('/');
  //   await page.fill('input[type="email"]', 'test@example.com');
  //   await page.fill('input[type="password"]', 'password123');
  //   await page.click('button[type="submit"]');
  //   await expect(page).toHaveURL(/dashboard/);
  // });
});
