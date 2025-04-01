const { supabase } = require('../config/supabase');

/**
 * StatusCheck model for interacting with status_checks table
 */
class StatusCheck {
  /**
   * Create a new status check
   */
  static async create(checkData) {
    try {
      // Make sure we have a valid supabase client
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }

      console.log('Creating status check with data:', checkData);
      
      const { data, error } = await supabase
        .from('status_checks')
        .insert([checkData]);
      
      if (error) {
        console.error('Supabase error creating status check:', error);
        throw error;
      }
      
      console.log('Status check created successfully');
      return checkData; // Return the original data since Supabase might not return inserted data
    } catch (error) {
      console.error('Error creating status check:', error);
      throw error;
    }
  }

  /**
   * Get status checks for a service within a time range
   */
  static async getByServiceAndTimeRange(serviceId, startDate, endDate) {
    try {
      console.log(`Getting status checks for service ${serviceId} from ${startDate} to ${endDate}`);
      
      const { data, error } = await supabase
        .from('status_checks')
        .select('*')
        .eq('service_id', serviceId)
        .gte('timestamp', startDate)
        .lte('timestamp', endDate)
        .order('timestamp', { ascending: true });
      
      if (error) {
        console.error('Supabase error getting status checks:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error getting status checks by time range:', error);
      throw error;
    }
  }

  /**
   * Get the latest status check for a service
   */
  static async getLatestByService(serviceId) {
    try {
      console.log(`Getting latest status check for service ${serviceId}`);
      
      const { data, error } = await supabase
        .from('status_checks')
        .select('*')
        .eq('service_id', serviceId)
        .order('timestamp', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('Supabase error getting latest status check:', error);
        throw error;
      }
      
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error(`Error getting latest status check for service ${serviceId}:`, error);
      throw error;
    }
  }

  /**
   * Get the latest status check for all services
   */
  static async getLatestForAllServices() {
    try {
      console.log('Getting latest status for all services');
      
      // Get all services
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('*');
      
      if (servicesError) {
        console.error('Supabase error getting services:', servicesError);
        throw servicesError;
      }
      
      console.log(`Found ${services.length} services`);
      
      // For each service, get the latest status check
      const results = [];
      
      for (const service of services) {
        try {
          const latestCheck = await this.getLatestByService(service.id);
          
          results.push({
            id: service.id,
            name: service.name,
            url: service.url,
            description: service.description,
            status: latestCheck ? (latestCheck.is_operational ? 'operational' : 'down') : 'unknown',
            status_code: latestCheck ? latestCheck.status_code : null,
            response_time: latestCheck ? latestCheck.response_time : null,
            last_checked: latestCheck ? latestCheck.timestamp : null
          });
        } catch (error) {
          console.error(`Error getting latest check for service ${service.id}:`, error);
          
          // Add service with unknown status
          results.push({
            id: service.id,
            name: service.name,
            url: service.url,
            description: service.description,
            status: 'unknown',
            status_code: null,
            response_time: null,
            last_checked: null
          });
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error getting latest status for all services:', error);
      throw error;
    }
  }

  /**
   * Delete status checks older than the retention period
   */
  static async deleteOldChecks(retentionDays) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      
      console.log(`Deleting status checks older than ${cutoffDate.toISOString()}`);
      
      const { data, error } = await supabase
        .from('status_checks')
        .delete()
        .lt('timestamp', cutoffDate.toISOString());
      
      if (error) {
        console.error('Supabase error deleting old status checks:', error);
        throw error;
      }
      
      console.log(`Deleted status checks older than ${retentionDays} days`);
      return true;
    } catch (error) {
      console.error('Error deleting old status checks:', error);
      throw error;
    }
  }
}

module.exports = StatusCheck; 