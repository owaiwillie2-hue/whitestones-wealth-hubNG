import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface KYCStatus {
  id: string;
  user_id: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  rejection_reason?: string;
}

export const useKYCStatus = () => {
  const [kyc, setKyc] = useState<KYCStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchKYCStatus();

    // Subscribe to changes
    const subscription = supabase
      .channel('kyc-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kyc_documents',
          filter: `user_id=eq.${supabase.auth.getUser().then(r => r.data?.user?.id)}`,
        },
        (payload) => {
          setKyc(payload.new as KYCStatus);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchKYCStatus = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      const { data, error: queryError } = await supabase
        .from('kyc_documents')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (queryError && queryError.code !== 'PGRST116') {
        throw queryError;
      }

      setKyc(data as KYCStatus || null);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isApproved = kyc?.status === 'approved';
  const isPending = kyc?.status === 'pending';
  const isUnderReview = kyc?.status === 'under_review';
  const isRejected = kyc?.status === 'rejected';

  return {
    kyc,
    loading,
    error,
    isApproved,
    isPending,
    isUnderReview,
    isRejected,
    refreshKYC: fetchKYCStatus,
  };
};
