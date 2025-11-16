import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Check, X, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const AdminKYC = () => {
  const [kycDocs, setKycDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  useEffect(() => {
    fetchKYCDocs();
  }, []);

  const fetchKYCDocs = async () => {
    try {
      const { data } = await supabase
        .from('kyc_documents')
        .select('*, profiles(full_name, email)')
        .order('submitted_at', { ascending: false });

      setKycDocs(data || []);
    } catch (error) {
      console.error('Error fetching KYC documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = async (path: string) => {
    const { data } = await supabase.storage
      .from('kyc-documents')
      .createSignedUrl(path, 3600);
    return data?.signedUrl;
  };

  const handleView = async (doc: any) => {
    const [frontUrl, backUrl, selfieUrl] = await Promise.all([
      doc.id_front_url ? getImageUrl(doc.id_front_url) : null,
      doc.id_back_url ? getImageUrl(doc.id_back_url) : null,
      doc.selfie_url ? getImageUrl(doc.selfie_url) : null
    ]);

    setSelectedDoc({ ...doc, frontUrl, backUrl, selfieUrl });
    setViewDialogOpen(true);
  };

  const handleApprove = async (docId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Admin not authenticated');

      const doc = kycDocs.find((d) => d.id === docId);
      if (!doc) throw new Error('Document not found');

      // Call the approve-kyc edge function to handle bonus logic
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/approve-kyc`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            user_id: doc.user_id,
            approved_by: user.id,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve KYC');
      }

      toast.success('KYC approved successfully. Bonus credited if applicable.');
      setViewDialogOpen(false);
      fetchKYCDocs();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleReject = async (docId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('kyc_documents').update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id,
        rejection_reason: 'Document quality insufficient or information mismatch'
      }).eq('id', docId);

      toast.success('KYC rejected');
      setViewDialogOpen(false);
      fetchKYCDocs();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">KYC Verification</h1>
        <p className="text-muted-foreground mt-2">Review and verify user identity documents</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>KYC Submissions ({kycDocs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kycDocs.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{doc.profiles?.full_name}</div>
                      <div className="text-sm text-muted-foreground">{doc.profiles?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      doc.status === 'approved' ? 'default' :
                      doc.status === 'pending' ? 'secondary' :
                      doc.status === 'under_review' ? 'secondary' :
                      'destructive'
                    }>
                      {doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(doc.submitted_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => handleView(doc)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>KYC Documents Review</DialogTitle>
          </DialogHeader>
          {selectedDoc && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">User Information</h3>
                <p><strong>Name:</strong> {selectedDoc.profiles?.full_name}</p>
                <p><strong>Email:</strong> {selectedDoc.profiles?.email}</p>
              </div>

              <div className="grid gap-4">
                {selectedDoc.frontUrl && (
                  <div>
                    <h4 className="font-medium mb-2">ID Front</h4>
                    <img src={selectedDoc.frontUrl} alt="ID Front" className="max-w-full rounded-lg border" />
                  </div>
                )}
                {selectedDoc.backUrl && (
                  <div>
                    <h4 className="font-medium mb-2">ID Back</h4>
                    <img src={selectedDoc.backUrl} alt="ID Back" className="max-w-full rounded-lg border" />
                  </div>
                )}
                {selectedDoc.selfieUrl && (
                  <div>
                    <h4 className="font-medium mb-2">Selfie with ID</h4>
                    <img src={selectedDoc.selfieUrl} alt="Selfie" className="max-w-full rounded-lg border" />
                  </div>
                )}
              </div>

              {selectedDoc.status === 'pending' && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={() => handleApprove(selectedDoc.id)} className="flex-1">
                    <Check className="h-4 w-4 mr-2" />
                    Approve KYC
                  </Button>
                  <Button variant="destructive" onClick={() => handleReject(selectedDoc.id)} className="flex-1">
                    <X className="h-4 w-4 mr-2" />
                    Reject KYC
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminKYC;
