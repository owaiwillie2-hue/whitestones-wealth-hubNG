import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Check if user is admin using server-side function
        const { data: roleData, error: roleError } = await supabase
          .rpc('has_role', { _user_id: data.user.id, _role: 'admin' });

        if (roleError) throw roleError;

        if (roleData) {
          toast.success('Admin login successful!');
          navigate('/admin/dashboard');
        } else {
          await supabase.auth.signOut();
          toast.error('Unauthorized: Admin access required');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Portal</h1>
            <p className="text-slate-600">Whitestones Markets</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-slate-900">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-slate-900">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Authenticating...' : 'Access Admin Dashboard'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
