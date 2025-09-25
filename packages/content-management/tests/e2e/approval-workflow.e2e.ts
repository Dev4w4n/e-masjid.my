/**
 * T014: Approval Workflow E2E Tests
 *
 * Tests the complete approval workflow from admin perspective.
 * These tests MUST fail initially per TDD requirements.
 */
import { test, expect } from '@playwright/test';
import {
  AuthHelper,
  ApprovalDashboardPage,
  ContentCreatePage,
  MyContentPage,
  NotificationHelper,
  TestDataGenerator,
} from './utils';

test.describe('Approval Workflow E2E', () => {
  let authAdmin: AuthHelper;
  let authUser: AuthHelper;
  let approvalDashboard: ApprovalDashboardPage;
  let createPage: ContentCreatePage;
  let myContentPage: MyContentPage;
  let notifications: NotificationHelper;
  let testData: TestDataGenerator;

  test.beforeEach(async ({ page }) => {
    authAdmin = new AuthHelper(page);
    authUser = new AuthHelper(page);
    approvalDashboard = new ApprovalDashboardPage(page);
    createPage = new ContentCreatePage(page);
    myContentPage = new MyContentPage(page);
    notifications = new NotificationHelper(page);
    testData = new TestDataGenerator();
  });

  test.afterEach(async ({ page }) => {
    await authAdmin.logout();
  });

  test('admin should see pending content in approval dashboard', async ({
    page,
  }) => {
    // This WILL fail - approval dashboard not implemented yet

    // First, create content as regular user
    await authUser.loginAsRegularUser();
    await createPage.goto();

    const imageData = testData.generateImageContentData();
    await createPage.fillImageContent(imageData);
    await createPage.submitContent();

    // Switch to admin and check approval dashboard
    await authAdmin.loginAsAdmin();
    await approvalDashboard.goto();

    // Verify pending content appears
    await approvalDashboard.expectPendingContent(imageData.title);

    // Verify content details are shown
    const contentRow = page
      .locator(`[data-testid="content-item"]`)
      .filter({ hasText: imageData.title });
    await expect(
      contentRow.locator('[data-testid="content-type"]')
    ).toContainText('Image');
    await expect(
      contentRow.locator('[data-testid="submitted-by"]')
    ).toBeVisible();
    await expect(
      contentRow.locator('[data-testid="submitted-date"]')
    ).toBeVisible();
  });

  test('admin should approve content successfully', async ({ page }) => {
    // This WILL fail - approval functionality not implemented

    // Create content as user first
    await authUser.loginAsRegularUser();
    await createPage.goto();

    const youtubeData = testData.generateYouTubeContentData();
    await createPage.fillYouTubeContent(youtubeData);
    await createPage.submitContent();

    // Get the created content ID from my content page
    await myContentPage.goto();
    const contentId = await page
      .locator('[data-testid="content-item"]')
      .filter({ hasText: youtubeData.title })
      .getAttribute('data-content-id');

    // Switch to admin and approve
    await authAdmin.loginAsAdmin();
    await approvalDashboard.goto();

    await approvalDashboard.approveContent(contentId!, 'Content looks good!');

    // Verify content is no longer in pending list
    await expect(
      page.locator(`[data-testid="content-${contentId}"]`)
    ).toBeHidden();

    // Switch back to user and verify status change
    await authUser.loginAsRegularUser();
    await myContentPage.goto();

    await myContentPage.expectContentStatus(youtubeData.title, 'approved');
  });

  test('admin should reject content with reason', async ({ page }) => {
    // This WILL fail - rejection functionality not implemented

    // Create content as user
    await authUser.loginAsRegularUser();
    await createPage.goto();

    const imageData = testData.generateImageContentData();
    await createPage.fillImageContent(imageData);
    await createPage.submitContent();

    // Get content ID
    await myContentPage.goto();
    const contentId = await page
      .locator('[data-testid="content-item"]')
      .filter({ hasText: imageData.title })
      .getAttribute('data-content-id');

    // Switch to admin and reject
    await authAdmin.loginAsAdmin();
    await approvalDashboard.goto();

    await approvalDashboard.rejectContent(
      contentId!,
      'Image quality is too low. Please upload a higher resolution image.'
    );

    // Verify content is removed from pending
    await expect(
      page.locator(`[data-testid="content-${contentId}"]`)
    ).toBeHidden();

    // Switch back to user and verify rejection
    await authUser.loginAsRegularUser();
    await myContentPage.goto();

    await myContentPage.expectContentStatus(imageData.title, 'rejected');

    // Verify rejection reason is shown
    const contentRow = page
      .locator('[data-testid="content-item"]')
      .filter({ hasText: imageData.title });
    await expect(
      contentRow.locator('[data-testid="rejection-reason"]')
    ).toContainText('Image quality is too low');
  });

  test('should send real-time notifications on approval', async ({
    page,
    context,
  }) => {
    // This WILL fail - real-time notifications not implemented

    // Open two browser contexts - user and admin
    const userPage = await context.newPage();
    const userAuth = new AuthHelper(userPage);
    const userCreatePage = new ContentCreatePage(userPage);
    const userNotifications = new NotificationHelper(userPage);

    // User creates content
    await userAuth.loginAsRegularUser();
    await userCreatePage.goto();

    const imageData = testData.generateImageContentData();
    await userCreatePage.fillImageContent(imageData);
    await userCreatePage.submitContent();

    // Navigate to user dashboard to watch notifications
    await userPage.goto('/dashboard');

    // Admin approves content
    await authAdmin.loginAsAdmin();
    await approvalDashboard.goto();

    const contentId = await page
      .locator('[data-testid="content-item"]')
      .filter({ hasText: imageData.title })
      .getAttribute('data-content-id');

    await approvalDashboard.approveContent(contentId!, 'Approved!');

    // User should receive real-time notification
    await userNotifications.waitForNotification(
      'Your content has been approved'
    );

    await userPage.close();
  });

  test('should handle bulk approval operations', async ({ page }) => {
    // This WILL fail - bulk operations not implemented

    // Create multiple content items as user
    await authUser.loginAsRegularUser();
    await createPage.goto();

    const contentItems = [
      testData.generateImageContentData(),
      testData.generateYouTubeContentData(),
      testData.generateImageContentData(),
    ];

    for (const data of contentItems) {
      if ('imageFile' in data) {
        await createPage.fillImageContent(data);
      } else {
        await createPage.fillYouTubeContent(data);
      }
      await createPage.submitContent();
      await createPage.goto(); // Reset form
    }

    // Switch to admin and bulk approve
    await authAdmin.loginAsAdmin();
    await approvalDashboard.goto();

    // Select all pending content
    await page.click('[data-testid="select-all-checkbox"]');

    // Bulk approve
    await page.click('[data-testid="bulk-approve-button"]');
    await page.fill(
      '[data-testid="bulk-approval-notes"]',
      'Bulk approval - all look good'
    );
    await page.click('[data-testid="confirm-bulk-approval"]');

    // Verify all content is approved
    await approvalDashboard.expectNoPendingContent();

    // Verify notification count
    await notifications.expectNotificationCount(3); // 3 approval notifications
  });

  test('should enforce masjid-specific approval permissions', async ({
    page,
    context,
  }) => {
    // This WILL fail - permission enforcement not implemented

    // Create content in KLCC masjid as user
    await authUser.loginAsRegularUser();
    await createPage.goto();

    const imageData = testData.generateImageContentData();
    await createPage.fillImageContent(imageData);
    await createPage.submitContent();

    // Try to approve as Putrajaya admin (different masjid)
    const putrajayaPage = await context.newPage();
    const putrajayaAuth = new AuthHelper(putrajayaPage);
    const putrajayaApproval = new ApprovalDashboardPage(putrajayaPage);

    await putrajayaAuth.loginAsAdminPutrajaya();
    await putrajayaApproval.goto();

    // Should not see KLCC content
    await expect(
      putrajayaPage
        .locator('[data-testid="content-item"]')
        .filter({ hasText: imageData.title })
    ).toBeHidden();

    // Should show empty state for Putrajaya admin
    await putrajayaApproval.expectNoPendingContent();

    await putrajayaPage.close();
  });

  test('should show approval history and audit trail', async ({ page }) => {
    // This WILL fail - audit trail not implemented

    // Create and approve content
    await authUser.loginAsRegularUser();
    await createPage.goto();

    const youtubeData = testData.generateYouTubeContentData();
    await createPage.fillYouTubeContent(youtubeData);
    await createPage.submitContent();

    // Get content ID and approve
    await myContentPage.goto();
    const contentId = await page
      .locator('[data-testid="content-item"]')
      .filter({ hasText: youtubeData.title })
      .getAttribute('data-content-id');

    await authAdmin.loginAsAdmin();
    await approvalDashboard.goto();

    await approvalDashboard.approveContent(contentId!, 'Great video content!');

    // View content details to see history
    await page.click(`[data-testid="view-content-${contentId}"]`);

    // Verify approval history is shown
    await expect(
      page.locator('[data-testid="approval-history"]')
    ).toBeVisible();
    await expect(page.locator('[data-testid="history-item"]')).toContainText(
      'Approved'
    );
    await expect(page.locator('[data-testid="history-item"]')).toContainText(
      'Great video content!'
    );
    await expect(page.locator('[data-testid="approved-by"]')).toBeVisible();
    await expect(page.locator('[data-testid="approved-date"]')).toBeVisible();
  });

  test('should handle content resubmission after rejection', async ({
    page,
  }) => {
    // This WILL fail - resubmission workflow not implemented

    // Create and reject content
    await authUser.loginAsRegularUser();
    await createPage.goto();

    const imageData = testData.generateImageContentData();
    await createPage.fillImageContent(imageData);
    await createPage.submitContent();

    // Get content ID
    await myContentPage.goto();
    const originalContentId = await page
      .locator('[data-testid="content-item"]')
      .filter({ hasText: imageData.title })
      .getAttribute('data-content-id');

    // Admin rejects
    await authAdmin.loginAsAdmin();
    await approvalDashboard.goto();

    await approvalDashboard.rejectContent(
      originalContentId!,
      'Please use a different image'
    );

    // User resubmits with changes
    await authUser.loginAsRegularUser();
    await myContentPage.goto();

    await myContentPage.resubmitRejectedContent(imageData.title);

    // Update content
    await page.fill(
      '[data-testid="content-title"]',
      imageData.title + ' - Updated'
    );
    await page.fill(
      '[data-testid="resubmission-notes"]',
      'Updated with better image as requested'
    );
    await page.click('[data-testid="submit-resubmission"]');

    // Verify resubmission appears in admin dashboard
    await authAdmin.loginAsAdmin();
    await approvalDashboard.goto();

    await approvalDashboard.expectPendingContent(
      imageData.title + ' - Updated'
    );

    // Verify resubmission link to original
    const resubmittedRow = page
      .locator('[data-testid="content-item"]')
      .filter({ hasText: imageData.title + ' - Updated' });

    await expect(
      resubmittedRow.locator('[data-testid="resubmission-badge"]')
    ).toContainText('Resubmission');
  });

  test('should validate approval permissions for different user roles', async ({
    page,
    context,
  }) => {
    // This WILL fail - role-based permissions not implemented

    // Create content as user
    await authUser.loginAsRegularUser();
    await createPage.goto();

    const imageData = testData.generateImageContentData();
    await createPage.fillImageContent(imageData);
    await createPage.submitContent();

    // Try to access approval dashboard as regular user
    const regularUserPage = await context.newPage();
    const regularAuth = new AuthHelper(regularUserPage);

    await regularAuth.loginAsRegularUser();
    await regularUserPage.goto('/admin/approvals');

    // Should be redirected or show access denied
    await expect(
      regularUserPage.locator('[data-testid="access-denied"]')
    ).toContainText('You do not have permission to access this page');

    await regularUserPage.close();
  });

  test('should handle approval workflow with content scheduling', async ({
    page,
  }) => {
    // This WILL fail - scheduling not implemented

    // Create scheduled content
    await authUser.loginAsRegularUser();
    await createPage.goto();

    const youtubeData = testData.generateYouTubeContentData();
    await createPage.fillYouTubeContent(youtubeData);

    // Set display schedule
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    await page.fill(
      '[data-testid="display-start"]',
      tomorrow.toISOString().slice(0, 16)
    );
    await page.fill(
      '[data-testid="display-end"]',
      new Date(tomorrow.getTime() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16)
    );

    await createPage.submitContent();

    // Admin approves scheduled content
    await authAdmin.loginAsAdmin();
    await approvalDashboard.goto();

    const contentId = await page
      .locator('[data-testid="content-item"]')
      .filter({ hasText: youtubeData.title })
      .getAttribute('data-content-id');

    await approvalDashboard.approveContent(
      contentId!,
      'Approved for scheduled display'
    );

    // Verify content shows as "scheduled" status
    await authUser.loginAsRegularUser();
    await myContentPage.goto();

    await myContentPage.expectContentStatus(youtubeData.title, 'approved');

    // Verify schedule information is shown
    const contentRow = page
      .locator('[data-testid="content-item"]')
      .filter({ hasText: youtubeData.title });
    await expect(
      contentRow.locator('[data-testid="schedule-info"]')
    ).toBeVisible();
    await expect(
      contentRow.locator('[data-testid="display-start"]')
    ).toBeVisible();
  });
});
