const axios = require('axios');
const Service = require('../models/Service');
const StatusCheck = require('../models/StatusCheck');
const DailySummary = require('../models/DailySummary');
const { calculateDailySummary } = require('../utils/summaryCalculator');
const { sendNotification } = require('../utils/notificationService');

/**
 * Check a single service and record its status
 * @param {Object} service Service object
 * @returns {Promise<Object>} Status check result
 */
async function checkService(service) {
  console.log(`Checking service: ${service.name} (${service.url})`);
  
  let statusCode = null;
  let responseTime = null;
  let isOperational = false;
  let error = null;
  
  const startTime = Date.now();
  
  try {
    // Set a timeout of 10 seconds for the request
    const response = await axios.get(service.url, {
      timeout: 10000,
      validateStatus: () => true, // Don't throw on any status code
      headers: {
        'User-Agent': 'SetScript-StatusMonitor/1.0'
      }
    });
    
    responseTime = Date.now() - startTime;
    statusCode = response.status;
    isOperational = statusCode >= 200 && statusCode < 400;
    
    console.log(`Service ${service.name} status: ${statusCode}, response time: ${responseTime}ms`);
  } catch (err) {
    responseTime = Date.now() - startTime;
    error = err.message;
    isOperational = false;
    
    console.error(`Error checking service ${service.name}:`, err.message);
  }
  
  // Create status check record
  const checkData = {
    service_id: service.id,
    status_code: statusCode,
    response_time: responseTime,
    is_operational: isOperational,
    error: error,
    timestamp: new Date().toISOString()
  };
  
  try {
    console.log(`Recording status check for ${service.name}:`, checkData);
    const statusCheck = await StatusCheck.create(checkData);
    
    // Get previous status check to determine if status changed
    const previousChecks = await StatusCheck.getByServiceAndTimeRange(
      service.id,
      new Date(Date.now() - 3600000).toISOString(), // Last hour
      new Date().toISOString()
    );
    
    // If this is the first check or status changed, send notification
    if (previousChecks.length <= 1 || 
        (previousChecks.length > 1 && previousChecks[previousChecks.length - 2].is_operational !== isOperational)) {
      
      // Send notification about status change
      await sendNotification({
        service: service.name,
        type: isOperational ? 'service_up' : 'service_down',
        statusCode,
        error,
        timestamp: new Date().toISOString()
      });
    }
    
    // Update daily summary
    await updateDailySummary(service.id);
    
    return statusCheck;
  } catch (err) {
    console.error(`Error recording status check for ${service.name}:`, err);
    // Continue execution even if there's an error
    return null;
  }
}

/**
 * Update daily summary for a service
 * @param {string} serviceId Service ID
 * @returns {Promise<void>}
 */
async function updateDailySummary(serviceId) {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Get all checks for today
    const startOfDay = new Date(today);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    const checks = await StatusCheck.getByServiceAndTimeRange(
      serviceId,
      startOfDay.toISOString(),
      endOfDay.toISOString()
    );
    
    if (checks.length === 0) {
      console.log(`No checks found for service ${serviceId} on ${today}`);
      return;
    }
    
    // Calculate summary data
    const summary = calculateDailySummary(checks);
    
    // Check if summary already exists for today
    const existingSummary = await DailySummary.getByServiceAndDate(serviceId, today);
    
    if (existingSummary) {
      // Update existing summary
      await DailySummary.update(serviceId, today, summary);
    } else {
      // Create new summary
      await DailySummary.create({
        service_id: serviceId,
        date: today,
        ...summary
      });
    }
    
    console.log(`Updated daily summary for service ${serviceId} on ${today}`);
  } catch (err) {
    console.error(`Error updating daily summary for service ${serviceId}:`, err);
    // Continue execution even if there's an error
  }
}

/**
 * Clean up old data beyond retention period
 * @returns {Promise<void>}
 */
async function cleanupOldData() {
  try {
    const retentionDays = parseInt(process.env.DATA_RETENTION_DAYS || '45', 10);
    
    console.log(`Cleaning up data older than ${retentionDays} days`);
    
    // Delete old status checks
    await StatusCheck.deleteOldChecks(retentionDays);
    
    // Delete old daily summaries
    await DailySummary.deleteOldSummaries(retentionDays);
    
    console.log('Data cleanup completed');
  } catch (err) {
    console.error('Error cleaning up old data:', err);
  }
}

/**
 * Main function to check all services and update summaries
 * @returns {Promise<void>}
 */
async function setupMonitoring() {
  try {
    console.log('Starting monitoring service...');
    
    // Get all services
    console.log('Fetching all services from database...');
    const services = await Service.getAll();
    
    if (services.length === 0) {
      console.log('No services found to monitor');
      return;
    }
    
    console.log(`Found ${services.length} services to monitor`);
    
    // Check each service one by one to avoid overwhelming the database
    for (const service of services) {
      try {
        await checkService(service);
      } catch (err) {
        console.error(`Error checking service ${service.name}:`, err);
        // Continue with next service
      }
    }
    
    // Clean up old data once a day (at midnight)
    const currentHour = new Date().getHours();
    if (currentHour === 0) {
      await cleanupOldData();
    }
    
    console.log('Monitoring cycle completed');
  } catch (err) {
    console.error('Error in monitoring service:', err);
  }
}

module.exports = {
  checkService,
  updateDailySummary,
  cleanupOldData,
  setupMonitoring
}; 