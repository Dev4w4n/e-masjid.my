# GitHub Copilot Instructions for E-Masjid.My

## Project Overview

E-Masjid.My is a comprehensive Islamic community management platform built as a monorepo with React 18+ frontend and Supabase backend. The system serves Malaysian mosques with multilingual support (Bahasa Malaysia/English) and follows strict constitutional principles for development.

## Active Technologies

**Frontend Stack**:

- React 18+ with TypeScript
- Material-UI v6 components
- Vite build system
- React Router v6
- Zustand for state management

**Backend & Data**:

- Supabase (PostgreSQL, Auth, Storage, Real-time)
- Row Level Security (RLS) policies
- Supabase Edge Functions
- Real-time subscriptions

**Testing & Quality**:

- Vitest (unit tests)
- Playwright (E2E tests)
- React Testing Library
- Schema-synced mock data
- TDD approach mandatory

**Build & Development**:

- Turborepo monorepo
- pnpm package manager (ONLY)
- ESLint + Prettier
- TypeScript strict mode

## Project Structure

```
packages/
├── auth/                    # Authentication logic
├── content-management/      # NEW: Content creation & approval
├── eslint-config/          # Linting configuration
├── shared-types/           # TypeScript definitions
├── supabase-client/        # Database operations
├── ui-components/          # Reusable React components
└── ui-theme/               # Material-UI theming

apps/
├── hub/                    # Main web application
│   ├── src/pages/content/  # NEW: Content management pages
│   └── src/pages/admin/    # NEW: Approval dashboard
└── tv-display/             # Display-only application

supabase/
├── migrations/             # Database schema
├── seed.sql               # Test data
└── config.toml            # Configuration
```

## Current Feature: Content Management & Approval System

**Status**: Phase 1 Design Complete (003-we-need-to branch)
**Scope**: Hub app content creation with masjid admin approval workflow

### Key Components to Implement

**Content Management Package** (`packages/content-management/`):

- Content CRUD services (images, YouTube videos)
- Approval workflow logic
- Real-time notification hooks
- Permission validation utilities

**Hub App Extensions**:

- `/content/create` - Content creation forms
- `/content/my-content` - User content history
- `/admin/approvals` - Admin approval dashboard
- `/admin/display-settings` - Display configuration

**Database Schema** (extends existing):

- Uses `display_content` table with approval workflow
- Minimal extensions: `approval_notes`, `resubmission_of`
- RLS policies enforce masjid-specific access

## Constitutional Requirements (MANDATORY)

### 1. Package-First Development

- ALL business logic in packages/, never directly in apps/
- Apps consume packages only
- Create `content-management` package before hub integration

### 2. Test-First Development (TDD)

- Write tests FIRST, see them fail
- Mock data synced with Supabase schema
- E2E tests retrieve real IDs from database
- Playwright tests for all UI workflows

### 3. Monorepo Architecture

- Use pnpm ONLY (never npm/yarn)
- Turborepo for build orchestration
- Workspace dependencies properly configured

### 4. Supabase-First Data

- All operations reference ./supabase/
- RLS policies for multi-tenant security
- Real-time subscriptions for notifications
- Use existing get_user_admin_masjids() function

## Code Generation Guidelines

### React Components

```typescript
// Use Material-UI v6 patterns
import { Card, CardContent, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";

// Functional components with TypeScript
interface ContentCardProps {
  content: DisplayContent;
  onApprove: (id: string, notes?: string) => void;
  onReject: (id: string, reason: string) => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  content,
  onApprove,
  onReject,
}) => {
  // Component logic here
};
```

### Database Operations

```typescript
// Use existing supabase-client patterns
import { createClient } from "@/packages/supabase-client";

export const createContent = async (content: CreateContentRequest) => {
  const { data, error } = await supabase
    .from("display_content")
    .insert([
      {
        ...content,
        status: "pending",
        submitted_by: user.id,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(`Content creation failed: ${error.message}`);
  return data;
};
```

### Real-time Subscriptions

```typescript
// Use Supabase real-time for notifications
useEffect(() => {
  const subscription = supabase
    .channel("content-updates")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "display_content",
        filter: `masjid_id=in.(${userMasjidIds.join(",")})`,
      },
      handleContentUpdate
    )
    .subscribe();

  return () => subscription.unsubscribe();
}, [userMasjidIds]);
```

### Testing Patterns

```typescript
// Contract tests with TDD approach
describe("Content Creation Service", () => {
  it("should create content with pending status", async () => {
    // This will fail initially - implement to make it pass
    const content = await createContent({
      title: "Test Content",
      type: "image",
      url: "test.jpg",
      masjid_id: testMasjidId,
    });

    expect(content.status).toBe("pending");
    expect(content.submitted_by).toBe(currentUserId);
  });
});
```

## Common Commands

**Development**:

```bash
pnpm dev                    # Start all apps
pnpm build                  # Build all packages (normal development)
pnpm run build:clean        # Build after clean operations (IMPORTANT!)
pnpm test                   # Run all tests
pnpm lint                   # Lint all packages
```

**⚠️ Critical Build Protocol**:
After `pnpm clean && pnpm install`, ALWAYS use `pnpm run build:clean` instead of `pnpm build`.
This ensures TypeScript composite projects build in correct dependency order.

**Database**:

```bash
./scripts/setup-supabase.sh    # Initialize test data
supabase db reset              # Reset database
supabase gen types typescript  # Generate types
```

**Testing**:

```bash
pnpm test:unit              # Unit tests only
pnpm test:e2e              # Playwright E2E tests
pnpm test:contract         # API contract tests
```

## Recent Changes (Last 3 Features)

1. **003-we-need-to**: Content Management & Approval System (CURRENT)
   - Added content creation and approval workflow
   - Extended hub app with admin dashboard
   - Real-time notifications for approvals

2. **002-create-a-new**: [Previous feature context]

3. **001-build-a-monorepo**: Initial monorepo setup
   - Established Turborepo + pnpm architecture
   - Created base packages and applications
   - Set up Supabase integration

## Key Constraints

- **Language**: Bahasa Malaysia primary, English fallback
- **Performance**: <2s content upload, <1s notifications
- **Permissions**: Masjid-specific admin access only
- **Content**: Images (10MB max) and YouTube videos only
- **Compliance**: WCAG 2.1 AA accessibility standards

## Debugging Tips

- Check RLS policies for permission issues
- Verify package dependencies in pnpm workspace
- Use Supabase dashboard for data inspection
- Test real-time subscriptions in browser network tab
- Validate mock data sync with schema changes

---

_This context helps GitHub Copilot understand the current project state and development patterns for accurate code suggestions._
