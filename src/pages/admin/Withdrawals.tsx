import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const AdminWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const { data } = await supabase
        .from('withdrawals')
        .select('*, profiles(full_name, email), withdrawal_accounts(*)')
        .order('created_at', { ascending: false });

      setWithdrawals(data || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (withdrawalId: string, userId: string, amount: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('withdrawals').update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: user?.id
      }).eq('id', withdrawalId);

      const { data: balance } = await supabase
        .from('account_balances')
        .select('main_balance, total_withdrawn')
        .eq('user_id', userId)
        .single();

      if (balance) {
        await supabase.from('account_balances').update({
          main_balance: Number(balance.main_balance) - amount,
          total_withdrawn: Number(balance.total_withdrawn) + amount
        }).eq('user_id', userId);

        await supabase.from('transactions').insert({
          user_id: userId,
          type: 'withdrawal',
          amount: -amount,
          balance_after: Number(balance.main_balance) - amount,
          reference_id: withdrawalId,
          description: 'Withdrawal approved'
        });
      }

      toast.success('Withdrawal approved successfully');
      fetchWithdrawals();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleReject = async (withdrawalId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('withdrawals').update({
        status: 'rejected',
        approved_at: new Date().toISOString(),
        approved_by: user?.id,
        rejection_reason: 'Insufficient verification'
      }).eq('id', withdrawalId);

      toast.success('Withdrawal rejected');
      fetchWithdrawals();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Withdrawal Management</h1>
        <p className="text-muted-foreground mt-2">Review and approve withdrawal requests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Withdrawals ({withdrawals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Account Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{withdrawal.profiles?.full_name}</div>
                      <div className="text-sm text-muted-foreground">{withdrawal.profiles?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">${withdrawal.amount}</TableCell>
                  <TableCell>{withdrawal.withdrawal_accounts?.account_type || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={
                      withdrawal.status === 'approved' ? 'default' :
                      withdrawal.status === 'pending' ? 'secondary' :
                      'destructive'
                    }>
                      {withdrawal.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(withdrawal.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    {withdrawal.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(withdrawal.id, withdrawal.user_id, withdrawal.amount)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(withdrawal.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminWithdrawals;
