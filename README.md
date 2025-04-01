# Status Monitoring System

A comprehensive status monitoring system for tracking and reporting the status of all services in your organization. This system is similar to status.discord.com, providing a dashboard to view the current and historical status of all services.

## Features

- **Monitoring Service**: Regularly checks all services and records their status
- **API Layer**: Provides JSON data for all service statuses with security features
- **Frontend Dashboard**: Displays current status and 45-day history for all services
- **Database**: Stores service information, status checks, and daily summaries

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL)
- **Frontend**: HTML, CSS, JavaScript (with Chart.js for visualizations)
- **Security**: API key authentication, IP whitelisting, rate limiting

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your configuration
4. Set up Supabase:
   - Create a new Supabase project
   - Run the SQL scripts in the `database` directory to set up tables
5. Start the development server:
   ```
   npm run dev
   ```
6. Access the dashboard at `http://localhost:3000`

## API Documentation

## License