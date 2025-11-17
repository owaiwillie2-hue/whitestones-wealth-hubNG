import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useKYCStatus } from '@/hooks/useKYCStatus';
import { KYCGuard, KYCStatusBadge } from '@/components/KYCGuard';
import { AlertCircle, CheckCircle } from 'lucide-react';

const Plans = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mainBalance, setMainBalance] = useState<number>(0);
  const { toast } = useToast();
  const { isApproved: kycApproved, isPending: kycPending } = useKYCStatus();

  useEffect(() => {
    fetchPlans();
    fetchBalance();
  }, []);

  const fetchPlans = async () => {
    const { data } = await supabase
      .from('investment_plans')
      .select('*')
      .eq('is_active', true)
      .order('min_amount');

    setPlans(data || []);
  };

  const fetchBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('account_balances')
        .select('main_balance')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setMainBalance(data.main_balance);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const handleInvest = async () => {
    if (!selectedPlan) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check KYC status
      if (!kycApproved) {
        throw new Error('KYC verification required before investing');
      }

      const investAmount = parseFloat(amount);
      if (investAmount < selectedPlan.min_amount || (selectedPlan.max_amount && investAmount > selectedPlan.max_amount)) {
        throw new Error(`Invalid investment amount. Min: $${selectedPlan.min_amount}${selectedPlan.max_amount ? `, Max: $${selectedPlan.max_amount}` : ''}`);
      }

      // Check if user has sufficient balance in main wallet
      if (mainBalance < investAmount) {
        throw new Error(`Insufficient balance. You have $${mainBalance} available.`);
      }

      const expectedProfit = (investAmount * selectedPlan.roi_percentage) / 100;
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + selectedPlan.duration_days);

      // Get current balances
      const { data: balances } = await supabase
        .from('account_balances')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!balances) throw new Error('Account not found');

      // Calculate new balances: deduct from main, add to investment
      const newMainBalance = balances.main_balance - investAmount;
      const newInvestmentBalance = balances.investment_balance + investAmount;

      // Update balances atomically
      const { error: balanceError } = await supabase
        .from('account_balances')
        .update({
          main_balance: newMainBalance,
          investment_balance: newInvestmentBalance,
        })
        .eq('user_id', user.id);

      if (balanceError) throw balanceError;

      // Create investment record
      const { error: investmentError } = await supabase.from('investments').insert({
        user_id: user.id,
        plan_id: selectedPlan.id,
        amount: investAmount,
        expected_profit: expectedProfit,
        end_date: endDate.toISOString(),
        start_date: new Date().toISOString(),
        status: 'active'
      });

      if (investmentError) throw investmentError;

      // Log transaction
      const { error: txError } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          type: 'investment',
          amount: investAmount,
          balance_after: newMainBalance,
        }]);

      if (txError) console.error('Transaction logging error:', txError);

      // Send notification
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([{
          user_id: user.id,
          title: 'Investment Started!',
          message: `You've invested $${investAmount} in ${selectedPlan.name} with ${selectedPlan.roi_percentage}% ROI. Expected profit: $${expectedProfit}. Funds will be returned in ${selectedPlan.duration_days} days.`,
          category: 'investment_updates' as any,
        }]);

      if (notificationError) console.error('Notification error:', notificationError);

      toast({
        title: 'Investment Created',
        description: `$${investAmount} invested in ${selectedPlan.name}. Expected profit: $${expectedProfit}`,
      });

      setAmount('');
      setSelectedPlan(null);
      setMainBalance(newMainBalance);
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

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Investment Plans</h1>
            <p className="text-muted-foreground mt-2">Choose a plan that suits your goals</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Main Wallet Balance</p>
            <p className="text-2xl font-bold text-green-600">${mainBalance.toFixed(2)}</p>
          </div>
        </div>
        <div className="mt-4">
          <KYCStatusBadge isApproved={kycApproved} isPending={kycPending} isRejected={false} />
        </div>
      </div>

      {!kycApproved && (
        <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            KYC verification is required before you can create investments.
          </AlertDescription>
        </Alert>
      )}

      <KYCGuard isApproved={kycApproved} isPending={kycPending} isRejected={false} actionName="Invest">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className="relative overflow-hidden">
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-3xl font-bold text-primary">{plan.roi_percentage}%</p>
                  <p className="text-sm text-muted-foreground">ROI</p>
                </div>
                <div className="space-y-2 text-sm">
                  <p><strong>Min:</strong> ${plan.min_amount}</p>
                  {plan.max_amount && <p><strong>Max:</strong> ${plan.max_amount}</p>}
                  <p><strong>Duration:</strong> {plan.duration_days} days</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full" onClick={() => setSelectedPlan(plan)} disabled={!kycApproved}>
                      Invest Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invest in {plan.name}</DialogTitle>
                      <DialogDescription>Enter the amount you want to invest</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Investment Amount (USD)</Label>
                        <p className="text-xs text-muted-foreground">Available balance: ${mainBalance.toFixed(2)}</p>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          min={plan.min_amount}
                          max={plan.max_amount || mainBalance}
                          placeholder={`Min: $${plan.min_amount}`}
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          {amount ? `Expected profit: $${((parseFloat(amount) * plan.roi_percentage) / 100).toFixed(2)}` : ''}
                        </p>
                      </div>
                      <Button onClick={handleInvest} className="w-full" disabled={loading || !kycApproved}>
                        {loading ? 'Creating...' : 'Confirm Investment'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      </KYCGuard>
    </div>
  );
};

export default Plans;
