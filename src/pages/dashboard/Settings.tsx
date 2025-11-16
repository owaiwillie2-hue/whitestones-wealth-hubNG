import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSearchParams } from 'react-router-dom';
import Profile from './Profile';
import WithdrawalAccounts from './WithdrawalAccounts';
import ActivityLog from './ActivityLog';

const Settings = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'profile';
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const { toast } = useToast();

  const handlePasswordChange = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: 'Password Updated',
        description: 'Your password has been successfully changed.',
      });
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account preferences</p>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Profile />
        </TabsContent>

        <TabsContent value="account">
          <WithdrawalAccounts />
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <Button onClick={handlePasswordChange}>Change Password</Button>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label htmlFor="2fa">Enable Two-Factor Authentication</Label>
                  <Switch id="2fa" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="alerts">Email Me on Unusual Activity</Label>
                  <Switch id="alerts" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="logs">Save My Activity Logs</Label>
                  <Switch id="logs" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <ActivityLog />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
