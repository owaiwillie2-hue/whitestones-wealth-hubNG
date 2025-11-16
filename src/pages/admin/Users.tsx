import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { Search } from 'lucide-react';

export const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*, account_balances(*), kyc_documents(status)')
        .order('created_at', { ascending: false });

      setUsers(profiles || []);
      setFilteredUsers(profiles || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = users.filter(user =>
      user.full_name?.toLowerCase().includes(query.toLowerCase()) ||
      user.email?.toLowerCase().includes(query.toLowerCase()) ||
      user.id?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-2">View and manage all platform users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Main Balance</TableHead>
                  <TableHead>Investment Balance</TableHead>
                  <TableHead>KYC Status</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    onClick={() => navigate(`/admin/users/${user.id}`)}
                    className="cursor-pointer hover:bg-accent transition-colors"
                  >
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.country || '-'}</TableCell>
                    <TableCell>
                      ${parseFloat(user.account_balances?.[0]?.main_balance || '0').toFixed(2)}
                    </TableCell>
                    <TableCell>
                      ${parseFloat(user.account_balances?.[0]?.investment_balance || '0').toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {user.kyc_documents?.[0]?.status ? (
                        <Badge variant={
                          user.kyc_documents[0].status === 'approved' ? 'default' :
                          user.kyc_documents[0].status === 'pending' ? 'secondary' :
                          'destructive'
                        }>
                          {user.kyc_documents[0].status}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Not Submitted</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.created_at ? formatDistanceToNow(new Date(user.created_at), { addSuffix: true }) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
