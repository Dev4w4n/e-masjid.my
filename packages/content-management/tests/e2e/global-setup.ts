/**
 * Global E2E Test Setup
 *
 * Initializes test environment and database for E2E tests.
 * Retrieves real IDs from database as per constitutional requirements.
 */
import { chromium, FullConfig } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

export interface TestContext {
  realIds: {
    users: {
      admin: string;
      regularUser: string;
      adminPutrajaya: string;
    };
    masjids: {
      klcc: string;
      putrajaya: string;
    };
    content: {
      pending: string;
      approved: string;
      rejected: string;
    };
    displays: {
      klccMain: string;
      putrajayaMain: string;
    };
  };
  authTokens: {
    admin: string;
    regularUser: string;
    adminPutrajaya: string;
  };
}

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test setup...');

  // Initialize Supabase client
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL || 'http://localhost:54321',
    process.env.VITE_SUPABASE_ANON_KEY || 'test-anon-key'
  );

  try {
    // 1. Retrieve real test user IDs from database
    console.log('📋 Retrieving test user IDs...');
    const { data: users, error: usersError } = await supabase
      .from('auth.users')
      .select('id, email, user_metadata')
      .in('email', [
        'admin@emasjid.test',
        'user@emasjid.test',
        'admin-putrajaya@emasjid.test',
      ]);

    if (usersError || !users || users.length !== 3) {
      throw new Error(
        `Failed to retrieve test users: ${usersError?.message || 'Missing users'}`
      );
    }

    const adminUser = users.find(u => u.email === 'admin@emasjid.test');
    const regularUser = users.find(u => u.email === 'user@emasjid.test');
    const adminPutrajayaUser = users.find(
      u => u.email === 'admin-putrajaya@emasjid.test'
    );

    if (!adminUser || !regularUser || !adminPutrajayaUser) {
      throw new Error('Missing required test users');
    }

    // 2. Retrieve real masjid IDs
    console.log('🕌 Retrieving masjid IDs...');
    const { data: masjids, error: masjidsError } = await supabase
      .from('masjids')
      .select('id, name')
      .in('name', ['Masjid KLCC', 'Masjid Putrajaya']);

    if (masjidsError || !masjids || masjids.length !== 2) {
      throw new Error(
        `Failed to retrieve masjids: ${masjidsError?.message || 'Missing masjids'}`
      );
    }

    const klccMasjid = masjids.find(m => m.name === 'Masjid KLCC');
    const putrajayaMasjid = masjids.find(m => m.name === 'Masjid Putrajaya');

    if (!klccMasjid || !putrajayaMasjid) {
      throw new Error('Missing required test masjids');
    }

    // 3. Retrieve real content IDs
    console.log('📄 Retrieving content IDs...');
    const { data: content, error: contentError } = await supabase
      .from('display_content')
      .select('id, status, title')
      .eq('masjid_id', klccMasjid.id)
      .in('status', ['pending', 'approved', 'rejected'])
      .limit(10);

    if (contentError) {
      throw new Error(`Failed to retrieve content: ${contentError.message}`);
    }

    const pendingContent = content?.find(c => c.status === 'pending');
    const approvedContent = content?.find(c => c.status === 'approved');
    const rejectedContent = content?.find(c => c.status === 'rejected');

    // 4. Retrieve real display IDs
    console.log('📺 Retrieving display IDs...');
    const { data: displays, error: displaysError } = await supabase
      .from('tv_displays')
      .select('id, name, masjid_id')
      .in('masjid_id', [klccMasjid.id, putrajayaMasjid.id]);

    if (displaysError) {
      throw new Error(`Failed to retrieve displays: ${displaysError.message}`);
    }

    const klccDisplay = displays?.find(d => d.masjid_id === klccMasjid.id);
    const putrajayaDisplay = displays?.find(
      d => d.masjid_id === putrajayaMasjid.id
    );

    // 5. Generate auth tokens for test users
    console.log('🔐 Generating auth tokens...');

    // Admin token
    const { data: adminAuth, error: adminAuthError } =
      await supabase.auth.signInWithPassword({
        email: 'admin@emasjid.test',
        password: 'testpassword123',
      });

    if (adminAuthError || !adminAuth.session) {
      throw new Error(
        `Failed to authenticate admin: ${adminAuthError?.message}`
      );
    }

    // Regular user token
    const { data: userAuth, error: userAuthError } =
      await supabase.auth.signInWithPassword({
        email: 'user@emasjid.test',
        password: 'testpassword123',
      });

    if (userAuthError || !userAuth.session) {
      throw new Error(`Failed to authenticate user: ${userAuthError?.message}`);
    }

    // Putrajaya admin token
    const { data: putrajayaAuth, error: putrajayaAuthError } =
      await supabase.auth.signInWithPassword({
        email: 'admin-putrajaya@emasjid.test',
        password: 'testpassword123',
      });

    if (putrajayaAuthError || !putrajayaAuth.session) {
      throw new Error(
        `Failed to authenticate putrajaya admin: ${putrajayaAuthError?.message}`
      );
    }

    // 6. Store context for tests
    const testContext: TestContext = {
      realIds: {
        users: {
          admin: adminUser.id,
          regularUser: regularUser.id,
          adminPutrajaya: adminPutrajayaUser.id,
        },
        masjids: {
          klcc: klccMasjid.id,
          putrajaya: putrajayaMasjid.id,
        },
        content: {
          pending: pendingContent?.id || '',
          approved: approvedContent?.id || '',
          rejected: rejectedContent?.id || '',
        },
        displays: {
          klccMain: klccDisplay?.id || '',
          putrajayaMain: putrajayaDisplay?.id || '',
        },
      },
      authTokens: {
        admin: adminAuth.session.access_token,
        regularUser: userAuth.session.access_token,
        adminPutrajaya: putrajayaAuth.session.access_token,
      },
    };

    // Store in process environment for test access
    process.env.E2E_TEST_CONTEXT = JSON.stringify(testContext);

    console.log('✅ E2E test setup completed successfully');
    console.log(`   - Admin User ID: ${testContext.realIds.users.admin}`);
    console.log(`   - KLCC Masjid ID: ${testContext.realIds.masjids.klcc}`);
    console.log(
      `   - Content IDs: ${Object.values(testContext.realIds.content).filter(Boolean).length} found`
    );
    console.log(
      `   - Display IDs: ${Object.values(testContext.realIds.displays).filter(Boolean).length} found`
    );
  } catch (error) {
    console.error('❌ E2E test setup failed:', error);
    process.exit(1);
  }
}

export default globalSetup;
