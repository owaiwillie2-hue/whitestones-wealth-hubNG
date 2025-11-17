import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Send, History } from 'lucide-react';
import { format } from 'date-fns';

interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  category: string;
  user_id?: string;
  created_at: string;
}

export const AdminNotifications = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('general');
  const [sendToAll, setSendToAll] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sentNotifications, setSentNotifications] = useState<NotificationRecord[]>([]);

  useEffect(() => {
    fetchUsers();
    fetchSentNotifications();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name', { ascending: true });

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchSentNotifications = async () => {
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      setSentNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      toast.error('Please fill in title and message');
      return;
    }

    try {
      setLoading(true);

      if (sendToAll) {
        // Send to all users + broadcast (NULL user_id)
        await supabase.from('notifications').insert([{
          user_id: null, // Broadcast to all
          title,
          message,
          category: category as any,
        }]);
      } else {
        if (!selectedUserId) {
          toast.error('Please select a user');
          return;
        }

        // Send to specific user
        await supabase.from('notifications').insert([{
          user_id: selectedUserId,
          title,
          message,
          category: category as any,
        }]);
      }

      toast.success(
        sendToAll
          ? 'Notification sent to all users'
          : 'Notification sent to selected user'
      );

      setTitle('');
      setMessage('');
      setCategory('general');
      setSelectedUserId('');
      setSendToAll(true);

      // Refresh sent notifications
      fetchSentNotifications();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      payment_updates: 'bg-blue-100 text-blue-800',
      withdraw_downtime: 'bg-yellow-100 text-yellow-800',
      investment_updates: 'bg-green-100 text-green-800',
      server_issues: 'bg-red-100 text-red-800',
      schedule_changes: 'bg-purple-100 text-purple-800',
      general: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notification Management</h1>
        <p className="text-muted-foreground mt-2">Send notifications to users</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Compose Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Send Notification</CardTitle>
            <CardDescription>Create and send notifications to users</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-4">
              {/* Send To */}
              <div className="space-y-2">
                <Label>Send To</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={sendToAll}
                      onChange={() => setSendToAll(true)}
                    />
                    <span>All Users</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={!sendToAll}
                      onChange={() => setSendToAll(false)}
                    />
                    <span>Specific User</span>
                  </label>
                </div>

                {!sendToAll && (
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Notification title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Notification message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payment_updates">Payment Updates</SelectItem>
                    <SelectItem value="withdraw_downtime">Withdraw Downtime</SelectItem>
                    <SelectItem value="investment_updates">Investment Updates</SelectItem>
                    <SelectItem value="server_issues">Server Issues</SelectItem>
                    <SelectItem value="schedule_changes">Schedule Changes</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Send Button */}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Notification
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {sentNotifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notifications sent yet</p>
              ) : (
                sentNotifications.map((notif) => (
                  <div key={notif.id} className="text-xs space-y-1 pb-2 border-b last:border-b-0">
                    <p className="font-medium line-clamp-1">{notif.title}</p>
                    <Badge className={getCategoryColor(notif.category)}>
                      {notif.category}
                    </Badge>
                    <p className="text-muted-foreground">
                      {format(new Date(notif.created_at), 'MMM dd, HH:mm')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminNotifications;
