import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle } from 'lucide-react';
import { useKYCStatus } from '@/hooks/useKYCStatus';
import { KYCGuard, KYCStatusBadge } from '@/components/KYCGuard';

const Withdraw = () => {
  const { isApproved, isPending, isRejected, rejectionReason } = useKYCStatus();
  const [amount, setAmount] = useState('');
  const [mainBalance, setMainBalance] = useState(0);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchWithdrawalAccounts();
    fetchMainBalance();
  }, []);

  const fetchWithdrawalAccounts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('withdrawal_accounts')
      .select('*')
      .eq('user_id', user.id);

    setAccounts(data || []);
  };

  const fetchMainBalance = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('account_balances')
      .select('main_balance')
      .eq('user_id', user.id)
      .single();

    setMainBalance(parseFloat(String(data?.main_balance || 0)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('withdrawals').insert({
        user_id: user.id,
        amount: parseFloat(amount),
        withdrawal_account_id: selectedAccount,
        status: 'pending'
      });

      if (error) throw error;

      toast({
        title: 'Withdrawal Request Submitted',
        description: 'Your withdrawal is pending admin approval.',
      });

      navigate('/dashboard');
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

  if (accounts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Withdraw Funds</h1>
            <p className="text-muted-foreground mt-2">You're almost ready to withdraw!</p>
          </div>
          <KYCStatusBadge isApproved={isApproved} isPending={isPending} isRejected={isRejected} />
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have not added any withdrawal account yet in your account.
            Please add the personal or company accounts that you'd like to withdraw funds.
          </AlertDescription>
        </Alert>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-center text-muted-foreground">
              To make a withdrawal, please add a withdrawal account from your profile.
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => navigate('/dashboard/settings?tab=account')}>
                ADD ACCOUNT
              </Button>
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Please feel free to contact us if you have any questions.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canWithdraw = mainBalance > 0 && isApproved;
  const withdrawDisabledReason = mainBalance === 0
    ? 'Insufficient balance'
    : !isApproved
    ? 'KYC verification required'
    : '';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Withdraw Funds</h1>
          <p className="text-muted-foreground mt-2">Request a withdrawal from your account</p>
        </div>
        <KYCStatusBadge isApproved={isApproved} isPending={isPending} isRejected={isRejected} />
      </div>

      <KYCGuard
        isApproved={isApproved}
        isPending={isPending}
        isRejected={isRejected}
        rejectionReason={rejectionReason || ''}
        actionName="Withdraw"
      >
        {mainBalance === 0 && (
          <Alert className="mb-4 border-yellow-500 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Your main wallet balance is $0. Deposit funds to start withdrawing.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Request</CardTitle>
            <CardDescription>Select account and enter amount</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Available Balance: ${mainBalance.toFixed(2)}</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="account">Withdrawal Account</Label>
                <select
                  id="account"
                  className="w-full p-2 border rounded-md bg-background"
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  disabled={!canWithdraw}
                  required
                >
                  <option value="">Select account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.account_name} - {account.account_type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={mainBalance}
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={!canWithdraw}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !canWithdraw}
                title={withdrawDisabledReason}
              >
                {loading ? 'Submitting...' : 'Submit Withdrawal Request'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </KYCGuard>
    </div>
  );
};

export default Withdraw;
