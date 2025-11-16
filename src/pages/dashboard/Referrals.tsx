import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Copy } from 'lucide-react';

const Referrals = () => {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [referralCode, setReferralCode] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchReferrals();
    generateReferralCode();
  }, []);

  const generateReferralCode = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setReferralCode(`${window.location.origin}/signup?ref=${user.id}`);
  };

  const fetchReferrals = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', user.id);

    setReferrals(data || []);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: 'Copied!',
      description: 'Referral link copied to clipboard',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Referrals</h1>
        <p className="text-muted-foreground mt-2">Invite friends and earn bonuses</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input value={referralCode} readOnly />
            <Button onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Referral Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-3xl font-bold text-primary">{referrals.length}</p>
              <p className="text-sm text-muted-foreground">Total Referrals</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-3xl font-bold text-green-600">
                ${referrals.reduce((sum, ref) => sum + (ref.bonus_amount || 0), 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Earned</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-3xl font-bold text-blue-600">
                {referrals.filter(ref => ref.bonus_paid).length}
              </p>
              <p className="text-sm text-muted-foreground">Paid Bonuses</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Referrals;
