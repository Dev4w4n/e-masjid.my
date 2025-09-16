# Quickstart Guide: Masjid Suite Profile Management System

**Date**: 17 September 2025  
**Prerequisites**: Node.js 18+, pnpm, Docker  
**Estimated Setup Time**: 30 minutes

## Overview

This quickstart guide will help you set up the Masjid Suite monorepo locally and run the Profile Management System. You'll create a super admin account, set up a masjid, and walk through the complete user workflow.

## 🚀 Quick Setup

### 1. Repository Setup

```bash
# Clone the repository
git clone https://github.com/Dev4w4n/e-masjid.my.git e-masjid.my
cd e-masjid.my

# Install dependencies with pnpm
pnpm install

# Copy environment configuration
cp .env.example .env.local
```

### 2. Environment Configuration

Edit `.env.local` with your configuration:

```bash
# Supabase Configuration
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Super Admin Configuration
SUPER_ADMIN_EMAIL=admin@e-masjid.my
SUPER_ADMIN_PASSWORD=SecureAdminPass123!

# Application Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Start Supabase Backend

```bash
npm install supabase --save-dev

npx supabase init

npx supabase start
```

Run all .sql in `./supabase/migrations`

### 4. Start Development Server

```bash
# Return to project root
cd ..

# Start all applications with Turborepo
pnpm dev

# Or start specific app
pnpm dev --filter=profile-app
```

The application will be available at:

- **Profile App**: http://localhost:3000
- **Supabase Studio**: http://localhost:54323

## 🧪 Testing the Complete Workflow

### Step 1: Super Admin Setup

1. **Navigate to the application**: http://localhost:3000
2. **Sign in as super admin**:
   - Email: `admin@e-masjid.my`
   - Password: `SecureAdminPass123!`
3. **Complete super admin profile**:
   - Full name: "System Administrator"
   - Phone: "+601234567890"
   - Address: Fill with valid Malaysian address
   - Home masjid: Leave empty (will create one)

### Step 2: Create First Masjid

1. **Access Masjid Management** (super admin only)
2. **Create new masjid**:
   ```json
   {
     "name": "Masjid Jamek Sungai Rambai",
     "registration_number": "MSJ-2024-001",
     "email": "admin@masjidjameksungairambai.org",
     "phone_number": "+60412345678",
     "description": "Community mosque in Bukit Mertajam, Pulau Pinang",
     "address": {
       "address_line_1": "Jalan Masjid Jamek",
       "address_line_2": "Sungai Rambai",
       "city": "Bukit Mertajam",
       "state": "Pulau Pinang",
       "postcode": "14000"
     }
   }
   ```

### Step 3: Register New User

1. **Open new browser window/incognito** (to simulate different user)
2. **Navigate to registration**: http://localhost:3000/auth/register
3. **Register new user**:
   - Email: `ali@example.com`
   - Password: `UserPassword123!`
4. **Complete profile**:
   - Full name: "Ali bin Abdullah"
   - Phone: "+60123456789"
   - Address: Valid Malaysian address
   - Home masjid: Select "Masjid Jamek Sungai Rambai"

### Step 4: Apply for Admin Role

1. **As registered user**, navigate to "Admin Application"
2. **Submit application**:
   - Select masjid: "Masjid Jamek Sungai Rambai"
   - Message: "I would like to help manage this masjid"
3. **Application status**: Should show "Pending"

### Step 5: Approve Admin Application

1. **Switch back to super admin window**
2. **Navigate to "Admin Applications"**
3. **Review Ahmad's application**:
   - Status: Approve
   - Notes: "Approved for community involvement"
4. **Confirm approval**

### Step 6: Test Admin Access

1. **As Ahmad**, refresh the page
2. **Role should now be**: "Masjid Admin"
3. **Access admin features**:
   - View masjid member list
   - See pending user profiles for approval
   - Update masjid information

### Step 7: Test Public User Access

1. **Open another browser window**
2. **Browse without registration**:
   - View public masjid list
   - See masjid details
   - Attempt restricted action → redirected to register

## 🧪 Automated Testing

### Unit Tests

```bash
# Run all unit tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch
```

### Integration Tests

```bash
# Run API integration tests
pnpm test:integration

# Test database operations
pnpm test:db
```

### End-to-End Tests

```bash
# Run E2E tests with Playwright
pnpm test:e2e

# Run E2E tests in UI mode
pnpm test:e2e:ui

# Test specific user flow
pnpm test:e2e --grep "admin workflow"
```

## 📱 User Interface Testing

### Profile Completion Flow

1. **Incomplete profile state**:
   - User sees completion prompt
   - Cannot access role-specific features
   - Progress indicator shows missing fields

2. **Form validation**:
   - Malaysian phone number format
   - Valid postal codes
   - Required field indicators

3. **Success feedback**:
   - Profile completion confirmation
   - Feature unlock notifications
   - Role-specific UI changes

### Role-Based Access Control

Test different user experiences:

| Role         | Can Access                                  | Cannot Access                     |
| ------------ | ------------------------------------------- | --------------------------------- |
| Public       | Masjid list, details                        | User management, profile creation |
| Registered   | Profile management, admin applications      | User management, masjid creation  |
| Masjid Admin | Assigned masjid management, member profiles | Other masjids, user roles         |
| Super Admin  | All features                                | N/A                               |

## 🛠️ Development Commands

### Code Quality

```bash
# Lint all packages
pnpm lint

# Fix linting issues
pnpm lint:fix

# Type checking
pnpm type-check

# Format code
pnpm format
```

### Build & Deploy

```bash
# Build all applications
pnpm build

# Build specific app
pnpm build --filter=profile-app

# Preview production build
pnpm preview
```

### Database Management

```bash
# Create new migration
supabase migration new add_new_feature

# Apply migrations
supabase db push

# Reset database
supabase db reset

# Generate TypeScript types
supabase gen types typescript --local > packages/shared-types/src/database.ts
```

## 🔧 Troubleshooting

### Common Issues

**Supabase Connection Error**

```bash
# Check Supabase status
supabase status

# Restart Supabase
supabase stop
supabase start
```

**Build Errors**

```bash
# Clean build cache
pnpm clean

# Reinstall dependencies
rm -rf node_modules
pnpm install
```

**Type Errors**

```bash
# Regenerate database types
supabase gen types typescript --local > packages/shared-types/src/database.ts

# Restart TypeScript server in VS Code
Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Environment Variables

Ensure all required environment variables are set:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPER_ADMIN_EMAIL`
- `SUPER_ADMIN_PASSWORD`

### Port Conflicts

Default ports used:

- Profile App: 3000
- Supabase API: 54321
- Supabase Studio: 54323
- Supabase Auth: 9999

## 📚 API Testing

### Using curl

**Register user**:

```bash
curl -X POST http://localhost:54321/auth/v1/signup \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_ANON_KEY" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

**Create profile**:

```bash
curl -X POST http://localhost:54321/rest/v1/profiles \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "full_name": "Test User",
    "phone_number": "+60123456789",
    "address": {
      "address_line_1": "123 Test Street",
      "city": "Kuala Lumpur",
      "state": "Kuala Lumpur",
      "postcode": "50100"
    }
  }'
```

### Using Postman/Insomnia

Import the OpenAPI specification from `contracts/api-spec.yaml` for full API documentation and testing capabilities.

## 🎯 Success Criteria Validation

### Functional Requirements Checklist

- [ ] Super admin can sign in with environment credentials
- [ ] Super admin can create masjids
- [ ] Users can register and complete profiles
- [ ] Profile validation works for Malaysian formats
- [ ] Users can apply for admin roles
- [ ] Super admin can approve/reject applications
- [ ] Masjid admins can manage their masjid
- [ ] Role-based access control functions correctly
- [ ] Public users have appropriate access levels

### Performance Validation

- [ ] Initial page load < 2 seconds
- [ ] Navigation between pages < 500ms
- [ ] Form submissions < 1 second
- [ ] Database queries optimized with proper indexes

### Security Validation

- [ ] JWT tokens properly validated
- [ ] Row Level Security policies working
- [ ] Input validation and sanitization
- [ ] Proper error handling without data leaks

## 📈 Next Steps

After completing this quickstart:

1. **Explore the codebase structure**
2. **Read the architecture documentation**
3. **Set up your development environment**
4. **Start contributing new features**

For adding new applications to the monorepo, see the [Contributing Guide](../CONTRIBUTING.md) and [Specify System Documentation](../.specify/README.md).

---

**Need Help?**

- Check the [Troubleshooting Guide](../docs/troubleshooting.md)
- Review the [API Documentation](./contracts/api-spec.yaml)
- Consult the [Development Guidelines](../docs/development.md)
