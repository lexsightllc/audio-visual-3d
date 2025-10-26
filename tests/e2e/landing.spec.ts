import { test, expect } from 'playwright/test';

test.describe('Landing page experience', () => {
  test('renders the canvas', async ({ page }) => {
    // Given a user navigates to the landing page
    await page.goto('/');

    // When the application boots
    const canvas = page.locator('canvas');

    // Then a rendering surface should be visible
    await expect(canvas).toBeVisible();
  });
});
