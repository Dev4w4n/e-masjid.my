# User Approval System - Test Results

## Unit Tests - PASSED ✅

**Date**: January 2025  
**Package**: @masjid-suite/user-approval  
**Test Framework**: Vitest 1.6.1  
**Results**: 23/23 tests passing  

### Test Coverage

#### Contract Tests (2 tests) ✅
- ✅ Export UserApprovalService class
- ✅ Have all required static methods

#### Type Exports (1 test) ✅
- ✅ Export all required types

#### getPendingApprovals (2 tests) ✅
- ✅ Accept masjid ID parameter
- ✅ Return Promise

#### approveUser (3 tests) ✅
- ✅ Require approval_id and approver_id
- ✅ Return Promise
- ✅ Accept optional notes parameter

#### rejectUser (4 tests) ✅
- ✅ Require approval_id, rejector_id, and notes
- ✅ Return Promise
- ✅ Validate notes minimum length (5 characters)
- ✅ Accept notes with 5 or more characters

#### getHomeMasjidLockStatus (3 tests) ✅
- ✅ Accept user ID parameter
- ✅ Return Promise
- ✅ Return lock status structure (is_locked, approved_at, home_masjid_id)

#### subscribeToApprovals (3 tests) ✅
- ✅ Accept masjid ID and callback parameters
- ✅ Return cleanup function
- ✅ Call cleanup function without errors

#### Error Handling (2 tests) ✅
- ✅ Handle RPC errors gracefully
- ✅ Handle database query errors

#### Input Validation (3 tests) ✅
- ✅ Validate masjid ID is provided
- ✅ Validate approval request has required fields
- ✅ Validate rejection request has all required fields

## Test Execution

```bash
cd packages/user-approval
pnpm test
```

### Output
```
 Test Files  1 passed (1)
      Tests  23 passed (23)
   Duration  218ms
```

## Key Testing Patterns

### Mock Setup
- Supabase client mocked with vi.mock()
- Mock must be defined before imports (hoisting)
- All mocks cleared in beforeEach()

### Database Mocking
- RPC calls mocked with mockSupabase.rpc
- Query chains mocked with from().select().eq().single()
- Real-time channels mocked with subscribe/unsubscribe

### Validation Tests
- Notes minimum length enforced (5 characters)
- Error messages match actual service implementation
- Type safety validated through TypeScript

## Next Steps

### Contract Tests (Pending)
Test database functions directly:
- `get_pending_user_approvals()`
- `approve_user_registration()`
- `reject_user_registration()`
- RLS policy validation

### E2E Tests (Pending)
Test complete user workflow:
1. Public user selects home masjid
2. Approval record created automatically
3. Admin sees pending approval
4. Admin approves/rejects
5. User role changes
6. Home masjid locked
7. Profile dropdown disabled

### Integration Tests (Pending)
- Real-time subscription updates
- Multi-masjid admin scenarios
- Concurrent approval attempts

## Test File Location
`packages/user-approval/tests/service.test.ts`

## Commands

```bash
# Run all tests
cd packages/user-approval && pnpm test

# Run with coverage
cd packages/user-approval && pnpm test --coverage

# Run in watch mode
cd packages/user-approval && pnpm test --watch
```
