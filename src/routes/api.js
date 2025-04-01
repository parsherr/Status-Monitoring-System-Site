const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const statusController = require('../controllers/statusController');

// Service routes
router.get('/services', serviceController.getAllServices);
router.get('/services/:id', serviceController.getServiceById);

// Status routes
router.get('/status', statusController.getCurrentStatus);
router.get('/history', statusController.getStatusHistory);
router.get('/services/:id/status', statusController.getServiceStatus);
router.get('/services/:id/history', statusController.getServiceHistory);

module.exports = router; 