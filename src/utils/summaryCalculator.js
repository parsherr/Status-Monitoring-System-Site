/**
 * Calculate daily summary from status checks
 * @param {Array} checks Array of status checks for a day
 * @returns {Object} Summary data
 */
function calculateDailySummary(checks) {
  if (!checks || checks.length === 0) {
    return {
      uptime_percentage: 0,
      total_checks: 0,
      failed_checks: 0,
      outage_periods: JSON.stringify([]),
      avg_response_time: 0,
      status: 'RED' // Default to RED if no checks
    };
  }
  
  // Sort checks by timestamp
  checks.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  // Calculate basic metrics
  const totalChecks = checks.length;
  const failedChecks = checks.filter(check => !check.is_operational).length;
  const uptimePercentage = ((totalChecks - failedChecks) / totalChecks) * 100;
  
  // Calculate average response time (only for successful checks)
  const successfulChecks = checks.filter(check => check.is_operational && check.response_time);
  const avgResponseTime = successfulChecks.length > 0
    ? successfulChecks.reduce((sum, check) => sum + check.response_time, 0) / successfulChecks.length
    : 0;
  
  // Identify outage periods
  const outagePeriods = [];
  let currentOutage = null;
  
  for (let i = 0; i < checks.length; i++) {
    const check = checks[i];
    const timestamp = new Date(check.timestamp);
    const timeStr = timestamp.toTimeString().split(' ')[0]; // HH:MM:SS format
    
    if (!check.is_operational) {
      if (!currentOutage) {
        currentOutage = {
          start: timeStr,
          end: null
        };
      }
    } else if (currentOutage) {
      currentOutage.end = timeStr;
      outagePeriods.push(currentOutage);
      currentOutage = null;
    }
  }
  
  // If there's an ongoing outage at the end of the day
  if (currentOutage) {
    currentOutage.end = '23:59:59'; // End of day
    outagePeriods.push(currentOutage);
  }
  
  // Determine status based on uptime percentage
  let status;
  if (uptimePercentage === 100) {
    status = 'GREEN';
  } else if (uptimePercentage === 0) {
    status = 'RED';
  } else {
    status = 'YELLOW';
  }
  
  return {
    uptime_percentage: parseFloat(uptimePercentage.toFixed(2)),
    total_checks: totalChecks,
    failed_checks: failedChecks,
    outage_periods: JSON.stringify(outagePeriods),
    avg_response_time: Math.round(avgResponseTime),
    status
  };
}

/**
 * Calculate total outage duration from outage periods
 * @param {Array} outagePeriods Array of outage periods
 * @returns {Object} Duration in hours, minutes, seconds
 */
function calculateOutageDuration(outagePeriods) {
  if (!outagePeriods || outagePeriods.length === 0) {
    return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
  }
  
  let totalSeconds = 0;
  
  for (const period of outagePeriods) {
    const startParts = period.start.split(':').map(Number);
    const endParts = period.end.split(':').map(Number);
    
    const startSeconds = startParts[0] * 3600 + startParts[1] * 60 + startParts[2];
    const endSeconds = endParts[0] * 3600 + endParts[1] * 60 + endParts[2];
    
    totalSeconds += endSeconds - startSeconds;
  }
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return { hours, minutes, seconds, totalSeconds };
}

/**
 * Format outage periods for display
 * @param {string} outagePeriods JSON string of outage periods
 * @returns {string} Formatted outage periods
 */
function formatOutagePeriods(outagePeriods) {
  try {
    const periods = JSON.parse(outagePeriods);
    
    if (periods.length === 0) {
      return 'No outages';
    }
    
    return periods.map(period => `${period.start} - ${period.end}`).join(', ');
  } catch (err) {
    console.error('Error parsing outage periods:', err);
    return 'Error parsing outage data';
  }
}

module.exports = {
  calculateDailySummary,
  calculateOutageDuration,
  formatOutagePeriods
}; 