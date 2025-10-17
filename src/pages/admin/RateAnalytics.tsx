import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  BarChart3,
  Download,
  RefreshCw,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

import type { RateAnalytics } from '@/types/rate';
import { getRatePlanById, getRateAnalytics } from '@/data/mockRates';

export default function RateAnalyticsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [analytics, setAnalytics] = useState<RateAnalytics | null>(null);

  // Load analytics data
  useEffect(() => {
    if (id) {
      const data = getRateAnalytics(id);
      if (data) {
        setAnalytics(data);
      } else {
        toast.error('Analytics data not available for this rate plan');
      }
    }
  }, [id]);

  if (!id) {
    navigate('/admin/rates');
    return null;
  }

  const ratePlan = getRatePlanById(id);

  if (!ratePlan) {
    toast.error('Rate plan not found');
    navigate('/admin/rates');
    return null;
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const handleExport = () => {
    toast.success('Analytics exported successfully');
  };

  const handleRefresh = () => {
    toast.success('Analytics refreshed');
  };

  // Calculate change indicators
  const getChangeIndicator = (value: number) => {
    if (value > 0) {
      return {
        icon: TrendingUp,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        text: `+${value.toFixed(1)}%`,
      };
    } else if (value < 0) {
      return {
        icon: TrendingDown,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        text: `${value.toFixed(1)}%`,
      };
    }
    return {
      icon: TrendingUp,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      text: '0%',
    };
  };

  const revenueChange = getChangeIndicator(analytics.comparisonToPrevious?.revenue || 0);
  const rateChange = getChangeIndicator(analytics.comparisonToPrevious?.averageRate || 0);
  const occupancyChange = getChangeIndicator(analytics.comparisonToPrevious?.occupancy || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(`/admin/rates/${id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Rate Analytics</h1>
            <p className="text-muted-foreground">{ratePlan.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={(value: string) => setSelectedPeriod(value as '7d' | '30d' | '90d' | '1y')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.revenue.toLocaleString()}</div>
            <div className={`flex items-center text-xs mt-1 ${revenueChange.color}`}>
              <revenueChange.icon className="mr-1 h-3 w-3" />
              {revenueChange.text} vs previous period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.averageRate.toFixed(2)}</div>
            <div className={`flex items-center text-xs mt-1 ${rateChange.color}`}>
              <rateChange.icon className="mr-1 h-3 w-3" />
              {rateChange.text} vs previous period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.bookings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ${(analytics.revenue / analytics.bookings).toFixed(2)} per booking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.occupancyRate}%</div>
            <div className={`flex items-center text-xs mt-1 ${occupancyChange.color}`}>
              <occupancyChange.icon className="mr-1 h-3 w-3" />
              {occupancyChange.text} vs previous period
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rate Range */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rate Range</CardTitle>
            <CardDescription>
              Minimum and maximum rates during the selected period
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Minimum Rate</span>
                <span className="text-2xl font-bold">${analytics.minimumRate}</span>
              </div>
              <Progress value={33} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Average Rate</span>
                <span className="text-2xl font-bold">${analytics.averageRate.toFixed(2)}</span>
              </div>
              <Progress value={66} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Maximum Rate</span>
                <span className="text-2xl font-bold">${analytics.maximumRate}</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>

            <Separator />

            <div className="pt-2">
              <p className="text-sm text-muted-foreground">
                Rate variance: ${analytics.maximumRate - analytics.minimumRate} (
                {(
                  ((analytics.maximumRate - analytics.minimumRate) / analytics.minimumRate) *
                  100
                ).toFixed(1)}
                %)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rate Distribution</CardTitle>
            <CardDescription>How bookings are distributed across rate levels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.rateDistribution.map((dist, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{dist.range}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{dist.count} bookings</span>
                    <Badge variant="secondary">{dist.percentage}%</Badge>
                  </div>
                </div>
                <Progress value={dist.percentage} className="h-2" />
              </div>
            ))}

            <Separator className="my-4" />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Most common range</p>
                <p className="font-semibold">
                  {
                    analytics.rateDistribution.reduce((prev, current) =>
                      prev.percentage > current.percentage ? prev : current
                    ).range
                  }
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Bookings in range</p>
                <p className="font-semibold">
                  {
                    analytics.rateDistribution.reduce((prev, current) =>
                      prev.percentage > current.percentage ? prev : current
                    ).percentage
                  }
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>
            Weekly performance metrics over the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Simple table view of trends */}
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-medium">Week</th>
                    <th className="text-right p-3 font-medium">Avg Rate</th>
                    <th className="text-right p-3 font-medium">Occupancy</th>
                    <th className="text-right p-3 font-medium">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.trends.map((trend, index) => (
                    <tr key={index} className="border-t hover:bg-muted/50">
                      <td className="p-3">
                        {new Date(trend.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="text-right p-3 font-medium">${trend.averageRate}</td>
                      <td className="text-right p-3">
                        <div className="flex items-center justify-end gap-2">
                          <Progress value={trend.occupancy} className="w-16 h-2" />
                          <span>{trend.occupancy}%</span>
                        </div>
                      </td>
                      <td className="text-right p-3 font-semibold">
                        ${trend.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Trend Summary */}
            <div className="grid gap-4 md:grid-cols-3 pt-4">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground mb-1">Average Weekly Rate</p>
                <p className="text-2xl font-bold">
                  $
                  {(
                    analytics.trends.reduce((sum, t) => sum + t.averageRate, 0) /
                    analytics.trends.length
                  ).toFixed(2)}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground mb-1">Average Weekly Occupancy</p>
                <p className="text-2xl font-bold">
                  {(
                    analytics.trends.reduce((sum, t) => sum + t.occupancy, 0) /
                    analytics.trends.length
                  ).toFixed(1)}
                  %
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground mb-1">Total Weekly Revenue</p>
                <p className="text-2xl font-bold">
                  $
                  {(
                    analytics.trends.reduce((sum, t) => sum + t.revenue, 0) /
                    analytics.trends.length
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison */}
      {analytics.comparisonToPrevious && (
        <Card>
          <CardHeader>
            <CardTitle>Period Comparison</CardTitle>
            <CardDescription>Performance vs previous period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className={`rounded-lg border p-4 ${revenueChange.bgColor}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Revenue Change</p>
                  <revenueChange.icon className={`h-5 w-5 ${revenueChange.color}`} />
                </div>
                <p className={`text-3xl font-bold ${revenueChange.color}`}>
                  {revenueChange.text}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {analytics.comparisonToPrevious.revenue > 0 ? 'Increase' : 'Decrease'} in total
                  revenue
                </p>
              </div>

              <div className={`rounded-lg border p-4 ${rateChange.bgColor}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Average Rate Change</p>
                  <rateChange.icon className={`h-5 w-5 ${rateChange.color}`} />
                </div>
                <p className={`text-3xl font-bold ${rateChange.color}`}>{rateChange.text}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {analytics.comparisonToPrevious.averageRate > 0 ? 'Increase' : 'Decrease'} in
                  average rate
                </p>
              </div>

              <div className={`rounded-lg border p-4 ${occupancyChange.bgColor}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Occupancy Change</p>
                  <occupancyChange.icon className={`h-5 w-5 ${occupancyChange.color}`} />
                </div>
                <p className={`text-3xl font-bold ${occupancyChange.color}`}>
                  {occupancyChange.text}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {analytics.comparisonToPrevious.occupancy > 0 ? 'Increase' : 'Decrease'} in
                  occupancy
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
          <CardDescription>Automated insights based on your performance data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.comparisonToPrevious?.revenue > 10 && (
              <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
                <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">Strong Revenue Growth</p>
                  <p className="text-sm text-green-700">
                    Your revenue increased by {analytics.comparisonToPrevious.revenue.toFixed(1)}%
                    compared to the previous period. Keep up the good work!
                  </p>
                </div>
              </div>
            )}

            {analytics.occupancyRate > 75 && (
              <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <BarChart3 className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">High Occupancy</p>
                  <p className="text-sm text-blue-700">
                    Your occupancy rate of {analytics.occupancyRate}% is excellent. Consider
                    increasing rates during peak demand periods.
                  </p>
                </div>
              </div>
            )}

            {analytics.comparisonToPrevious?.revenue < -5 && (
              <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <TrendingDown className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900">Revenue Decline</p>
                  <p className="text-sm text-amber-700">
                    Revenue decreased by {Math.abs(analytics.comparisonToPrevious.revenue).toFixed(1)}
                    %. Review your pricing strategy and consider promotional offers.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
