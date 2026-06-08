import { createClient } from '@supabase/supabase-js';


// Initialize Supabase client
// Using direct values from project configuration
const supabaseUrl = 'https://jwefvgujlutngrtypysi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3ZWZ2Z3VqbHV0bmdydHlweXNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NTgyOTYsImV4cCI6MjA2ODEzNDI5Nn0.drP0XcjD2VCH-n7PZ9xL-Q5Owlwzb2AdUshdfN9X5Q8';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };