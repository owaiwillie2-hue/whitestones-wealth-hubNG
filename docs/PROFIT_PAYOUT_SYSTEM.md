# Automated Profit Payout System

## Overview
The system automatically calculates and distributes investment profits daily based on the plan's ROI percentage and duration.

## How It Works

1. **Database Function**: `process_investment_profits()` 
   - Loops through all active investments
   - Calculates daily ROI based on plan percentage
   - Distributes profits proportionally for each day
   - Updates user profit balances
   - Creates transaction records
   - Marks completed investments

2. **Edge Function**: `process-profits`
   - Calls the database function on a schedule
   - Accessible at: https://elrofncgydzlvixekjxj.supabase.co/functions/v1/process-profits

## Setting Up the Cron Job

To run the profit payout system automatically every day at midnight, follow these steps:

### Step 1: Enable Required Extensions
Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard/project/elrofncgydzlvixekjxj/sql/new):

```sql
-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### Step 2: Create the Cron Job
Run this SQL to schedule the profit payout to run daily at midnight UTC:

```sql
SELECT cron.schedule(
  'daily-profit-payout',
  '0 0 * * *', -- Every day at midnight UTC
  $$
  SELECT net.http_post(
    url:='https://elrofncgydzlvixekjxj.supabase.co/functions/v1/process-profits',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscm9mbmNneWR6bHZpeGVranhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5Mzc3MDIsImV4cCI6MjA3ODUxMzcwMn0.kBf8YdXZn3cH9x-OXY0JXcP8SY03LQ_PiZpKSWT6QqQ"}'::jsonb,
    body:=concat('{"time": "', now(), '"}')::jsonb
  ) as request_id;
  $$
);
```

### Step 3: Verify the Cron Job
Check that the cron job was created successfully:

```sql
SELECT * FROM cron.job;
```

### Manual Testing
You can manually trigger the profit payout anytime by calling:

```sql
SELECT process_investment_profits();
```

Or by making an HTTP request to the edge function:
```bash
curl -X POST https://elrofncgydzlvixekjxj.supabase.co/functions/v1/process-profits
```

## Profit Calculation Example

For an investment of $1000 with 20% ROI over 30 days:
- Daily ROI = 20% / 30 = 0.67% per day
- Daily Profit = $1000 × 0.67% = $6.70 per day

After 10 days: $67.00 in profits distributed to the user's profit balance.

## Notes
- Profits are added to the user's `profit_balance` in the `account_balances` table
- A transaction record is created for each payout
- Investments are automatically marked as 'completed' when the end date is reached
- The system tracks the last payout date to avoid duplicate payments
