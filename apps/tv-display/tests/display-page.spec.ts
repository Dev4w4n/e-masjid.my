import { test, expect } from '@playwright/test';

test.describe('TV Display Page', () => {
  test('should load display page with real data', async ({ page }) => {
    // Use one of the display IDs that was created in the seed data
    const displayId = '2f1146ed-2e0e-452c-94a0-f89aa3b371b5';
    
    // Navigate to display page
    await page.goto(`/display/${displayId}`);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/display-page.png', fullPage: true });
    
    // Check if the page has any content
    const bodyContent = await page.textContent('body');
    console.log('Display page body content length:', bodyContent?.length || 0);
    console.log('Display page body preview:', bodyContent?.substring(0, 500) || 'No content');
    
    // Check page title
    const title = await page.title();
    console.log('Display page title:', title);
    
    // Check for HTML content
    const htmlContent = await page.content();
    console.log('Display page HTML length:', htmlContent.length);
    
    // Look for specific TV display elements
    const contentCarousel = page.locator('[data-testid="content-carousel"]');
    const prayerTimes = page.locator('[data-testid="prayer-times"]');
    const sponsorship = page.locator('[data-testid="sponsorship"]');
    const offlineHandler = page.locator('[data-testid="offline-handler"]');
    const displayStatus = page.locator('[data-testid="display-status"]');
    
    console.log('Content carousel found:', await contentCarousel.count());
    console.log('Prayer times found:', await prayerTimes.count());
    console.log('Sponsorship found:', await sponsorship.count());
    console.log('Offline handler found:', await offlineHandler.count());
    console.log('Display status found:', await displayStatus.count());
    
    // Check for any text content that should be from our test data
    const welcomeText = page.locator('text=Welcome');
    const prayerText = page.locator('text=Prayer');
    const donationText = page.locator('text=Donation');
    
    console.log('Welcome text found:', await welcomeText.count());
    console.log('Prayer text found:', await prayerText.count());
    console.log('Donation text found:', await donationText.count());
    
    // Basic assertion - page should have loaded
    expect(htmlContent.length).toBeGreaterThan(100);
  });
  
  test('should check for API calls and network activity', async ({ page }) => {
    const networkRequests: string[] = [];
    const apiResponses: { url: string; status: number; response?: any }[] = [];
    
    // Monitor network requests
    page.on('request', request => {
      networkRequests.push(`${request.method()} ${request.url()}`);
    });
    
    page.on('response', async response => {
      const url = response.url();
      const status = response.status();
      
      if (url.includes('/api/')) {
        try {
          const responseData = await response.json();
          apiResponses.push({ url, status, response: responseData });
        } catch (e) {
          apiResponses.push({ url, status, response: 'Could not parse JSON' });
        }
      }
    });
    
    // Use the display ID from our test data
    const displayId = '2f1146ed-2e0e-452c-94a0-f89aa3b371b5';
    
    await page.goto(`/display/${displayId}`);
    
    // Wait for any async operations
    await page.waitForTimeout(5000);
    
    console.log('Network requests made:');
    networkRequests.forEach(req => console.log('  -', req));
    
    console.log('API responses:');
    apiResponses.forEach(resp => {
      console.log(`  - ${resp.url} (${resp.status}):`, resp.response);
    });
    
    // Check if we made calls to our TV display APIs
    const contentApiCall = networkRequests.find(req => req.includes('/api/content'));
    const prayerApiCall = networkRequests.find(req => req.includes('/api/prayer-times'));
    const configApiCall = networkRequests.find(req => req.includes('/api/config'));
    
    console.log('Content API called:', !!contentApiCall);
    console.log('Prayer API called:', !!prayerApiCall);
    console.log('Config API called:', !!configApiCall);
  });
  
  test('should test with simple display ID "1"', async ({ page }) => {
    // Test with a simple display ID
    await page.goto('/display/1');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot
    await page.screenshot({ path: 'test-results/display-page-simple-id.png', fullPage: true });
    
    // Check if the page loads (even if display doesn't exist)
    const bodyContent = await page.textContent('body');
    console.log('Simple ID page body content length:', bodyContent?.length || 0);
    console.log('Simple ID page body preview:', bodyContent?.substring(0, 300) || 'No content');
    
    // Check if there's an error message or not found message
    const errorMessage = page.locator('text=Error');
    const notFoundMessage = page.locator('text=not found');
    
    console.log('Error messages found:', await errorMessage.count());
    console.log('Not found messages found:', await notFoundMessage.count());
  });
});