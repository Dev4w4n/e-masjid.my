# Feature Specification: Masjid Digital Display TV App

**Feature Branch**: `002-create-a-new`  
**Created**: 20 September 2025  
**Status**: Draft  
**Input**: User description: "Create a new tv app that will blend in with the existing system turborepo workspace and environment configuration. it will display content by masjids. This a digital display for masjid. the masjid may have more than 1 tv that is showing different configuration of content. The display has 2 layers of display. The back layer is a configurable carousel that refers to the masjids list of contents to be displayed. The list of contents could either be a youtube video link or an image link. The carousel will display only top 10 of the list based on the accumulated funds sponsored to the content. The front layer is a floting display of the prayer time. The position on f the prayer times is configurable to show either top, bottom, right, left or center but not stretched. All contents and setting will be stored separately for each masjid. This app only displays no data entry. It will be displayed by masjids. the display language to be used is bahasa malaysia as main."

## Execution Flow (main)

```
1. Parse user description from Input
   → Feature description provided: Digital display system for masjids
2. Extract key concepts from description
   → Actors: Masjid administrators, mosque visitors
   → Actions: Display content, show prayer times, rotate sponsored content
   → Data: Content list, prayer times, sponsorship amounts, display configurations
   → Constraints: Display-only (no data entry), Bahasa Malaysia language, layered UI
3. For each unclear aspect:
   → Prayer time data source marked for clarification
   → Content moderation workflow needs clarification
4. Fill User Scenarios & Testing section
   → Primary flow: Display rotating content with overlay prayer times
5. Generate Functional Requirements
   → All requirements testable and masjid-specific
6. Identify Key Entities
   → Masjid, Content Item, Display Configuration, Prayer Schedule
7. Run Review Checklist
   → All requirements clarified and completed
   → No implementation details included
   → Business value focused on community engagement
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines

- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

---

## User Scenarios & Testing

### Primary User Story

Masjid visitors enter the mosque and see a digital display showing relevant Islamic content (videos/images) with current prayer times overlaid. The content rotates automatically, prioritizing items with higher sponsorship funding. Different displays within the same masjid can show different content configurations based on their location and purpose.

### Acceptance Scenarios

1. **Given** a masjid has configured content items with sponsorship amounts, **When** the display loads, **Then** it shows the top 10 highest-sponsored content items in a rotating carousel
2. **Given** prayer times are scheduled for the day, **When** the display is active, **Then** current prayer times are shown in a floating overlay at the configured position
3. **Given** multiple displays exist in one masjid, **When** each display is configured with different settings, **Then** each shows its specific content configuration independently
4. **Given** content includes YouTube videos and images, **When** the carousel rotates, **Then** videos play automatically and images display for a configured duration
5. **Given** the system language is set to Bahasa Malaysia, **When** any text is displayed, **Then** all interface elements appear in Bahasa Malaysia

### Edge Cases

- What happens when no sponsored content is available for display? will display a temp masjid logo and no content sign.
- How does the system handle network connectivity issues for YouTube videos? skip
- What occurs when prayer time data is unavailable or outdated? retry 3 times and show error.
- How does the display behave when content items are removed or updated? skip if removed

## Requirements

### Functional Requirements

- **FR-001**: System MUST display a rotating carousel of content items (YouTube videos and images) as the background layer
- **FR-002**: System MUST show only the top 10 content items ranked by accumulated sponsorship funds
- **FR-003**: System MUST display prayer times in a floating overlay that doesn't obstruct the main content
- **FR-004**: System MUST allow prayer time position to be configured (top, bottom, left, right, or center) without stretching
- **FR-005**: System MUST support multiple independent display configurations for a single masjid
- **FR-006**: System MUST display all interface text in Bahasa Malaysia as the primary language
- **FR-007**: System MUST operate as a display-only application with no data entry capabilities
- **FR-008**: System MUST automatically transition between content items in the carousel
- **FR-009**: System MUST handle both YouTube video links and image links seamlessly
- **FR-010**: System MUST store and retrieve masjid-specific content, sponsorship data, and display settings
- **FR-011**: System MUST integrate with the existing turborepo workspace architecture
- **FR-012**: System MUST retrieve prayer times from JAKIM API using masjid-specific zone identifiers
- **FR-013**: System MUST allow masjid administrators to approve and remove content items through the content moderation process
- **FR-014**: System MUST provide configurable timing intervals for carousel content rotation
- **FR-015**: System MUST play YouTube videos in their entirety before transitioning to the next content item

### Key Entities

- **Masjid**: Represents a mosque with unique display configurations, content lists, and prayer schedules
- **Content Item**: Represents displayable content (YouTube video or image) with associated sponsorship amount and metadata
- **Display Configuration**: Represents settings for a specific display including prayer time position, content filters, and timing preferences
- **Prayer Schedule**: Represents daily prayer times specific to each masjid's location and calculation method
- **Sponsorship Record**: Represents financial backing for content items that determines display priority

---

## Review & Acceptance Checklist

### Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed
