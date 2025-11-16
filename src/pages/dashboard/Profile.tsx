import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

const Profile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    setProfile(data);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone_number: profile.phone_number,
          country: profile.country,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-2">Manage your personal information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">{t('auth.fullName')}</Label>
                <Input
                  id="fullName"
                  value={profile.full_name || ''}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input id="email" value={profile.email} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t('auth.phone')}</Label>
                <Input
                  id="phone"
                  value={profile.phone_number || ''}
                  onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">{t('auth.country')}</Label>
                <Input
                  id="country"
                  value={profile.country || ''}
                  onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">{t('auth.dob')}</Label>
                <Input id="dob" type="date" value={profile.date_of_birth || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <select
                  className="w-full p-2 border rounded-md bg-background"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                >
                  <option value="en">English</option>
                  <option value="de">Deutsch</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="it">Italiano</option>
                  <option value="pt">Português</option>
                </select>
              </div>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
