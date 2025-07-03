import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fwawdkznyzvfjqfpjefi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YXdka3pueXp2ZmpxZnBqZWZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NzIxMjgsImV4cCI6MjA2NzE0ODEyOH0.C9NjiS50jwZtKl34E8wmHK1R7rpa2TSg5r2oVzoJhcY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
