import { ReactNode, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Home, TrendingUp, DollarSign, FileText, Users, Settings, LogOut, Menu, X, Activity, User, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Activity, label: 'Transaction', path: '/dashboard/transactions' },
    { icon: TrendingUp, label: 'Investment', path: '/dashboard/investments' },
    { icon: FileText, label: 'Our Plans', path: '/dashboard/plans' },
    { icon: User, label: 'My Profile', path: '/dashboard/profile' },
    { icon: Users, label: 'Referrals', path: '/dashboard/referrals' },
    { icon: CreditCard, label: 'KYC', path: '/dashboard/kyc' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <nav className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden mr-4 p-2 rounded-md hover:bg-accent"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h1 className="text-xl font-bold text-foreground">Whitestones Markets</h1>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/dashboard/deposit">
                <Button variant="default" size="sm">
                  Deposit Funds
                </Button>
              </Link>
              <Link to="/dashboard/withdraw">
                <Button variant="outline" size="sm">
                  Withdraw Funds
                </Button>
              </Link>

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-full hover:bg-accent"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg py-2">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-medium">{user?.email}</p>
                    </div>
                    <Link
                      to="/dashboard/deposit"
                      className="block px-4 py-2 text-sm hover:bg-accent"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Deposit Funds
                    </Link>
                    <Link
                      to="/dashboard/withdraw"
                      className="block px-4 py-2 text-sm hover:bg-accent"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Withdraw Funds
                    </Link>
                    <Link
                      to="/dashboard/profile"
                      className="block px-4 py-2 text-sm hover:bg-accent"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      View Profile
                    </Link>
                    <Link
                      to="/dashboard/settings"
                      className="block px-4 py-2 text-sm hover:bg-accent"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Account Settings
                    </Link>
                    <Link
                      to="/dashboard/activity"
                      className="block px-4 py-2 text-sm hover:bg-accent"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Login Activity
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-accent text-destructive"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out mt-16 lg:mt-0`}
        >
          <div className="h-full overflow-y-auto p-4">
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent text-foreground transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              ))}
              
              <div className="pt-4 border-t border-border">
                <Link
                  to="/"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent text-foreground transition-colors"
                >
                  <Home size={20} />
                  <span>Go to Home</span>
                </Link>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-20 mt-16"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
