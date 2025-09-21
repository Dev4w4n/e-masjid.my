import { test, expect } from '@playwright/test';

test.describe('TV Display Home Page', () => {
  test('should load home page and show basic content', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/home-page.png', fullPage: true });
    
    // Check if the page has any content
    const bodyContent = await page.textContent('body');
    console.log('Body content:', bodyContent);
    
    // Check page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Check for HTML content
    const htmlContent = await page.content();
    console.log('HTML length:', htmlContent.length);
    console.log('HTML preview:', htmlContent.substring(0, 500));
    
    // Look for specific elements
    const heading = page.locator('h1');
    const headingCount = await heading.count();
    console.log('H1 elements found:', headingCount);
    
    if (headingCount > 0) {
      const headingText = await heading.textContent();
      console.log('H1 text:', headingText);
    }
    
    // Check for forms
    const forms = page.locator('form');
    const formCount = await forms.count();
    console.log('Forms found:', formCount);
    
    // Check for input fields
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    console.log('Input fields found:', inputCount);
    
    // Check for errors in console
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Wait a bit to capture any console errors
    await page.waitForTimeout(2000);
    
    if (errors.length > 0) {
      console.log('Console errors:', errors);
    }
    
    // Basic assertion - page should have loaded
    expect(htmlContent.length).toBeGreaterThan(100);
  });
  
  test('should check for JavaScript errors and loading state', async ({ page }) => {
    const errors: string[] = [];
    const logs: string[] = [];
    
    // Capture console messages
    page.on('console', msg => {
      const text = msg.text();
      logs.push(`${msg.type()}: ${text}`);
      if (msg.type() === 'error') {
        errors.push(text);
      }
    });
    
    // Capture JavaScript errors
    page.on('pageerror', error => {
      errors.push(`JavaScript error: ${error.message}`);
    });
    
    await page.goto('/');
    
    // Wait for any async operations
    await page.waitForTimeout(5000);
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/home-page-debug.png', fullPage: true });
    
    console.log('All console logs:', logs);
    console.log('JavaScript errors:', errors);
    
    // Check if React has loaded
    const reactLoaded = await page.evaluate(() => {
      return typeof window !== 'undefined' && 
             window.React !== undefined || 
             document.querySelector('[data-reactroot]') !== null ||
             document.querySelector('#__next') !== null;
    });
    
    console.log('React loaded:', reactLoaded);
    
    // Check if Next.js has loaded
    const nextLoaded = await page.evaluate(() => {
      return typeof window !== 'undefined' && 
             (window.__NEXT_DATA__ !== undefined || document.querySelector('#__next') !== null);
    });
    
    console.log('Next.js loaded:', nextLoaded);
    
    // Print all errors for debugging
    if (errors.length > 0) {
      console.error('Errors found:');
      errors.forEach(error => console.error('  -', error));
    }
  });
});