import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay, subMonths } from 'date-fns';
import { BarChart, LineChart, PieChart, TrendingUp, TrendingDown, Activity } from 'lucide-react';

export const Analytics = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [depositsOverTime, setDepositsOverTime] = useState<any[]>([]);
  const [withdrawalsOverTime, setWithdrawalsOverTime] = useState<any[]>([]);
  const [investmentsByPlan, setInvestmentsByPlan] = useState<any[]>([]);
  const [kycCompletion, setKycCompletion] = useState({ completed: 0, pending: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const getDaysInRange = () => {
    switch (timeRange) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      default: return 30;
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const daysBack = getDaysInRange();
      const startDate = startOfDay(subDays(new Date(), daysBack));
      const startDateISO = startDate.toISOString();

      // Fetch deposits over time
      const { data: deposits } = await supabase
        .from('deposits')
        .select('amount, status, created_at')
        .gte('created_at', startDateISO)
        .eq('status', 'approved');

      // Fetch withdrawals over time
      const { data: withdrawals } = await supabase
        .from('withdrawals')
        .select('amount, status, created_at')
        .gte('created_at', startDateISO)
        .eq('status', 'approved');

      // Fetch investments by plan
      const { data: investments } = await supabase
        .from('investments')
        .select(`
          amount,
          status,
          investment_plans(name, roi_percentage)
        `)
        .gte('created_at', startDateISO);

      // Fetch KYC completion
      const { data: kycData } = await supabase
        .from('kyc_documents')
        .select('status')
        .gte('created_at', startDateISO);

      // Process deposits over time (daily)
      const depositsDaily: { [key: string]: number } = {};
      deposits?.forEach((d: any) => {
        const date = format(new Date(d.created_at), 'MMM dd');
        depositsDaily[date] = (depositsDaily[date] || 0) + Number(d.amount || 0);
      });

      setDepositsOverTime(
        Object.entries(depositsDaily).map(([date, amount]) => ({
          date,
          amount,
        }))
      );

      // Process withdrawals over time (daily)
      const withdrawalsDaily: { [key: string]: number } = {};
      withdrawals?.forEach((w: any) => {
        const date = format(new Date(w.created_at), 'MMM dd');
        withdrawalsDaily[date] = (withdrawalsDaily[date] || 0) + Number(w.amount || 0);
      });

      setWithdrawalsOverTime(
        Object.entries(withdrawalsDaily).map(([date, amount]) => ({
          date,
          amount,
        }))
      );

      // Process investments by plan
      const investmentsByPlanMap: { [key: string]: { count: number; total: number; roi: number } } = {};
      investments?.forEach((i: any) => {
        const planName = i.investment_plans?.name || 'Unknown';
        if (!investmentsByPlanMap[planName]) {
          investmentsByPlanMap[planName] = { count: 0, total: 0, roi: i.investment_plans?.roi_percentage || 0 };
        }
        investmentsByPlanMap[planName].count += 1;
        investmentsByPlanMap[planName].total += Number(i.amount || 0);
      });

      setInvestmentsByPlan(
        Object.entries(investmentsByPlanMap).map(([plan, data]) => ({
          plan,
          ...data,
        }))
      );

      // Process KYC completion
      const kycStatus = { completed: 0, pending: 0, rejected: 0 };
      kycData?.forEach((k: any) => {
        if (k.status === 'approved') kycStatus.completed += 1;
        else if (k.status === 'pending') kycStatus.pending += 1;
        else if (k.status === 'rejected') kycStatus.rejected += 1;
      });

      setKycCompletion(kycStatus);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalDeposits = depositsOverTime.reduce((sum, d) => sum + d.amount, 0);
  const totalWithdrawals = withdrawalsOverTime.reduce((sum, w) => sum + w.amount, 0);
  const netFlow = totalDeposits - totalWithdrawals;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-2">Detailed platform metrics and insights</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Deposits</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalDeposits.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">{depositsOverTime.length} days with activity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Withdrawals</CardTitle>
            <TrendingDown className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalWithdrawals.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">{withdrawalsOverTime.length} days with activity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Cash Flow</CardTitle>
            <Activity className={`h-5 w-5 ${netFlow >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${netFlow.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {netFlow >= 0 ? '+' : ''}{Math.round((netFlow / totalDeposits) * 100 || 0)}% of deposits
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Investment Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Distribution by Plan</CardTitle>
          <CardDescription>Active and completed investments grouped by plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {investmentsByPlan.length > 0 ? (
              investmentsByPlan.map((plan) => (
                <div key={plan.plan} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{plan.plan}</p>
                    <p className="text-sm text-muted-foreground">{plan.count} investments • {plan.roi}% ROI</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${plan.total.toFixed(2)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No investments in this period</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* KYC Completion */}
      <Card>
        <CardHeader>
          <CardTitle>KYC Completion Status</CardTitle>
          <CardDescription>Document verification progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{kycCompletion.completed}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">{kycCompletion.pending}</p>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{kycCompletion.rejected}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Deposits Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {depositsOverTime.slice(-10).map((day, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{day.date}</span>
                  <span className="font-semibold">${day.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Withdrawals Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {withdrawalsOverTime.slice(-10).map((day, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{day.date}</span>
                  <span className="font-semibold">${day.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
