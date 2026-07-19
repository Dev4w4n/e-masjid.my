/**
 * Landing Page E2E Tests
 * Feature: 007-tv-landing-tiers
 * Playwright tests for user flows on landing page
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173'; // Vite dev server

test.describe('Landing Page - User Story 1: Free Tier Discovery', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to landing page
    await page.goto(`${BASE_URL}/landing`);
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
  });

  test('E2E-001: User should see hero section on landing', async ({ page }) => {
    // Hero headline should be visible
    const headline = page.locator('h1');
    await expect(headline).toBeVisible();

    // Should contain "Sahaja TV" or "Free Mosque TV"
    const text = await headline.textContent();
    expect(text).toMatch(/sahaja|free|tv/i);

    // CTA button should be visible
    const ctaButton = page.locator('button:has-text("Mulai Percuma"), button:has-text("Start Free")').first();
    await expect(ctaButton).toBeVisible();
  });

  test('E2E-002: Hero CTA should scroll to tiers section', async ({ page }) => {
    // Get hero CTA button
    const ctaButton = page.locator('button:has-text("Mulai Percuma"), button:has-text("Start Free")').first();

    // Click hero CTA
    await ctaButton.click();

    // Should scroll to tiers section
    const tiersSection = page.locator('#tiers-section');
    const box = await tiersSection.boundingBox();
    expect(box?.y).toBeLessThan(1000); // Should be in viewport
  });

  test('E2E-003: User should see all 4 tier cards', async ({ page }) => {
    // Wait for tier cards to load
    const tierCards = page.locator('[class*="MuiCard"]');
    await expect(tierCards).toHaveCount(4);

    // Verify tier names are visible
    await expect(page.locator('text=Asas')).toBeVisible();
    await expect(page.locator('text=Maju')).toBeVisible();
    await expect(page.locator('text=Gemilang')).toBeVisible();
    await expect(page.locator('text=Istimewa')).toBeVisible();
  });

  test('E2E-004: Asas tier should show "Start Free" button', async ({ page }) => {
    // Find Asas tier card
    const asasCard = page.locator('text=Asas').first().locator('..').first();

    // Should contain "Start Free" or "Mulai Percuma" button
    const startButton = asasCard.locator('button:has-text("Mulai Percuma"), button:has-text("Start Free")');
    await expect(startButton).toBeVisible();

    // Should show "Percuma" or "Free" price
    await expect(asasCard.locator('text=Percuma, text=Free')).toHaveCount(1);
  });

  test('E2E-005: Paid tiers should show "Upgrade" button', async ({ page }) => {
    // Find Maju tier
    const majuCard = page.locator('text=Maju').first().locator('..').first();

    // Should contain "Upgrade" button
    const upgradeButton = majuCard.locator('button:has-text("Upgrade"), button:has-text("Naik Taraf")');
    await expect(upgradeButton).toBeVisible();

    // Should show price
    const price = majuCard.locator('text=/RM|~150/');
    await expect(price).toBeVisible();
  });

  test('E2E-006: Featured tier should have special styling', async ({ page }) => {
    // Asas (featured) should have "Most Popular" or "Pilihan Popular" badge
    const badge = page.locator('text=Most Popular, text=Pilihan Popular').first();
    await expect(badge).toBeVisible();

    // Gemilang (also featured) should have badge
    const gemilangBadge = page.locator('div:has(text=Gemilang) >> text=Most Popular, div:has(text=Gemilang) >> text=Pilihan Popular');
    await expect(gemilangBadge).toBeVisible();
  });

  test('E2E-007: Clicking Asas "Start Free" navigates to zone selection', async ({ page }) => {
    // Click "Start Free" button for Asas
    const asasCard = page.locator('text=Asas').first().locator('..').first();
    const startButton = asasCard.locator('button:has-text("Mulai Percuma"), button:has-text("Start Free")');

    // Set up navigation listener
    const navigationPromise = page.waitForNavigation();
    await startButton.click();

    // Should navigate to zones page
    await navigationPromise;
    expect(page.url()).toMatch(/zones|zone/i);
  });

  test('E2E-008: Learn More button is visible for all tiers', async ({ page }) => {
    // Find all "Learn More" buttons
    const learnMoreButtons = page.locator('button:has-text("Learn More"), button:has-text("Ketahui Lanjut")');

    // Should have 4 (one per tier)
    await expect(learnMoreButtons).toHaveCount(4);

    // Each should be clickable
    for (let i = 0; i < 4; i++) {
      await expect(learnMoreButtons.nth(i)).toBeVisible();
    }
  });

  test('E2E-009: Compare features link is visible', async ({ page }) => {
    // Should see "Compare all features" link
    const compareLink = page.locator('text=Compare all features >>, text=Bandingkan semua ciri >>');
    await expect(compareLink).toBeVisible();
  });

  test('E2E-010: Page should be responsive on mobile', async ({ page }) => {
    // Resize to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Hero section should still be visible
    const headline = page.locator('h1');
    await expect(headline).toBeVisible();

    // Tier cards should stack vertically
    const tierCards = page.locator('[class*="MuiCard"]');
    const firstCard = tierCards.nth(0);
    const secondCard = tierCards.nth(1);

    const firstBox = await firstCard.boundingBox();
    const secondBox = await secondCard.boundingBox();

    // Cards should not be side-by-side (different Y positions)
    expect(secondBox?.y).toBeGreaterThan(firstBox!.y! + firstBox!.height!);
  });

  test('E2E-011: All tier features should be visible', async ({ page }) => {
    // Scroll to tiers
    await page.locator('#tiers-section').scrollIntoViewIfNeeded();

    // Check Asas features
    const asasFeatures = page.locator('text=JAKIM Prayer Times, text=Waktu Solat JAKIM');
    await expect(asasFeatures).toHaveCount(1);

    // Features should have checkmark icons
    const checkIcons = page.locator('[data-testid="CheckCircleIcon"]');
    expect(await checkIcons.count()).toBeGreaterThanOrEqual(4); // At least 1 per tier
  });

  test('E2E-012: Bilingual support - toggle language', async ({ page }) => {
    // Note: Requires language toggle button to be implemented
    // This test is a placeholder for future language switching functionality

    // Initial language should be set
    let headline = page.locator('h1');
    let initialText = await headline.textContent();
    expect(initialText).toBeTruthy();

    // If language toggle exists, test switching
    const langToggle = page.locator('button[aria-label*="Language"], button[title*="Language"]');
    if (await langToggle.isVisible()) {
      await langToggle.click();

      // Text should change
      headline = page.locator('h1');
      const newText = await headline.textContent();
      expect(newText).not.toBe(initialText);
    }
  });

  test('E2E-013: Performance - Landing page should load in < 2 seconds', async ({ page }) => {
    const startTime = Date.now();

    // Navigate and wait for networkidle
    await page.goto(`${BASE_URL}/landing`);
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Should load in under 2 seconds
    expect(loadTime).toBeLessThan(2000);
  });

  test('E2E-014: Accessibility - All buttons should be keyboard accessible', async ({ page }) => {
    // Tab through page - should reach all buttons
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    expect(buttonCount).toBeGreaterThan(0);

    // Focus should be manageable via Tab key
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('E2E-015: CLS (Cumulative Layout Shift) - Layout should be stable', async ({ page }) => {
    // Lighthouse reports CLS - we check that page doesn't jump around
    const heroSection = page.locator('h1').first();

    await expect(heroSection).toBeVisible();

    // Get initial position
    const initialBox = await heroSection.boundingBox();

    // Wait for everything to load
    await page.waitForTimeout(1000);

    // Get final position - should be the same
    const finalBox = await heroSection.boundingBox();

    expect(initialBox?.y).toBe(finalBox?.y);
  });
});
