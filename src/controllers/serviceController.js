const Service = require('../models/Service');

/**
 * Get all services
 */
async function getAllServices(req, res) {
  try {
    console.log('Fetching all services');
    const services = await Service.getAll();
    return res.json({ status: 'success', data: services });
  } catch (error) {
    console.error('Error fetching services:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch services' });
  }
}

/**
 * Get a service by ID
 */
async function getServiceById(req, res) {
  try {
    const { id } = req.params;
    console.log(`Fetching service with ID: ${id}`);
    
    const service = await Service.getById(id);
    
    if (!service) {
      return res.status(404).json({ status: 'error', message: 'Service not found' });
    }
    
    return res.json({ status: 'success', data: service });
  } catch (error) {
    console.error(`Error fetching service: ${error.message}`);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch service' });
  }
}

/**
 * Create a new service
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function createService(req, res) {
  try {
    const { name, url, description } = req.body;
    
    // Validate required fields
    if (!name || !url) {
      return res.status(400).json({
        status: 'error',
        message: 'Name and URL are required'
      });
    }
    
    // Create service
    const serviceData = {
      name,
      url,
      description: description || '',
      created_at: new Date().toISOString()
    };
    
    const newService = await Service.create(serviceData);
    
    res.status(201).json({
      status: 'success',
      message: 'Service created successfully',
      data: newService
    });
  } catch (err) {
    console.error('Error creating service:', err);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to create service',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}

/**
 * Update a service
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function updateService(req, res) {
  try {
    const { id } = req.params;
    const { name, url, description } = req.body;
    
    if (!id) {
      return res.status(400).json({
        status: 'error',
        message: 'Service ID is required'
      });
    }
    
    // Check if service exists
    const existingService = await Service.getById(id);
    
    if (!existingService) {
      return res.status(404).json({
        status: 'error',
        message: 'Service not found'
      });
    }
    
    // Update service
    const serviceData = {};
    if (name) serviceData.name = name;
    if (url) serviceData.url = url;
    if (description !== undefined) serviceData.description = description;
    
    const updatedService = await Service.update(id, serviceData);
    
    res.json({
      status: 'success',
      message: 'Service updated successfully',
      data: updatedService
    });
  } catch (err) {
    console.error(`Error updating service with ID ${req.params.id}:`, err);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to update service',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}

/**
 * Delete a service
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function deleteService(req, res) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        status: 'error',
        message: 'Service ID is required'
      });
    }
    
    // Check if service exists
    const existingService = await Service.getById(id);
    
    if (!existingService) {
      return res.status(404).json({
        status: 'error',
        message: 'Service not found'
      });
    }
    
    // Delete service
    await Service.delete(id);
    
    res.json({
      status: 'success',
      message: 'Service deleted successfully'
    });
  } catch (err) {
    console.error(`Error deleting service with ID ${req.params.id}:`, err);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete service',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService
}; 