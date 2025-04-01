/**
 * Script to update services with working test URLs
 */
require('dotenv').config();
const { supabase } = require('../config/supabase');

async function updateServices() {
  try {
    console.log('Updating services with working test URLs...');
    
    // Define working test URLs
    const serviceUpdates = [
      { name: 'SetScript Ana Sayfa', url: 'https://www.google.com' },
      { name: 'SetScript API', url: 'https://www.github.com' },
      { name: 'SetScript Docs', url: 'https://www.microsoft.com' },
      { name: 'SetScript AI', url: 'https://www.apple.com' }
    ];
    
    // Update each service
    for (const service of serviceUpdates) {
      const { data, error } = await supabase
        .from('services')
        .update({ url: service.url })
        .eq('name', service.name);
      
      if (error) {
        console.error(`Error updating ${service.name}:`, error);
      } else {
        console.log(`Updated ${service.name} to use URL: ${service.url}`);
      }
    }
    
    // Verify the updates
    const { data, error } = await supabase
      .from('services')
      .select('*');
    
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
    console.error('Error in update script:', error);
  }
}

// Run the update
updateServices()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 