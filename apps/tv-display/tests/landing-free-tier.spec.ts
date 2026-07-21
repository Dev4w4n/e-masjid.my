import { test, expect } from '@playwright/test';

test.describe('TV Landing - Free Tier Discovery (US1)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('shows Asas tier and free-tier CTA above the fold', async ({ page }) => {
    await expect(page.locator('text=Asas').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Mulai Percuma|Start Free/ }).first()).toBeVisible();
  });

  test('opens zone selection flow from primary CTA without authentication', async ({ page }) => {
    const cta = page.getByRole('button', { name: /Mulai Percuma|Start Free/ }).first();
    await cta.click();

    await expect(page.locator('#zone-modal-title')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Cari Kawasan Anda|Find Your Zone/ })).toBeVisible();
  });

  test('shows tier comparison details when user expands comparison section', async ({ page }) => {
    const compareToggle = page.getByRole('button', {
      name: /Bandingkan Semua Ciri|Compare All Features/,
    });

    await compareToggle.click();

    await expect(page.getByText(/Number of Displays|Bilangan Skrin Paparan/)).toBeVisible();
    await expect(page.getByText(/Support Level|Tahap Sokongan/)).toBeVisible();
    await expect(page.getByText(/Asas \(Free\)|Asas \(Percuma\)/)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Gemilang' })).toBeVisible();
  });

  test('shows FAQ section and allows expanding common questions', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Soalan Lazim|Frequently Asked Questions/ }),
    ).toBeVisible();

    const firstFaq = page
      .getByText(/Apakah perbezaan antara Asas dan Maju\?|What's the difference between Asas and Maju\?/) 
      .first();
    await expect(firstFaq).toBeVisible();
    await firstFaq.click();

    await expect(
      page.getByText(/Asas adalah percuma|Asas is free/, { exact: false }),
    ).toBeVisible();
  });
});
