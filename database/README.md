# Database Setup

This directory contains SQL scripts for setting up the Supabase database for the Status Monitoring System.

## Setup Instructions

1. Create a new Supabase project at [https://app.supabase.io/](https://app.supabase.io/)
2. Go to the SQL Editor in your Supabase dashboard
3. Copy the contents of `schema.sql` and run it in the SQL Editor
4. Update your `.env` file with your Supabase URL and anon key

## Database Schema

The database consists of three main tables:

1. **services** - Stores information about the services being monitored
2. **status_checks** - Stores individual status check results
3. **daily_summaries** - Stores daily summary data for each service

## Data Retention

By default, data is retained for 45 days. This can be configured in the `.env` file by changing the `DATA_RETENTION_DAYS` value.

A cleanup function is included in the schema to automatically remove old data. This can be scheduled to run daily using pg_cron if available in your Supabase project. 