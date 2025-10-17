import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { TableSkeleton, BookingListSkeleton } from '@/components/ui/loading-skeletons';
import { EmptyState } from '@/components/ui/empty-state';
import { listReservations, getReservation } from '@/api/client';
import { date, money } from '@/i18n/format';
import { Search, Filter, Eye, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface Reservation {
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

interface ReservationDetail extends Reservation {
  guestPhone?: string;
  propertyId?: string;
  guests?: number;
  nights?: number;
  created?: string;
  notes?: string;
}

interface ListReservationsParams {
  page: number;
  size: number;
  q?: string;
  status?: string;
}

interface BackendBooking {
  _id: string;
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  property?: {
    _id: string;
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
  guests: {
    adults: number;
    children: number;
  };
  createdAt?: string;
  specialRequests?: string[];
}

interface ReservationsResponse {
  success?: boolean;
  data?: {
    bookings?: BackendBooking[];
    pagination?: {
      totalPages: number;
    };
  };
  bookings?: BackendBooking[];
  pagination?: {
    totalPages: number;
  };
}

interface ReservationDetailResponse {
  success?: boolean;
  data?: {
    booking?: BackendBooking;
  };
  booking?: BackendBooking;
}

export const AdminReservations: React.FC = () => {
  const { t } = useTranslation(['admin', 'common']);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReservation, setSelectedReservation] = useState<ReservationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const params: ListReservationsParams = {
        page: currentPage,
        size: 10,
      };

      if (searchQuery) params.q = searchQuery;
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;

      const response = await listReservations(params) as ReservationsResponse;

      // Backend returns { success: true, data: { bookings: [...], pagination: {...} } }
      const bookingsData = response.data?.bookings || response.bookings || response.data || [];
      const paginationData = response.data?.pagination || response.pagination || { totalPages: 1 };

      // Map bookings to frontend format
      const mappedReservations = (bookingsData as BackendBooking[]).map((booking: BackendBooking) => ({
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
      
      setReservations(mappedReservations);
      setTotalPages(paginationData.totalPages);
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const fetchReservationDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const response = await getReservation(id) as ReservationDetailResponse;
      const booking = (response.data?.booking || response.booking || response.data || response) as BackendBooking;
      
      // Map booking to frontend format
      const detail: ReservationDetail = {
        id: booking._id,
        guest: `${booking.guestInfo.firstName} ${booking.guestInfo.lastName}`,
        guestEmail: booking.guestInfo.email,
        guestPhone: booking.guestInfo.phone,
        property: booking.property?.name || 'Unknown Property',
        propertyId: booking.property?._id,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        status: booking.status,
        channel: booking.channel,
        total: booking.pricing.total,
        currency: booking.pricing.currency,
        guests: booking.guests.adults + booking.guests.children,
        nights: Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24)),
        created: booking.createdAt,
        notes: booking.specialRequests?.join(', ')
      };
      
      setSelectedReservation(detail);
    } catch (error) {
      console.error('Failed to fetch reservation detail:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      confirmed: 'default',
      'checked-in': 'secondary',
      'checked-out': 'outline',
      cancelled: 'destructive',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('admin:reservations.title')}</h1>
        <p className="text-muted-foreground">Manage and monitor all reservations</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('admin:filters.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t('admin:filters.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="checked-in">Checked In</SelectItem>
                <SelectItem value="checked-out">Checked Out</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reservations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reservations ({reservations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <>
              {/* Desktop Table Skeleton */}
              <div className="hidden lg:block overflow-x-auto">
                <TableSkeleton rows={5} columns={8} />
              </div>

              {/* Mobile Cards Skeleton */}
              <div className="lg:hidden">
                <BookingListSkeleton count={5} />
              </div>
            </>
          ) : reservations.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title={
                searchQuery || statusFilter !== 'all'
                  ? 'No reservations found'
                  : 'No reservations yet'
              }
              description={
                searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters to find reservations.'
                  : 'Reservations will appear here once guests make bookings for your properties.'
              }
            />
          ) : (
            <div className="space-y-4">
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">{t('admin:tables.guest')}</th>
                      <th className="pb-3 font-medium">{t('admin:tables.property')}</th>
                      <th className="pb-3 font-medium">{t('admin:tables.checkIn')}</th>
                      <th className="pb-3 font-medium">{t('admin:tables.checkOut')}</th>
                      <th className="pb-3 font-medium">{t('admin:tables.status')}</th>
                      <th className="pb-3 font-medium">{t('admin:tables.channel')}</th>
                      <th className="pb-3 font-medium">{t('admin:tables.total')}</th>
                      <th className="pb-3 font-medium">{t('admin:tables.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((reservation) => (
                      <tr key={reservation.id} className="border-b hover:bg-muted/50">
                        <td className="py-4">
                          <div>
                            <div className="font-medium">{reservation.guest}</div>
                            <div className="text-sm text-muted-foreground">{reservation.guestEmail}</div>
                          </div>
                        </td>
                        <td className="py-4">{reservation.property}</td>
                        <td className="py-4">{date(reservation.checkIn)}</td>
                        <td className="py-4">{date(reservation.checkOut)}</td>
                        <td className="py-4">{getStatusBadge(reservation.status)}</td>
                        <td className="py-4">{reservation.channel}</td>
                        <td className="py-4 font-medium">{money(reservation.total, reservation.currency)}</td>
                        <td className="py-4">
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => fetchReservationDetail(reservation.id)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                {t('common:actions.view')}
                              </Button>
                            </SheetTrigger>
                            <SheetContent className="w-full sm:max-w-lg">
                              <SheetHeader>
                                <SheetTitle>Reservation Details</SheetTitle>
                              </SheetHeader>
                              {detailLoading ? (
                                <div className="space-y-4 mt-6">
                                  <Skeleton className="h-4 w-full" />
                                  <Skeleton className="h-4 w-3/4" />
                                  <Skeleton className="h-4 w-1/2" />
                                </div>
                              ) : selectedReservation ? (
                                <div className="space-y-6 mt-6">
                                  <div>
                                    <h4 className="font-medium mb-2">Guest Information</h4>
                                    <div className="space-y-1 text-sm">
                                      <p><strong>Name:</strong> {selectedReservation.guest}</p>
                                      <p><strong>Email:</strong> {selectedReservation.guestEmail}</p>
                                      {selectedReservation.guestPhone && (
                                        <p><strong>Phone:</strong> {selectedReservation.guestPhone}</p>
                                      )}
                                      {selectedReservation.guests && (
                                        <p><strong>Guests:</strong> {selectedReservation.guests}</p>
                                      )}
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-medium mb-2">Booking Details</h4>
                                    <div className="space-y-1 text-sm">
                                      <p><strong>Property:</strong> {selectedReservation.property}</p>
                                      <p><strong>Check-in:</strong> {date(selectedReservation.checkIn, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                      <p><strong>Check-out:</strong> {date(selectedReservation.checkOut, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                      {selectedReservation.nights && (
                                        <p><strong>Nights:</strong> {selectedReservation.nights}</p>
                                      )}
                                      <p><strong>Status:</strong> {getStatusBadge(selectedReservation.status)}</p>
                                      <p><strong>Channel:</strong> {selectedReservation.channel}</p>
                                      <p><strong>Total:</strong> {money(selectedReservation.total, selectedReservation.currency)}</p>
                                    </div>
                                  </div>

                                  {selectedReservation.notes && (
                                    <div>
                                      <h4 className="font-medium mb-2">Notes</h4>
                                      <p className="text-sm text-muted-foreground">{selectedReservation.notes}</p>
                                    </div>
                                  )}

                                  {selectedReservation.created && (
                                    <div>
                                      <h4 className="font-medium mb-2">Booking Created</h4>
                                      <p className="text-sm text-muted-foreground">
                                        {date(selectedReservation.created, { 
                                          weekday: 'long', 
                                          year: 'numeric', 
                                          month: 'long', 
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ) : null}
                            </SheetContent>
                          </Sheet>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4">
                {reservations.map((reservation) => (
                  <Card key={reservation.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-medium">{reservation.guest}</div>
                        <div className="text-sm text-muted-foreground">{reservation.guestEmail}</div>
                      </div>
                      {getStatusBadge(reservation.status)}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Property:</span>
                        <span>{reservation.property}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dates:</span>
                        <span>{date(reservation.checkIn)} - {date(reservation.checkOut)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Channel:</span>
                        <span>{reservation.channel}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Total:</span>
                        <span>{money(reservation.total, reservation.currency)}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full"
                            onClick={() => fetchReservationDetail(reservation.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            {t('common:actions.view')}
                          </Button>
                        </SheetTrigger>
                        <SheetContent>
                          {/* Same detail content as desktop */}
                        </SheetContent>
                      </Sheet>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t('admin:pagination.prev')}
                </Button>
                
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="gap-2"
                >
                  {t('admin:pagination.next')}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReservations;