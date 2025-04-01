const { supabase } = require('../config/supabase');

/**
 * Service model for interacting with services table
 */
class Service {
  /**
   * Get all services
   * @returns {Promise<Array>} Array of services
   */
  static async getAll() {
    try {
      console.log('Fetching all services from database...');
      
      const { data, error } = await supabase
        .from('services')
        .select('*');
      
      if (error) {
        console.error('Supabase error getting services:', error);
        throw error;
      }
      
      console.log(`Found ${data.length} services in database`);
      return data || [];
    } catch (error) {
      console.error('Error getting all services:', error);
      throw error;
    }
  }
  
  /**
   * Get a service by ID
   * @param {string} id Service ID
   * @returns {Promise<Object>} Service object
   */
  static async getById(id) {
    try {
      console.log(`Fetching service with ID: ${id}`);
      
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error(`Supabase error getting service ${id}:`, error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error(`Error getting service ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Create a new service
   * @param {Object} serviceData Service data
   * @returns {Promise<Object>} Created service
   */
  static async create(serviceData) {
    try {
      console.log('Creating new service:', serviceData);
      
      const { data, error } = await supabase
        .from('services')
        .insert([serviceData])
        .select();
      
      if (error) {
        console.error('Supabase error creating service:', error);
        throw error;
      }
      
      return data[0];
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  }
  
  /**
   * Update a service
   * @param {string} id Service ID
   * @param {Object} serviceData Service data to update
   * @returns {Promise<Object>} Updated service
   */
  static async update(id, serviceData) {
    try {
      console.log(`Updating service ${id}:`, serviceData);
      
      const { data, error } = await supabase
        .from('services')
        .update(serviceData)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error(`Supabase error updating service ${id}:`, error);
        throw error;
      }
      
      return data[0];
    } catch (error) {
      console.error(`Error updating service ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a service
   * @param {string} id Service ID
   * @returns {Promise<void>}
   */
  static async delete(id) {
    try {
      console.log(`Deleting service ${id}`);
      
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error(`Supabase error deleting service ${id}:`, error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting service ${id}:`, error);
      throw error;
    }
  }
}

module.exports = Service; 