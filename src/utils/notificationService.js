const axios = require('axios');
require('dotenv').config();

/**
 * Notification service for sending alerts about service status changes
 */

/**
 * Send a notification about a service status change
 */
async function sendNotification(data) {
  try {
    console.log(`Sending notification for ${data.service}: ${data.type}`);
    
    // Only send Discord notifications
    if (process.env.DISCORD_WEBHOOK_URL) {
      await sendDiscordNotification(data);
    }
    
    // Email and SMS notifications remain disabled
    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
}

/**
 * Send a notification to Discord
 */
async function sendDiscordNotification(data) {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.log('Discord webhook URL not configured');
      return false;
    }
    
    console.log(`Sending Discord notification for ${data.service}`);
    
    let color, title;
    
    switch (data.type) {
      case 'service_down':
        color = 0xf04747; // Red
        title = '🔴 Service Down';
        break;
      case 'service_up':
        color = 0x43b581; // Green
        title = '🟢 Service Restored';
        break;
      default:
        color = 0xfaa61a; // Yellow
        title = '⚠️ Service Status Alert';
    }
    
    const embed = {
      title,
      color,
      description: `**Service:** ${data.service}`,
      fields: [
        {
          name: 'Status',
          value: data.statusCode ? `HTTP ${data.statusCode}` : 'Connection Error',
          inline: true
        }
      ],
      timestamp: data.timestamp || new Date().toISOString()
    };
    
    if (data.error) {
      embed.fields.push({
        name: 'Error',
        value: data.error,
        inline: false
      });
    }
    
    await axios.post(webhookUrl, {
      embeds: [embed]
    });
    
    console.log(`Discord notification sent for ${data.service}`);
    return true;
  } catch (error) {
    console.error('Error sending Discord notification:', error);
    return false;
  }
}

/**
 * Send an email notification (disabled)
 */
async function sendEmailNotification(data) {
  console.log(`[EMAIL NOTIFICATIONS DISABLED] Would send email notification for ${data.service}`);
  return false;
}

/**
 * Send an SMS notification (disabled)
 */
async function sendSmsNotification(data) {
  console.log(`[SMS NOTIFICATIONS DISABLED] Would send SMS notification for ${data.service}`);
  return false;
}

module.exports = {
  sendNotification,
  sendDiscordNotification,
  sendEmailNotification,
  sendSmsNotification
}; 