import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { DollarSign, TrendingUp, Clock, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const DashboardOverview = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<any>(null);
  const [stats, setStats] = useState({
    totalInvested: 0,
    activeInvestments: 0,
    totalProfit: 0,
    daysActive: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch account balance
      const { data: balanceData } = await supabase
        .from('account_balances')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (balanceData) {
        setBalance(balanceData);
        
        // Calculate days active
        const accountCreated = new Date(balanceData.account_active_since);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - accountCreated.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        setStats(prev => ({
          ...prev,
          daysActive: diffDays,
        }));
      }

      // Fetch investments
      const { data: investments } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id);

      if (investments) {
        const activeInvs = investments.filter(i => i.status === 'active');
        const totalInvested = investments.reduce((sum, i) => sum + Number(i.amount), 0);
        const totalProfit = investments.reduce((sum, i) => {
          if (i.status === 'completed') {
            return sum + Number(i.expected_profit);
          }
          return sum;
        }, 0);

        setStats(prev => ({
          ...prev,
          totalInvested,
          activeInvestments: activeInvs.length,
          totalProfit,
        }));
      }
    };

    fetchData();
  }, [user]);

  const statCards = [
    {
      title: 'Main Balance',
      value: `$${balance ? Number(balance.main_balance).toFixed(2) : '0.00'}`,
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Profit Balance',
      value: `$${balance ? Number(balance.profit_balance).toFixed(2) : '0.00'}`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: `Profits (${stats.daysActive}d)`,
      value: `$${stats.totalProfit.toFixed(2)}`,
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Active Investments',
      value: stats.activeInvestments,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
        <p className="text-muted-foreground">Welcome back! Here's your account overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Deposited</span>
              <span className="font-semibold">${balance ? Number(balance.total_deposited).toFixed(2) : '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Withdrawn</span>
              <span className="font-semibold">${balance ? Number(balance.total_withdrawn).toFixed(2) : '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Invested</span>
              <span className="font-semibold">${stats.totalInvested.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Account Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Active Since</span>
              <span className="font-semibold">{stats.daysActive} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Investments</span>
              <span className="font-semibold">{stats.activeInvestments}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Profit Earned</span>
              <span className="font-semibold text-green-600">${stats.totalProfit.toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
