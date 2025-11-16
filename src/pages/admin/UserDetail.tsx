import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Loader2, Plus, Minus } from 'lucide-react';

export const AdminUserDetail = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adjusting, setAdjusting] = useState(false);

  // Form state
  const [wallet, setWallet] = useState<'main' | 'investment'>('main');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [adminNotes, setAdminNotes] = useState<any[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
      fetchAdminNotes();
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*, account_balances(*), kyc_documents(*)')
        .eq('id', userId)
        .single();

      if (profile) {
        setUser(profile);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminNotes = async () => {
    try {
      setLoadingNotes(true);
      const { data: notes } = await supabase
        .from('admin_notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      setAdminNotes(notes || []);
    } catch (error) {
      console.error('Error fetching admin notes:', error);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleAdjustFunds = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!reason) {
      toast.error('Please provide a reason for the adjustment');
      return;
    }

    try {
      setAdjusting(true);

      // Get current admin ID from auth
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser?.id) {
        toast.error('Admin authentication required');
        return;
      }

      const adjustmentAmount = parseFloat(amount);

      const { data, error } = await supabase.functions.invoke('admin-adjust-funds', {
        body: {
          user_id: userId,
          admin_id: authUser.id,
          wallet,
          amount: adjustmentAmount,
          reason,
          notes: notes || undefined,
        },
      });

      if (error) {
        toast.error(error.message || 'Failed to adjust funds');
        return;
      }

      if (data?.success) {
        toast.success(`Adjusted ${wallet} wallet by $${adjustmentAmount.toFixed(2)}`);
        setAmount('');
        setReason('');
        setNotes('');
        await fetchUserDetails();
        await fetchAdminNotes();
      }
    } catch (error) {
      console.error('Error adjusting funds:', error);
      toast.error('Failed to adjust funds');
    } finally {
      setAdjusting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate('/admin/users')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">User not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const mainBalance = parseFloat(user.account_balances?.[0]?.main_balance || '0');
  const investmentBalance = parseFloat(user.account_balances?.[0]?.investment_balance || '0');
  const kycStatus = user.kyc_documents?.[0]?.status || 'not_submitted';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" onClick={() => navigate('/admin/users')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="text-right">
          <h1 className="text-3xl font-bold">{user.full_name}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {/* User Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Main Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mainBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Account balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Investment Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${investmentBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Investment balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(mainBalance + investmentBalance).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Combined balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">KYC Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={
              kycStatus === 'approved' ? 'default' :
              kycStatus === 'pending' ? 'secondary' :
              'destructive'
            }>
              {kycStatus}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Phone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">{user.phone || '-'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Joined</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {user.created_at ? formatDistanceToNow(new Date(user.created_at), { addSuffix: true }) : '-'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fund Adjustment Form */}
      <Card>
        <CardHeader>
          <CardTitle>Adjust Wallet Funds</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdjustFunds} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wallet">Wallet</Label>
                <Select value={wallet} onValueChange={(val: any) => setWallet(val)}>
                  <SelectTrigger id="wallet">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">Main Wallet</SelectItem>
                    <SelectItem value="investment">Investment Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g., 100.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger id="reason">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual_deposit">Manual Deposit</SelectItem>
                  <SelectItem value="manual_withdrawal">Manual Withdrawal</SelectItem>
                  <SelectItem value="correction">Account Correction</SelectItem>
                  <SelectItem value="bonus">Bonus Credit</SelectItem>
                  <SelectItem value="compensation">Compensation</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Admin Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes about this adjustment..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Button type="submit" disabled={adjusting} className="w-full">
              {adjusting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {parseFloat(amount) > 0 && wallet ? (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add ${amount || '0'} to {wallet} wallet
                    </>
                  ) : (
                    'Adjust Funds'
                  )}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Admin Notes History */}
      <Card>
        <CardHeader>
          <CardTitle>Adjustment History</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingNotes ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : adminNotes.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No adjustments yet</p>
          ) : (
            <div className="space-y-3">
              {adminNotes.map((note) => (
                <div key={note.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <p className="font-medium">{note.note}</p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  {note.metadata && (
                    <div className="text-sm text-muted-foreground space-y-1">
                      {note.metadata.amount && (
                        <div>Amount: ${Math.abs(note.metadata.amount).toFixed(2)}</div>
                      )}
                      {note.metadata.reason && (
                        <div>Reason: {note.metadata.reason}</div>
                      )}
                      {note.metadata.admin_notes && (
                        <div>Notes: {note.metadata.admin_notes}</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserDetail;
