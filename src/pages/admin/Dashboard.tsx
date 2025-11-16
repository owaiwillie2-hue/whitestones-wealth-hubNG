import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Users, DollarSign, FileText, UserCheck, TrendingUp, Clock, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    pendingKYC: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    activeInvestments: 0,
    totalInvested: 0,
    depositsLast7Days: 0,
    withdrawalsLast7Days: 0,
    newUsersLast7Days: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const sevenDaysAgo = startOfDay(subDays(new Date(), 7));
      const sevenDaysAgoISO = sevenDaysAgo.toISOString();

      const [users, deposits, withdrawals, kyc, investments] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('deposits').select('amount, status, created_at'),
        supabase.from('withdrawals').select('amount, status, created_at'),
        supabase.from('kyc_documents').select('*', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('investments').select('amount, status')
      ]);

      const pendingDeposits = deposits.data?.filter(d => d.status === 'pending') || [];
      const approvedDeposits = deposits.data?.filter(d => d.status === 'approved') || [];
      const depositsLast7Days = deposits.data?.filter(d => new Date(d.created_at) > sevenDaysAgo) || [];
      
      const pendingWithdrawals = withdrawals.data?.filter(w => w.status === 'pending') || [];
      const approvedWithdrawals = withdrawals.data?.filter(w => w.status === 'approved') || [];
      const withdrawalsLast7Days = withdrawals.data?.filter(w => new Date(w.created_at) > sevenDaysAgo) || [];
      
      const activeInvestments = investments.data?.filter(i => i.status === 'active') || [];

      setStats({
        totalUsers: users.count || 0,
        pendingDeposits: pendingDeposits.length,
        pendingWithdrawals: pendingWithdrawals.length,
        pendingKYC: kyc.count || 0,
        totalDeposits: approvedDeposits.reduce((sum, d) => sum + Number(d.amount || 0), 0),
        totalWithdrawals: approvedWithdrawals.reduce((sum, w) => sum + Number(w.amount || 0), 0),
        activeInvestments: activeInvestments.length,
        totalInvested: activeInvestments.reduce((sum, i) => sum + Number(i.amount || 0), 0),
        depositsLast7Days: depositsLast7Days.reduce((sum, d) => sum + Number(d.amount || 0), 0),
        withdrawalsLast7Days: withdrawalsLast7Days.reduce((sum, w) => sum + Number(w.amount || 0), 0),
        newUsersLast7Days: users.data?.filter((u: any) => new Date(u.created_at) > sevenDaysAgo).length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, subtitle, color }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Platform overview and key metrics</p>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          subtitle={`+${stats.newUsersLast7Days} last 7 days`}
          color="text-blue-500"
        />
        <StatCard
          title="Pending KYC"
          value={stats.pendingKYC}
          icon={FileText}
          subtitle="Awaiting verification"
          color="text-purple-500"
        />
        <StatCard
          title="Pending Deposits"
          value={stats.pendingDeposits}
          icon={Clock}
          subtitle={`$${stats.depositsLast7Days.toFixed(2)} last 7 days`}
          color="text-yellow-500"
        />
        <StatCard
          title="Verified Users"
          value={stats.totalUsers - stats.pendingKYC}
          icon={UserCheck}
          subtitle="KYC approved"
          color="text-cyan-500"
        />
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Deposits (Approved)</CardTitle>
            <ArrowUpRight className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalDeposits.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingDeposits} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Withdrawals (Approved)</CardTitle>
            <ArrowDownLeft className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalWithdrawals.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingWithdrawals} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Investments</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeInvestments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ${stats.totalInvested.toFixed(2)} total invested
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Cash Flow (7d)</CardTitle>
            <DollarSign className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.depositsLast7Days >= stats.withdrawalsLast7Days ? 'text-green-600' : 'text-red-600'}`}>
              ${(stats.depositsLast7Days - stats.withdrawalsLast7Days).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              In: ${stats.depositsLast7Days.toFixed(2)} | Out: ${stats.withdrawalsLast7Days.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Summary</CardTitle>
          <CardDescription>Platform status at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Pending Actions</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {stats.pendingKYC} KYC applications awaiting approval</li>
                <li>• {stats.pendingDeposits} deposits awaiting approval</li>
                <li>• {stats.pendingWithdrawals} withdrawal requests awaiting processing</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Platform Health</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ {stats.totalUsers} active users</li>
                <li>✓ {stats.totalUsers - stats.pendingKYC} verified users ({Math.round(((stats.totalUsers - stats.pendingKYC) / stats.totalUsers) * 100 || 0)}%)</li>
                <li>✓ {stats.activeInvestments} active investments</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
