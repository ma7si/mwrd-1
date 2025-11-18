import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const testAccounts = [
  {
    email: 'admin@mwrd.com',
    password: 'admin123',
    role: 'admin',
    real_name: 'Admin User',
    company_name: 'mwrd Platform',
    status: 'approved'
  },
  {
    email: 'client@test.com',
    password: 'client123',
    role: 'client',
    real_name: 'John Smith',
    company_name: 'ABC Manufacturing Co.',
    status: 'approved'
  },
  {
    email: 'supplier@test.com',
    password: 'supplier123',
    role: 'supplier',
    real_name: 'Sarah Johnson',
    company_name: 'Quality Supplies Ltd.',
    status: 'approved'
  },
  {
    email: 'supplier2@test.com',
    password: 'supplier123',
    role: 'supplier',
    real_name: 'Mike Chen',
    company_name: 'Global Electronics Inc.',
    status: 'approved'
  }
];

async function setupTestAccounts() {
  console.log('Setting up test accounts...\n');

  for (const account of testAccounts) {
    console.log(`Creating account: ${account.email}`);

    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: account.email,
        password: account.password,
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`  ⚠️  Account already exists: ${account.email}`);
          continue;
        }
        throw authError;
      }

      if (!authData.user) {
        console.log(`  ❌ Failed to create user: ${account.email}`);
        continue;
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: account.email,
          role: account.role,
          real_name: account.real_name,
          company_name: account.company_name,
          status: account.status,
          phone: '+1 234 567 8900'
        });

      if (profileError) {
        console.log(`  ❌ Profile error: ${profileError.message}`);
        continue;
      }

      console.log(`  ✅ Created: ${account.email} (${account.role})`);

      // Sign out to prepare for next account
      await supabase.auth.signOut();

    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  }

  console.log('\n✅ Test account setup complete!\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('TEST ACCOUNTS - Use these credentials to log in:');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('🔐 ADMIN PORTAL ACCESS:');
  console.log('   Email:    admin@mwrd.com');
  console.log('   Password: admin123');
  console.log('   Role:     Administrator\n');

  console.log('👤 CLIENT PORTAL ACCESS:');
  console.log('   Email:    client@test.com');
  console.log('   Password: client123');
  console.log('   Role:     Client (Buyer)\n');

  console.log('🏭 SUPPLIER PORTAL ACCESS #1:');
  console.log('   Email:    supplier@test.com');
  console.log('   Password: supplier123');
  console.log('   Role:     Supplier (Seller)\n');

  console.log('🏭 SUPPLIER PORTAL ACCESS #2:');
  console.log('   Email:    supplier2@test.com');
  console.log('   Password: supplier123');
  console.log('   Role:     Supplier (Seller)\n');

  console.log('═══════════════════════════════════════════════════════');
  console.log('NOTE: Accounts are pre-approved and ready to use!');
  console.log('═══════════════════════════════════════════════════════\n');
}

setupTestAccounts().catch(console.error);
