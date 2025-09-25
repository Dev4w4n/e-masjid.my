/**
 * T013: Content Creation E2E Tests
 *
 * Tests the complete content creation workflow.
 * These tests MUST fail initially per TDD requirements.
 */
import { test, expect } from '@playwright/test';
import {
  AuthHelper,
  ContentCreatePage,
  MyContentPage,
  TestDataGenerator,
  AccessibilityHelper,
} from './utils';

test.describe('Content Creation E2E', () => {
  let auth: AuthHelper;
  let createPage: ContentCreatePage;
  let myContentPage: MyContentPage;
  let testData: TestDataGenerator;
  let accessibility: AccessibilityHelper;

  test.beforeEach(async ({ page }) => {
    auth = new AuthHelper(page);
    createPage = new ContentCreatePage(page);
    myContentPage = new MyContentPage(page);
    testData = new TestDataGenerator();
    accessibility = new AccessibilityHelper(page);

    // Login as regular user for content creation
    await auth.loginAsRegularUser();
  });

  test.afterEach(async ({ page }) => {
    await auth.logout();
  });

  test('should create image content successfully', async ({ page }) => {
    // This WILL fail - content creation form not implemented yet
    const imageData = testData.generateImageContentData();

    // Navigate to content creation page
    await createPage.goto();

    // Verify page loads correctly
    await expect(page.locator('h1')).toContainText('Create Content');

    // Fill image content form
    await createPage.fillImageContent(imageData);

    // Submit content
    await createPage.submitContent();

    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      'Content created successfully'
    );

    // Navigate to my content page
    await myContentPage.goto();

    // Verify content appears with pending status
    await myContentPage.expectContentStatus(imageData.title, 'pending');
  });

  test('should create YouTube content successfully', async ({ page }) => {
    // This WILL fail - YouTube content form not implemented
    const youtubeData = testData.generateYouTubeContentData();

    // Navigate to content creation page
    await createPage.goto();

    // Fill YouTube content form
    await createPage.fillYouTubeContent(youtubeData);

    // Submit content
    await createPage.submitContent();

    // Verify success and navigate to my content
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await myContentPage.goto();

    // Verify content appears with pending status
    await myContentPage.expectContentStatus(youtubeData.title, 'pending');
  });

  test('should validate required fields', async ({ page }) => {
    // This WILL fail - form validation not implemented
    await createPage.goto();

    // Try to submit empty form
    await createPage.submitContent();

    // Should show validation errors
    await createPage.expectValidationError('Title is required');
    await createPage.expectValidationError('Content type is required');
  });

  test('should validate title length constraints', async ({ page }) => {
    // This WILL fail - length validation not implemented
    await createPage.goto();

    // Test minimum length
    await createPage.fillImageContent({
      title: 'AB', // Too short
      imageFile: 'tests/fixtures/test-image.jpg',
    });

    await createPage.submitContent();
    await createPage.expectValidationError(
      'Title must be at least 3 characters'
    );

    // Test maximum length
    await createPage.fillImageContent({
      title: 'A'.repeat(201), // Too long
      imageFile: 'tests/fixtures/test-image.jpg',
    });

    await createPage.submitContent();
    await createPage.expectValidationError(
      'Title must be less than 200 characters'
    );
  });

  test('should validate YouTube URL format', async ({ page }) => {
    // This WILL fail - URL validation not implemented
    await createPage.goto();

    const invalidData = {
      title: 'Test YouTube Content',
      youtubeUrl: 'https://example.com/not-youtube', // Invalid URL
    };

    await createPage.fillYouTubeContent(invalidData);
    await createPage.submitContent();

    await createPage.expectValidationError('Invalid YouTube URL format');
  });

  test('should validate image file constraints', async ({ page }) => {
    // This WILL fail - file validation not implemented
    await createPage.goto();

    // Try uploading non-image file
    await page.setInputFiles(
      '[data-testid="image-upload"]',
      'tests/fixtures/test-document.txt'
    );

    await expect(page.locator('[data-testid="file-error"]')).toContainText(
      'File must be an image'
    );
  });

  test('should handle image file size limits', async ({ page }) => {
    // This WILL fail - size validation not implemented
    await createPage.goto();

    // Mock large file upload (would need actual large file in real test)
    await page.evaluate(() => {
      const fileInput = document.querySelector(
        '[data-testid="image-upload"]'
      ) as HTMLInputElement;
      if (fileInput) {
        const largeFile = new File(
          ['x'.repeat(11 * 1024 * 1024)],
          'large.jpg',
          {
            type: 'image/jpeg',
          }
        );
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(largeFile);
        fileInput.files = dataTransfer.files;
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    await expect(page.locator('[data-testid="file-error"]')).toContainText(
      'File size must be less than 10MB'
    );
  });

  test('should preview image before submission', async ({ page }) => {
    // This WILL fail - image preview not implemented
    await createPage.goto();

    const imageData = testData.generateImageContentData();
    await createPage.fillImageContent(imageData);

    // Verify image preview appears
    await expect(page.locator('[data-testid="image-preview"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="image-preview"] img')
    ).toHaveAttribute('src');
  });

  test('should preview YouTube video before submission', async ({ page }) => {
    // This WILL fail - YouTube preview not implemented
    await createPage.goto();

    const youtubeData = testData.generateYouTubeContentData();
    await createPage.fillYouTubeContent(youtubeData);

    // Verify YouTube preview appears
    await expect(page.locator('[data-testid="youtube-preview"]')).toBeVisible();
    await expect(page.locator('[data-testid="youtube-title"]')).toBeVisible();
  });

  test('should auto-save draft content', async ({ page }) => {
    // This WILL fail - auto-save not implemented
    await createPage.goto();

    const imageData = testData.generateImageContentData();

    // Fill form partially
    await page.fill('[data-testid="content-title"]', imageData.title);
    await page.fill(
      '[data-testid="content-description"]',
      imageData.description!
    );

    // Wait for auto-save
    await page.waitForSelector('[data-testid="auto-save-indicator"]', {
      timeout: 3000,
    });
    await expect(
      page.locator('[data-testid="auto-save-indicator"]')
    ).toContainText('Draft saved');

    // Refresh page and verify draft is restored
    await page.reload();
    await createPage.goto();

    await expect(page.locator('[data-testid="content-title"]')).toHaveValue(
      imageData.title
    );
    await expect(
      page.locator('[data-testid="content-description"]')
    ).toHaveValue(imageData.description!);
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // This WILL fail - error handling not implemented
    await createPage.goto();

    // Block network requests
    await page.route('**/api/**', route => route.abort());

    const imageData = testData.generateImageContentData();
    await createPage.fillImageContent(imageData);

    await createPage.submitContent();

    // Should show network error message
    await expect(page.locator('[data-testid="network-error"]')).toContainText(
      'Network error. Please try again.'
    );
  });

  test('should be keyboard accessible', async ({ page }) => {
    // This WILL fail - accessibility not implemented
    await createPage.goto();

    // Test keyboard navigation
    await accessibility.checkKeyboardNavigation();

    // Test ARIA labels
    await accessibility.checkAriaLabels();

    // Test form submission with keyboard
    await page.keyboard.press('Tab'); // Focus first input
    await page.keyboard.type('Test Content Title');

    // Navigate to submit button and press Enter
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    // Should show validation error (no content type selected)
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('should support multiple languages', async ({ page }) => {
    // This WILL fail - i18n not implemented
    await createPage.goto();

    // Switch to Bahasa Malaysia
    await page.click('[data-testid="language-toggle"]');
    await page.click('[data-testid="language-ms"]');

    // Verify UI switches to Malay
    await expect(page.locator('h1')).toContainText('Cipta Kandungan');
    await expect(page.locator('[data-testid="title-label"]')).toContainText(
      'Tajuk'
    );

    // Test creating content in Malay
    const malayData = {
      title: 'Kandungan Ujian E2E',
      description: 'Penerangan kandungan dalam Bahasa Malaysia',
      imageFile: 'tests/fixtures/test-image.jpg',
    };

    await createPage.fillImageContent(malayData);
    await createPage.submitContent();

    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      'Kandungan berjaya dicipta'
    );
  });

  test('should handle concurrent user sessions', async ({ page, context }) => {
    // This WILL fail - concurrent session handling not implemented
    await createPage.goto();

    const imageData = testData.generateImageContentData();
    await createPage.fillImageContent(imageData);

    // Open second tab with same user
    const secondPage = await context.newPage();
    const secondAuth = new AuthHelper(secondPage);
    const secondCreatePage = new ContentCreatePage(secondPage);

    await secondAuth.loginAsRegularUser();
    await secondCreatePage.goto();

    // Fill same content in second tab
    await secondCreatePage.fillImageContent({
      ...imageData,
      title: imageData.title + ' - Second Tab',
    });

    // Submit from first tab
    await createPage.submitContent();
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

    // Submit from second tab
    await secondCreatePage.submitContent();
    await expect(
      secondPage.locator('[data-testid="success-message"]')
    ).toBeVisible();

    // Verify both contents were created
    await myContentPage.goto();
    await myContentPage.expectContentStatus(imageData.title, 'pending');
    await myContentPage.expectContentStatus(
      imageData.title + ' - Second Tab',
      'pending'
    );

    await secondPage.close();
  });
});
