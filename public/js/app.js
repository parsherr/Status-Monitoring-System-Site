// API Configuration
const API_KEY = 'your_api_key_here'; // This should be set securely in a production environment
const API_URL = '/api';
const SERVICES_ENDPOINT = `${API_URL}/services`;
const STATUS_ENDPOINT = `${API_URL}/status`;
const HISTORY_ENDPOINT = `${API_URL}/history`;

// DOM Elements
const servicesGrid = document.getElementById('services-grid');
const historyContainer = document.getElementById('history-container');
const overallStatus = document.getElementById('overall-status');
const statusMessage = document.getElementById('status-message');
const updateTime = document.getElementById('update-time');
const modal = document.getElementById('detail-modal');
const closeButton = document.querySelector('.close-button');
const modalTitle = document.getElementById('modal-title');
const detailDate = document.getElementById('detail-date');
const detailStatusBadge = document.getElementById('detail-status-badge');
const detailUptime = document.getElementById('detail-uptime');
const detailOutages = document.getElementById('detail-outages');
const detailDuration = document.getElementById('detail-duration');
const detailResponseTime = document.getElementById('detail-response-time');
const detailChecks = document.getElementById('detail-checks');

// State
let servicesData = [];
let historyData = [];

// Initialize the dashboard
async function initDashboard() {
  console.log('Initializing dashboard...');
  try {
    // Fetch current status
    console.log('Fetching current status...');
    const currentStatus = await fetchCurrentStatus();
    console.log('Current status fetched:', currentStatus);
    
    // Fetch history data
    console.log('Fetching history data...');
    const historyData = await fetchHistoryData();
    console.log('History data fetched:', historyData);
    
    // Render service cards
    console.log('Rendering service cards...');
    renderServiceCards(currentStatus);
    
    // Render history charts
    console.log('Rendering history charts...');
    renderHistoryCharts(historyData);
    
    // Update overall status
    console.log('Updating overall status...');
    updateOverallStatus(currentStatus);
    
    // Remove skeleton loaders
    console.log('Removing skeleton loaders...');
    removeSkeletons();
    
    console.log('Dashboard initialized successfully');
  } catch (error) {
    console.error('Error initializing dashboard:', error);
    showError('Failed to load dashboard data. Please try refreshing the page.');
    
    // Remove skeleton loaders even on error
    removeSkeletons();
    
    // Show empty state
    servicesGrid.innerHTML = '<div class="empty-state"><p>Unable to load services. Please try again later.</p></div>';
    historyContainer.innerHTML = '<div class="empty-state"><p>Unable to load history data. Please try again later.</p></div>';
  }
}

// Fetch current status of all services
async function fetchCurrentStatus() {
  try {
    const response = await fetch(STATUS_ENDPOINT);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'success' || !data.data) {
      throw new Error('Invalid response format');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error fetching current status:', error);
    
    // Fallback to services endpoint if status endpoint fails
    console.log('Falling back to services endpoint...');
    const response = await fetch(SERVICES_ENDPOINT);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'success' || !data.data) {
      throw new Error('Invalid response format');
    }
    
    // Return services with unknown status
    return data.data.map(service => ({
      ...service,
      status: 'unknown',
      status_code: null,
      response_time: null,
      last_checked: null
    }));
  }
}

// Fetch history data for all services
async function fetchHistoryData() {
  try {
    const response = await fetch(HISTORY_ENDPOINT);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'success' || !data.data) {
      throw new Error('Invalid response format');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error fetching history data:', error);
    
    // Fallback to services endpoint if history endpoint fails
    console.log('Falling back to services endpoint...');
    const response = await fetch(SERVICES_ENDPOINT);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'success' || !data.data) {
      throw new Error('Invalid response format');
    }
    
    // Return services with empty history
    return data.data.map(service => ({
      ...service,
      history: []
    }));
  }
}

// Render service cards
function renderServiceCards(services) {
  servicesGrid.innerHTML = '';
  
  if (!services || services.length === 0) {
    servicesGrid.innerHTML = '<div class="empty-state"><p>No services found.</p></div>';
    return;
  }
  
  services.forEach(service => {
    const statusClass = getStatusClass(service.status);
    const responseTime = service.response_time ? `${service.response_time}ms` : 'N/A';
    const lastChecked = service.last_checked ? formatDateTime(service.last_checked) : 'N/A';
    
    const serviceCard = document.createElement('div');
    serviceCard.className = 'service-card';
    serviceCard.innerHTML = `
      <div class="service-header">
        <h3>${service.name}</h3>
        <span class="status-badge ${statusClass}">${getStatusText(service.status)}</span>
      </div>
      <p>${service.description || 'No description available'}</p>
      <div class="service-details">
        <span>Last checked: ${lastChecked}</span>
        <span>Response time: ${responseTime}</span>
      </div>
    `;
    
    servicesGrid.appendChild(serviceCard);
  });
}

// Render history charts
function renderHistoryCharts(servicesHistory) {
  historyContainer.innerHTML = '';
  
  if (!servicesHistory || servicesHistory.length === 0) {
    historyContainer.innerHTML = '<div class="empty-state"><p>No history data available.</p></div>';
    return;
  }
  
  servicesHistory.forEach(service => {
    const serviceHistory = document.createElement('div');
    serviceHistory.className = 'service-history';
    serviceHistory.innerHTML = `
      <h3>${service.name}</h3>
      <div class="history-chart-container">
        <div class="history-bar-container" id="history-${service.id}"></div>
      </div>
    `;
    
    historyContainer.appendChild(serviceHistory);
    
    // Render history bars
    const historyBarContainer = document.getElementById(`history-${service.id}`);
    renderHistoryBars(historyBarContainer, service.history || [], service.name);
  });
}

// Render history bars
function renderHistoryBars(container, history, serviceName) {
  if (!history || history.length === 0) {
    container.innerHTML = '<div class="empty-history">No history data available</div>';
    return;
  }
  
  // Sort history by date
  const sortedHistory = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  sortedHistory.forEach(day => {
    const statusColorClass = getStatusColorClass(day.status);
    const date = formatDate(day.date);
    
    const historyBar = document.createElement('div');
    historyBar.className = `history-bar ${statusColorClass}`;
    historyBar.title = `${date}: ${day.uptime_percentage}% uptime`;
    historyBar.setAttribute('data-date', day.date);
    historyBar.setAttribute('data-service', serviceName);
    
    historyBar.addEventListener('click', () => {
      showDayDetails(day, serviceName);
    });
    
    container.appendChild(historyBar);
  });
  
  // If we have less than 45 days of history, add placeholder bars
  const daysToAdd = 45 - sortedHistory.length;
  if (daysToAdd > 0) {
    for (let i = 0; i < daysToAdd; i++) {
      const placeholderBar = document.createElement('div');
      placeholderBar.className = 'history-bar placeholder';
      placeholderBar.title = 'No data available';
      container.appendChild(placeholderBar);
    }
  }
}

// Update overall status
function updateOverallStatus(services) {
  if (!services || services.length === 0) {
    overallStatus.className = 'status-circle unknown';
    statusMessage.textContent = 'Status unknown';
    updateTime.textContent = 'No data available';
    return;
  }
  
  // Find the most recent check
  let latestTimestamp = null;
  services.forEach(service => {
    if (service.last_checked && (!latestTimestamp || new Date(service.last_checked) > new Date(latestTimestamp))) {
      latestTimestamp = service.last_checked;
    }
  });
  
  // Count services by status
  const statusCounts = {
    operational: 0,
    down: 0,
    unknown: 0
  };
  
  services.forEach(service => {
    if (service.status in statusCounts) {
      statusCounts[service.status]++;
    } else {
      statusCounts.unknown++;
    }
  });
  
  // Determine overall status
  let overallStatusClass = 'operational';
  let statusText = 'All systems operational';
  
  if (statusCounts.down > 0) {
    overallStatusClass = 'down';
    statusText = 'Some services are experiencing issues';
  } else if (statusCounts.unknown > 0 && statusCounts.operational === 0) {
    overallStatusClass = 'unknown';
    statusText = 'Status unknown';
  }
  
  overallStatus.className = `status-circle ${overallStatusClass}`;
  statusMessage.textContent = statusText;
  updateTime.textContent = latestTimestamp ? formatDateTime(latestTimestamp) : 'No data available';
}

// Show day details in modal
function showDayDetails(day, serviceName) {
  modalTitle.textContent = `${serviceName} - Status Details`;
  detailDate.textContent = formatDate(day.date);
  
  const statusClass = getStatusClass(day.status);
  detailStatusBadge.className = `status-badge ${statusClass}`;
  detailStatusBadge.textContent = getStatusText(day.status);
  
  detailUptime.textContent = `${day.uptime_percentage}% uptime`;
  
  // Format outage periods
  if (day.outage_periods && day.outage_periods.length > 0) {
    const formattedOutages = day.formatted_outages || day.outage_periods.map(period => 
      `${period.start} - ${period.end}`
    ).join(', ');
    
    detailOutages.textContent = formattedOutages;
  } else {
    detailOutages.textContent = 'No outages reported';
  }
  
  // Format outage duration
  if (day.outage_duration) {
    detailDuration.textContent = formatDuration(day.outage_duration);
  } else {
    detailDuration.textContent = '0 minutes';
  }
  
  // Response time and checks
  detailResponseTime.textContent = day.avg_response_time ? `${day.avg_response_time} ms` : 'N/A';
  
  if (day.total_checks) {
    detailChecks.textContent = `${day.total_checks} total, ${day.failed_checks || 0} failed`;
  } else {
    detailChecks.textContent = 'No data available';
  }
  
  modal.style.display = 'block';
}

// Calculate outage duration from outage periods
function calculateOutageDuration(outagePeriods) {
  if (!outagePeriods || outagePeriods.length === 0) {
    return { hours: 0, minutes: 0, seconds: 0 };
  }
  
  let totalSeconds = 0;
  
  outagePeriods.forEach(period => {
    const startParts = period.start.split(':').map(Number);
    const endParts = period.end.split(':').map(Number);
    
    const startSeconds = startParts[0] * 3600 + startParts[1] * 60 + (startParts[2] || 0);
    const endSeconds = endParts[0] * 3600 + endParts[1] * 60 + (endParts[2] || 0);
    
    totalSeconds += endSeconds - startSeconds;
  });
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return { hours, minutes, seconds };
}

// Format duration object to string
function formatDuration(duration) {
  if (typeof duration === 'string') {
    return duration;
  }
  
  if (!duration || typeof duration !== 'object') {
    return '0 minutes';
  }
  
  const { hours, minutes, seconds } = duration;
  
  const parts = [];
  
  if (hours > 0) {
    parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  }
  
  if (minutes > 0) {
    parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  }
  
  if (seconds > 0 && hours === 0) {
    parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);
  }
  
  return parts.length > 0 ? parts.join(', ') : '0 minutes';
}

// Helper functions
function getStatusClass(status) {
  switch (status) {
    case 'operational':
      return 'operational';
    case 'down':
      return 'down';
    case 'partial':
      return 'partial';
    case 'GREEN':
      return 'operational';
    case 'YELLOW':
      return 'partial';
    case 'RED':
      return 'down';
    default:
      return 'unknown';
  }
}

function getStatusColorClass(status) {
  switch (status) {
    case 'operational':
    case 'GREEN':
      return 'green';
    case 'partial':
    case 'YELLOW':
      return 'yellow';
    case 'down':
    case 'RED':
      return 'red';
    default:
      return 'unknown';
  }
}

function getStatusText(status) {
  switch (status) {
    case 'operational':
    case 'GREEN':
      return 'Operational';
    case 'partial':
    case 'YELLOW':
      return 'Partial Outage';
    case 'down':
    case 'RED':
      return 'Down';
    default:
      return 'Unknown';
  }
}

function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

function removeSkeletons() {
  const skeletons = document.querySelectorAll('.skeleton');
  skeletons.forEach(skeleton => {
    skeleton.classList.remove('skeleton');
  });
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  
  document.body.appendChild(errorDiv);
  
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

// Event listeners
closeButton.addEventListener('click', () => {
  modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});

// Add some CSS for empty states and unknown status
const style = document.createElement('style');
style.textContent = `
  .empty-state {
    padding: 2rem;
    text-align: center;
    background-color: #f5f5f5;
    border-radius: 8px;
    margin: 1rem 0;
  }
  
  .empty-history {
    text-align: center;
    padding: 1rem;
    color: #666;
    font-style: italic;
  }
  
  .status-circle.unknown {
    background-color: #999;
  }
  
  .status-badge.unknown {
    background-color: #999;
  }
  
  .history-bar.unknown {
    background-color: #999;
  }
  
  .history-bar.placeholder {
    background-color: #eee;
    cursor: default;
  }
`;
document.head.appendChild(style);

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', initDashboard); 