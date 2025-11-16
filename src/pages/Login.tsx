import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import * as OTPAuth from 'otpauth';

const Login = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [twoFactorSecret, setTwoFactorSecret] = useState<string | null>(null);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Check if 2FA is enabled
        const { data: profile } = await supabase
          .from('profiles')
          .select('two_factor_enabled, two_factor_secret')
          .eq('user_id', data.user.id)
          .single();

        if (profile?.two_factor_enabled && profile?.two_factor_secret) {
          // Require 2FA verification
          setPendingUserId(data.user.id);
          setTwoFactorSecret(profile.two_factor_secret);
          setShow2FADialog(true);
          // Sign out temporarily until 2FA is verified
          await supabase.auth.signOut();
        } else {
          // No 2FA, proceed with login
          await completeLogin(data.user.id);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!pendingUserId || !twoFactorSecret) return;

    try {
      // Verify the TOTP code
      const totp = new OTPAuth.TOTP({
        issuer: 'Whitestones Markets',
        label: email,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: twoFactorSecret,
      });

      const isValid = totp.validate({ token: twoFactorCode, window: 1 }) !== null;

      if (!isValid) {
        toast.error('Invalid verification code');
        return;
      }

      // Re-authenticate with password since we signed out
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await completeLogin(data.user.id);
        setShow2FADialog(false);
        setTwoFactorCode('');
      }
    } catch (error: any) {
      toast.error(error.message || '2FA verification failed');
    }
  };

  const completeLogin = async (userId: string) => {
    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: userId,
      action: 'login',
      ip_address: 'N/A',
      user_agent: navigator.userAgent,
    });

    toast.success('Login successful!');
    navigate('/dashboard');
  };

  const languages = [
    { code: 'de', name: 'Deutsch' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <Link to="/" className="absolute top-4 left-4">
        <Button variant="outline" className="gap-2">
          <Home className="h-4 w-4" />
          Back to Home
        </Button>
      </Link>
      
      <div className="absolute top-4 right-4">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as any)}
          className="bg-card border border-border rounded-md px-3 py-2 text-sm"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full max-w-md">
        <div className="bg-card p-8 rounded-lg shadow-lg border border-border">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">{t('auth.login')}</h1>
            <p className="text-muted-foreground">Welcome back to Whitestones Markets</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <label htmlFor="remember" className="text-sm text-foreground cursor-pointer">
                  {t('auth.rememberMe')}
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                {t('auth.forgotCode')}
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Loading...' : t('cta.login')}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {t('auth.noAccount')}{' '}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              {t('auth.createAccount')}
            </Link>
          </div>
        </div>
      </div>

      {/* 2FA Verification Dialog */}
      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Two-Factor Authentication</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit verification code from your authenticator app.
            </p>
            <div className="space-y-2">
              <Label htmlFor="twoFactorCode">Verification Code</Label>
              <Input
                id="twoFactorCode"
                type="text"
                placeholder="000000"
                maxLength={6}
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl tracking-widest"
              />
            </div>
            <Button 
              onClick={handleVerify2FA}
              className="w-full"
              disabled={twoFactorCode.length !== 6}
            >
              Verify
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
