const StatusCheck = require('../models/StatusCheck');
const Service = require('../models/Service');
const DailySummary = require('../models/DailySummary');

/**
 * Get current status of all services
 */
async function getCurrentStatus(req, res) {
  try {
    console.log('Fetching current status for all services');
    const statusData = await StatusCheck.getLatestForAllServices();
    return res.json({ status: 'success', data: statusData });
  } catch (error) {
    console.error('Error fetching current status:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch current status' });
  }
}

/**
 * Get status history for all services
 */
async function getStatusHistory(req, res) {
  try {
    console.log('Fetching status history for all services');
    const days = parseInt(req.query.days) || 45;
    
    // Get all services
    const services = await Service.getAll();
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get history for each service
    const historyData = await Promise.all(
      services.map(async (service) => {
        const history = await DailySummary.getByServiceAndDateRange(
          service.id,
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        );
        
        return {
          ...service,
          history
        };
      })
    );
    
    return res.json({ status: 'success', data: historyData });
  } catch (error) {
    console.error('Error fetching status history:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch status history' });
  }
}

/**
 * Get current status of a specific service
 */
async function getServiceStatus(req, res) {
  try {
    const { id } = req.params;
    console.log(`Fetching current status for service ${id}`);
    
    // Check if service exists
    const service = await Service.getById(id);
    if (!service) {
      return res.status(404).json({ status: 'error', message: 'Service not found' });
    }
    
    // Get latest status check
    const statusCheck = await StatusCheck.getLatestByService(id);
    if (!statusCheck) {
      return res.json({ 
        status: 'success', 
        data: { 
          ...service, 
          status: 'unknown',
          last_checked: null
        } 
      });
    }
    
    return res.json({ status: 'success', data: { ...service, ...statusCheck } });
  } catch (error) {
    console.error(`Error fetching service status: ${error.message}`);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch service status' });
  }
}

/**
 * Get status history for a specific service
 */
async function getServiceHistory(req, res) {
  try {
    const { id } = req.params;
    const days = parseInt(req.query.days) || 45;
    console.log(`Fetching ${days} days of history for service ${id}`);
    
    // Check if service exists
    const service = await Service.getById(id);
    if (!service) {
      return res.status(404).json({ status: 'error', message: 'Service not found' });
    }
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get history
    const history = await DailySummary.getByServiceAndDateRange(
      id,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
    
    return res.json({ 
      status: 'success', 
      data: { 
        ...service, 
        history 
      } 
    });
  } catch (error) {
    console.error(`Error fetching service history: ${error.message}`);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch service history' });
  }
}

module.exports = {
  getCurrentStatus,
  getStatusHistory,
  getServiceStatus,
  getServiceHistory
}; 