import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, Loader2 } from 'lucide-react';

interface WalletsOverviewProps {
  refreshTrigger?: number;
  onTransferSuccess?: () => void;
}

export const WalletsOverview: React.FC<WalletsOverviewProps> = ({
  refreshTrigger = 0,
  onTransferSuccess,
}) => {
  const [mainBalance, setMainBalance] = useState(0);
  const [investmentBalance, setInvestmentBalance] = useState(0);
  const [profitBalance, setProfitBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBalances();
  }, [refreshTrigger]);

  const fetchBalances = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('account_balances')
        .select('main_balance, investment_balance, profit_balance')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setMainBalance(parseFloat(data?.main_balance || '0'));
      setInvestmentBalance(parseFloat(data?.investment_balance || '0'));
      setProfitBalance(parseFloat(data?.profit_balance || '0'));
    } catch (error: any) {
      console.error('Error fetching balances:', error);
      toast({
        title: 'Error',
        description: 'Failed to load wallet balances',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(transferAmount);

    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount greater than 0',
        variant: 'destructive',
      });
      return;
    }

    if (amount > mainBalance) {
      toast({
        title: 'Insufficient Balance',
        description: `You only have $${mainBalance.toFixed(2)} available`,
        variant: 'destructive',
      });
      return;
    }

    try {
      setTransferLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Call the wallet-transfer edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wallet-transfer`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            user_id: user.id,
            from_wallet: 'main',
            to_wallet: 'investment',
            amount,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Transfer failed');
      }

      const result = await response.json();

      setMainBalance(result.new_main_balance);
      setInvestmentBalance(result.new_investment_balance);
      setTransferAmount('');
      setShowTransferForm(false);

      toast({
        title: 'Transfer Successful',
        description: `Transferred $${amount.toFixed(2)} to Investment wallet`,
      });

      if (onTransferSuccess) {
        onTransferSuccess();
      }

      // Refresh balances after transfer
      setTimeout(() => fetchBalances(), 500);
    } catch (error: any) {
      console.error('Transfer error:', error);
      toast({
        title: 'Transfer Failed',
        description: error.message || 'Failed to transfer funds',
        variant: 'destructive',
      });
    } finally {
      setTransferLoading(false);
    }
  };

  const totalBalance = mainBalance + investmentBalance + profitBalance;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Your Wallets</h2>
        <p className="text-muted-foreground mt-1">Manage your account and investment wallets</p>
      </div>

      {/* Total Balance Overview */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>Total Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-primary">
            ${totalBalance.toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Across all wallets and accounts
          </p>
        </CardContent>
      </Card>

      {/* Wallet Cards Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Main Wallet */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Main Wallet</CardTitle>
            <CardDescription>Primary account for deposits & withdrawals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-3xl font-bold text-green-600">
                  ${mainBalance.toFixed(2)}
                </p>
              </div>
              <Button
                onClick={() => setShowTransferForm(!showTransferForm)}
                className="w-full"
                variant={showTransferForm ? 'secondary' : 'default'}
              >
                {showTransferForm ? 'Cancel' : 'Transfer to Investment'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Investment Wallet */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Investment Wallet</CardTitle>
            <CardDescription>Used for investment purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-3xl font-bold text-blue-600">
                  ${investmentBalance.toFixed(2)}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                ℹ️ Funds locked in active investments
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Profit Wallet */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profit Balance</CardTitle>
            <CardDescription>Earnings from investments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Accumulated Profits</p>
                <p className="text-3xl font-bold text-purple-600">
                  ${profitBalance.toFixed(2)}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                ℹ️ Auto-credited when investments mature
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transfer Form */}
      {showTransferForm && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Transfer Funds
            </CardTitle>
            <CardDescription>
              Move funds from Main wallet to Investment wallet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertDescription>
                Only transfers from Main → Investment are allowed. You can reinvest after
                investments mature.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleTransfer} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transfer-amount">Amount to Transfer</Label>
                <Input
                  id="transfer-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={mainBalance}
                  placeholder="Enter amount"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Max: ${mainBalance.toFixed(2)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-3 bg-background rounded-lg">
                  <p className="text-muted-foreground">From (Main)</p>
                  <p className="font-semibold">
                    ${(mainBalance - parseFloat(transferAmount || '0')).toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-background rounded-lg">
                  <p className="text-muted-foreground">To (Investment)</p>
                  <p className="font-semibold">
                    ${(investmentBalance + parseFloat(transferAmount || '0')).toFixed(2)}
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={transferLoading || !transferAmount}
              >
                {transferLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Transferring...
                  </>
                ) : (
                  <>
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Confirm Transfer
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WalletsOverview;
