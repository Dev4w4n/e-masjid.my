/**
 * Tier Service
 * Feature: 007-multi-tenant-saas
 * Tasks: T031-T032 (User Story 1)
 *
 * Handles tier feature access checks and tier comparisons
 */
export class TierService {
    /**
     * Get feature matrix for all tiers
     * Task: T031
     */
    static getTierFeatures() {
        return {
            rakyat: {
                // Display Management
                max_tv_displays: 1,
                max_content_items: 10,
                content_approval_required: true,
                // Branding & Customization
                custom_branding: false,
                custom_domain: false,
                white_label: false,
                // Technical Features
                api_access: false,
                webhook_notifications: false,
                dedicated_database: false,
                // Support & Services
                priority_support: false,
                local_admin_support: false,
                onboarding_assistance: false,
                // Data & Analytics
                advanced_analytics: false,
                export_capabilities: false,
                retention_days: 30,
            },
            pro: {
                // Display Management
                max_tv_displays: 5,
                max_content_items: 50,
                content_approval_required: false,
                // Branding & Customization
                custom_branding: false,
                custom_domain: false,
                white_label: false,
                // Technical Features
                api_access: true,
                webhook_notifications: true,
                dedicated_database: false,
                // Support & Services
                priority_support: false,
                local_admin_support: false,
                onboarding_assistance: false,
                // Data & Analytics
                advanced_analytics: true,
                export_capabilities: true,
                retention_days: 90,
            },
            premium: {
                // Display Management
                max_tv_displays: -1, // Unlimited
                max_content_items: -1, // Unlimited
                content_approval_required: false,
                // Branding & Customization
                custom_branding: true,
                custom_domain: true,
                white_label: true,
                // Technical Features
                api_access: true,
                webhook_notifications: true,
                dedicated_database: true,
                // Support & Services
                priority_support: true,
                local_admin_support: true,
                onboarding_assistance: true,
                // Data & Analytics
                advanced_analytics: true,
                export_capabilities: true,
                retention_days: 365,
            },
        };
    }
    /**
     * Get tier comparison with bilingual descriptions
     * Task: T032
     */
    static getTierComparison(language = "bm") {
        const rakyatDesc = language === "bm"
            ? "Percuma Selamanya - Sesuai untuk Masjid Kecil"
            : "Free Forever - Perfect for Small Mosques";
        const proDesc = language === "bm"
            ? "RM30/bulan - Untuk Komuniti Berkembang"
            : "RM30/month - For Growing Communities";
        const premiumDesc = language === "bm"
            ? "RM300-500/bulan - Perkhidmatan Penuh dengan Admin Tempatan"
            : "RM300-500/month - Full-Service with Local Admin";
        return [
            {
                tier: "rakyat",
                name: "Rakyat",
                description: rakyatDesc,
                priceMonthly: 0,
                priceYearly: 0,
            },
            {
                tier: "pro",
                name: "Pro",
                description: proDesc,
                priceMonthly: 30,
                priceYearly: 300,
                recommended: true,
            },
            {
                tier: "premium",
                name: "Premium",
                description: premiumDesc,
                priceMonthly: 300,
                priceYearly: 3600,
            },
        ];
    }
    /**
     * Get feature descriptions for comparison table
     */
    static getFeatureDescriptions(language = "bm") {
        const descriptions = [
            // Display Management
            {
                key: "max_tv_displays",
                name_en: "TV Displays",
                name_bm: "Paparan TV",
                description_en: "Maximum number of TV displays you can manage",
                description_bm: "Bilangan maksimum paparan TV yang boleh diurus",
                category: "display",
            },
            {
                key: "max_content_items",
                name_en: "Content Items",
                name_bm: "Item Kandungan",
                description_en: "Maximum content items you can create",
                description_bm: "Bilangan maksimum item kandungan yang boleh dicipta",
                category: "display",
            },
            {
                key: "content_approval_required",
                name_en: "Content Approval",
                name_bm: "Kelulusan Kandungan",
                description_en: "Admin approval required before content goes live",
                description_bm: "Kelulusan admin diperlukan sebelum kandungan disiarkan",
                category: "display",
            },
            // Branding & Customization
            {
                key: "custom_branding",
                name_en: "Custom Branding",
                name_bm: "Jenama Tersuai",
                description_en: "Use your own logo and colors",
                description_bm: "Gunakan logo dan warna anda sendiri",
                category: "branding",
            },
            {
                key: "custom_domain",
                name_en: "Custom Domain",
                name_bm: "Domain Tersuai",
                description_en: "Use your own domain name (e.g., masjid.my)",
                description_bm: "Gunakan nama domain anda sendiri (cth: masjid.my)",
                category: "branding",
            },
            {
                key: "white_label",
                name_en: "White Label",
                name_bm: "Label Putih",
                description_en: "Remove all e-Masjid branding",
                description_bm: "Buang semua jenama e-Masjid",
                category: "branding",
            },
            // Technical Features
            {
                key: "api_access",
                name_en: "API Access",
                name_bm: "Akses API",
                description_en: "Access to REST API for integrations",
                description_bm: "Akses kepada REST API untuk integrasi",
                category: "technical",
            },
            {
                key: "webhook_notifications",
                name_en: "Webhook Notifications",
                name_bm: "Pemberitahuan Webhook",
                description_en: "Real-time notifications for events",
                description_bm: "Pemberitahuan masa nyata untuk acara",
                category: "technical",
            },
            {
                key: "dedicated_database",
                name_en: "Dedicated Database",
                name_bm: "Pangkalan Data Khusus",
                description_en: "Isolated database instance for better performance",
                description_bm: "Pangkalan data terasing untuk prestasi lebih baik",
                category: "technical",
            },
            // Support & Services
            {
                key: "priority_support",
                name_en: "Priority Support",
                name_bm: "Sokongan Keutamaan",
                description_en: "Get priority in support queue",
                description_bm: "Dapatkan keutamaan dalam barisan sokongan",
                category: "support",
            },
            {
                key: "local_admin_support",
                name_en: "Local Admin Support",
                name_bm: "Sokongan Admin Tempatan",
                description_en: "Dedicated local admin to help manage your masjid",
                description_bm: "Admin tempatan khusus untuk membantu urus masjid anda",
                category: "support",
            },
            {
                key: "onboarding_assistance",
                name_en: "Onboarding Assistance",
                name_bm: "Bantuan Penyertaan",
                description_en: "Personal onboarding and training",
                description_bm: "Penyertaan dan latihan peribadi",
                category: "support",
            },
            // Data & Analytics
            {
                key: "advanced_analytics",
                name_en: "Advanced Analytics",
                name_bm: "Analitik Lanjutan",
                description_en: "Detailed insights and reporting",
                description_bm: "Pandangan terperinci dan pelaporan",
                category: "analytics",
            },
            {
                key: "export_capabilities",
                name_en: "Export Data",
                name_bm: "Eksport Data",
                description_en: "Export your data in multiple formats",
                description_bm: "Eksport data anda dalam pelbagai format",
                category: "analytics",
            },
            {
                key: "retention_days",
                name_en: "Data Retention",
                name_bm: "Pengekalan Data",
                description_en: "How long your data is kept",
                description_bm: "Berapa lama data anda disimpan",
                category: "analytics",
            },
        ];
        // Convert to Record<string, string>
        const result = {};
        descriptions.forEach((desc) => {
            result[desc.key] = language === "bm" ? desc.description_bm : desc.description_en;
        });
        return result;
    }
    /**
     * Check if a feature is available for a tier
     */
    static hasFeature(tier, feature) {
        const features = this.getTierFeatures()[tier];
        const value = features[feature];
        // For boolean features
        if (typeof value === "boolean") {
            return value;
        }
        // For numeric features (> 0 means available, -1 means unlimited)
        if (typeof value === "number") {
            return value !== 0;
        }
        return false;
    }
    /**
     * Check if tier usage is within limits
     */
    static checkLimit(tier, feature, currentValue) {
        const features = this.getTierFeatures()[tier];
        const limit = features[feature];
        // -1 means unlimited
        if (limit === -1) {
            return {
                allowed: true,
                limit: -1,
                usage: currentValue,
                percentage: 0,
            };
        }
        const allowed = currentValue < limit;
        const percentage = limit > 0 ? (currentValue / limit) * 100 : 0;
        return {
            allowed,
            limit,
            usage: currentValue,
            percentage: Math.min(percentage, 100),
        };
    }
    /**
     * Get recommended tier based on usage patterns
     */
    static getRecommendedTier(usage) {
        const features = this.getTierFeatures();
        // Check if Premium features are needed
        if (usage.needs_local_admin || usage.needs_custom_branding) {
            return "premium";
        }
        if (usage.tv_displays > features.pro.max_tv_displays ||
            usage.content_items > features.pro.max_content_items) {
            return "premium";
        }
        // Check if Pro features are needed
        if (usage.tv_displays > features.rakyat.max_tv_displays ||
            usage.content_items > features.rakyat.max_content_items ||
            usage.needs_api) {
            return "pro";
        }
        // Default to Rakyat
        return "rakyat";
    }
}
//# sourceMappingURL=TierService.js.map