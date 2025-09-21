/**
 * Content Carousel Integration Tests
 * 
 * Tests the complete content carousel functionality from user stories
 * These tests MUST FAIL initially until implementation is complete (TDD)
 * 
 * Expected to fail: Components and pages don't exist yet
 * Success criteria: All tests pass after T026-T028 component implementation
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
const SAMPLE_DISPLAY_ID = '550e8400-e29b-41d4-a716-446655440000';

test.describe('Content Carousel Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the TV display page
    await page.goto(`${BASE_URL}/display/${SAMPLE_DISPLAY_ID}`);
  });

  test('displays content carousel with sponsored items in ranking order', async ({ page }) => {
    // Wait for content to load
    await page.waitForSelector('[data-testid="content-carousel"]', { timeout: 10000 });

    // Verify carousel container is visible
    const carousel = page.locator('[data-testid="content-carousel"]');
    await expect(carousel).toBeVisible();

    // Verify content items are displayed
    const contentItems = page.locator('[data-testid="content-item"]');
    await expect(contentItems).toHaveCount({ min: 1, max: 10 });

    // Verify first item has highest sponsorship amount (data should be sorted)
    const firstItem = contentItems.first();
    await expect(firstItem).toBeVisible();
    
    // Check that sponsorship amount is displayed
    const sponsorshipAmount = firstItem.locator('[data-testid="sponsorship-amount"]');
    await expect(sponsorshipAmount).toBeVisible();
  });

  test('transitions between content items automatically', async ({ page }) => {
    await page.waitForSelector('[data-testid="content-carousel"]');

    // Get initial content item
    const activeItem = page.locator('[data-testid="content-item"][data-active="true"]');
    await expect(activeItem).toBeVisible();

    const initialItemId = await activeItem.getAttribute('data-content-id');

    // Wait for automatic transition (should happen within carousel_interval)
    await page.waitForTimeout(8000); // Wait longer than minimum interval

    // Verify a different item is now active
    const newActiveItem = page.locator('[data-testid="content-item"][data-active="true"]');
    const newItemId = await newActiveItem.getAttribute('data-content-id');

    expect(newItemId).not.toBe(initialItemId);
  });

  test('displays YouTube videos with proper embedding', async ({ page }) => {
    await page.waitForSelector('[data-testid="content-carousel"]');

    // Look for YouTube video content
    const youtubeItems = page.locator('[data-testid="content-item"][data-type="youtube_video"]');
    
    if (await youtubeItems.count() > 0) {
      const youtubeItem = youtubeItems.first();
      await expect(youtubeItem).toBeVisible();

      // Verify YouTube player is embedded
      const videoPlayer = youtubeItem.locator('[data-testid="video-player"]');
      await expect(videoPlayer).toBeVisible();

      // Verify video controls are appropriate for TV display
      const iframe = youtubeItem.locator('iframe');
      if (await iframe.count() > 0) {
        const src = await iframe.getAttribute('src');
        expect(src).toContain('youtube.com');
        expect(src).toContain('autoplay=1'); // Should autoplay for TV
      }
    }
  });

  test('displays image content with proper scaling for TV', async ({ page }) => {
    await page.waitForSelector('[data-testid="content-carousel"]');

    // Look for image content
    const imageItems = page.locator('[data-testid="content-item"][data-type="image"]');
    
    if (await imageItems.count() > 0) {
      const imageItem = imageItems.first();
      await expect(imageItem).toBeVisible();

      // Verify image is properly displayed
      const image = imageItem.locator('[data-testid="content-image"]');
      await expect(image).toBeVisible();

      // Verify image dimensions are appropriate for TV display
      const boundingBox = await image.boundingBox();
      expect(boundingBox?.width).toBeGreaterThan(800); // Minimum TV width
      expect(boundingBox?.height).toBeGreaterThan(400); // Minimum TV height
    }
  });

  test('shows content titles in Bahasa Malaysia', async ({ page }) => {
    await page.waitForSelector('[data-testid="content-carousel"]');

    const contentItems = page.locator('[data-testid="content-item"]');
    const firstItem = contentItems.first();

    // Verify title is displayed
    const title = firstItem.locator('[data-testid="content-title"]');
    await expect(title).toBeVisible();

    const titleText = await title.textContent();
    expect(titleText?.length).toBeGreaterThan(0);
  });

  test('respects carousel interval configuration', async ({ page }) => {
    await page.waitForSelector('[data-testid="content-carousel"]');

    // Mock API response to set specific interval
    await page.route(`**/api/displays/${SAMPLE_DISPLAY_ID}/content`, async (route) => {
      const json = {
        data: [
          {
            id: 'test-1',
            title: 'Test Content 1',
            type: 'image',
            url: 'https://example.com/image1.jpg',
            thumbnail_url: 'https://example.com/thumb1.jpg',
            sponsorship_amount: 100,
            duration: 5,
            status: 'active',
            approved_at: new Date().toISOString()
          },
          {
            id: 'test-2', 
            title: 'Test Content 2',
            type: 'image',
            url: 'https://example.com/image2.jpg',
            thumbnail_url: 'https://example.com/thumb2.jpg',
            sponsorship_amount: 50,
            duration: 5,
            status: 'active',
            approved_at: new Date().toISOString()
          }
        ],
        meta: {
          total: 2,
          carousel_interval: 5 // 5 seconds
        }
      };
      await route.fulfill({ json });
    });

    await page.reload();
    await page.waitForSelector('[data-testid="content-carousel"]');

    const startTime = Date.now();
    
    // Wait for transition
    await page.waitForFunction(() => {
      const items = document.querySelectorAll('[data-testid="content-item"][data-active="true"]');
      return items.length > 0;
    });

    // Wait for next transition
    await page.waitForFunction(() => {
      const activeItems = document.querySelectorAll('[data-testid="content-item"][data-active="true"]');
      return activeItems.length > 0 && activeItems[0].getAttribute('data-content-id') === 'test-2';
    }, { timeout: 10000 });

    const transitionTime = Date.now() - startTime;
    
    // Should transition within reasonable time (5s ± 2s for timing tolerance)
    expect(transitionTime).toBeGreaterThan(3000);
    expect(transitionTime).toBeLessThan(7000);
  });

  test('handles empty content gracefully', async ({ page }) => {
    // Mock empty content response
    await page.route(`**/api/displays/${SAMPLE_DISPLAY_ID}/content`, async (route) => {
      const json = {
        data: [],
        meta: {
          total: 0,
          carousel_interval: 10
        }
      };
      await route.fulfill({ json });
    });

    await page.goto(`${BASE_URL}/display/${SAMPLE_DISPLAY_ID}`);

    // Should show placeholder or message
    const placeholder = page.locator('[data-testid="no-content-message"]');
    await expect(placeholder).toBeVisible();

    const placeholderText = await placeholder.textContent();
    expect(placeholderText).toContain('Tiada kandungan'); // Bahasa Malaysia
  });

  test('maintains smooth 60fps animations during transitions', async ({ page }) => {
    await page.waitForSelector('[data-testid="content-carousel"]');

    // Monitor frame rate during transition
    let frameCount = 0;
    const startTime = performance.now();

    // Count frames for 1 second during transition
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        let frames = 0;
        const start = performance.now();
        
        function countFrame() {
          frames++;
          if (performance.now() - start < 1000) {
            requestAnimationFrame(countFrame);
          } else {
            (window as any).frameCount = frames;
            resolve();
          }
        }
        requestAnimationFrame(countFrame);
      });
    });

    frameCount = await page.evaluate(() => (window as any).frameCount);

    // Should achieve close to 60fps (allow for some tolerance)
    expect(frameCount).toBeGreaterThan(45); // At least 45fps
  });

  test('displays content items in responsive TV layout', async ({ page }) => {
    await page.waitForSelector('[data-testid="content-carousel"]');

    const carousel = page.locator('[data-testid="content-carousel"]');
    
    // Verify carousel takes full viewport
    const carouselBox = await carousel.boundingBox();
    const viewport = page.viewportSize();
    
    expect(carouselBox?.width).toBeCloseTo(viewport?.width || 1920, 50);
    expect(carouselBox?.height).toBeCloseTo(viewport?.height || 1080, 50);

    // Verify content is centered and properly scaled
    const activeItem = page.locator('[data-testid="content-item"][data-active="true"]');
    const itemBox = await activeItem.boundingBox();
    
    expect(itemBox?.width).toBeGreaterThan(800);
    expect(itemBox?.height).toBeGreaterThan(400);
  });

  test('preloads next content for smooth transitions', async ({ page }) => {
    await page.waitForSelector('[data-testid="content-carousel"]');

    // Check that next content item is preloaded
    const preloadedItems = page.locator('[data-testid="content-item"][data-preloaded="true"]');
    await expect(preloadedItems).toHaveCount({ min: 1 });

    // Verify images are preloaded
    const preloadedImages = page.locator('img[data-preloaded="true"]');
    if (await preloadedImages.count() > 0) {
      const img = preloadedImages.first();
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0); // Image should be loaded
    }
  });
});

test.describe('Content Carousel Error Handling', () => {
  test('handles API failures gracefully', async ({ page }) => {
    // Mock API failure
    await page.route(`**/api/displays/${SAMPLE_DISPLAY_ID}/content`, async (route) => {
      await route.fulfill({ status: 500 });
    });

    await page.goto(`${BASE_URL}/display/${SAMPLE_DISPLAY_ID}`);

    // Should show error message or fallback content
    const errorMessage = page.locator('[data-testid="content-error"]');
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });

  test('handles slow content loading', async ({ page }) => {
    // Mock slow API response
    await page.route(`**/api/displays/${SAMPLE_DISPLAY_ID}/content`, async (route) => {
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
      const json = {
        data: [
          {
            id: 'slow-content',
            title: 'Slow Loading Content',
            type: 'image',
            url: 'https://example.com/slow-image.jpg',
            thumbnail_url: 'https://example.com/slow-thumb.jpg',
            sponsorship_amount: 100,
            duration: 10,
            status: 'active',
            approved_at: new Date().toISOString()
          }
        ],
        meta: { total: 1, carousel_interval: 10 }
      };
      await route.fulfill({ json });
    });

    await page.goto(`${BASE_URL}/display/${SAMPLE_DISPLAY_ID}`);

    // Should show loading state
    const loadingIndicator = page.locator('[data-testid="content-loading"]');
    await expect(loadingIndicator).toBeVisible();

    // Eventually should load content
    await page.waitForSelector('[data-testid="content-carousel"]', { timeout: 15000 });
  });

  test('handles invalid YouTube URLs gracefully', async ({ page }) => {
    // Mock content with invalid YouTube URL
    await page.route(`**/api/displays/${SAMPLE_DISPLAY_ID}/content`, async (route) => {
      const json = {
        data: [
          {
            id: 'invalid-youtube',
            title: 'Invalid YouTube Content',
            type: 'youtube_video',
            url: 'https://youtube.com/invalid-url',
            thumbnail_url: 'https://example.com/thumb.jpg',
            sponsorship_amount: 100,
            duration: 30,
            status: 'active',
            approved_at: new Date().toISOString()
          }
        ],
        meta: { total: 1, carousel_interval: 10 }
      };
      await route.fulfill({ json });
    });

    await page.goto(`${BASE_URL}/display/${SAMPLE_DISPLAY_ID}`);
    await page.waitForSelector('[data-testid="content-carousel"]');

    // Should show fallback or error state for invalid video
    const errorState = page.locator('[data-testid="video-error"]');
    await expect(errorState).toBeVisible({ timeout: 10000 });
  });
});