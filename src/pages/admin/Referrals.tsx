import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';

export const AdminReferrals = () => {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const { data } = await supabase
        .from('referrals')
        .select(`
          *,
          referrer:profiles!referrer_id(full_name, email),
          referred:profiles!referred_id(full_name, email)
        `)
        .order('created_at', { ascending: false });

      setReferrals(data || []);
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Referral Management</h1>
        <p className="text-muted-foreground mt-2">View all referral activity</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Referrals ({referrals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Referrer</TableHead>
                <TableHead>Referred User</TableHead>
                <TableHead>Bonus Amount</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referrals.map((referral) => (
                <TableRow key={referral.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{referral.referrer?.full_name}</div>
                      <div className="text-sm text-muted-foreground">{referral.referrer?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{referral.referred?.full_name}</div>
                      <div className="text-sm text-muted-foreground">{referral.referred?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>${referral.bonus_amount}</TableCell>
                  <TableCell>{referral.bonus_paid ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    {new Date(referral.created_at).toLocaleDateString()}
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

export default AdminReferrals;
