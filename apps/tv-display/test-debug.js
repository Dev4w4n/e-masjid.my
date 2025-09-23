const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to display page...');
    await page.goto('http://localhost:3001/display/550e8400-e29b-41d4-a716-446655440000');
    
    // Wait a bit for page to load
    await page.waitForTimeout(5000);
    
    // Check what data-testid elements are actually present
    const testIds = await page.$$eval('[data-testid]', elements => 
      elements.map(el => ({
        testId: el.getAttribute('data-testid'),
        visible: !el.hidden && el.offsetParent !== null,
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
    
    for (const testId of carouselElements) {
      const element = await page.$(`[data-testid="${testId}"]`);
      if (element) {
        const isVisible = await element.isVisible();
        console.log(`${testId}: ${isVisible ? 'VISIBLE' : 'HIDDEN'}`);
      } else {
        console.log(`${testId}: NOT FOUND`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();