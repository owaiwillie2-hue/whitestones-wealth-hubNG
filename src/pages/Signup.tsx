import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { countries } from '@/utils/countries';

const Signup = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [country, setCountry] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      toast.error('Please agree to the Terms & Conditions');
      return;
    }

    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            phone_number: phone,
            date_of_birth: dob,
            country: country,
            referral_code: referralCode,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Update profile with additional data
        await supabase.from('profiles').update({
          phone_number: phone,
          date_of_birth: dob,
          country: country,
        }).eq('user_id', data.user.id);

        toast.success('Account created successfully! Please check your email to verify your account.');
        navigate('/login');
      }
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-12">
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
            <h1 className="text-3xl font-bold text-foreground mb-2">{t('auth.signup')}</h1>
            <p className="text-muted-foreground">Join Whitestones Markets today</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label htmlFor="fullName">{t('auth.fullName')} *</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">{t('auth.email')} *</Label>
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
              <Label htmlFor="password">{t('auth.password')} *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone">{t('auth.phone')} *</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="dob">{t('auth.dob')} *</Label>
              <Input
                id="dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="country">{t('auth.country')} *</Label>
              <Select value={country} onValueChange={setCountry} required>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.name}>
                      {c.flag} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="referralCode">Referral Code (Optional)</Label>
              <Input
                id="referralCode"
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Enter referral code"
                className="mt-1"
              />
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                required
              />
              <label htmlFor="terms" className="text-sm text-foreground cursor-pointer leading-tight">
                {t('auth.terms')}
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : t('auth.signup')}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {t('auth.haveAccount')}{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              {t('auth.signInInstead')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
