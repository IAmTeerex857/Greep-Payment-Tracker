// Script to set up Supabase Auth user for production
// This script should be run with the SUPABASE_SERVICE_KEY environment variable set
// Example: SUPABASE_SERVICE_KEY=your-service-key node setup-prod-auth.js

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://fwawdkznyzvfjqfpjefi.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error('Error: SUPABASE_SERVICE_KEY environment variable is required');
  console.error('Example usage: SUPABASE_SERVICE_KEY=your-key node setup-prod-auth.js');
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupProductionAuth() {
  try {
    console.log('Setting up production auth user...');
    
    // 1. Create a new user with the desired credentials
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@greep.io',
      password: 'Grace2Grace',
      email_confirm: true,
      user_metadata: { name: 'Admin User' }
    });
    
    if (error) {
      console.error('Error creating auth user:', error.message);
      return;
    }
    
    console.log('Successfully created auth user:', data.user.id);
    
    // 2. Update or create the user in the custom users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        id: data.user.id,
        name: 'Admin User',
        email: 'admin@greep.io',
        password: 'Grace2Grace', // Note: In a real production app, you might not want to store this
        role: 'admin',
        tier: 'A',
        created_at: new Date().toISOString(),
        active: true,
        can_login: true
      }, { onConflict: 'id' });
    
    if (userError) {
      console.error('Error updating custom users table:', userError.message);
      return;
    }
    
    console.log('Successfully updated custom users table');
    console.log('Production auth setup complete!');
    console.log('\nYou can now login with:');
    console.log('Email: admin@greep.io');
    console.log('Password: Grace2Grace');
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

// Run the setup function
setupProductionAuth();
