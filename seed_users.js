// ============================================================
// Supabase Auth User Seeder — Option 3 (Admin API)
// ============================================================
// Usage:
//   1. Fill in your SUPABASE_URL and SERVICE_ROLE_KEY below
//      (find them in: Supabase Dashboard → Project Settings → API)
//   2. Run: node seed-users.js
//
// ⚠️  Use SERVICE_ROLE_KEY, NOT the anon key.
//     Never commit this file with real keys to version control.
// ============================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ufbhteewrbcvcqxdzsui.supabase.co'; // 🔁 replace
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmYmh0ZWV3cmJjdmNxeGR6c3VpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjgxMzQ5NSwiZXhwIjoyMDg4Mzg5NDk1fQ.Xjkfh22KnVK3mQKLEVc7u2GqbZ3IHB8-gwAwZEGeW80'; // 🔁 replace

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ============================================================
// Users to seed
// ============================================================
const users = [
  {
    id: 'a1b2c3d4-0001-4000-8000-000000000001',
    email: 'emma.carter@example.com',
    password: 'Password123!',
    name: 'Emma Carter',
  },
  {
    id: 'a1b2c3d4-0002-4000-8000-000000000002',
    email: 'james.rivera@example.com',
    password: 'Password123!',
    name: 'James Rivera',
  },
  {
    id: 'a1b2c3d4-0003-4000-8000-000000000003',
    email: 'sofia.nguyen@example.com',
    password: 'Password123!',
    name: 'Sofia Nguyen',
  },
  {
    id: 'caf4b78b-b2e5-4b7a-b790-fbcb1105bfac',
    email: 'alex.morgan@example.com',
    password: 'Password123!',
    name: 'Alex Morgan',
  },
];

// ============================================================
// Seed function
// ============================================================
async function seedUsers() {
  console.log(`\n🌱 Seeding ${users.length} users into Supabase Auth...\n`);

  const results = { created: [], skipped: [], failed: [] };

  for (const user of users) {
    // Check if user already exists by attempting to fetch them
    const { data: existing } = await supabase.auth.admin.getUserById(user.id);

    if (existing?.user) {
      console.log(`⏭️  Skipped  ${user.email} (already exists)`);
      results.skipped.push(user.email);
      continue;
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true, // marks email as confirmed, no email sent
      user_metadata: { name: user.name },
    });

    if (error) {
      console.error(`❌ Failed   ${user.email} — ${error.message}`);
      results.failed.push({ email: user.email, error: error.message });
      continue;
    }

    // Warn if Supabase assigned a different ID than expected
    if (data.user.id !== user.id) {
      console.warn(
        `⚠️  Created  ${user.email} but ID differs!\n` +
          `   Expected: ${user.id}\n` +
          `   Got:      ${data.user.id}\n` +
          `   → Update your seed SQL files to use the new ID.`,
      );
    } else {
      console.log(`✅ Created  ${user.email} (id: ${data.user.id})`);
    }

    results.created.push(user.email);
  }

  // ── Summary ──────────────────────────────────────────────
  console.log('\n──────────────────────────────────────────');
  console.log(`✅ Created:  ${results.created.length}`);
  console.log(`⏭️  Skipped:  ${results.skipped.length}`);
  console.log(`❌ Failed:   ${results.failed.length}`);

  if (results.failed.length > 0) {
    console.log('\nFailed users:');
    results.failed.forEach((f) => console.log(`  • ${f.email}: ${f.error}`));
  }

  console.log('\n🏁 Done. You can now run your seed SQL files.\n');
}

seedUsers().catch(console.error);
