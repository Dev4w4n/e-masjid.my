import { test, expect } from '@playwright/test';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
const MAIN_DISPLAY_ID = '550e8400-e29b-41d4-a716-446655440000';

test('debug content carousel state', async ({ page }) => {
  console.log('Testing display page...');
  
  await page.goto(`${BASE_URL}/display/${MAIN_DISPLAY_ID}`);
  
  // Wait a bit for page to load
  await page.waitForTimeout(3000);
  
  // Check what data-testid elements are actually present
  const testIds = await page.$$eval('[data-testid]', elements => 
    elements.map(el => ({
      testId: el.getAttribute('data-testid'),
      visible: (el as HTMLElement).offsetParent !== null,
      text: el.textContent?.substring(0, 100)
    }))
  );
  
  console.log('Found elements with data-testid:', testIds);
  
  // Check for specific carousel elements
  const carouselElements = [
    'content-carousel',
    'content-carousel-loading', 
    'content-carousel-error',
    'content-carousel-empty',
    'content-carousel-no-current'
  ];
  
  let foundState = null;
  for (const testId of carouselElements) {
    const element = await page.$(`[data-testid="${testId}"]`);
    if (element) {
      const isVisible = await element.isVisible();
      console.log(`${testId}: ${isVisible ? 'VISIBLE' : 'HIDDEN'}`);
      if (isVisible) {
        foundState = testId;
        break;
      }
    } else {
      console.log(`${testId}: NOT FOUND`);
    }
  }
  
  console.log('Current carousel state:', foundState || 'UNKNOWN');
  
  // Take a screenshot for debugging
  await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
  
  // Just pass the test - we're debugging
  expect(true).toBe(true);
});