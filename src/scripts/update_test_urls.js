/**
 * Simple script to update services with working test URLs
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client directly in this script
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

console.log('Initializing Supabase client with URL:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateTestUrls() {
  try {
    console.log('Updating services with working test URLs...');
    
    // Update SetScript Ana Sayfa
    console.log('Updating SetScript Ana Sayfa...');
    const { error: error1 } = await supabase
      .from('services')
      .update({ url: 'https://www.google.com' })
      .eq('name', 'SetScript Ana Sayfa');
    
    if (error1) {
      console.error('Error updating SetScript Ana Sayfa:', error1);
    } else {
      console.log('SetScript Ana Sayfa updated successfully');
    }
    
    // Update SetScript API
    console.log('Updating SetScript API...');
    const { error: error2 } = await supabase
      .from('services')
      .update({ url: 'https://www.github.com' })
      .eq('name', 'SetScript API');
    
    if (error2) {
      console.error('Error updating SetScript API:', error2);
    } else {
      console.log('SetScript API updated successfully');
    }
    
    // Update SetScript Docs
    console.log('Updating SetScript Docs...');
    const { error: error3 } = await supabase
      .from('services')
      .update({ url: 'https://www.microsoft.com' })
      .eq('name', 'SetScript Docs');
    
    if (error3) {
      console.error('Error updating SetScript Docs:', error3);
    } else {
      console.log('SetScript Docs updated successfully');
    }
    
    // Update SetScript AI
    console.log('Updating SetScript AI...');
    const { error: error4 } = await supabase
      .from('services')
      .update({ url: 'https://www.apple.com' })
      .eq('name', 'SetScript AI');
    
    if (error4) {
      console.error('Error updating SetScript AI:', error4);
    } else {
      console.log('SetScript AI updated successfully');
    }
    
    // Verify updates
    const { data, error } = await supabase
      .from('services')
      .select('name, url');
    
    if (error) {
      console.error('Error fetching updated services:', error);
    } else {
      console.log('Updated services:');
      data.forEach(service => {
        console.log(`- ${service.name}: ${service.url}`);
      });
    }
    
    console.log('Service update completed');
  } catch (error) {
    console.error('Error updating services:', error);
  }
}

// Run the update
updateTestUrls()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 