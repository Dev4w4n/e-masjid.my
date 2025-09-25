/**
 * E2E Test Utilities and Fixtures
 *
 * Provides utilities for E2E tests with real database IDs.
 * Constitutional requirement: Retrieve real IDs during beforeEach.
 */
import { Page, expect } from '@playwright/test';
import type { TestContext } from './global-setup';

export function getTestContext(): TestContext {
  const contextStr = process.env.E2E_TEST_CONTEXT;
  if (!contextStr) {
    throw new Error(
      'E2E test context not available. Global setup may have failed.'
    );
  }
  return JSON.parse(contextStr);
}

/**
 * Authentication utilities
 */
export class AuthHelper {
  constructor(private page: Page) {}

  async loginAsAdmin(): Promise<void> {
    const context = getTestContext();
    await this.loginWithToken(context.authTokens.admin);
  }

  async loginAsRegularUser(): Promise<void> {
    const context = getTestContext();
    await this.loginWithToken(context.authTokens.regularUser);
  }

  async loginAsAdminPutrajaya(): Promise<void> {
    const context = getTestContext();
    await this.loginWithToken(context.authTokens.adminPutrajaya);
  }

  private async loginWithToken(token: string): Promise<void> {
    // Set authentication token in localStorage
    await this.page.evaluate(authToken => {
      localStorage.setItem(
        'supabase.auth.token',
        JSON.stringify({
          access_token: authToken,
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'mock-refresh-token',
        })
      );
    }, token);

    // Reload page to apply authentication
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
  }

  async logout(): Promise<void> {
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await this.page.reload();
  }
}

/**
 * Content Management Page Objects
 */
export class ContentCreatePage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/content/create');
    await this.page.waitForLoadState('networkidle');
  }

  async fillImageContent(data: {
    title: string;
    description?: string;
    imageFile?: string;
  }): Promise<void> {
    // Select image content type
    await this.page.click('[data-testid="content-type-image"]');

    // Fill title
    await this.page.fill('[data-testid="content-title"]', data.title);

    // Fill description if provided
    if (data.description) {
      await this.page.fill(
        '[data-testid="content-description"]',
        data.description
      );
    }

    // Upload image if provided
    if (data.imageFile) {
      await this.page.setInputFiles(
        '[data-testid="image-upload"]',
        data.imageFile
      );
      await this.page.waitForSelector('[data-testid="image-preview"]');
    }
  }

  async fillYouTubeContent(data: {
    title: string;
    description?: string;
    youtubeUrl: string;
  }): Promise<void> {
    // Select YouTube content type
    await this.page.click('[data-testid="content-type-youtube"]');

    // Fill title
    await this.page.fill('[data-testid="content-title"]', data.title);

    // Fill YouTube URL
    await this.page.fill('[data-testid="youtube-url"]', data.youtubeUrl);

    // Wait for URL validation
    await this.page.waitForSelector('[data-testid="youtube-preview"]', {
      timeout: 5000,
    });

    // Fill description if provided
    if (data.description) {
      await this.page.fill(
        '[data-testid="content-description"]',
        data.description
      );
    }
  }

  async submitContent(): Promise<void> {
    await this.page.click('[data-testid="submit-content"]');

    // Wait for success message
    await this.page.waitForSelector('[data-testid="success-message"]');
  }

  async expectValidationError(message: string): Promise<void> {
    await expect(
      this.page.locator('[data-testid="error-message"]')
    ).toContainText(message);
  }
}

export class ApprovalDashboardPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/admin/approvals');
    await this.page.waitForLoadState('networkidle');
  }

  async approveContent(contentId: string, notes?: string): Promise<void> {
    // Find content row
    const contentRow = this.page.locator(
      `[data-testid="content-${contentId}"]`
    );

    // Click approve button
    await contentRow.locator('[data-testid="approve-button"]').click();

    // Fill approval notes if provided
    if (notes) {
      await this.page.fill('[data-testid="approval-notes"]', notes);
    }

    // Confirm approval
    await this.page.click('[data-testid="confirm-approval"]');

    // Wait for success notification
    await this.page.waitForSelector('[data-testid="approval-success"]');
  }

  async rejectContent(contentId: string, reason: string): Promise<void> {
    // Find content row
    const contentRow = this.page.locator(
      `[data-testid="content-${contentId}"]`
    );

    // Click reject button
    await contentRow.locator('[data-testid="reject-button"]').click();

    // Fill rejection reason
    await this.page.fill('[data-testid="rejection-reason"]', reason);

    // Confirm rejection
    await this.page.click('[data-testid="confirm-rejection"]');

    // Wait for success notification
    await this.page.waitForSelector('[data-testid="rejection-success"]');
  }

  async expectPendingContent(title: string): Promise<void> {
    await expect(
      this.page
        .locator('[data-testid="pending-content"]')
        .filter({ hasText: title })
    ).toBeVisible();
  }

  async expectNoPendingContent(): Promise<void> {
    await expect(
      this.page.locator('[data-testid="no-pending-content"]')
    ).toBeVisible();
  }
}

export class MyContentPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/content/my-content');
    await this.page.waitForLoadState('networkidle');
  }

  async expectContentStatus(
    title: string,
    status: 'pending' | 'approved' | 'rejected'
  ): Promise<void> {
    const contentRow = this.page
      .locator('[data-testid="content-item"]')
      .filter({ hasText: title });
    await expect(
      contentRow.locator(`[data-testid="status-${status}"]`)
    ).toBeVisible();
  }

  async editContent(title: string): Promise<void> {
    const contentRow = this.page
      .locator('[data-testid="content-item"]')
      .filter({ hasText: title });
    await contentRow.locator('[data-testid="edit-button"]').click();
    await this.page.waitForURL('**/content/edit/**');
  }

  async deleteContent(title: string): Promise<void> {
    const contentRow = this.page
      .locator('[data-testid="content-item"]')
      .filter({ hasText: title });
    await contentRow.locator('[data-testid="delete-button"]').click();

    // Confirm deletion
    await this.page.click('[data-testid="confirm-delete"]');

    // Wait for success notification
    await this.page.waitForSelector('[data-testid="delete-success"]');
  }

  async resubmitRejectedContent(title: string): Promise<void> {
    const contentRow = this.page
      .locator('[data-testid="content-item"]')
      .filter({ hasText: title });
    await contentRow.locator('[data-testid="resubmit-button"]').click();
    await this.page.waitForURL('**/content/resubmit/**');
  }
}

/**
 * Real-time notification utilities
 */
export class NotificationHelper {
  constructor(private page: Page) {}

  async waitForNotification(message: string, timeout = 5000): Promise<void> {
    await this.page.waitForSelector(`[data-testid="notification"]`, {
      timeout,
    });
    await expect(
      this.page.locator('[data-testid="notification"]')
    ).toContainText(message);
  }

  async expectNotificationCount(count: number): Promise<void> {
    if (count === 0) {
      await expect(
        this.page.locator('[data-testid="notification-badge"]')
      ).toBeHidden();
    } else {
      await expect(
        this.page.locator('[data-testid="notification-badge"]')
      ).toContainText(count.toString());
    }
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.page.click('[data-testid="notifications-button"]');
    await this.page.click('[data-testid="mark-all-read"]');
    await this.page.waitForSelector('[data-testid="no-notifications"]');
  }
}

/**
 * Test data generators using real IDs
 */
export class TestDataGenerator {
  private context: TestContext;

  constructor() {
    this.context = getTestContext();
  }

  generateImageContentData() {
    return {
      title: `E2E Test Image - ${Date.now()}`,
      description: 'Test image content for E2E testing',
      imageFile: 'tests/fixtures/test-image.jpg',
    };
  }

  generateYouTubeContentData() {
    return {
      title: `E2E Test YouTube - ${Date.now()}`,
      description: 'Test YouTube content for E2E testing',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    };
  }

  getRealIds() {
    return this.context.realIds;
  }

  getAuthTokens() {
    return this.context.authTokens;
  }
}

/**
 * Accessibility testing utilities
 */
export class AccessibilityHelper {
  constructor(private page: Page) {}

  async checkKeyboardNavigation(): Promise<void> {
    // Tab through form elements
    await this.page.keyboard.press('Tab');
    await expect(this.page.locator(':focus')).toBeVisible();

    // Continue tabbing and verify focus is visible
    for (let i = 0; i < 5; i++) {
      await this.page.keyboard.press('Tab');
      const focused = this.page.locator(':focus');
      if ((await focused.count()) > 0) {
        await expect(focused).toBeVisible();
      }
    }
  }

  async checkAriaLabels(): Promise<void> {
    // Check that buttons have accessible names
    const buttons = this.page.locator('button');
    const buttonCount = await buttons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();

      expect(ariaLabel || text).toBeTruthy();
    }
  }
}
