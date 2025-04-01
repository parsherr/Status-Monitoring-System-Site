const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const cron = require('node-cron');
const { setupMonitoring } = require('./services/monitoringService');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP for simplicity
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api', require('./routes/api'));

// Serve the main HTML file for all routes (SPA style)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Setup monitoring service
  const checkIntervalMinutes = parseInt(process.env.CHECK_INTERVAL_MINUTES) || 30;
  console.log(`Setting up monitoring service with ${checkIntervalMinutes} minute interval`);
  
  setupMonitoring();
  
  // Schedule monitoring to run at the specified interval
  cron.schedule(`*/${checkIntervalMinutes} * * * *`, async () => {
    console.log(`Running scheduled monitoring check at ${new Date().toISOString()}`);
    await setupMonitoring();
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
}); 