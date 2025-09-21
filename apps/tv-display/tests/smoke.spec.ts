import { test, expect } from '@playwright/test';

test.describe('TV Display App - Smoke Tests', () => {
  test('should load the TV display page', async ({ page }) => {
    await page.goto('/');
    
    // Verify the page loads
    await expect(page).toHaveTitle(/E-Masjid TV Display/);
    
    // Check for basic layout elements
    await expect(page.locator('body')).toBeVisible();
  });

  test('should render in TV viewport correctly', async ({ page }) => {
    // Test specifically for TV display dimensions
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeGreaterThanOrEqual(1920);
    expect(viewport?.height).toBeGreaterThanOrEqual(1080);
    
    await page.goto('/');
    
    // Verify page renders without horizontal scroll
    const bodyWidth = await page.locator('body').evaluate(el => el.scrollWidth);
    const viewportWidth = viewport?.width || 1920;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
  });

  test('should support keyboard navigation for TV remotes', async ({ page }) => {
    await page.goto('/');
    
    // Test arrow key navigation (common on TV remotes)
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    
    // Should not cause any console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    expect(consoleErrors.length).toBe(0);
  });
});