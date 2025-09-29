/**
 * E2E Test Data Helpers for Supabase
 *
 * Utilities to fetch real IDs and data from Supabase before E2E tests run.
 * This ensures tests use actual database data while maintaining isolation.
 */
/**
 * Configuration for E2E test data
 */
export interface E2ETestConfig {
    /** Whether to clean up test data after tests */
    cleanupAfterTests?: boolean;
    /** Prefix for test data to identify it */
    testDataPrefix?: string;
    /** Maximum age of test data before cleanup (in minutes) */
    maxTestDataAge?: number;
}
/**
 * Test data that's fetched from Supabase for E2E tests
 */
export interface E2ETestData {
    testUser: {
        id: string;
        email: string;
        accessToken: string;
    };
    masjid: {
        id: string;
        name: string;
        address: any;
    };
    displays: Array<{
        id: string;
        name: string;
        isActive: boolean;
    }>;
    content: Array<{
        id: string;
        title: string;
        type: string;
        status: string;
        url: string;
    }>;
    prayerTimes: {
        id: string;
        date: string;
        fajr: string;
        dhuhr: string;
        asr: string;
        maghrib: string;
        isha: string;
    } | null;
}
/**
 * E2E Test Data Manager
 *
 * Handles fetching, creating, and cleaning up test data for E2E tests
 */
export declare class E2ETestDataManager {
    private supabase;
    private serviceRoleClient;
    private config;
    constructor(config?: E2ETestConfig);
    /**
     * Set up test data before running E2E tests
     */
    setupTestData(): Promise<E2ETestData>;
    /**
     * Clean up test data after E2E tests
     */
    cleanupTestData(testData?: E2ETestData): Promise<void>;
    /**
     * Create or get a test user for E2E tests
     */
    private createOrGetTestUser;
    /**
     * Get or create a test masjid
     */
    private getOrCreateTestMasjid;
    /**
     * Get or create test displays
     */
    private getOrCreateTestDisplays;
    /**
     * Get or create test content
     */
    private getOrCreateTestContent;
    /**
     * Get prayer times data
     */
    private getPrayerTimes;
    /**
     * Clean up old test data
     */
    private cleanupOldTestData;
    /**
     * Clean up specific test data
     */
    private cleanupSpecificTestData;
}
/**
 * Global setup/teardown functions for E2E test frameworks
 */
export declare class E2ETestSetup {
    private static dataManager;
    private static testData;
    /**
     * Setup for Playwright global setup
     */
    static playwrightGlobalSetup(config?: E2ETestConfig): Promise<void>;
    /**
     * Teardown for Playwright global teardown
     */
    static playwrightGlobalTeardown(): Promise<void>;
    /**
     * Get test data in individual tests
     */
    static getTestData(): E2ETestData;
}
/**
 * Helper functions for common E2E test scenarios
 */
export declare class E2ETestHelpers {
    /**
     * Get authentication headers for API requests
     */
    static getAuthHeaders(testData: E2ETestData): Record<string, string>;
    /**
     * Wait for content to be displayed (for display flow tests)
     */
    static waitForContentDisplay(page: any, contentTitle: string, timeout?: number): Promise<void>;
    /**
     * Wait for prayer times to load
     */
    static waitForPrayerTimes(page: any, timeout?: number): Promise<void>;
    /**
     * Simulate network issues for resilience testing
     */
    static simulateNetworkIssues(page: any, duration?: number): Promise<void>;
    /**
     * Check if display is showing online status
     */
    static verifyDisplayOnline(page: any): Promise<boolean>;
}
/**
 * Type-safe environment variable helper
 */
export declare function getRequiredEnvVar(name: string): string;
/**
 * Validate E2E test environment
 */
export declare function validateE2EEnvironment(): void;
//# sourceMappingURL=e2e-test-helpers.d.ts.map