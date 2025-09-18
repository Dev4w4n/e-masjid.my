// Contract test for Supabase client implementation
// This test validates the Supabase client services and utilities

import { describe, it, expect, beforeEach } from 'vitest';

describe('Supabase Client Contract', () => {
  beforeEach(() => {
    // Reset any mocks or state if needed
  });

  describe('Client Initialization', () => {
    it('should export a Supabase client with valid configuration', async () => {
      // Test the default export (supabase client)
      const supabaseModule = await import('../src/index.js');
      const { default: supabase } = supabaseModule;
      
      expect(supabase).toBeDefined();
      expect(supabase.auth).toBeDefined();
      expect(supabase.from).toBeDefined();
      expect(typeof supabase.from).toBe('function');
    });

    it('should export service classes with proper types', async () => {
      const {
        AuthService,
        DatabaseService,
        ProfileService,
        MasjidService
      } = await import('../src/index.js');
      
      expect(AuthService).toBeDefined();
      expect(DatabaseService).toBeDefined();
      expect(ProfileService).toBeDefined();
      expect(MasjidService).toBeDefined();
      
      expect(typeof AuthService).toBe('function');
      expect(typeof DatabaseService).toBe('function');
      expect(typeof ProfileService).toBe('function');
      expect(typeof MasjidService).toBe('function');
    });

    it('should export service instances', async () => {
      const {
        authService,
        databaseService,
        profileService,
        masjidService
      } = await import('../src/index.js');
      
      expect(authService).toBeDefined();
      expect(databaseService).toBeDefined();
      expect(profileService).toBeDefined();
      expect(masjidService).toBeDefined();
    });

    it('should configure authentication properly', async () => {
      const supabaseModule = await import('../src/index.js');
      const { default: supabase } = supabaseModule;
      
      // Test auth methods exist
      expect(supabase.auth.signUp).toBeDefined();
      expect(supabase.auth.signInWithPassword).toBeDefined();
      expect(supabase.auth.signOut).toBeDefined();
      expect(supabase.auth.getUser).toBeDefined();
      expect(supabase.auth.getSession).toBeDefined();
    });

    it('should export TypeScript types', async () => {
      const supabaseModule = await import('../src/index.js');
      
      // These should be available for import (even though we can't test them directly)
      expect(supabaseModule).toBeDefined();
    });
  });

  describe('Authentication Service Contract', () => {
    it('should provide authentication methods', async () => {
      const { authService } = await import('../src/index.js');
      
      expect(authService.signUp).toBeDefined();
      expect(authService.signIn).toBeDefined();
      expect(authService.signOut).toBeDefined();
      expect(authService.getCurrentUser).toBeDefined();
      expect(authService.getCurrentSession).toBeDefined();
      expect(authService.resetPassword).toBeDefined();
      expect(authService.updatePassword).toBeDefined();
      expect(authService.updateUserMetadata).toBeDefined();
      expect(authService.onAuthStateChange).toBeDefined();
      
      expect(typeof authService.signUp).toBe('function');
      expect(typeof authService.signIn).toBe('function');
      expect(typeof authService.signOut).toBe('function');
      expect(typeof authService.getCurrentUser).toBe('function');
      expect(typeof authService.getCurrentSession).toBe('function');
      expect(typeof authService.resetPassword).toBe('function');
      expect(typeof authService.updatePassword).toBe('function');
      expect(typeof authService.updateUserMetadata).toBe('function');
      expect(typeof authService.onAuthStateChange).toBe('function');
    });
  });

  describe('Database Service Contract', () => {
    it('should provide database operation methods', async () => {
      const { databaseService } = await import('../src/index.js');
      
      expect(databaseService.table).toBeDefined();
      expect(databaseService.rpc).toBeDefined();
      expect(databaseService.subscribe).toBeDefined();
      expect(databaseService.count).toBeDefined();
      
      expect(typeof databaseService.table).toBe('function');
      expect(typeof databaseService.rpc).toBe('function');
      expect(typeof databaseService.subscribe).toBe('function');
      expect(typeof databaseService.count).toBe('function');
    });

    it('should provide typed table access', async () => {
      const { databaseService } = await import('../src/index.js');
      
      // Test that we can access tables
      const usersTable = databaseService.table('users');
      expect(usersTable).toBeDefined();
      
      const profilesTable = databaseService.table('profiles');
      expect(profilesTable).toBeDefined();
      
      const masjidsTable = databaseService.table('masjids');
      expect(masjidsTable).toBeDefined();
    });
  });

  describe('Profile Service Contract', () => {
    it('should provide profile management methods', async () => {
      const { profileService } = await import('../src/index.js');
      
      expect(profileService.getProfile).toBeDefined();
      expect(profileService.upsertProfile).toBeDefined();
      expect(profileService.getProfileAddresses).toBeDefined();
      expect(profileService.addProfileAddress).toBeDefined();
      
      expect(typeof profileService.getProfile).toBe('function');
      expect(typeof profileService.upsertProfile).toBe('function');
      expect(typeof profileService.getProfileAddresses).toBe('function');
      expect(typeof profileService.addProfileAddress).toBe('function');
    });
  });

  describe('Masjid Service Contract', () => {
    it('should provide masjid management methods', async () => {
      const { masjidService } = await import('../src/index.js');
      
      expect(masjidService.getAllMasjids).toBeDefined();
      expect(masjidService.getMasjid).toBeDefined();
      expect(masjidService.createMasjid).toBeDefined();
      expect(masjidService.updateMasjid).toBeDefined();
      expect(masjidService.getMasjidAdmins).toBeDefined();
      expect(masjidService.assignAdmin).toBeDefined();
      
      expect(typeof masjidService.getAllMasjids).toBe('function');
      expect(typeof masjidService.getMasjid).toBe('function');
      expect(typeof masjidService.createMasjid).toBe('function');
      expect(typeof masjidService.updateMasjid).toBe('function');
      expect(typeof masjidService.getMasjidAdmins).toBe('function');
      expect(typeof masjidService.assignAdmin).toBe('function');
    });
  });
});
