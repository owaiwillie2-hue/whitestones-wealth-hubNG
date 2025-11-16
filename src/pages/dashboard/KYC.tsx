import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Camera } from 'lucide-react';

const KYC = () => {
  const [kycStatus, setKycStatus] = useState<any>(null);
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('kyc_documents')
      .select('*')
      .eq('user_id', user.id)
      .single();

    setKycStatus(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idFrontFile || !idBackFile || !selfieFile) {
      toast({
        title: 'Missing Documents',
        description: 'Please upload all required documents',
        variant: 'destructive'
      });
      return;
    }
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload ID front
      const frontExt = idFrontFile.name.split('.').pop();
      const frontFileName = `${user.id}/id-front-${Date.now()}.${frontExt}`;
      const { error: frontError } = await supabase.storage
        .from('kyc-documents')
        .upload(frontFileName, idFrontFile);
      if (frontError) throw frontError;

      // Upload ID back
      const backExt = idBackFile.name.split('.').pop();
      const backFileName = `${user.id}/id-back-${Date.now()}.${backExt}`;
      const { error: backError } = await supabase.storage
        .from('kyc-documents')
        .upload(backFileName, idBackFile);
      if (backError) throw backError;

      // Upload selfie
      const selfieExt = selfieFile.name.split('.').pop();
      const selfieFileName = `${user.id}/selfie-${Date.now()}.${selfieExt}`;
      const { error: selfieError } = await supabase.storage
        .from('kyc-documents')
        .upload(selfieFileName, selfieFile);
      if (selfieError) throw selfieError;

      // Save to database
      const { error } = await supabase.from('kyc_documents').upsert({
        user_id: user.id,
        id_front_url: frontFileName,
        id_back_url: backFileName,
        selfie_url: selfieFileName,
        status: 'pending',
        submitted_at: new Date().toISOString()
      });

      if (error) throw error;

      toast({
        title: 'KYC Submitted',
        description: 'Your documents have been submitted for review.',
      });

      fetchKYCStatus();
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

  const getStatusBadge = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-500',
      under_review: 'bg-blue-500',
      approved: 'bg-green-500',
      rejected: 'bg-red-500'
    };
    return <Badge className={colors[status] || 'bg-gray-500'}>{status.replace('_', ' ').toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">KYC Verification</h1>
        <p className="text-muted-foreground mt-2">Complete your identity verification</p>
      </div>

      {kycStatus && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>KYC Status</CardTitle>
              {getStatusBadge(kycStatus.status)}
            </div>
          </CardHeader>
          <CardContent>
            {kycStatus.rejection_reason && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-200"><strong>Rejection Reason:</strong> {kycStatus.rejection_reason}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {(!kycStatus || kycStatus.status === 'rejected') && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>ID Document - Front Side (Passport, National ID, or Driver's License)</Label>
                <div className="flex flex-col md:flex-row gap-2">
                  <Input
                    ref={frontInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => setIdFrontFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => frontInputRef.current?.click()}
                    className="flex-1"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Front
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (frontInputRef.current) {
                        frontInputRef.current.setAttribute('capture', 'environment');
                        frontInputRef.current.click();
                      }
                    }}
                    className="flex-1"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Take Photo
                  </Button>
                </div>
                {idFrontFile && <p className="text-sm text-muted-foreground">Selected: {idFrontFile.name}</p>}
              </div>

              <div className="space-y-2">
                <Label>ID Document - Back Side</Label>
                <div className="flex flex-col md:flex-row gap-2">
                  <Input
                    ref={backInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => setIdBackFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => backInputRef.current?.click()}
                    className="flex-1"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Back
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (backInputRef.current) {
                        backInputRef.current.setAttribute('capture', 'environment');
                        backInputRef.current.click();
                      }
                    }}
                    className="flex-1"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Take Photo
                  </Button>
                </div>
                {idBackFile && <p className="text-sm text-muted-foreground">Selected: {idBackFile.name}</p>}
              </div>

              <div className="space-y-2">
                <Label>Selfie with ID</Label>
                <div className="flex flex-col md:flex-row gap-2">
                  <Input
                    ref={selfieInputRef}
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={(e) => setSelfieFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => selfieInputRef.current?.click()}
                    className="flex-1"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Selfie
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (selfieInputRef.current) {
                        selfieInputRef.current.setAttribute('capture', 'user');
                        selfieInputRef.current.click();
                      }
                    }}
                    className="flex-1"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Take Selfie
                  </Button>
                </div>
                {selfieFile && <p className="text-sm text-muted-foreground">Selected: {selfieFile.name}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Uploading...' : 'Submit KYC Documents'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default KYC;
