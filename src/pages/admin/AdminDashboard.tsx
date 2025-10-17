import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { analyticsApi } from '@/api/client';
import { money } from '@/i18n/format';
import {
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
  ArrowRight,
  BarChart3,
  TrendingDown
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Bright, professional color palette
const COLORS = {
  primary: '#3b82f6', // Bright blue
  secondary: '#8b5cf6', // Vibrant purple
  success: '#10b981', // Emerald green
  warning: '#f59e0b', // Amber
  danger: '#ef4444', // Red
  info: '#06b6d4', // Cyan
  chart: [
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#10b981', // Green
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#06b6d4', // Cyan
    '#ec4899', // Pink
  ]
};

interface RevenueTrendPoint {
  date: string;
  value: number;
  label?: string;
}

interface BookingsByChannel {
  [channel: string]: number;
}

interface RevenueBreakdown {
  total: number;
  byChannel: BookingsByChannel;
  currency: string;
}

interface BookingStatistics {
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  cancellationRate: number;
  averageBookingValue: number;
  byChannel: BookingsByChannel;
  currency: string;
}

export const AdminDashboard: React.FC = () => {
  const { t } = useTranslation(['admin', 'common']);

  // State for all analytics data
  const [revenueTrendDaily, setRevenueTrendDaily] = useState<RevenueTrendPoint[]>([]);
  const [revenueTrendMonthly, setRevenueTrendMonthly] = useState<RevenueTrendPoint[]>([]);
  const [occupancyTrend, setOccupancyTrend] = useState<RevenueTrendPoint[]>([]);
  const [revenueBreakdown, setRevenueBreakdown] = useState<RevenueBreakdown | null>(null);
  const [bookingStats, setBookingStats] = useState<BookingStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [
          dailyRevenueRes,
          monthlyRevenueRes,
          occupancyRes,
          revenueRes,
          bookingsRes
        ] = await Promise.all([
          analyticsApi.getRevenueTrend('last_30_days'),
          analyticsApi.getRevenueTrend('this_year'),
          analyticsApi.getOccupancyTrend('last_30_days'),
          analyticsApi.getRevenueBreakdown('last_30_days'),
          analyticsApi.getBookingStatistics('last_30_days'),
        ]);

        setRevenueTrendDaily(dailyRevenueRes.data || []);

        // Group monthly data by month
        const monthlyData = (monthlyRevenueRes.data || []).reduce((acc: any[], point: RevenueTrendPoint) => {
          const month = point.date.substring(0, 7); // YYYY-MM
          const existing = acc.find(item => item.date === month);
          if (existing) {
            existing.value += point.value;
          } else {
            acc.push({ date: month, value: point.value, label: month });
          }
          return acc;
        }, []);
        setRevenueTrendMonthly(monthlyData);

        setOccupancyTrend(occupancyRes.data || []);
        setRevenueBreakdown(revenueRes.data);
        setBookingStats(bookingsRes.data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Transform channel data for pie chart
  const channelChartData = bookingStats ? Object.entries(bookingStats.byChannel)
    .filter(([_, count]) => count > 0)
    .map(([channel, count]) => ({
      name: channel.charAt(0).toUpperCase() + channel.slice(1),
      value: count
    })) : [];

  // Calculate trend percentages (mock for now)
  const revenueTrend = revenueTrendDaily.length >= 2 ?
    ((revenueTrendDaily[revenueTrendDaily.length - 1].value - revenueTrendDaily[0].value) / revenueTrendDaily[0].value * 100).toFixed(1) : '0';
  const isRevenueTrendPositive = parseFloat(revenueTrend) >= 0;

  if (loading) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {t('admin:dashboard.title')}
        </h1>
        <p className="text-muted-foreground">
          Monitor your property performance and manage operations
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue (30 days)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {money(revenueBreakdown?.total || 0)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {isRevenueTrendPositive ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={isRevenueTrendPositive ? 'text-green-600' : 'text-red-600'}>
                {revenueTrend}%
              </span>
              <span className="text-muted-foreground">vs previous period</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {bookingStats?.totalBookings || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {bookingStats?.confirmedBookings || 0} confirmed, {bookingStats?.cancelledBookings || 0} cancelled
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Booking Value
            </CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {money(bookingStats?.averageBookingValue || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {bookingStats?.currency || 'USD'} per booking
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Trend - Last 30 Days */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Revenue Trend (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueTrendDaily}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="label"
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Occupancy Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              Occupancy Rate (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={occupancyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="label"
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Occupancy']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={COLORS.success}
                  strokeWidth={3}
                  dot={{ fill: COLORS.success, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              Monthly Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueTrendMonthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                />
                <Bar
                  dataKey="value"
                  fill={COLORS.secondary}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bookings by Channel - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-500" />
              Bookings by Channel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={channelChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {channelChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.chart[index % COLORS.chart.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button asChild className="w-full justify-between" variant="outline">
            <Link to="/admin/reservations">
              {t('admin:dashboard.quick.reservations')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          <Button asChild className="w-full justify-between" variant="outline">
            <Link to="/admin/inventory">
              {t('admin:dashboard.quick.inventory')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          <Button asChild className="w-full justify-between" variant="outline">
            <Link to="/admin/properties">
              Manage Properties
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
