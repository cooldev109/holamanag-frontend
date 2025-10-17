import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { clientApi } from '@/api/client';
import { money, date } from '@/i18n/format';
import { Calendar, CreditCard, Bell, Settings } from 'lucide-react';

interface ClientOverview {
  nextStay?: {
    id: string;
    property: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    status: string;
    currency: string;
    total: number;
  };
  lastReservation?: {
    id: string;
    property: string;
    total: number;
    currency: string;
  };
  notices: string[];
}

export const ClientDashboard: React.FC = () => {
  const { t } = useTranslation('client');
  const { toast } = useToast();
  const [data, setData] = useState<ClientOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const overview = await clientApi.getOverview();
        setData(overview as ClientOverview);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-14 w-96 bg-slate-800/50" />
          <div className="h-1 bg-gradient-to-r from-amber-500 via-amber-400/50 to-transparent rounded-full shadow-lg shadow-amber-500/50 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-64 bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border-2 border-amber-500/20 shadow-2xl shadow-amber-500/10 animate-pulse">
              <CardHeader>
                <Skeleton className="h-6 w-32 bg-slate-800/50" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full bg-slate-800/50" />
                <Skeleton className="h-4 w-3/4 bg-slate-800/50" />
                <Skeleton className="h-4 w-1/2 bg-slate-800/50" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="space-y-4">
        <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent" style={{ fontFamily: 'serif' }}>
          {t('dashboard.title')}
        </h1>
        <div className="h-1 bg-gradient-to-r from-amber-500 via-amber-400/50 to-transparent rounded-full shadow-lg shadow-amber-500/50" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Upcoming Stay Card */}
        <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border-2 border-amber-500/20 shadow-2xl shadow-amber-500/10 hover:shadow-amber-500/20 transition-all duration-500 hover:scale-105 hover:border-amber-500/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-amber-100 uppercase tracking-wide">
              {t('dashboard.nextStay')}
            </CardTitle>
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Calendar className="h-5 w-5 text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            {data?.nextStay ? (
              <div className="space-y-4">
                <div>
                  <p className="font-bold text-lg text-amber-100">{data.nextStay.property}</p>
                  <p className="text-sm text-slate-400">
                    {date(data.nextStay.checkIn, { month: 'short', day: 'numeric' })} - {date(data.nextStay.checkOut, { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div className="flex justify-between text-sm bg-slate-800/50 rounded-lg p-2">
                  <span className="text-slate-400">{t('labels.nights')}:</span>
                  <span className="font-semibold text-amber-200">{data.nextStay.nights}</span>
                </div>
                <div className="flex justify-between text-sm bg-slate-800/50 rounded-lg p-2">
                  <span className="text-slate-400">{t('labels.status')}:</span>
                  <span className="font-semibold text-emerald-400 capitalize">{data.nextStay.status}</span>
                </div>
                {/* Timeline bar */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>Today</span>
                    <span>Check-in</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5 shadow-inner">
                    <div className="bg-gradient-to-r from-amber-500 to-amber-400 h-2.5 rounded-full shadow-lg shadow-amber-500/50" style={{ width: '35%' }} />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">No upcoming stays</p>
            )}
          </CardContent>
        </Card>

        {/* Last Reservation Card */}
        <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border-2 border-amber-500/20 shadow-2xl shadow-amber-500/10 hover:shadow-amber-500/20 transition-all duration-500 hover:scale-105 hover:border-amber-500/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-amber-100 uppercase tracking-wide">
              {t('dashboard.lastReservation')}
            </CardTitle>
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <CreditCard className="h-5 w-5 text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            {data?.lastReservation ? (
              <div className="space-y-4">
                <div>
                  <p className="font-bold text-lg text-amber-100">{data.lastReservation.property}</p>
                  <p className="text-xs text-slate-500 font-mono">ID: {data.lastReservation.id.substring(0, 8)}...</p>
                </div>
                <div className="flex justify-between items-center bg-slate-800/50 rounded-lg p-3">
                  <span className="text-sm text-slate-400">{t('labels.total')}:</span>
                  <span className="font-bold text-2xl bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                    {money(data.lastReservation.total, data.lastReservation.currency)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">No reservations</p>
            )}
          </CardContent>
        </Card>

        {/* Notices Card */}
        <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border-2 border-amber-500/20 shadow-2xl shadow-amber-500/10 hover:shadow-amber-500/20 transition-all duration-500 hover:scale-105 hover:border-amber-500/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-amber-100 uppercase tracking-wide">
              {t('dashboard.notices')}
            </CardTitle>
            <div className="p-2 bg-amber-500/20 rounded-lg animate-pulse">
              <Bell className="h-5 w-5 text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            {data?.notices && data.notices.length > 0 ? (
              <div className="space-y-2">
                {data.notices.slice(0, 2).map((notice, index) => (
                  <div key={index} className="p-3 bg-gradient-to-r from-emerald-900/30 to-slate-800/30 rounded-lg border border-emerald-500/20">
                    <p className="text-sm text-slate-300">{notice}</p>
                  </div>
                ))}
                {data.notices.length > 2 && (
                  <p className="text-xs text-amber-400 font-medium pt-1">
                    +{data.notices.length - 2} more notices
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400">{t('empty.notices')}</p>
            )}
          </CardContent>
        </Card>

        {/* Shortcuts Card */}
        <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border-2 border-amber-500/20 shadow-2xl shadow-amber-500/10 hover:shadow-amber-500/20 transition-all duration-500 hover:scale-105 hover:border-amber-500/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-amber-100 uppercase tracking-wide">
              {t('dashboard.shortcuts')}
            </CardTitle>
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Settings className="h-5 w-5 text-amber-400" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start bg-slate-800/50 hover:bg-amber-500/20 border-amber-500/30 hover:border-amber-500/50 text-slate-300 hover:text-amber-200 transition-all duration-300"
              aria-label={t('shortcuts.reservations')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              {t('shortcuts.reservations')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start bg-slate-800/50 hover:bg-amber-500/20 border-amber-500/30 hover:border-amber-500/50 text-slate-300 hover:text-amber-200 transition-all duration-300"
              aria-label={t('shortcuts.profile')}
            >
              <Settings className="h-4 w-4 mr-2" />
              {t('shortcuts.profile')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDashboard;