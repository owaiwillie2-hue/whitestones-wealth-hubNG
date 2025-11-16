import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface KYCGuardProps {
  isApproved: boolean;
  isPending: boolean;
  isRejected: boolean;
  rejectionReason?: string;
  children: React.ReactNode;
  actionName: string; // e.g., "Deposit", "Withdraw", "Invest"
  showAlert?: boolean;
}

export const KYCGuard: React.FC<KYCGuardProps> = ({
  isApproved,
  isPending,
  isRejected,
  rejectionReason,
  children,
  actionName,
  showAlert = true,
}) => {
  const navigate = useNavigate();

  if (isApproved) {
    return <>{children}</>;
  }

  const getAlert = () => {
    if (isRejected) {
      return (
        <Alert variant="destructive" className="mb-6">
          <XCircle className="h-4 w-4" />
          <AlertTitle>KYC Verification Failed</AlertTitle>
          <AlertDescription>
            {rejectionReason
              ? `Your KYC was rejected: ${rejectionReason}`
              : 'Your KYC verification was rejected. Please resubmit.'}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard/kyc')}
              className="mt-2"
            >
              Resubmit KYC
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    if (isPending) {
      return (
        <Alert className="mb-6 border-blue-500 bg-blue-50">
          <Clock className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-900">KYC Verification Pending</AlertTitle>
          <AlertDescription className="text-blue-800">
            Your KYC documents are being reviewed. {actionName} will be available once approved.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{actionName} Requires KYC Verification</AlertTitle>
        <AlertDescription>
          Complete your KYC (Know Your Customer) verification to {actionName.toLowerCase()}.
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/kyc')}
            className="mt-2"
          >
            Start KYC Verification
          </Button>
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div>
      {showAlert && getAlert()}

      {/* Disabled state overlay */}
      <div className={isApproved ? '' : 'opacity-50 pointer-events-none'}>
        {children}
      </div>
    </div>
  );
};

export const KYCStatusBadge: React.FC<{
  isApproved: boolean;
  isPending: boolean;
  isRejected: boolean;
}> = ({ isApproved, isPending, isRejected }) => {
  if (isApproved) {
    return (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="mr-1 h-3 w-3" />
        KYC Verified
      </Badge>
    );
  }

  if (isPending) {
    return (
      <Badge className="bg-yellow-100 text-yellow-800">
        <Clock className="mr-1 h-3 w-3" />
        KYC Pending
      </Badge>
    );
  }

  if (isRejected) {
    return (
      <Badge className="bg-red-100 text-red-800">
        <XCircle className="mr-1 h-3 w-3" />
        KYC Rejected
      </Badge>
    );
  }

  return (
    <Badge variant="outline">
      <AlertCircle className="mr-1 h-3 w-3" />
      KYC Required
    </Badge>
  );
};
