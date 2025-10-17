import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Building2,
  RefreshCw,
  Eye,
  AlertCircle
} from 'lucide-react';
import { getKpis } from '@/api/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface KpiData {
  occupancyPct: number;
  revenue: number;
  newBookings: number;
}

interface KpiResponse {
  success?: boolean;
  data?: KpiData;
  occupancyPct?: number;
  revenue?: number;
  newBookings?: number;
}

export const SupervisorDashboard = () => {
  const { t } = useTranslation(['supervisor', 'common']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState<KpiData>({
    occupancyPct: 0,
    revenue: 0,
    newBookings: 0
  });

  const fetchKpis = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getKpis() as KpiResponse;
      const data = response.data || response;
      setKpis(data as KpiData);
    } catch (err: unknown) {
      console.error('Failed to fetch KPIs:', err);
      const errorMessage = err instanceof Error ? err.message : t('common:error');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchKpis();
  }, [fetchKpis]);

  const kpiCards = [
    {
      title: t('supervisor:dashboard.kpis.occupancy'),
      value: loading ? '...' : `${kpis.occupancyPct.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: t('supervisor:dashboard.kpis.revenue'),
      value: loading ? '...' : `$${kpis.revenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: t('supervisor:dashboard.kpis.bookings'),
      value: loading ? '...' : kpis.newBookings,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {t('supervisor:dashboard.title')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {t('supervisor:dashboard.subtitle')}
          </p>
        </div>
        
        <Button
          onClick={fetchKpis}
          disabled={loading}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          style={{ minHeight: '44px' }}
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
          {t('common:refresh')}
        </Button>
      </div>

      {/* View-Only Notice */}
      <Alert className="border-blue-200 bg-blue-50">
        <Eye className="h-4 w-4 text-blue-600 flex-shrink-0" />
        <AlertDescription className="text-blue-800 text-sm sm:text-base">
          {t('supervisor:viewOnly')}
        </AlertDescription>
      </Alert>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card 
              key={index}
              className="p-4 sm:p-6 hover:shadow-lg transition-shadow bg-white"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                    {kpi.title}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {kpi.value}
                  </p>
                </div>
                <div className={cn(
                  "p-2 sm:p-3 rounded-lg",
                  kpi.bgColor
                )}>
                  <Icon className={cn("w-5 h-5 sm:w-6 sm:h-6", kpi.color)} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Overview Section */}
      <Card className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          {t('supervisor:dashboard.overview')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="flex items-center gap-3 p-3 sm:p-4 bg-white rounded-lg">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">
                {t('supervisor:dashboard.kpis.properties')}
              </p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {loading ? '...' : '-'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-4 sm:p-6 lg:p-8 bg-white">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          {t('supervisor:dashboard.recentActivity')}
        </h2>
        <div className="flex items-center justify-center p-8 sm:p-12 text-gray-500">
          <p className="text-sm sm:text-base text-center">
            {t('supervisor:dashboard.noActivity')}
          </p>
        </div>
      </Card>
    </div>
  );
};

// Helper function
function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

export default SupervisorDashboard;



