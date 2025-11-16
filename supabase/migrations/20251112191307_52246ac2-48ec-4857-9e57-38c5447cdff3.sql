-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  date_of_birth DATE,
  country TEXT,
  profile_picture TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles table
CREATE TYPE public.app_role AS ENUM ('user', 'admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE(user_id, role)
);

-- Function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- KYC documents table
CREATE TYPE public.kyc_status AS ENUM ('pending', 'under_review', 'approved', 'rejected');

CREATE TABLE public.kyc_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  id_document_url TEXT,
  selfie_url TEXT,
  status kyc_status DEFAULT 'pending',
  rejection_reason TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Withdrawal accounts table
CREATE TYPE public.account_type AS ENUM ('bank', 'crypto', 'paypal', 'payoneer');

CREATE TABLE public.withdrawal_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_type account_type NOT NULL,
  account_name TEXT,
  account_details JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Main account balances
CREATE TABLE public.account_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  main_balance DECIMAL(20, 2) DEFAULT 0,
  profit_balance DECIMAL(20, 2) DEFAULT 0,
  total_deposited DECIMAL(20, 2) DEFAULT 0,
  total_withdrawn DECIMAL(20, 2) DEFAULT 0,
  account_active_since TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investment plans
CREATE TABLE public.investment_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  min_amount DECIMAL(20, 2) NOT NULL,
  max_amount DECIMAL(20, 2),
  roi_percentage DECIMAL(5, 2) NOT NULL,
  duration_days INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User investments
CREATE TYPE public.investment_status AS ENUM ('active', 'completed', 'cancelled');

CREATE TABLE public.investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.investment_plans(id) NOT NULL,
  amount DECIMAL(20, 2) NOT NULL,
  expected_profit DECIMAL(20, 2) NOT NULL,
  status investment_status DEFAULT 'active',
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deposits
CREATE TYPE public.transaction_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.deposits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(20, 2) NOT NULL,
  payment_method TEXT,
  transaction_hash TEXT,
  status transaction_status DEFAULT 'pending',
  proof_url TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Withdrawals
CREATE TABLE public.withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(20, 2) NOT NULL,
  withdrawal_account_id UUID REFERENCES public.withdrawal_accounts(id),
  status transaction_status DEFAULT 'pending',
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions history
CREATE TYPE public.transaction_type AS ENUM ('deposit', 'withdrawal', 'investment', 'profit', 'bonus', 'referral');

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type transaction_type NOT NULL,
  amount DECIMAL(20, 2) NOT NULL,
  balance_after DECIMAL(20, 2) NOT NULL,
  description TEXT,
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referrals
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bonus_amount DECIMAL(20, 2) DEFAULT 0,
  bonus_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity logs
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Website settings (admin configurable)
CREATE TABLE public.website_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for KYC
CREATE POLICY "Users can view own KYC" ON public.kyc_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own KYC" ON public.kyc_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own KYC" ON public.kyc_documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all KYC" ON public.kyc_documents FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all KYC" ON public.kyc_documents FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for withdrawal accounts
CREATE POLICY "Users can manage own withdrawal accounts" ON public.withdrawal_accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all withdrawal accounts" ON public.withdrawal_accounts FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for account balances
CREATE POLICY "Users can view own balance" ON public.account_balances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all balances" ON public.account_balances FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for investment plans
CREATE POLICY "Everyone can view active plans" ON public.investment_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage plans" ON public.investment_plans FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for investments
CREATE POLICY "Users can view own investments" ON public.investments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own investments" ON public.investments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all investments" ON public.investments FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for deposits
CREATE POLICY "Users can view own deposits" ON public.deposits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own deposits" ON public.deposits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all deposits" ON public.deposits FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for withdrawals
CREATE POLICY "Users can view own withdrawals" ON public.withdrawals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own withdrawals" ON public.withdrawals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all withdrawals" ON public.withdrawals FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for transactions
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all transactions" ON public.transactions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for referrals
CREATE POLICY "Users can view own referrals" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
CREATE POLICY "Users can create referrals" ON public.referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id);
CREATE POLICY "Admins can manage all referrals" ON public.referrals FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for activity logs
CREATE POLICY "Users can view own activity" ON public.activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity" ON public.activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all activity" ON public.activity_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for website settings
CREATE POLICY "Everyone can view settings" ON public.website_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.website_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  INSERT INTO public.account_balances (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_account_balances_updated_at BEFORE UPDATE ON public.account_balances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default investment plans
INSERT INTO public.investment_plans (name, min_amount, max_amount, roi_percentage, duration_days, description) VALUES
('Starter Plan', 100, 4999, 10, 7, 'Perfect for beginners looking to start their investment journey'),
('Platinum Plan', 5000, 19999, 25, 14, 'For investors ready to grow their portfolio significantly'),
('Executive Plan', 20000, 99999, 50, 21, 'Premium plan for serious investors seeking substantial returns'),
('Apex Plan', 100000, NULL, 100, 30, 'Elite tier for high-net-worth individuals seeking maximum growth');

-- Insert initial website settings
INSERT INTO public.website_settings (key, value) VALUES
('contact_email', 'whitestonesmarkets@gmail.com'),
('support_email', 'support@whitestonesmarkets.com'),
('company_address', '123 Financial District, New York, NY 10004'),
('company_phone', '+1 (555) 123-4567'),
('bitcoin_address', 'bc1q9s4hsv0m3mq7pu0gfj33l3ey800fe6ujy95apc');

-- Create admin user (will be added via trigger when they sign up)
-- The email tgramstore@gmail.com will need to be manually assigned admin role after signup