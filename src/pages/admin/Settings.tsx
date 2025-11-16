import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Save, Upload, Trash2 } from 'lucide-react';

export const AdminSettings = () => {
  const [settings, setSettings] = useState({
    deposit_address: '',
    deposit_qr_url: '',
    company_address: '',
    company_phone: '',
    company_email: ''
  });
  const [loading, setLoading] = useState(false);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string>('');

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
        setSettings(prev => ({ ...prev, ...settingsObj }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let qrUrl = settings.deposit_qr_url;

      // Upload QR file if provided
      if (qrFile) {
        const fileExt = qrFile.name.split('.').pop();
        const fileName = `qr-${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('settings')
          .upload(fileName, qrFile, { upsert: true });

        if (uploadError) throw uploadError;

        // Get public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('settings')
          .getPublicUrl(fileName);
        
        qrUrl = publicUrl;
      }

      const updates = Object.entries({...settings, deposit_qr_url: qrUrl}).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString()
      }));

      for (const update of updates) {
        await supabase
          .from('website_settings')
          .upsert(update, { onConflict: 'key' });
      }

      toast.success('Settings saved successfully');
      setQrFile(null);
      setQrPreview('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setQrFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveQr = () => {
    setQrFile(null);
    setQrPreview('');
    setSettings({ ...settings, deposit_qr_url: '' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Website Settings</h1>
        <p className="text-muted-foreground mt-2">Manage website configuration</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Deposit Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="deposit_address">Bitcoin Deposit Address</Label>
              <Textarea
                id="deposit_address"
                value={settings.deposit_address}
                onChange={(e) => setSettings({ ...settings, deposit_address: e.target.value })}
                placeholder="bc1q..."
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="deposit_qr_file" className="block mb-2">Upload Bitcoin QR Code</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 hover:border-muted-foreground/50 transition">
                <input
                  id="deposit_qr_file"
                  type="file"
                  accept="image/*"
                  onChange={handleQrFileChange}
                  className="hidden"
                />
                <label htmlFor="deposit_qr_file" className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click to upload QR image or drag and drop</span>
                  <span className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</span>
                </label>
              </div>
              
              {(qrPreview || settings.deposit_qr_url) && (
                <div className="mt-4 space-y-2">
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <img 
                      src={qrPreview || settings.deposit_qr_url} 
                      alt="QR Code Preview" 
                      className="h-48 w-48 object-cover rounded"
                    />
                  </div>
                  <Button 
                    type="button"
                    variant="destructive" 
                    size="sm"
                    onClick={handleRemoveQr}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove QR Code
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company_address">Company Address</Label>
              <Textarea
                id="company_address"
                value={settings.company_address}
                onChange={(e) => setSettings({ ...settings, company_address: e.target.value })}
                placeholder="123 Financial District..."
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="company_phone">Company Phone</Label>
              <Input
                id="company_phone"
                value={settings.company_phone}
                onChange={(e) => setSettings({ ...settings, company_phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="company_email">Company Email</Label>
              <Input
                id="company_email"
                type="email"
                value={settings.company_email}
                onChange={(e) => setSettings({ ...settings, company_email: e.target.value })}
                placeholder="contact@company.com"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Button onClick={handleSave} disabled={loading} size="lg">
        <Save className="mr-2 h-5 w-5" />
        {loading ? 'Saving...' : 'Save Settings'}
      </Button>
    </div>
  );
};

export default AdminSettings;
