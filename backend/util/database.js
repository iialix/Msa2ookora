const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mnizfspvhxqghljlgqnn.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uaXpmc3B2aHhxZ2hsamxncW5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyNTQyNDUsImV4cCI6MjA5MjgzMDI0NX0.njiQel2dV-0JWKvCQiRqQOd7Lk1h5a8DgzoptEFq4ZM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    const { error } = await supabase.from('players').select('id').limit(1);
    if (error) throw error;
    return true;
}

module.exports = { supabase, testConnection };