import { test, expect } from '@playwright/test';

test.describe('Hydration Fix Validation', () => {
  test('should not have hydration mismatch errors', async ({ page }) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Capture console messages
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error') {
        errors.push(text);
      } else if (msg.type() === 'warning') {
        warnings.push(text);
      }
    });
    
    // Navigate to home page
    await page.goto('/');
    
    // Wait for hydration to complete
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Navigate to display page
    const displayId = '2f1146ed-2e0e-452c-94a0-f89aa3b371b5';
    await page.goto(`/display/${displayId}`);
    
    // Wait for components to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    // Filter out hydration-related errors
    const hydrationErrors = errors.filter(error => 
      error.includes('hydration') || 
      error.includes('server rendered HTML') ||
      error.includes("didn't match") ||
      error.includes('mismatch')
    );
    
    const hydrationWarnings = warnings.filter(warning => 
      warning.includes('hydration') || 
      warning.includes('server rendered HTML') ||
      warning.includes("didn't match") ||
      warning.includes('mismatch')
    );
    
    console.log('All errors:', errors);
    console.log('All warnings:', warnings);
    console.log('Hydration errors:', hydrationErrors);
    console.log('Hydration warnings:', hydrationWarnings);
    
    // Take screenshots for debugging
    await page.screenshot({ path: 'test-results/hydration-test-home.png', fullPage: true });
    
    // The test should pass if there are no hydration-specific errors
    expect(hydrationErrors).toHaveLength(0);
    expect(hydrationWarnings).toHaveLength(0);
  });
});