-- Add 2FA support to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;

-- Add last_profit_payout column to investments table for tracking
ALTER TABLE investments ADD COLUMN IF NOT EXISTS last_profit_payout TIMESTAMP WITH TIME ZONE;

-- Create a function to calculate and distribute profits
CREATE OR REPLACE FUNCTION process_investment_profits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  inv RECORD;
  profit_amount NUMERIC;
  daily_roi NUMERIC;
  days_elapsed INTEGER;
BEGIN
  -- Loop through all active investments
  FOR inv IN 
    SELECT i.*, p.roi_percentage, p.duration_days
    FROM investments i
    JOIN investment_plans p ON i.plan_id = p.id
    WHERE i.status = 'active'
    AND i.end_date > NOW()
  LOOP
    -- Calculate days since last payout or start date
    days_elapsed := EXTRACT(DAY FROM NOW() - COALESCE(inv.last_profit_payout, inv.start_date))::INTEGER;
    
    IF days_elapsed >= 1 THEN
      -- Calculate daily ROI
      daily_roi := inv.roi_percentage / inv.duration_days;
      
      -- Calculate profit for elapsed days
      profit_amount := (inv.amount * daily_roi / 100) * days_elapsed;
      
      -- Update user's profit balance
      UPDATE account_balances
      SET profit_balance = COALESCE(profit_balance, 0) + profit_amount,
          updated_at = NOW()
      WHERE user_id = inv.user_id;
      
      -- Create transaction record
      INSERT INTO transactions (user_id, type, amount, balance_after, description, reference_id)
      SELECT 
        inv.user_id,
        'profit',
        profit_amount,
        (SELECT COALESCE(main_balance, 0) + COALESCE(profit_balance, 0) FROM account_balances WHERE user_id = inv.user_id),
        'Investment profit payout for ' || days_elapsed || ' days',
        inv.id;
      
      -- Update last payout timestamp
      UPDATE investments
      SET last_profit_payout = NOW()
      WHERE id = inv.id;
      
      -- Check if investment has completed
      IF inv.end_date <= NOW() THEN
        UPDATE investments
        SET status = 'completed',
            completed_at = NOW()
        WHERE id = inv.id;
      END IF;
    END IF;
  END LOOP;
END;
$$;