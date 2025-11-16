import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useKYCStatus } from '@/hooks/useKYCStatus';
import { KYCGuard } from '@/components/KYCGuard';
import { useInvestmentTimer, formatTimerDisplay } from '@/hooks/useInvestmentTimer';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';

const Investments = () => {
  const [investments, setInvestments] = useState<any[]>([]);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { isApproved: kycApproved, isPending: kycPending } = useKYCStatus();

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('investments')
      .select(`
        *,
        investment_plans(name, roi_percentage, duration_days)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setInvestments(data || []);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleClaimProfit = async (investmentId: string) => {
    setCompletingId(investmentId);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('investment-completion', {
        body: {
          investmentId,
          userId: user.id,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to complete investment');
      }

      const { principal_returned, profit_returned, total_returned } = response.data;

      toast({
        title: 'Profit Claimed!',
        description: `Principal: $${principal_returned}, Profit: $${profit_returned}, Total: $${total_returned} returned to Main Wallet`,
      });

      // Refresh investments list
      await fetchInvestments();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to claim profit',
        variant: 'destructive',
      });
    } finally {
      setCompletingId(null);
    }
  };

  const InvestmentCard = ({ investment }: { investment: any }) => {
    const timer = useInvestmentTimer(investment.id, investment.end_date);

    const isExpired = timer.isExpired;
    const canClaim = investment.status === 'active' && isExpired && kycApproved;

    return (
      <Card key={investment.id} className={isExpired ? 'border-2 border-amber-500' : ''}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{investment.investment_plans?.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Started: {format(new Date(investment.start_date), 'PP')}
              </p>
            </div>
            <Badge variant={investment.status === 'active' ? 'default' : 'secondary'}>
              {investment.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isExpired && investment.status === 'active' && (
            <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950">
              <Clock className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                Your investment has matured! Claim your profits now to receive your principal + profits to your Main Wallet.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Amount Invested</p>
              <p className="text-lg font-bold">${investment.amount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expected Profit</p>
              <p className="text-lg font-bold text-green-600">${investment.expected_profit}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ROI</p>
              <p className="text-lg font-bold">{investment.investment_plans?.roi_percentage}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">End Date</p>
              <p className="text-lg font-bold">
                {format(new Date(investment.end_date), 'PP')}
              </p>
            </div>
          </div>

          {/* Timer Display */}
          {investment.status === 'active' && !isExpired && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Time Remaining</p>
                <p className="text-lg font-bold text-blue-800 dark:text-blue-200">
                  {formatTimerDisplay(timer)}
                </p>
              </div>
            </div>
          )}

          {/* Completed Status */}
          {investment.status === 'completed' && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-700 dark:text-green-300">
                Investment completed on {format(new Date(investment.completed_at), 'PPp')}
              </p>
            </div>
          )}

          {/* Claim Profit Button */}
          {investment.status === 'active' && isExpired && (
            <KYCGuard isApproved={kycApproved} isPending={kycPending} actionName="claim profits">
              <Button
                onClick={() => handleClaimProfit(investment.id)}
                disabled={completingId === investment.id || !kycApproved}
                className="w-full"
                size="lg"
              >
                {completingId === investment.id ? 'Claiming Profits...' : 'Claim Profits'}
              </Button>
            </KYCGuard>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Investments</h1>
        <p className="text-muted-foreground mt-2">Track your active and completed investments. Claim your profits when investments mature!</p>
      </div>

      <div className="grid gap-6">
        {investments.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">No investments yet</p>
              <p className="text-center text-sm text-muted-foreground mt-2">
                Visit the Investment Plans page to start investing
              </p>
            </CardContent>
          </Card>
        ) : (
          investments.map((investment) => (
            <InvestmentCard key={investment.id} investment={investment} />
          ))
        )}
      </div>
    </div>
  );
};

export default Investments;
