-- Create storage bucket for KYC documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('kyc-documents', 'kyc-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for KYC documents
CREATE POLICY "Users can upload own KYC documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'kyc-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own KYC documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all KYC documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc-documents' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Add front and back ID document fields to kyc_documents
ALTER TABLE kyc_documents 
ADD COLUMN IF NOT EXISTS id_front_url text,
ADD COLUMN IF NOT EXISTS id_back_url text;

-- Update existing records to use id_front_url
UPDATE kyc_documents 
SET id_front_url = id_document_url 
WHERE id_front_url IS NULL AND id_document_url IS NOT NULL;