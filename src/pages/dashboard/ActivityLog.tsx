import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ActivityLog = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    if (!userAgent) return <Monitor className="h-5 w-5" />;
    if (userAgent.toLowerCase().includes('mobile')) return <Smartphone className="h-5 w-5" />;
    if (userAgent.toLowerCase().includes('tablet')) return <Tablet className="h-5 w-5" />;
    return <Monitor className="h-5 w-5" />;
  };

  const getDeviceType = (userAgent: string) => {
    if (!userAgent) return 'Unknown';
    if (userAgent.toLowerCase().includes('mobile')) return 'Mobile';
    if (userAgent.toLowerCase().includes('tablet')) return 'Tablet';
    return 'Desktop';
  };

  const getBrowserName = (userAgent: string) => {
    if (!userAgent) return 'Unknown Browser';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown Browser';
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading activity...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Login Activity</h1>
        <p className="text-muted-foreground mt-2">Review your recent account activity</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Browser</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No activity recorded yet
                    </TableCell>
                  </TableRow>
                ) : (
                  activities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(activity.user_agent)}
                          <span>{getDeviceType(activity.user_agent)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{activity.action}</TableCell>
                      <TableCell>{getBrowserName(activity.user_agent)}</TableCell>
                      <TableCell className="font-mono text-sm">{activity.ip_address || 'N/A'}</TableCell>
                      <TableCell>{activity.location || 'Unknown'}</TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityLog;
