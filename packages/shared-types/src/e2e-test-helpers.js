/**
 * E2E Test Data Helpers for Supabase
 *
 * Utilities to fetch real IDs and data from Supabase before E2E tests run.
 * This ensures tests use actual database data while maintaining isolation.
 */
import { createClient } from "@supabase/supabase-js";
// Environment variables for Supabase connection
const SUPABASE_URL = process.env.SUPABASE_URL || "http://127.0.0.1:54321";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
/**
 * E2E Test Data Manager
 *
 * Handles fetching, creating, and cleaning up test data for E2E tests
 */
export class E2ETestDataManager {
    constructor(config = {}) {
        this.config = {
            cleanupAfterTests: true,
            testDataPrefix: "e2e-test",
            maxTestDataAge: 60,
            ...config,
        };
        this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        this.serviceRoleClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    }
    /**
     * Set up test data before running E2E tests
     */
    async setupTestData() {
        console.log("🔧 Setting up E2E test data...");
        try {
            // Clean up old test data first
            await this.cleanupOldTestData();
            // Create or get test user
            const testUser = await this.createOrGetTestUser();
            // Get or create test masjid
            const masjid = await this.getOrCreateTestMasjid(testUser.id);
            // Get or create test displays
            const displays = await this.getOrCreateTestDisplays(masjid.id);
            // Get or create test content
            const content = await this.getOrCreateTestContent(masjid.id, testUser.id);
            // Get prayer times data
            const prayerTimes = await this.getPrayerTimes(masjid.id);
            const testData = {
                testUser,
                masjid,
                displays,
                content,
                prayerTimes,
            };
            console.log("✅ E2E test data setup complete");
            console.log(`📊 Test data summary:
        - User: ${testUser.email}
        - Masjid: ${masjid.name}
        - Displays: ${displays.length}
        - Content items: ${content.length}
        - Prayer times: ${prayerTimes ? "Available" : "Not available"}`);
            return testData;
        }
        catch (error) {
            console.error("❌ Failed to setup E2E test data:", error);
            throw error;
        }
    }
    /**
     * Clean up test data after E2E tests
     */
    async cleanupTestData(testData) {
        if (!this.config.cleanupAfterTests) {
            console.log("🔧 Skipping test data cleanup (disabled in config)");
            return;
        }
        console.log("🧹 Cleaning up E2E test data...");
        try {
            // Clean up by prefix and age
            await this.cleanupOldTestData();
            // If specific test data provided, clean that up too
            if (testData) {
                await this.cleanupSpecificTestData(testData);
            }
            console.log("✅ E2E test data cleanup complete");
        }
        catch (error) {
            console.error("❌ Failed to cleanup E2E test data:", error);
            // Don't throw here - cleanup failures shouldn't fail tests
        }
    }
    /**
     * Create or get a test user for E2E tests
     */
    async createOrGetTestUser() {
        const testEmail = `${this.config.testDataPrefix}-user-${Date.now()}@example.com`;
        // Try to sign up a new user
        const { data: authData, error: signUpError } = await this.supabase.auth.signUp({
            email: testEmail,
            password: "test-password-123",
        });
        if (signUpError && !signUpError.message.includes("already registered")) {
            throw new Error(`Failed to create test user: ${signUpError.message}`);
        }
        // If user already exists, sign in
        if (signUpError?.message.includes("already registered")) {
            const { data: signInData, error: signInError } = await this.supabase.auth.signInWithPassword({
                email: testEmail,
                password: "test-password-123",
            });
            if (signInError) {
                throw new Error(`Failed to sign in test user: ${signInError.message}`);
            }
            if (!signInData.user || !signInData.session) {
                throw new Error("No user or session returned from sign in");
            }
            return {
                id: signInData.user.id,
                email: signInData.user.email,
                accessToken: signInData.session.access_token,
            };
        }
        if (!authData.user || !authData.session) {
            throw new Error("No user or session returned from sign up");
        }
        return {
            id: authData.user.id,
            email: authData.user.email,
            accessToken: authData.session.access_token,
        };
    }
    /**
     * Get or create a test masjid
     */
    async getOrCreateTestMasjid(createdBy) {
        const testMasjidName = `${this.config.testDataPrefix}-masjid-${Date.now()}`;
        // Check if test masjid already exists
        const { data: existingMasjids } = await this.serviceRoleClient
            .from("masjids")
            .select("id, name, address")
            .like("name", `${this.config.testDataPrefix}%`)
            .limit(1);
        if (existingMasjids && existingMasjids.length > 0) {
            const masjid = existingMasjids[0];
            if (!masjid) {
                throw new Error("Unexpected error: masjid data is undefined");
            }
            return {
                id: masjid.id,
                name: masjid.name,
                address: masjid.address,
            };
        }
        // Create a new test masjid
        const { data: newMasjid, error } = await this.serviceRoleClient
            .from("masjids")
            .insert({
            name: testMasjidName,
            email: `admin@${testMasjidName.toLowerCase().replace(/\s+/g, "")}.test`,
            phone_number: "+60123456789",
            description: "Test masjid for E2E testing",
            address: {
                address_line_1: "123 Test Street",
                city: "Test City",
                state: "Kuala Lumpur",
                postcode: "50000",
                country: "MYS",
            },
            status: "active",
            created_by: createdBy,
        })
            .select("id, name, address")
            .single();
        if (error) {
            throw new Error(`Failed to create test masjid: ${error.message}`);
        }
        return {
            id: newMasjid.id,
            name: newMasjid.name,
            address: newMasjid.address,
        };
    }
    /**
     * Get or create test displays
     */
    async getOrCreateTestDisplays(masjidId) {
        // Check for existing test displays
        const { data: existingDisplays } = await this.serviceRoleClient
            .from("tv_displays")
            .select("id, display_name, is_active")
            .eq("masjid_id", masjidId)
            .like("display_name", `${this.config.testDataPrefix}%`);
        if (existingDisplays && existingDisplays.length > 0) {
            return existingDisplays.map((display) => ({
                id: display.id,
                name: display.display_name,
                isActive: display.is_active,
            }));
        }
        // Create test displays
        const displaysToCreate = [
            {
                masjid_id: masjidId,
                display_name: `${this.config.testDataPrefix}-display-main`,
                description: "Main display for E2E testing",
                location_description: "Main Hall",
                is_active: true,
            },
            {
                masjid_id: masjidId,
                display_name: `${this.config.testDataPrefix}-display-entrance`,
                description: "Entrance display for E2E testing",
                location_description: "Entrance",
                is_active: true,
            },
        ];
        const { data: newDisplays, error } = await this.serviceRoleClient
            .from("tv_displays")
            .insert(displaysToCreate)
            .select("id, display_name, is_active");
        if (error) {
            throw new Error(`Failed to create test displays: ${error.message}`);
        }
        return newDisplays.map((display) => ({
            id: display.id,
            name: display.display_name,
            isActive: display.is_active,
        }));
    }
    /**
     * Get or create test content
     */
    async getOrCreateTestContent(masjidId, submittedBy) {
        // Check for existing test content
        const { data: existingContent } = await this.serviceRoleClient
            .from("display_content")
            .select("id, title, type, status, url")
            .eq("masjid_id", masjidId)
            .like("title", `${this.config.testDataPrefix}%`);
        if (existingContent && existingContent.length > 0) {
            return existingContent.map((content) => ({
                id: content.id,
                title: content.title,
                type: content.type,
                status: content.status,
                url: content.url,
            }));
        }
        // Create test content
        const today = new Date().toISOString().split("T")[0];
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        const endDate = futureDate.toISOString().split("T")[0];
        const contentToCreate = [
            {
                masjid_id: masjidId,
                title: `${this.config.testDataPrefix}-image-content`,
                description: "Test image content for E2E testing",
                type: "image",
                url: "https://picsum.photos/1920/1080",
                status: "active",
                start_date: today,
                end_date: endDate,
                submitted_by: submittedBy,
                approved_by: submittedBy,
                approved_at: new Date().toISOString(),
            },
            {
                masjid_id: masjidId,
                title: `${this.config.testDataPrefix}-youtube-content`,
                description: "Test YouTube content for E2E testing",
                type: "youtube_video",
                url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                status: "active",
                start_date: today,
                end_date: endDate,
                submitted_by: submittedBy,
                approved_by: submittedBy,
                approved_at: new Date().toISOString(),
            },
            {
                masjid_id: masjidId,
                title: `${this.config.testDataPrefix}-announcement`,
                description: "Test announcement for E2E testing",
                type: "text_announcement",
                url: "https://example.com/announcement",
                status: "active",
                start_date: today,
                end_date: endDate,
                submitted_by: submittedBy,
                approved_by: submittedBy,
                approved_at: new Date().toISOString(),
            },
        ];
        const { data: newContent, error } = await this.serviceRoleClient
            .from("display_content")
            .insert(contentToCreate)
            .select("id, title, type, status, url");
        if (error) {
            throw new Error(`Failed to create test content: ${error.message}`);
        }
        return newContent.map((content) => ({
            id: content.id,
            title: content.title,
            type: content.type,
            status: content.status,
            url: content.url,
        }));
    }
    /**
     * Get prayer times data
     */
    async getPrayerTimes(masjidId) {
        const today = new Date().toISOString().split("T")[0];
        const { data: prayerTimes } = await this.serviceRoleClient
            .from("prayer_times")
            .select("id, prayer_date, fajr_time, dhuhr_time, asr_time, maghrib_time, isha_time")
            .eq("masjid_id", masjidId)
            .eq("prayer_date", today)
            .single();
        if (!prayerTimes) {
            // Create prayer times for today if they don't exist
            const { data: newPrayerTimes, error } = await this.serviceRoleClient
                .from("prayer_times")
                .insert({
                masjid_id: masjidId,
                prayer_date: today,
                fajr_time: "05:30:00",
                sunrise_time: "07:15:00",
                dhuhr_time: "13:15:00",
                asr_time: "16:45:00",
                maghrib_time: "19:30:00",
                isha_time: "20:45:00",
                source: "MANUAL_ENTRY",
            })
                .select("id, prayer_date, fajr_time, dhuhr_time, asr_time, maghrib_time, isha_time")
                .single();
            if (error) {
                console.warn("Failed to create prayer times for testing:", error.message);
                return null;
            }
            return {
                id: newPrayerTimes.id,
                date: newPrayerTimes.prayer_date,
                fajr: newPrayerTimes.fajr_time,
                dhuhr: newPrayerTimes.dhuhr_time,
                asr: newPrayerTimes.asr_time,
                maghrib: newPrayerTimes.maghrib_time,
                isha: newPrayerTimes.isha_time,
            };
        }
        return {
            id: prayerTimes.id,
            date: prayerTimes.prayer_date,
            fajr: prayerTimes.fajr_time,
            dhuhr: prayerTimes.dhuhr_time,
            asr: prayerTimes.asr_time,
            maghrib: prayerTimes.maghrib_time,
            isha: prayerTimes.isha_time,
        };
    }
    /**
     * Clean up old test data
     */
    async cleanupOldTestData() {
        const cutoffTime = new Date();
        cutoffTime.setMinutes(cutoffTime.getMinutes() - this.config.maxTestDataAge);
        const cutoffTimestamp = cutoffTime.toISOString();
        try {
            // Clean up old display content
            await this.serviceRoleClient
                .from("display_content")
                .delete()
                .like("title", `${this.config.testDataPrefix}%`)
                .lt("created_at", cutoffTimestamp);
            // Clean up old TV displays
            await this.serviceRoleClient
                .from("tv_displays")
                .delete()
                .like("display_name", `${this.config.testDataPrefix}%`)
                .lt("created_at", cutoffTimestamp);
            // Clean up old masjids (this will cascade delete related data)
            await this.serviceRoleClient
                .from("masjids")
                .delete()
                .like("name", `${this.config.testDataPrefix}%`)
                .lt("created_at", cutoffTimestamp);
            console.log(`🧹 Cleaned up test data older than ${this.config.maxTestDataAge} minutes`);
        }
        catch (error) {
            console.warn("⚠️ Some test data cleanup failed:", error);
            // Don't throw - partial cleanup is better than none
        }
    }
    /**
     * Clean up specific test data
     */
    async cleanupSpecificTestData(testData) {
        try {
            // Delete content first (foreign key constraints)
            for (const content of testData.content) {
                await this.serviceRoleClient
                    .from("display_content")
                    .delete()
                    .eq("id", content.id);
            }
            // Delete displays
            for (const display of testData.displays) {
                await this.serviceRoleClient
                    .from("tv_displays")
                    .delete()
                    .eq("id", display.id);
            }
            // Delete masjid (will cascade to prayer times, etc.)
            await this.serviceRoleClient
                .from("masjids")
                .delete()
                .eq("id", testData.masjid.id);
            console.log("🗑️ Cleaned up specific test data");
        }
        catch (error) {
            console.warn("⚠️ Specific test data cleanup failed:", error);
        }
    }
}
/**
 * Global setup/teardown functions for E2E test frameworks
 */
export class E2ETestSetup {
    /**
     * Setup for Playwright global setup
     */
    static async playwrightGlobalSetup(config) {
        this.dataManager = new E2ETestDataManager(config);
        this.testData = await this.dataManager.setupTestData();
        // Store test data in global context for tests to access
        global.__E2E_TEST_DATA__ = this.testData;
    }
    /**
     * Teardown for Playwright global teardown
     */
    static async playwrightGlobalTeardown() {
        if (this.dataManager && this.testData) {
            await this.dataManager.cleanupTestData(this.testData);
        }
        delete global.__E2E_TEST_DATA__;
    }
    /**
     * Get test data in individual tests
     */
    static getTestData() {
        const testData = global.__E2E_TEST_DATA__;
        if (!testData) {
            throw new Error("E2E test data not found. Make sure global setup ran successfully.");
        }
        return testData;
    }
}
E2ETestSetup.testData = null;
/**
 * Helper functions for common E2E test scenarios
 */
export class E2ETestHelpers {
    /**
     * Get authentication headers for API requests
     */
    static getAuthHeaders(testData) {
        return {
            Authorization: `Bearer ${testData.testUser.accessToken}`,
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON_KEY,
        };
    }
    /**
     * Wait for content to be displayed (for display flow tests)
     */
    static async waitForContentDisplay(page, contentTitle, timeout = 30000) {
        await page.waitForSelector(`[data-testid*="content"], [title*="${contentTitle}"], :text("${contentTitle}")`, { timeout });
    }
    /**
     * Wait for prayer times to load
     */
    static async waitForPrayerTimes(page, timeout = 15000) {
        await page.waitForSelector('[data-testid="prayer-times-overlay"], [data-testid*="prayer-"]', { timeout });
    }
    /**
     * Simulate network issues for resilience testing
     */
    static async simulateNetworkIssues(page, duration = 5000) {
        await page.context().setOffline(true);
        await page.waitForTimeout(duration);
        await page.context().setOffline(false);
    }
    /**
     * Check if display is showing online status
     */
    static async verifyDisplayOnline(page) {
        try {
            const onlineIndicator = page.locator('[data-status="online"], [data-testid="online-indicator"]');
            await onlineIndicator.waitFor({ timeout: 10000 });
            return true;
        }
        catch {
            return false;
        }
    }
}
/**
 * Type-safe environment variable helper
 */
export function getRequiredEnvVar(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Required environment variable ${name} is not set`);
    }
    return value;
}
/**
 * Validate E2E test environment
 */
export function validateE2EEnvironment() {
    const requiredVars = ["SUPABASE_URL", "SUPABASE_ANON_KEY"];
    const missingVars = requiredVars.filter((varName) => !process.env[varName]);
    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables for E2E tests: ${missingVars.join(", ")}\n` +
            "Please ensure your .env file contains the necessary Supabase configuration.");
    }
    console.log("✅ E2E test environment validation passed");
}
//# sourceMappingURL=e2e-test-helpers.js.map