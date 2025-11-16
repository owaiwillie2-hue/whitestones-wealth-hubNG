import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Loader } from 'lucide-react';
import bitcoinQR from '@/assets/bitcoin-qr.png';
import { useKYCStatus } from '@/hooks/useKYCStatus';
import { KYCGuard, KYCStatusBadge } from '@/components/KYCGuard';

const Deposit = () => {
  const { isApproved, isPending, isRejected, rejectionReason } = useKYCStatus();
  const [amount, setAmount] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string>(bitcoinQR);
  const [bitcoinAddress, setBitcoinAddress] = useState('bc1q9s4hsv0m3mq7pu0gfj33l3ey800fe6ujy95apc');
  const [settingsLoading, setSettingsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await supabase
        .from('website_settings')
        .select('*');

      if (data) {
        const settingsObj: any = {};
        data.forEach(item => {
          settingsObj[item.key] = item.value;
        });
        
        if (settingsObj.deposit_qr_url) {
          setQrImageUrl(settingsObj.deposit_qr_url);
        }
        if (settingsObj.deposit_address) {
          setBitcoinAddress(settingsObj.deposit_address);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let proofUrl = '';
      if (proofFile) {
        const fileExt = proofFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('deposit-proofs')
          .upload(fileName, proofFile);

        if (uploadError) throw uploadError;
        proofUrl = fileName;
      }

      const { error } = await supabase.from('deposits').insert({
        user_id: user.id,
        amount: parseFloat(amount),
        payment_method: 'Bitcoin',
        proof_url: proofUrl,
        status: 'pending'
      });

      if (error) throw error;

      toast({
        title: 'Deposit Request Submitted',
        description: 'Your deposit is pending admin approval.',
      });

      navigate('/dashboard');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Deposit Funds</h1>
          <p className="text-muted-foreground mt-2">Fund your account to start investing</p>
        </div>
        <KYCStatusBadge isApproved={isApproved} isPending={isPending} isRejected={isRejected} />
      </div>

      <KYCGuard
        isApproved={isApproved}
        isPending={isPending}
        isRejected={isRejected}
        rejectionReason={rejectionReason || ''}
        actionName="Deposit"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Bitcoin Deposit Address</CardTitle>
              <CardDescription>Send Bitcoin to this address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                {settingsLoading ? (
                  <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 bg-muted rounded-lg flex items-center justify-center">
                    <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <img src={qrImageUrl} alt="Bitcoin QR Code" className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 object-contain rounded-lg border border-muted" />
                )}
              </div>
              <div className="space-y-2">
                <Label>Bitcoin Address</Label>
                <div className="p-3 bg-muted rounded-lg break-all text-sm font-mono hover:bg-muted/80 transition cursor-pointer" title="Click to copy">
                  {bitcoinAddress}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Submit Deposit Proof</CardTitle>
              <CardDescription>Upload proof of payment after transfer</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (USD)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proof">Payment Proof (Screenshot/Receipt)</Label>
                  <Input
                    id="proof"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Deposit Request'}
                  <Upload className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </KYCGuard>
    </div>
  );
};

export default Deposit;
