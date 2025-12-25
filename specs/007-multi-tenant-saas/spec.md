# Feature Specification: Multi-Tenant SaaS with Tiered Pricing

**Feature Branch**: `007-multi-tenant-saas`  
**Created**: 24 December 2025  
**Status**: Draft  
**Input**: User description: "Multi-tenant SaaS system with tier management, super-admin access, public user restrictions, streamlined registration flow with three pricing tiers (Rakyat/Free, Pro/RM30, Premium/RM300-500), ToyyibPay integration with split billing, 14-day grace period, soft-lock downgrade logic, and strategic hub landing page UX."

**Constitutional Requirements Checklist**:

- [ ] Package-first architecture (business logic in `packages/`)
- [ ] TDD approach (tests written first)
- [ ] Database migrations if schema changes needed (format: `YYYYMMDDHHMMSS_name.sql`)
- [ ] Update `scripts/setup-supabase.sh` if database changes affect setup
- [ ] Multilingual support (Bahasa Malaysia/English)
- [ ] Documentation plan for `/docs`

## Clarifications

### Session 2025-12-24

- Q: When a masjid admin registers and creates their first TV display on the Rakyat (free) tier, should they be allowed to immediately start using it for their mosque operations, or should there be an approval/verification step by super admin before the display becomes publicly accessible? → A: Immediate activation - displays become publicly accessible instantly after creation without approval
- Q: For the Premium tier's "Private Database" hosting (RM300-500/month), what happens to the existing masjid data when a user first upgrades from Rakyat or Pro tier? → A: Manual migration - for private premium hosting, migration will be done manually first
- Q: When a Premium tier user's payment fails and enters soft-lock state after 14 days, their data stays on the private database but they lose premium features. What should happen if they remain in soft-lock for an extended period (e.g., 90 days)? → A: Keep indefinitely on private database - data remains isolated forever until user reactivates or explicitly deletes account
- Q: For ToyyibPay split billing on Premium tier (RM150 to Local Admin, remainder to platform), when should the split payment be triggered? → A: Immediately upon subscription payment - split happens in real-time when user pays

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Public User Discovery Journey (Priority: P1)

A visitor lands on the hub landing page and needs to quickly understand what e-Masjid offers, see available pricing tiers, and view public masjid information displays (papan-info and TV display) without needing to register.

**Why this priority**: This is the entry point for all users. Without clear communication of value and tiered offerings, conversion to registered users will fail. This directly impacts business growth and user acquisition.

**Independent Test**: A new visitor can navigate the hub landing page, understand the three tier offerings (Rakyat/Pro/Premium), view sample displays from any masjid's public papan-info and TV display, and access the registration page—all without authentication.

**Acceptance Scenarios**:

1. **Given** a visitor lands on hub landing page, **When** they scroll through the page, **Then** they see clear sections explaining: what e-Masjid is, the three pricing tiers with feature comparison, benefits for each tier, and call-to-action buttons for registration
2. **Given** a visitor views the landing page, **When** they look at the Rakyat tier section, **Then** they see "Free Forever" pricing, unlimited TV displays feature, and "Powered by e-Masjid branding" requirement clearly stated
3. **Given** a visitor views the landing page, **When** they look at the Pro tier section, **Then** they see "RM30/month" pricing, custom branding feature, smart scheduling, and data export capabilities clearly listed
4. **Given** a visitor views the landing page, **When** they look at the Premium tier section, **Then** they see "RM300-500/month" pricing, private database hosting, WhatsApp support, and dedicated Local Admin service clearly highlighted
5. **Given** a visitor is on the hub landing page, **When** they access any masjid's public papan-info or TV display URL, **Then** they can view the content without being prompted to login
6. **Given** a visitor attempts to edit or modify public display content, **When** they try to interact with edit controls, **Then** they are redirected to login page with a message "Please register/login to manage content"

---

### User Story 2 - Streamlined Masjid Registration (Priority: P1)

A new user discovers e-Masjid and wants to register their masjid account with minimal friction, selecting their desired pricing tier during signup, and immediately accessing their dashboard.

**Why this priority**: This is the critical conversion point. A complicated registration process will lose potential customers. The ease of tier selection during registration is essential for capturing revenue intent early.

**Independent Test**: A new user can complete full registration (email verification, masjid details, tier selection) in under 5 minutes and land on a functional dashboard with tier-appropriate features activated.

**Acceptance Scenarios**:

1. **Given** a visitor clicks "Register" from the landing page, **When** they enter basic account details (email, password, name), **Then** they receive an email verification link within 2 minutes
2. **Given** a user clicks the verification link, **When** the email is verified, **Then** they are redirected to the masjid setup page
3. **Given** a user is on the masjid setup page, **When** they enter masjid details (name, location, contact), **Then** they see a clear tier selection interface showing all three tiers side-by-side
4. **Given** a user selects the "Rakyat (Free)" tier, **When** they complete the form, **Then** their account is activated immediately with access to unlimited TV displays and "Powered by e-Masjid" branding enabled by default
5. **Given** a user selects the "Pro" tier, **When** they complete the form, **Then** they are redirected to ToyyibPay payment gateway for RM30/month subscription setup
6. **Given** a user selects the "Premium" tier, **When** they complete the form, **Then** they are redirected to ToyyibPay payment gateway and see a message "Your dedicated Local Admin will contact you within 24 hours"
7. **Given** a user completes payment successfully, **When** payment is confirmed by ToyyibPay, **Then** their tier-specific features are activated immediately and they land on their dashboard
8. **Given** a user's payment fails, **When** the failure is detected, **Then** they are notified and given an option to retry payment or downgrade to free tier

---

### User Story 3 - Super Admin Global Management (Priority: P1)

A super admin needs unrestricted access to view, create, update, and delete data across all masjids, manage user accounts, view billing information, and monitor system health without tier restrictions.

**Why this priority**: Platform viability depends on effective administration. Without comprehensive admin tools, troubleshooting, customer support, and business operations become impossible.

**Independent Test**: Super admin can login, access admin dashboard, view list of all masjids across all tiers, edit any masjid's content, manage any user account, view billing/subscription data, and perform system-wide queries—all without encountering permission restrictions.

**Acceptance Scenarios**:

1. **Given** a super admin logs into the system, **When** they access the admin dashboard, **Then** they see overview metrics: total masjids count, breakdown by tier (Rakyat/Pro/Premium), active subscriptions count, revenue summary, and system health indicators
2. **Given** a super admin is on the admin dashboard, **When** they navigate to "All Masjids" view, **Then** they see a searchable/filterable list of all registered masjids with columns: masjid name, tier, registration date, subscription status, last activity
3. **Given** a super admin selects any masjid from the list, **When** they click "View/Edit", **Then** they can access and modify all masjid data including content, users, settings, and subscription details regardless of tier
4. **Given** a super admin views a masjid's details, **When** they access the content management section, **Then** they can create, update, or delete any display content (papan-info, TV display slides) for that masjid
5. **Given** a super admin views all users, **When** they filter by role, **Then** they can see and manage: public users, registered masjid admins, Local Admins assigned to Premium tiers, and other super admins
6. **Given** a super admin accesses billing section, **When** they view subscription details, **Then** they can see: payment history, ToyyibPay transaction IDs, split billing records (RM150 to Local Admin), grace period status, and soft-lock states
7. **Given** a super admin needs to troubleshoot an issue, **When** they access any masjid account, **Then** there is a clear indicator showing the user's tier and active features
8. **Given** a super admin needs to manually adjust a subscription, **When** they access subscription management, **Then** they can override tier, extend grace periods, or trigger soft-lock/unlock actions with audit trail logging

---

### Edge Cases

- **What happens when a user attempts to upgrade from Rakyat to Pro mid-month?** The system charges full tier price (RM30 for Pro, RM300-500 for Premium) immediately upon upgrade with immediate feature activation. Next billing cycle occurs 30 days from upgrade date (no proration to simplify billing).
- **How does system handle when ToyyibPay webhook is delayed or not received?** System should implement polling mechanism to check payment status every 30 minutes for pending payments. After 24 hours of no webhook, system should trigger manual verification alert to super admin.
- **What happens when hub landing page needs to display bilingual content (Bahasa Malaysia and English)?** Language toggle should be prominently placed in header. All pricing tier descriptions, feature lists, and call-to-action buttons should dynamically switch based on selected language. User language preference should persist in session.

## Requirements _(mandatory)_

### Functional Requirements

#### User Access & Permissions

- **FR-001**: Public users MUST be able to view hub landing page without authentication
- **FR-002**: Public users MUST be able to access any masjid's papan-info display URL without authentication
- **FR-003**: Public users MUST be able to access any masjid's TV display URL without authentication
- **FR-004**: Public users MUST NOT be able to create, edit, or delete any content across the system
- **FR-005**: Super admin MUST have unrestricted CRUD access to all entities (masjids, users, billing, content, subscriptions, settings, TV displays) regardless of tier restrictions, including ability to manually override tier assignments, extend grace periods, and trigger soft-lock/unlock actions with audit trail logging
- **FR-006**: Super admin actions MUST be logged with timestamp, admin user ID, action type, and description for compliance audit trail

#### Registration & Onboarding

- **FR-007**: New users MUST be able to complete registration with basic details: email, password, full name
- **FR-008**: System MUST send email verification link within 2 minutes of registration
- **FR-009**: System MUST redirect verified users to masjid setup page where they enter: masjid name, location, contact information
- **FR-010**: Masjid setup page MUST display all three pricing tiers side-by-side with clear feature comparison: Rakyat (Free), Pro (RM30/mo), Premium (RM300-500/mo)
- **FR-011**: Users selecting Rakyat tier MUST have account activated immediately upon form submission without payment flow
- **FR-012**: Users selecting Pro or Premium tier MUST be redirected to ToyyibPay payment gateway for subscription setup
- **FR-013**: System MUST activate tier-specific features immediately after successful payment confirmation from ToyyibPay
- **FR-014**: System MUST handle payment failures gracefully by notifying user and offering retry payment or downgrade to free tier options

#### Tier-Specific Features: Rakyat (Free)

- **FR-015**: Rakyat tier users MUST be able to create unlimited TV displays without restrictions
- **FR-015a**: TV displays created by Rakyat tier users MUST become publicly accessible immediately without requiring super admin approval or verification
- **FR-016**: Rakyat tier users MUST manually manage all content through DIY interface
- **FR-017**: All Rakyat tier TV displays MUST show permanent "Powered by e-Masjid" branding that cannot be removed or hidden
- **FR-018**: Rakyat tier users MUST NOT have access to custom branding settings
- **FR-019**: Rakyat tier users MUST NOT have access to smart scheduling features
- **FR-020**: Rakyat tier users MUST NOT have access to data export functionality
- **FR-021**: When Rakyat tier users attempt to access premium features, system MUST display upgrade prompts with call-to-action

#### Tier-Specific Features: Pro (RM30/month)

- **FR-022**: Pro tier users MUST be able to upload custom masjid logo (PNG/JPG, max 2MB)
- **FR-023**: Pro tier users MUST be able to set custom primary and secondary brand colors
- **FR-024**: System MUST completely remove "Powered by e-Masjid" branding when custom branding is applied
- **FR-025**: Pro tier users MUST be able to create time-based schedules with recurring patterns
- **FR-026**: System MUST automatically activate/deactivate scheduled content at designated times
- **FR-027**: Pro tier users MUST be able to export display activity data in PDF or Excel format
- **FR-028**: Data exports MUST include: display name, content shown, timestamp, duration, formatted for audit purposes
- **FR-029**: System MUST generate and deliver data export files within 30 seconds

#### Tier-Specific Features: Premium (RM300-500/month)

- **FR-030**: Super admin MUST manually provision separate Supabase project for each Premium tier customer within 1 hour of payment confirmation to provide true database isolation
- **FR-031**: Super admin or assigned Local Admin MUST manually migrate existing masjid data (TV displays, content, settings, users) from shared database to Premium tier user's dedicated Supabase project
- **FR-031a**: Premium tier users MUST be notified when manual data migration is complete and dedicated Supabase project is ready for use
- **FR-031b**: During manual data migration period, user MUST retain full access to their existing data on shared database to prevent service interruption
- **FR-032**: Premium tier users MUST see "Private Database" badge in account settings with dedicated project status
- **FR-033**: Premium tier users MUST have access to dedicated WhatsApp support with guaranteed 1-hour human response from Local Admin during business hours (9 AM - 6 PM MYT, 7 days/week)
- **FR-034**: System MUST assign dedicated Local Admin to each Premium tier user within 24 hours
- **FR-035**: System MUST send email introduction with Local Admin's name and contact details
- **FR-036**: Local Admin MUST be able to create, upload, and manage content on behalf of Premium tier user
- **FR-037**: Local Admin MUST complete content requests within 24 hours
- **FR-038**: Premium tier users MUST have access to all Pro tier features plus Premium-specific features

#### Billing & Split Payment

- **FR-039**: System MUST integrate with ToyyibPay payment gateway for all subscription payments
- **FR-040**: For Premium tier payments, system MUST immediately initiate split payment in real-time upon successful subscription payment confirmation: RM150 to Local Admin account, remainder to platform merchant account
- **FR-041**: System MUST record both ToyyibPay transaction IDs and link them to original subscription payment
- **FR-042**: If split billing transfer fails, system MUST retry with exponential backoff: after 1 hour, after 6 hours, after 17 hours (3 retries total over 24 hours)
- **FR-043**: If all retries fail, system MUST notify super admin with transaction details
- **FR-044**: Local Admin MUST be able to view earnings dashboard with payment history
- **FR-045**: When Premium tier price varies (RM300-500), Local Admin MUST always receive fixed RM150

#### Grace Period & Soft-Lock

- **FR-046**: When Pro or Premium payment fails, system MUST grant 14-day grace period automatically
- **FR-047**: System MUST send immediate email notification with retry payment link
- **FR-048**: During grace period, system MUST display persistent banner with countdown timer
- **FR-049**: If user makes successful payment during grace period, system MUST cancel grace period immediately
- **FR-050**: On day 13, system MUST send urgent email reminder
- **FR-051**: When grace period expires, system MUST automatically trigger soft-lock state
- **FR-052**: During soft-lock: disable custom branding, re-enable "Powered by e-Masjid", stop smart scheduling, disable data exports
- **FR-053**: During soft-lock, system MUST preserve all user data without deletion
- **FR-054**: For Premium soft-lock: keep data on dedicated Supabase project indefinitely until user reactivates or explicitly requests account deletion, downgrade WhatsApp support to email-only, notify Local Admin of suspension
- **FR-054a**: System MUST NOT automatically migrate Premium tier soft-locked data back to shared database regardless of soft-lock duration
- **FR-055**: When user makes successful payment during soft-lock, system MUST remove soft-lock immediately and reactivate features
- **FR-056**: Super admin MUST be able to view all soft-locked accounts with details and manual unlock option

#### Hub Landing Page UX

- **FR-057**: Hub landing page MUST clearly explain what e-Masjid is (purpose, target audience, core value proposition)
- **FR-058**: Hub landing page MUST display comprehensive feature comparison table for all three tiers
- **FR-059**: Feature comparison MUST highlight key differentiators: branding, scheduling, exports, support, database hosting
- **FR-060**: Hub landing page MUST include prominent call-to-action buttons at: hero section, feature comparison, footer
- **FR-061**: Hub landing page MUST support bilingual content (Bahasa Malaysia and English) with language toggle
- **FR-062**: All pricing tier descriptions and buttons MUST dynamically switch based on selected language
- **FR-063**: User language preference MUST persist in browser session

#### System Automation

- **FR-064**: System MUST run automated checks every 15 minutes using Supabase Edge Functions for: scheduled content activation/deactivation, grace period monitoring, grace period expiry notifications, and soft-lock triggers

### Key Entities

- **Masjid**: Registered mosque organization with: name, location, contact info, registration date, subscription tier, subscription status, assigned Local Admin ID (Premium), custom branding settings, database connection details (Premium)
- **User**: System users with role-based access: email, full name, role (public/masjid-admin/local-admin/super-admin), associated masjid ID, authentication status, email verification status, registration date
- **Subscription**: Billing relationship: masjid ID, tier, price, billing cycle, payment method (ToyyibPay), status (active/grace-period/soft-locked/cancelled), next billing date, grace period dates, failed payment attempts
- **Payment Transaction**: Payment records: subscription ID, masjid ID, amount, payment date, ToyyibPay transaction ID, split billing details, payment status, retry attempts, failure reason
- **Local Admin**: Dedicated support staff for Premium tiers: user ID, full name, contact details, assigned masjid IDs, earnings summary, availability status, maximum capacity
- **TV Display**: Individual display screens: masjid ID, display name, unique URL, active status, branding settings, content playlist, schedule rules, viewer analytics
- **Content**: Media and information for displays: masjid ID, content type, media URL, text content, duration, display order, creation date, created by, approval status
- **Schedule Rule**: Smart scheduling configuration: masjid ID, rule name, trigger conditions, content associations, recurrence pattern, active status

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: New users complete registration in under 5 minutes (Rakyat) or under 10 minutes (Pro/Premium with payment)
- **SC-002**: 80% of first-time visitors correctly identify all three pricing tiers after 2 minutes of browsing
- **SC-003**: Public users access masjid displays without authentication barriers
- **SC-004**: Super admin completes common admin tasks in under 3 clicks from dashboard
- **SC-005**: Rakyat tier users create and publish first TV display in under 15 minutes
- **SC-006**: Pro tier users apply custom branding and see changes on all displays within 2 minutes
- **SC-007**: Pro tier smart scheduling activates content within 1 minute of designated time
- **SC-008**: Premium tier database provisioning completes within 1 hour 95% of the time
- **SC-009**: Premium tier WhatsApp support achieves 95% response rate SLA (1 hour during business hours)
- **SC-010**: Premium tier Local Admin achieves 90% on-time completion rate (24 hours)
- **SC-011**: Split billing executes successfully 99% of the time with both transfers completing within 24 hours
- **SC-012**: Grace period notifications sent within 5 minutes of payment failure
- **SC-013**: Users reactivating during grace period experience feature reactivation within 2 minutes
- **SC-014**: Soft-lock applies accurately on day 15 with zero data loss
- **SC-015**: Users reactivating from soft-lock regain full features within 5 minutes
- **SC-016**: 90% of Pro tier users successfully export data reports on first attempt
- **SC-017**: System maintains 99.5% uptime for public-facing displays
- **SC-018**: Hub landing page loads within 3 seconds on 4G mobile connection in Malaysia
- **SC-019**: Language switching occurs instantly (under 500ms) without page reload
- **SC-020**: Free tier to paid tier conversion rate reaches 15% within first 3 months

## Assumptions

1. **ToyyibPay Integration**: ToyyibPay API supports split payment functionality or webhook-based transfer initiation. If not natively supported, implement sequential transfers.
2. **Database Provisioning**: Premium tier uses separate Supabase projects for true database isolation. Super admin manually creates and configures new Supabase project for each Premium customer. Manual provisioning completed within 1 hour of payment confirmation.
3. **Local Admin Availability**: Platform has recruited pool of available Local Admins before Premium tier marketing. Maximum 5 Premium masjids per Local Admin.
4. **Payment Gateway Reliability**: ToyyibPay webhook reliability is 95%+. System includes polling fallback every 30 minutes.
5. **Email Deliverability**: Transactional emails achieve 95%+ delivery rate using established email service.
6. **Content Storage**: Supabase Storage or AWS S3 used for media content with appropriate CDN for Malaysian users.
7. **Branding Watermark**: "Powered by e-Masjid" implemented as SVG overlay on frontend rendering layer for seamless removal upon upgrade.
8. **Business Hours**: 9 AM - 6 PM refers to Malaysian Time (MYT, UTC+8), Monday through Sunday (mosques operate 7 days).
9. **Grace Period**: Starts immediately upon first payment failure, counts 14 full calendar days.
10. **Soft-Lock Reversibility**: Fully reversible with zero data loss. Content, settings, configurations preserved in read-only state.
11. **Tier Migration**: Upgrades take effect immediately, downgrades at end of billing cycle to honor paid period.
12. **Super Admin Access**: Manually assigned by system administrators during deployment, not self-serviceable through UI.
13. **Public Display Access**: Papan-info and TV display URLs publicly accessible via direct link but not indexed by search engines (noindex).
14. **Bilingual Content**: All system-generated text maintained in Bahasa Malaysia and English with BM as default for Malaysian users.
15. **Mobile Responsiveness**: Hub landing page and dashboards mobile-responsive for Malaysian mobile users.
16. **Concurrent User Load**: System handles at least 1,000 concurrent users during peak traffic without performance degradation.
17. **Data Retention**: Soft-locked account data retained indefinitely until reactivation or explicit deletion request. No automatic purging.
18. **Local Admin Compensation**: RM150 split payment fixed regardless of Premium tier price variation (RM300-500).
19. **Free Tier Usage**: "Unlimited TV displays" for Rakyat tier is truly unlimited with reasonable usage monitoring to prevent abuse.
20. **Audit Trail**: All super admin actions logged with timestamp, admin user ID, and action description for compliance.
