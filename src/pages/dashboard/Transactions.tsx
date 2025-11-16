import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const Transactions = () => {
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setTransactions(data || []);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Transaction History</h1>
        <p className="text-muted-foreground mt-2">View all your transactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex justify-between items-center p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">{transaction.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.description || 'No description'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(transaction.created_at), 'PPpp')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount > 0 ? '+' : ''}${transaction.amount}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Balance: ${transaction.balance_after}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;
