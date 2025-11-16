import { useState } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, Users, DollarSign, Download, FileText, 
  GitBranch, Settings, LogOut, Menu, X, Moon, Sun, Bell
} from 'lucide-react';
import logo from '@/assets/logo.png';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';

export const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Analytics', path: '/admin/dashboard' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: DollarSign, label: 'Deposits', path: '/admin/deposits' },
    { icon: Download, label: 'Withdrawals', path: '/admin/withdrawals' },
    { icon: FileText, label: 'KYC', path: '/admin/kyc' },
    { icon: GitBranch, label: 'Referrals', path: '/admin/referrals' },
    { icon: Bell, label: 'Notifications', path: '/admin/notifications' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link to="/admin/dashboard" className="flex items-center space-x-2">
              <img src={logo} alt="Whitestones Markets" className="h-8" />
              <span className="font-bold text-lg hidden sm:inline">Admin Panel</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64
          bg-card border-r border-border transition-transform duration-300 lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-all
                  ${isActive(item.path) 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent text-foreground'
                  }
                `}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
