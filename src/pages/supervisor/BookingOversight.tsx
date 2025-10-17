import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, Search, RefreshCw, AlertCircle, Calendar, User } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { listReservations } from '@/api/client';
import { format } from 'date-fns';

interface BackendBooking {
  _id: string;
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
  };
  property?: {
    name: string;
  };
  checkIn: string;
  checkOut: string;
  status: string;
  channel: string;
  pricing: {
    total: number;
    currency: string;
  };
}

interface ReservationsResponse {
  success?: boolean;
  data?: {
    bookings?: BackendBooking[];
  };
  bookings?: BackendBooking[];
}

interface Booking {
  id: string;
  guest: string;
  guestEmail: string;
  property: string;
  checkIn: string;
  checkOut: string;
  status: string;
  channel: string;
  total: number;
  currency: string;
}

export const BookingOversight = () => {
  const { t } = useTranslation(['supervisor', 'common']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listReservations({}) as ReservationsResponse;
      const bookingsData = response.data?.bookings || response.bookings || response.data || [];

      // Map bookings to frontend format
      const mappedBookings = (bookingsData as BackendBooking[]).map((booking: BackendBooking) => ({
        id: booking._id,
        guest: `${booking.guestInfo.firstName} ${booking.guestInfo.lastName}`,
        guestEmail: booking.guestInfo.email,
        property: booking.property?.name || 'Unknown Property',
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        status: booking.status,
        channel: booking.channel,
        total: booking.pricing.total,
        currency: booking.pricing.currency
      }));

      setBookings(mappedBookings);
    } catch (err: unknown) {
      console.error('Failed to fetch bookings:', err);
      const errorMessage = err instanceof Error ? err.message : t('common:error');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filteredBookings = bookings.filter(booking =>
    booking.guest.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.guestEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.property.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
      checked_in: 'bg-blue-100 text-blue-700',
      checked_out: 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-blue-600 text-sm sm:text-base">{t('common:loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {t('supervisor:bookings.title')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {t('supervisor:bookings.subtitle')}
          </p>
        </div>
        
        <Button
          onClick={fetchBookings}
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
          {t('supervisor:bookings.viewOnly')}
        </AlertDescription>
      </Alert>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <Card className="p-4 sm:p-6 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-600">{t('supervisor:bookings.totalBookings')}</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{bookings.length}</p>
          </div>
          <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600" />
        </div>
      </Card>

      {/* Search */}
      <Card className="p-4 sm:p-6 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={t('supervisor:bookings.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            style={{ minHeight: '44px' }}
          />
        </div>
      </Card>

      {/* Bookings List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredBookings.map((booking) => (
          <Card key={booking.id} className="p-4 sm:p-6 hover:shadow-lg transition-shadow bg-white">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
              {/* Left side - Guest & Property */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-2">
                  <User className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg text-gray-900 truncate">
                      {booking.guest}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                      {booking.guestEmail}
                    </p>
                  </div>
                </div>
                
                <div className="ml-7 space-y-1">
                  <p className="text-sm text-gray-700 font-medium truncate">
                    {booking.property}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {format(new Date(booking.checkIn), 'MMM dd, yyyy')} - {format(new Date(booking.checkOut), 'MMM dd, yyyy')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {booking.channel} | {booking.currency} {booking.total.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Right side - Status */}
              <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                <span className={cn(
                  "inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap",
                  getStatusColor(booking.status)
                )}>
                  {booking.status}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* No Data */}
      {filteredBookings.length === 0 && (
        <Card className="p-8 sm:p-12 bg-white">
          <p className="text-center text-gray-500 text-sm sm:text-base">
            {t('supervisor:bookings.noData')}
          </p>
        </Card>
      )}
    </div>
  );
};

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

export default BookingOversight;



