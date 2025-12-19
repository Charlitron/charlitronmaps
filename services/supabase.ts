
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vcajwttfxrysxyranehk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjYWp3dHRmeHJ5c3h5cmFuZWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3OTA3NjgsImV4cCI6MjA3NTM2Njc2OH0.oCCzYfYSvFbvWmcqjE3PGNaqLELsQSDDdpk20MSLMRY';

export const supabase = createClient(supabaseUrl, supabaseKey);
