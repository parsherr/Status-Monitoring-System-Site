const { supabase } = require('../config/supabase');

/**
 * DailySummary model for interacting with daily_summaries table
 */
class DailySummary {
  /**
   * Create a new daily summary
   */
  static async create(summaryData) {
    try {
      console.log('Creating daily summary:', summaryData);
      
      // Convert outage_periods to JSON string if it's an object
      if (summaryData.outage_periods && typeof summaryData.outage_periods !== 'string') {
        summaryData.outage_periods = JSON.stringify(summaryData.outage_periods);
      }
      
      const { data, error } = await supabase
        .from('daily_summaries')
        .insert([summaryData])
        .select();
      
      if (error) {
        console.error('Supabase error creating daily summary:', error);
        throw error;
      }
      
      return data[0];
    } catch (error) {
      console.error('Error creating daily summary:', error);
      throw error;
    }
  }

  /**
   * Update a daily summary
   */
  static async update(serviceId, date, summaryData) {
    try {
      console.log(`Updating daily summary for service ${serviceId} on ${date}:`, summaryData);
      
      // Convert outage_periods to JSON string if it's an object
      if (summaryData.outage_periods && typeof summaryData.outage_periods !== 'string') {
        summaryData.outage_periods = JSON.stringify(summaryData.outage_periods);
      }
      
      const { data, error } = await supabase
        .from('daily_summaries')
        .update(summaryData)
        .eq('service_id', serviceId)
        .eq('date', date)
        .select();
      
      if (error) {
        console.error(`Supabase error updating daily summary for service ${serviceId} on ${date}:`, error);
        throw error;
      }
      
      return data[0];
    } catch (error) {
      console.error(`Error updating daily summary for service ${serviceId} on ${date}:`, error);
      throw error;
    }
  }

  /**
   * Get a daily summary for a service on a specific date
   */
  static async getByServiceAndDate(serviceId, date) {
    try {
      console.log(`Getting daily summary for service ${serviceId} on ${date}`);
      
      const { data, error } = await supabase
        .from('daily_summaries')
        .select('*')
        .eq('service_id', serviceId)
        .eq('date', date)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned" error
        console.error(`Supabase error getting daily summary for service ${serviceId} on ${date}:`, error);
        throw error;
      }
      
      // Parse outage_periods JSON string if it exists
      if (data && data.outage_periods) {
        try {
          data.outage_periods = JSON.parse(data.outage_periods);
        } catch (e) {
          console.warn(`Error parsing outage_periods for service ${serviceId} on ${date}:`, e);
        }
      }
      
      return data;
    } catch (error) {
      console.error(`Error getting daily summary for service ${serviceId} on ${date}:`, error);
      throw error;
    }
  }

  /**
   * Get daily summaries for a service within a date range
   */
  static async getByServiceAndDateRange(serviceId, startDate, endDate) {
    try {
      console.log(`Getting daily summaries for service ${serviceId} from ${startDate} to ${endDate}`);
      
      const { data, error } = await supabase
        .from('daily_summaries')
        .select('*')
        .eq('service_id', serviceId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });
      
      if (error) {
        console.error(`Supabase error getting daily summaries for service ${serviceId}:`, error);
        throw error;
      }
      
      // Parse outage_periods JSON string for each summary
      if (data) {
        data.forEach(summary => {
          if (summary.outage_periods) {
            try {
              summary.outage_periods = JSON.parse(summary.outage_periods);
            } catch (e) {
              console.warn(`Error parsing outage_periods for service ${serviceId} on ${summary.date}:`, e);
            }
          }
        });
      }
      
      return data || [];
    } catch (error) {
      console.error(`Error getting daily summaries for service ${serviceId}:`, error);
      throw error;
    }
  }

  /**
   * Get all daily summaries for a specific date
   */
  static async getAllByDate(date) {
    try {
      console.log(`Getting all daily summaries for ${date}`);
      
      const { data, error } = await supabase
        .from('daily_summaries')
        .select('*')
        .eq('date', date);
      
      if (error) {
        console.error(`Supabase error getting all daily summaries for ${date}:`, error);
        throw error;
      }
      
      // Parse outage_periods JSON string for each summary
      if (data) {
        data.forEach(summary => {
          if (summary.outage_periods) {
            try {
              summary.outage_periods = JSON.parse(summary.outage_periods);
            } catch (e) {
              console.warn(`Error parsing outage_periods for service ${summary.service_id} on ${date}:`, e);
            }
          }
        });
      }
      
      return data || [];
    } catch (error) {
      console.error(`Error getting all daily summaries for ${date}:`, error);
      throw error;
    }
  }

  /**
   * Get all daily summaries within a date range
   */
  static async getAllByDateRange(startDate, endDate) {
    try {
      console.log(`Getting all daily summaries from ${startDate} to ${endDate}`);
      
      const { data, error } = await supabase
        .from('daily_summaries')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });
      
      if (error) {
        console.error(`Supabase error getting all daily summaries from ${startDate} to ${endDate}:`, error);
        throw error;
      }
      
      // Parse outage_periods JSON string for each summary
      if (data) {
        data.forEach(summary => {
          if (summary.outage_periods) {
            try {
              summary.outage_periods = JSON.parse(summary.outage_periods);
            } catch (e) {
              console.warn(`Error parsing outage_periods for service ${summary.service_id} on ${summary.date}:`, e);
            }
          }
        });
      }
      
      return data || [];
    } catch (error) {
      console.error(`Error getting all daily summaries from ${startDate} to ${endDate}:`, error);
      throw error;
    }
  }

  /**
   * Delete daily summaries older than the retention period
   */
  static async deleteOldSummaries(retentionDays) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      
      console.log(`Deleting daily summaries older than ${cutoffDate.toISOString().split('T')[0]}`);
      
      const { data, error } = await supabase
        .from('daily_summaries')
        .delete()
        .lt('date', cutoffDate.toISOString().split('T')[0]);
      
      if (error) {
        console.error('Supabase error deleting old daily summaries:', error);
        throw error;
      }
      
      console.log(`Deleted daily summaries older than ${retentionDays} days`);
      return true;
    } catch (error) {
      console.error('Error deleting old daily summaries:', error);
      throw error;
    }
  }
}

module.exports = DailySummary; 