import { vi, beforeEach } from 'vitest';
import {
  resetMockData,
  getMockDataState,
  FIXED_IDS,
} from '@masjid-suite/shared-types';

// Mock the Supabase client before any tests run
vi.mock('@masjid-suite/supabase-client', () => {
  const createMockQuery = () => {
    const query = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockImplementation(function (this: any, insertData: any) {
        // Store the insert data for when select().single() is called
        this._insertData = insertData;
        return this;
      }),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      like: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(async function (this: any) {
        // Get current mock data state
        const mockState = getMockDataState();

        // Check if this is an insert operation
        if (this._insertData) {
          const insertedData = {
            ...this._insertData,
            id: `new-content-${Date.now()}`, // Generate a fake ID
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Add to mock state for future queries
          mockState.contents.push(insertedData);

          return { data: insertedData, error: null };
        }

        // Check if this is an update query
        const updateCalls = this.update?.mock?.calls;
        if (updateCalls && updateCalls.length > 0) {
          const updateData = updateCalls[updateCalls.length - 1][0];

          // Find the content being updated by looking at eq calls
          const eqCalls = this.eq.mock.calls;
          let contentId = null;

          for (const [field, value] of eqCalls) {
            if (field === 'id') {
              contentId = value;
              break;
            }
          }

          if (contentId) {
            const content = mockState.contents.find(
              (c: any) => c.id === contentId
            );
            if (content) {
              // Apply the update to the content
              const updatedContent = { ...content, ...updateData };
              // Update the mock state
              const index = mockState.contents.findIndex(
                (c: any) => c.id === contentId
              );
              if (index !== -1) {
                mockState.contents[index] = updatedContent;
              }
              return { data: updatedContent, error: null };
            }
          }
        }

        // Regular select query - find by ID
        const eqCalls = this.eq.mock.calls;
        if (eqCalls.length > 0) {
          const [field, value] = eqCalls[eqCalls.length - 1];

          if (field === 'id') {
            // Looking up by ID - return matching content
            const content = mockState.contents.find((c: any) => c.id === value);
            if (content) {
              return { data: content, error: null };
            }
          }
        }

        // Default: no data found
        return { data: null, error: null };
      }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      then: vi.fn().mockImplementation(function (
        this: any,
        onResolve: any,
        onReject?: any
      ) {
        const mockState = getMockDataState();

        // Check for delete operations
        const deleteCalls = this.delete?.mock?.calls;
        if (deleteCalls && deleteCalls.length > 0) {
          const eqCalls = this.eq.mock.calls;
          let contentId = null;

          for (const [field, value] of eqCalls) {
            if (field === 'id') {
              contentId = value;
              break;
            }
          }

          if (contentId) {
            const contentIndex = mockState.contents.findIndex(
              (c: any) => c.id === contentId
            );
            if (contentIndex !== -1) {
              // Remove from mock state
              mockState.contents.splice(contentIndex, 1);
              return Promise.resolve({
                data: null,
                error: null,
                count: 1, // Indicate successful deletion
              }).then(onResolve, onReject);
            }
          }

          // Content not found
          return Promise.resolve({
            data: null,
            error: null,
            count: 0,
          }).then(onResolve, onReject);
        }

        // Check if this looks like a list query (no single() called)
        const selectCalls = this.select.mock.calls;
        const singleCalls = this.single.mock.calls;

        if (selectCalls.length > 0 && singleCalls.length === 0) {
          // This is a list query
          const eqCalls = this.eq.mock.calls;
          if (eqCalls.length > 0) {
            // Apply all eq filters
            let filteredContent = mockState.contents;

            for (const [field, value] of eqCalls) {
              filteredContent = filteredContent.filter(
                (c: any) => c[field] === value
              );
            }

            return Promise.resolve({ data: filteredContent, error: null }).then(
              onResolve,
              onReject
            );
          }

          // Default list query
          return Promise.resolve({
            data: mockState.contents,
            error: null,
          }).then(onResolve, onReject);
        }

        // For single queries, use the mock implementation
        return this.single().then(onResolve, onReject);
      }),
    };

    return query;
  };

  const mockSupabaseClient = {
    from: vi.fn(() => createMockQuery()),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: FIXED_IDS.users.admin } }, // admin user
        error: null,
      }),
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
    },
    rpc: vi.fn().mockImplementation(async (fnName: string, params?: any) => {
      if (fnName === 'get_user_admin_masjids') {
        // Return admin masjids only for the admin user
        const userId = params?.user_id || 'current-user'; // Default to current if no params

        if (userId === FIXED_IDS.users.admin) {
          return {
            data: [FIXED_IDS.masjids.masjidKlcc], // Return as array of strings
            error: null,
          };
        }

        if (userId === FIXED_IDS.users.adminPutrajaya) {
          return {
            data: [FIXED_IDS.masjids.masjidPutrajaya], // Admin for different masjid
            error: null,
          };
        }

        // Return empty array for non-admin users
        return {
          data: [],
          error: null,
        };
      }
      return { data: [], error: null };
    }),
  };

  return {
    supabase: mockSupabaseClient,
    authService: {
      getCurrentUser: vi.fn().mockResolvedValue({ id: FIXED_IDS.users.admin }),
    },
    databaseService: {
      table: vi.fn(() => createMockQuery()),
      rpc: mockSupabaseClient.rpc,
    },
    default: mockSupabaseClient,
  };
});

// Global test setup
beforeEach(() => {
  // Reset mock data before each test
  resetMockData();

  // Clear all mocks
  vi.clearAllMocks();
});
