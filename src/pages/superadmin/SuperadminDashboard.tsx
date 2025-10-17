import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { Users, Home, Calendar, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getDashboardStats, type DashboardData } from '@/api/dashboard';
import { useToast } from '@/hooks/use-toast';

export const SuperadminDashboard = () => {
  const { t, i18n } = useTranslation('superadmin');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getDashboardStats();
      setData(result);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : 'Failed to load dashboard',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatDate = (dateString: string) => {
    const locale = i18n.language === 'es' ? es : enUS;
    return format(new Date(dateString), 'PPP', { locale });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6 flex items-center justify-center">
        <p className="text-blue-600 text-lg">{t('dashboard.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <h1 className="text-3xl font-bold text-blue-900">{t('dashboard.title')}</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <Card className="border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">
                {t('dashboard.stats.totalUsers')}
              </CardTitle>
              <Users className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">
                {data?.stats.users.total || 0}
              </div>
              <p className="text-xs text-blue-600 mt-2">
                {data?.stats.users.admins || 0} {t('dashboard.stats.admins')},{' '}
                {data?.stats.users.supervisors || 0} {t('dashboard.stats.supervisors')},{' '}
                {data?.stats.users.clients || 0} {t('dashboard.stats.clients')}
              </p>
            </CardContent>
          </Card>

          {/* Total Properties */}
          <Card className="border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">
                {t('dashboard.stats.totalProperties')}
              </CardTitle>
              <Home className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">
                {data?.stats.properties || 0}
              </div>
            </CardContent>
          </Card>

          {/* Bookings This Week */}
          <Card className="border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">
                {t('dashboard.stats.totalBookings')}
              </CardTitle>
              <Calendar className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">
                {data?.stats.bookings.thisWeek || 0}
              </div>
              <p className="text-xs text-blue-600 mt-2">
                {t('dashboard.stats.thisWeek')}
              </p>
            </CardContent>
          </Card>

          {/* Active Users */}
          <Card className="border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">
                {t('dashboard.stats.activeUsers')}
              </CardTitle>
              <UserCheck className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">
                {data?.stats.activeUsers || 0}
              </div>
              <p className="text-xs text-blue-600 mt-2">
                {t('dashboard.stats.last7Days')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">{t('dashboard.actions.createUser')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button
              onClick={() => navigate('/superadmin/users')}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {t('dashboard.actions.createUser')}
            </Button>
            <Button
              onClick={() => navigate('/superadmin/users')}
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              {t('dashboard.actions.viewUsers')}
            </Button>
            <Button
              onClick={() => navigate('/superadmin/settings')}
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              {t('dashboard.actions.systemSettings')}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">{t('dashboard.recentUsers.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.recentUsers && data.recentUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('dashboard.recentUsers.name')}</TableHead>
                      <TableHead>{t('dashboard.recentUsers.email')}</TableHead>
                      <TableHead>{t('dashboard.recentUsers.role')}</TableHead>
                      <TableHead>{t('dashboard.recentUsers.createdAt')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.roles.map((role) => (
                            <Badge
                              key={role}
                              variant="outline"
                              className={`mr-1 ${
                                role === 'admin'
                                  ? 'border-blue-500 text-blue-600'
                                  : role === 'supervisor'
                                  ? 'border-green-500 text-green-600'
                                  : 'border-purple-500 text-purple-600'
                              }`}
                            >
                              {role}
                            </Badge>
                          ))}
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-blue-600 text-center py-4">
                {t('dashboard.recentUsers.noUsers')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperadminDashboard;



