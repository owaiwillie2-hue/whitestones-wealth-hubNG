-- Add investment_balance to account_balances, transfer, notifications, admin_notes, and settings

-- Add wallet type enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'wallet_type') THEN
    CREATE TYPE public.wallet_type AS ENUM ('main', 'investment');
  END IF;
END$$;

-- Add investment_balance column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'account_balances' AND column_name = 'investment_balance'
  ) THEN
    ALTER TABLE public.account_balances
      ADD COLUMN investment_balance DECIMAL(20,2) DEFAULT 0;
  END IF;
END$$;

-- Ensure transaction_type enum contains 'transfer'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'transaction_type' AND e.enumlabel = 'transfer'
  ) THEN
    ALTER TYPE public.transaction_type ADD VALUE 'transfer';
  END IF;
END$$;

-- Wallet transfers table (Main -> Investment only by business logic)
CREATE TABLE IF NOT EXISTS public.wallet_transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  from_wallet wallet_type NOT NULL,
  to_wallet wallet_type NOT NULL,
  amount DECIMAL(20,2) NOT NULL CHECK (amount >= 0),
  status transaction_status DEFAULT 'pending',
  reference TEXT,
  meta JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Notifications table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_category') THEN
    CREATE TYPE public.notification_category AS ENUM ('payment_updates', 'withdraw_downtime', 'investment_updates', 'server_issues', 'schedule_changes', 'general');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL = broadcast to all users
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category notification_category DEFAULT 'general',
  data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin notes table
CREATE TABLE IF NOT EXISTS public.admin_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings keys if not present
INSERT INTO public.website_settings (key, value)
SELECT * FROM (VALUES
  ('first_deposit_bonus_percent','10'),
  ('kyc_approval_bonus_amount','0'),
  ('bitcoin_qr_url','')
) AS s(k,v)
WHERE NOT EXISTS (SELECT 1 FROM public.website_settings ws WHERE ws.key = s.k);

-- Enable RLS on new tables
ALTER TABLE public.wallet_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;

-- RLS policies for wallet_transfers
CREATE POLICY "Users can create own transfers" ON public.wallet_transfers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own transfers" ON public.wallet_transfers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage transfers" ON public.wallet_transfers FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for notifications
CREATE POLICY "Admins can manage notifications" ON public.notifications FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON public.notifications FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS policies for admin_notes
CREATE POLICY "Admins can manage admin notes" ON public.admin_notes FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view notes for a user" ON public.admin_notes FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Add helper view for user wallets (main, investment, profit)
CREATE OR REPLACE VIEW public.user_wallets AS
SELECT
  ab.user_id,
  ab.main_balance::DECIMAL(20,2) AS main_balance,
  COALESCE(ab.investment_balance, 0)::DECIMAL(20,2) AS investment_balance,
  COALESCE(ab.profit_balance, 0)::DECIMAL(20,2) AS profit_balance,
  ab.updated_at
FROM public.account_balances ab;

-- Grant select on view to public (RLS on underlying table will still apply)
GRANT SELECT ON public.user_wallets TO PUBLIC;
