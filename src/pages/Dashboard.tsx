import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
    }
  };

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

export default Dashboard;
