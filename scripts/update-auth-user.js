// Script to update Supabase Auth user credentials
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://fwawdkznyzvfjqfpjefi.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SERVICE_KEY_HERE'; // Replace with your service key

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateAuthUser() {
  try {
    console.log('Starting auth user update process...');
    
    // 1. First, let's delete the existing admin user (if it exists)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(
      '957dadef-fa6e-42eb-bf2b-731f6d726391' // The admin user ID
    );
    
    if (deleteError) {
      console.error('Error deleting existing user:', deleteError.message);
      // Continue anyway as the user might not exist
    } else {
      console.log('Successfully deleted existing user');
    }
    
    // 2. Create a new user with the desired credentials
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      uuid: '957dadef-fa6e-42eb-bf2b-731f6d726391', // Use the same ID as in our app
      email: 'admin@greep.io',
      password: 'Grace2Grace',
      email_confirm: true,
      user_metadata: { name: 'Admin User' }
    });
    
    if (createError) {
      console.error('Error creating new user:', createError.message);
      return;
    }
    
    console.log('Successfully created new auth user:', userData);
    
    // 3. Update the custom users table to match
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        email: 'admin@greep.io',
        password: 'Grace2Grace' // Note: In production, you wouldn't store plaintext passwords
      })
      .eq('id', '957dadef-fa6e-42eb-bf2b-731f6d726391');
    
    if (updateError) {
      console.error('Error updating custom users table:', updateError.message);
      return;
    }
    
    console.log('Successfully updated custom users table');
    console.log('Auth user update complete!');
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

// Run the update function
updateAuthUser();
