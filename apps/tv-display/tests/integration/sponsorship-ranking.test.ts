/**
 * Sponsorship Ranking Integration Tests
 * 
 * Tests the complete sponsorship-based content ranking functionality from user stories
 * These tests MUST FAIL initially until implementation is complete (TDD)
 * 
 * Expected to fail: Sponsorship ranking logic doesn't exist yet
 * Success criteria: All tests pass after content ranking implementation
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
const SAMPLE_DISPLAY_ID = '550e8400-e29b-41d4-a716-446655440000';

test.describe('Sponsorship Ranking Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock content with different sponsorship amounts
    await page.route(`**/api/displays/${SAMPLE_DISPLAY_ID}/content`, async (route) => {
      const json = {
        data: [
          {
            id: 'high-sponsor-1',
            title: 'Premium Sponsor Content 1',
            type: 'youtube_video',
            url: 'https://youtube.com/watch?v=premium1',
            thumbnail_url: 'https://example.com/premium1.jpg',
            sponsorship_amount: 1000.00,
            duration: 30,
            status: 'active',
            approved_at: '2024-12-01T10:00:00Z'
          },
          {
            id: 'high-sponsor-2',
            title: 'Premium Sponsor Content 2',
            type: 'image',
            url: 'https://example.com/premium2.jpg',
            thumbnail_url: 'https://example.com/premium2-thumb.jpg',
            sponsorship_amount: 950.00,
            duration: 15,
            status: 'active',
            approved_at: '2024-12-01T11:00:00Z'
          },
          {
            id: 'medium-sponsor-1',
            title: 'Medium Sponsor Content',
            type: 'image',
            url: 'https://example.com/medium1.jpg',
            thumbnail_url: 'https://example.com/medium1-thumb.jpg',
            sponsorship_amount: 500.00,
            duration: 10,
            status: 'active',
            approved_at: '2024-12-01T12:00:00Z'
          },
          {
            id: 'low-sponsor-1',
            title: 'Basic Sponsor Content 1',
            type: 'youtube_video',
            url: 'https://youtube.com/watch?v=basic1',
            thumbnail_url: 'https://example.com/basic1.jpg',
            sponsorship_amount: 100.00,
            duration: 20,
            status: 'active',
            approved_at: '2024-12-01T13:00:00Z'
          },
          {
            id: 'low-sponsor-2',
            title: 'Basic Sponsor Content 2',
            type: 'image',
            url: 'https://example.com/basic2.jpg',
            thumbnail_url: 'https://example.com/basic2-thumb.jpg',
            sponsorship_amount: 50.00,
            duration: 8,
            status: 'active',
            approved_at: '2024-12-01T14:00:00Z'
          }
        ],
        meta: {
          total: 5,
          carousel_interval: 10
        }
      };
      await route.fulfill({ json });
    });

    await page.goto(`${BASE_URL}/display/${SAMPLE_DISPLAY_ID}`);
    await page.waitForSelector('[data-testid="content-carousel"]');
  });

  test('displays content in descending order of sponsorship amount', async ({ page }) => {
    const contentItems = page.locator('[data-testid="content-item"]');
    await expect(contentItems).toHaveCount(5);

    // Get sponsorship amounts in display order
    const sponsorshipAmounts = [];
    const count = await contentItems.count();
    
    for (let i = 0; i < count; i++) {
      const item = contentItems.nth(i);
      const amountElement = item.locator('[data-testid="sponsorship-amount"]');
      const amountText = await amountElement.textContent();
      
      // Extract numeric value from amount display
      const amount = parseFloat(amountText?.replace(/[^0-9.]/g, '') || '0');
      sponsorshipAmounts.push(amount);
    }

    // Verify descending order
    for (let i = 0; i < sponsorshipAmounts.length - 1; i++) {
      expect(sponsorshipAmounts[i]).toBeGreaterThanOrEqual(sponsorshipAmounts[i + 1]);
    }

    // Verify highest sponsor is first
    expect(sponsorshipAmounts[0]).toBe(1000);
    expect(sponsorshipAmounts[sponsorshipAmounts.length - 1]).toBe(50);
  });

  test('higher sponsors get more display time in carousel rotation', async ({ page }) => {
    const contentItems = page.locator('[data-testid="content-item"]');
    
    // Track which content items are displayed over time
    const displayTracking: { [key: string]: number } = {};
    const trackingDuration = 60000; // Track for 1 minute
    const checkInterval = 1000; // Check every second

    const startTime = Date.now();
    
    while (Date.now() - startTime < trackingDuration) {
      const activeItem = page.locator('[data-testid="content-item"][data-active="true"]');
      
      if (await activeItem.count() > 0) {
        const contentId = await activeItem.getAttribute('data-content-id');
        if (contentId) {
          displayTracking[contentId] = (displayTracking[contentId] || 0) + 1;
        }
      }
      
      await page.waitForTimeout(checkInterval);
    }

    // Higher sponsored content should appear more frequently
    const highSponsorDisplays = displayTracking['high-sponsor-1'] || 0;
    const lowSponsorDisplays = displayTracking['low-sponsor-2'] || 0;

    expect(highSponsorDisplays).toBeGreaterThan(lowSponsorDisplays);
  });

  test('displays sponsorship amount prominently for high-value sponsors', async ({ page }) => {
    // Look for premium sponsor content
    const premiumContent = page.locator('[data-testid="content-item"][data-content-id="high-sponsor-1"]');
    await expect(premiumContent).toBeVisible();

    // Verify sponsorship amount is displayed prominently
    const sponsorshipBadge = premiumContent.locator('[data-testid="sponsorship-badge"]');
    await expect(sponsorshipBadge).toBeVisible();

    // Check premium styling for high-value sponsors
    const isPremiumStyled = await sponsorshipBadge.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.fontWeight === 'bold' || 
             styles.fontSize.includes('large') ||
             el.classList.contains('premium-sponsor');
    });
    
    expect(isPremiumStyled).toBe(true);
  });

  test('applies sponsor tier visual differentiation', async ({ page }) => {
    const contentItems = page.locator('[data-testid="content-item"]');
    
    // Check for tier-based styling
    const highTierItem = page.locator('[data-testid="content-item"][data-content-id="high-sponsor-1"]');
    const mediumTierItem = page.locator('[data-testid="content-item"][data-content-id="medium-sponsor-1"]');
    const lowTierItem = page.locator('[data-testid="content-item"][data-content-id="low-sponsor-2"]');

    // Verify different visual treatments exist
    const highTierClass = await highTierItem.getAttribute('class');
    const mediumTierClass = await mediumTierItem.getAttribute('class');
    const lowTierClass = await lowTierItem.getAttribute('class');

    // Should have different styling classes based on sponsorship tiers
    expect(highTierClass).toContain('premium');
    expect(mediumTierClass).toContain('standard');
    expect(lowTierClass).toContain('basic');
  });

  test('handles equal sponsorship amounts with secondary sorting criteria', async ({ page }) => {
    // Mock content with equal sponsorship amounts
    await page.route(`**/api/displays/${SAMPLE_DISPLAY_ID}/content`, async (route) => {
      const json = {
        data: [
          {
            id: 'equal-sponsor-1',
            title: 'Equal Sponsor Content 1',
            type: 'image',
            url: 'https://example.com/equal1.jpg',
            thumbnail_url: 'https://example.com/equal1-thumb.jpg',
            sponsorship_amount: 500.00,
            duration: 10,
            status: 'active',
            approved_at: '2024-12-01T10:00:00Z' // Earlier approval
          },
          {
            id: 'equal-sponsor-2',
            title: 'Equal Sponsor Content 2',
            type: 'youtube_video',
            url: 'https://youtube.com/watch?v=equal2',
            thumbnail_url: 'https://example.com/equal2.jpg',
            sponsorship_amount: 500.00,
            duration: 20,
            status: 'active',
            approved_at: '2024-12-01T12:00:00Z' // Later approval
          }
        ],
        meta: {
          total: 2,
          carousel_interval: 10
        }
      };
      await route.fulfill({ json });
    });

    await page.reload();
    await page.waitForSelector('[data-testid="content-carousel"]');

    // When sponsorship amounts are equal, should sort by approval date (earlier first)
    const firstItem = page.locator('[data-testid="content-item"]').first();
    const firstItemId = await firstItem.getAttribute('data-content-id');
    
    expect(firstItemId).toBe('equal-sponsor-1'); // Earlier approved content first
  });

  test('respects max content items limit while maintaining sponsorship ranking', async ({ page }) => {
    // Mock display config with lower max items
    await page.route(`**/api/displays/${SAMPLE_DISPLAY_ID}/config`, async (route) => {
      const json = {
        data: {
          id: SAMPLE_DISPLAY_ID,
          masjid_id: 'masjid-001',
          display_name: 'Limited Display',
          prayer_time_position: 'top',
          carousel_interval: 10,
          max_content_items: 3, // Only show top 3
          auto_refresh_interval: 5,
          is_active: true,
          last_heartbeat: new Date().toISOString()
        }
      };
      await route.fulfill({ json });
    });

    // Mock content API to return only top sponsors based on limit
    await page.route(`**/api/displays/${SAMPLE_DISPLAY_ID}/content`, async (route) => {
      const json = {
        data: [
          {
            id: 'high-sponsor-1',
            title: 'Premium Sponsor Content 1',
            type: 'youtube_video',
            url: 'https://youtube.com/watch?v=premium1',
            thumbnail_url: 'https://example.com/premium1.jpg',
            sponsorship_amount: 1000.00,
            duration: 30,
            status: 'active',
            approved_at: '2024-12-01T10:00:00Z'
          },
          {
            id: 'high-sponsor-2',
            title: 'Premium Sponsor Content 2',
            type: 'image',
            url: 'https://example.com/premium2.jpg',
            thumbnail_url: 'https://example.com/premium2-thumb.jpg',
            sponsorship_amount: 950.00,
            duration: 15,
            status: 'active',
            approved_at: '2024-12-01T11:00:00Z'
          },
          {
            id: 'medium-sponsor-1',
            title: 'Medium Sponsor Content',
            type: 'image',
            url: 'https://example.com/medium1.jpg',
            thumbnail_url: 'https://example.com/medium1-thumb.jpg',
            sponsorship_amount: 500.00,
            duration: 10,
            status: 'active',
            approved_at: '2024-12-01T12:00:00Z'
          }
        ],
        meta: {
          total: 5, // Total available, but only showing top 3
          carousel_interval: 10
        }
      };
      await route.fulfill({ json });
    });

    await page.reload();
    await page.waitForSelector('[data-testid="content-carousel"]');

    // Should only show 3 items (the highest sponsors)
    const contentItems = page.locator('[data-testid="content-item"]');
    await expect(contentItems).toHaveCount(3);

    // Verify these are the top 3 sponsors
    const sponsorshipAmounts = [];
    for (let i = 0; i < 3; i++) {
      const item = contentItems.nth(i);
      const amountElement = item.locator('[data-testid="sponsorship-amount"]');
      const amountText = await amountElement.textContent();
      const amount = parseFloat(amountText?.replace(/[^0-9.]/g, '') || '0');
      sponsorshipAmounts.push(amount);
    }

    expect(sponsorshipAmounts).toEqual([1000, 950, 500]);
  });

  test('updates sponsorship ranking when content is refreshed', async ({ page }) => {
    // Initial content display
    await page.waitForSelector('[data-testid="content-carousel"]');
    
    const initialFirstItem = page.locator('[data-testid="content-item"]').first();
    const initialFirstId = await initialFirstItem.getAttribute('data-content-id');

    // Mock updated content with different sponsorship amounts
    await page.route(`**/api/displays/${SAMPLE_DISPLAY_ID}/content`, async (route) => {
      const json = {
        data: [
          {
            id: 'new-top-sponsor',
            title: 'New Top Sponsor Content',
            type: 'youtube_video',
            url: 'https://youtube.com/watch?v=newtop',
            thumbnail_url: 'https://example.com/newtop.jpg',
            sponsorship_amount: 2000.00, // Higher than previous top
            duration: 25,
            status: 'active',
            approved_at: new Date().toISOString()
          },
          {
            id: 'high-sponsor-1',
            title: 'Previous Top Sponsor',
            type: 'youtube_video',
            url: 'https://youtube.com/watch?v=premium1',
            thumbnail_url: 'https://example.com/premium1.jpg',
            sponsorship_amount: 1000.00,
            duration: 30,
            status: 'active',
            approved_at: '2024-12-01T10:00:00Z'
          }
        ],
        meta: {
          total: 2,
          carousel_interval: 10
        }
      };
      await route.fulfill({ json });
    });

    // Trigger content refresh
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('content-refresh'));
    });

    await page.waitForTimeout(2000);

    // Verify new top sponsor is now first
    const newFirstItem = page.locator('[data-testid="content-item"]').first();
    const newFirstId = await newFirstItem.getAttribute('data-content-id');
    
    expect(newFirstId).toBe('new-top-sponsor');
    expect(newFirstId).not.toBe(initialFirstId);
  });

  test('displays sponsorship information in multiple languages', async ({ page }) => {
    // Look for sponsorship information display
    const sponsorshipInfo = page.locator('[data-testid="sponsorship-info"]');
    
    if (await sponsorshipInfo.count() > 0) {
      await expect(sponsorshipInfo).toBeVisible();
      
      const infoText = await sponsorshipInfo.textContent();
      
      // Should contain Bahasa Malaysia terms for sponsorship
      const malayWords = ['Penaja', 'Sumbangan', 'RM'];
      const containsMalayTerm = malayWords.some(word => infoText?.includes(word));
      
      expect(containsMalayTerm).toBe(true);
    }
  });

  test('handles sponsorship amount formatting and currency display', async ({ page }) => {
    const contentItems = page.locator('[data-testid="content-item"]');
    const firstItem = contentItems.first();
    
    const sponsorshipAmount = firstItem.locator('[data-testid="sponsorship-amount"]');
    await expect(sponsorshipAmount).toBeVisible();
    
    const amountText = await sponsorshipAmount.textContent();
    
    // Should format currency properly (Malaysian Ringgit)
    expect(amountText).toMatch(/RM\s*[\d,]+\.?\d*/);
    
    // Should use proper thousand separators for large amounts
    if (amountText?.includes('1000')) {
      expect(amountText).toMatch(/1,000/);
    }
  });

  test('maintains sponsorship ranking consistency across page reloads', async ({ page }) => {
    // Get initial ranking order
    const initialOrder = [];
    const contentItems = page.locator('[data-testid="content-item"]');
    const count = await contentItems.count();
    
    for (let i = 0; i < count; i++) {
      const item = contentItems.nth(i);
      const contentId = await item.getAttribute('data-content-id');
      initialOrder.push(contentId);
    }

    // Reload page
    await page.reload();
    await page.waitForSelector('[data-testid="content-carousel"]');

    // Get order after reload
    const reloadOrder = [];
    const newContentItems = page.locator('[data-testid="content-item"]');
    const newCount = await newContentItems.count();
    
    for (let i = 0; i < newCount; i++) {
      const item = newContentItems.nth(i);
      const contentId = await item.getAttribute('data-content-id');
      reloadOrder.push(contentId);
    }

    // Order should be consistent
    expect(reloadOrder).toEqual(initialOrder);
  });
});

test.describe('Sponsorship Ranking Error Handling', () => {
  test('handles missing sponsorship amount data gracefully', async ({ page }) => {
    // Mock content with missing sponsorship amounts
    await page.route(`**/api/displays/${SAMPLE_DISPLAY_ID}/content`, async (route) => {
      const json = {
        data: [
          {
            id: 'missing-amount',
            title: 'Content with Missing Amount',
            type: 'image',
            url: 'https://example.com/missing.jpg',
            thumbnail_url: 'https://example.com/missing-thumb.jpg',
            // sponsorship_amount missing
            duration: 10,
            status: 'active',
            approved_at: '2024-12-01T10:00:00Z'
          },
          {
            id: 'valid-content',
            title: 'Valid Content',
            type: 'image',
            url: 'https://example.com/valid.jpg',
            thumbnail_url: 'https://example.com/valid-thumb.jpg',
            sponsorship_amount: 100.00,
            duration: 10,
            status: 'active',
            approved_at: '2024-12-01T11:00:00Z'
          }
        ],
        meta: {
          total: 2,
          carousel_interval: 10
        }
      };
      await route.fulfill({ json });
    });

    await page.goto(`${BASE_URL}/display/${SAMPLE_DISPLAY_ID}`);
    await page.waitForSelector('[data-testid="content-carousel"]');

    // Should handle missing amounts (treat as 0 or show gracefully)
    const contentItems = page.locator('[data-testid="content-item"]');
    await expect(contentItems).toHaveCount(2);

    // Valid content should appear first
    const firstItem = contentItems.first();
    const firstItemId = await firstItem.getAttribute('data-content-id');
    expect(firstItemId).toBe('valid-content');
  });

  test('handles invalid sponsorship amount values', async ({ page }) => {
    // Mock content with invalid amounts
    await page.route(`**/api/displays/${SAMPLE_DISPLAY_ID}/content`, async (route) => {
      const json = {
        data: [
          {
            id: 'negative-amount',
            title: 'Negative Amount Content',
            type: 'image',
            url: 'https://example.com/negative.jpg',
            thumbnail_url: 'https://example.com/negative-thumb.jpg',
            sponsorship_amount: -100.00, // Invalid negative amount
            duration: 10,
            status: 'active',
            approved_at: '2024-12-01T10:00:00Z'
          },
          {
            id: 'string-amount',
            title: 'String Amount Content',
            type: 'image',
            url: 'https://example.com/string.jpg',
            thumbnail_url: 'https://example.com/string-thumb.jpg',
            sponsorship_amount: 'invalid' as any, // Invalid string amount
            duration: 10,
            status: 'active',
            approved_at: '2024-12-01T11:00:00Z'
          }
        ],
        meta: {
          total: 2,
          carousel_interval: 10
        }
      };
      await route.fulfill({ json });
    });

    await page.goto(`${BASE_URL}/display/${SAMPLE_DISPLAY_ID}`);

    // Should handle invalid amounts gracefully without crashing
    const errorState = page.locator('[data-testid="content-error"]');
    const contentCarousel = page.locator('[data-testid="content-carousel"]');

    // Either show error state or handle gracefully with carousel
    const hasError = await errorState.count() > 0;
    const hasCarousel = await contentCarousel.count() > 0;
    
    expect(hasError || hasCarousel).toBe(true);
  });

  test('handles extremely large sponsorship amounts', async ({ page }) => {
    // Mock content with very large amounts
    await page.route(`**/api/displays/${SAMPLE_DISPLAY_ID}/content`, async (route) => {
      const json = {
        data: [
          {
            id: 'massive-sponsor',
            title: 'Massive Sponsor Content',
            type: 'image',
            url: 'https://example.com/massive.jpg',
            thumbnail_url: 'https://example.com/massive-thumb.jpg',
            sponsorship_amount: 999999999.99, // Very large amount
            duration: 10,
            status: 'active',
            approved_at: '2024-12-01T10:00:00Z'
          }
        ],
        meta: {
          total: 1,
          carousel_interval: 10
        }
      };
      await route.fulfill({ json });
    });

    await page.goto(`${BASE_URL}/display/${SAMPLE_DISPLAY_ID}`);
    await page.waitForSelector('[data-testid="content-carousel"]');

    // Should format large amounts properly without breaking UI
    const sponsorshipAmount = page.locator('[data-testid="sponsorship-amount"]');
    await expect(sponsorshipAmount).toBeVisible();
    
    const amountText = await sponsorshipAmount.textContent();
    
    // Should handle large numbers with proper formatting
    expect(amountText?.length).toBeGreaterThan(0);
    expect(amountText).toMatch(/RM.*999,999,999/);
  });
});