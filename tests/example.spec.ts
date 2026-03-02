import { test, expect } from '@playwright/test';

test.describe('Basic Navigation', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    
    // Check if page loads successfully
    await expect(page).toHaveURL('http://localhost:3000/');
    
    // Check if login form is present (since homepage redirects to login)
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });
});
