/**
 * Global E2E Test Teardown
 *
 * Cleans up test environment after E2E tests complete.
 */
import { FullConfig } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting E2E test cleanup...');

  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL || 'http://localhost:54321',
      process.env.VITE_SUPABASE_ANON_KEY || 'test-anon-key'
    );

    // Clean up any test-created content
    console.log('🗑️  Cleaning up test content...');

    const { error: cleanupError } = await supabase
      .from('display_content')
      .delete()
      .like('title', 'E2E Test%'); // Delete content created during tests

    if (cleanupError) {
      console.warn(
        '⚠️  Warning: Failed to clean up test content:',
        cleanupError.message
      );
    }

    // Clear test context
    delete process.env.E2E_TEST_CONTEXT;

    console.log('✅ E2E test cleanup completed');
  } catch (error) {
    console.error('❌ E2E test cleanup failed:', error);
    // Don't fail the process, just warn
  }
}

export default globalTeardown;
