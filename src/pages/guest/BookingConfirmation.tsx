import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, Calendar, Users, Mail, Phone, Home, Bed, DollarSign, MessageSquare } from 'lucide-react';
import guestBookingAPI, { type GetBookingResponse } from '@/api/guestBooking';

const BookingConfirmation = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { confirmationCode } = useParams();

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<GetBookingResponse['booking'] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBooking = async () => {
      if (!confirmationCode) {
        setError('No confirmation code provided');
        setLoading(false);
        return;
      }

      try {
        const response = await guestBookingAPI.getBooking(confirmationCode);
        setBooking(response.booking);
      } catch (err: unknown) {
        console.error('Error loading booking:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load booking details';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [confirmationCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">{t('loading', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">{t('error', 'Error')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>
                {error || t('bookingNotFound', 'Booking not found')}
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => navigate('/book')}
              className="w-full mt-4"
              variant="outline"
            >
              {t('makeNewBooking', 'Make a New Booking')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const checkInDate = new Date(booking.checkIn);
  const checkOutDate = new Date(booking.checkOut);
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t('bookingConfirmed', 'Booking Confirmed!')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('confirmationEmailSent', 'A confirmation email has been sent to')} {booking.guestEmail}
          </p>
        </div>

        {/* Confirmation Code */}
        <Card className="mb-6 border-2 border-blue-500 shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                {t('confirmationCode', 'Confirmation Code')}
              </p>
              <p className="text-3xl font-bold text-blue-600 tracking-wider">
                {booking.confirmationCode}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {t('saveThisCode', 'Please save this code for your records')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Booking Details */}
        <Card className="shadow-xl mb-6">
          <CardHeader>
            <CardTitle>{t('bookingDetails', 'Booking Details')}</CardTitle>
            <CardDescription>
              {t('reviewYourBooking', 'Review your booking information')}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Property & Room */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Home className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">{t('property', 'Property')}</p>
                  <p className="font-semibold">{booking.property?.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Bed className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">{t('room', 'Room')}</p>
                  <p className="font-semibold">{booking.room?.name || 'N/A'}</p>
                  {booking.room?.type && (
                    <Badge variant="outline" className="mt-1">
                      {booking.room.type}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid md:grid-cols-3 gap-4 py-4 border-y">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">{t('checkIn', 'Check-in')}</p>
                  <p className="font-semibold">
                    {checkInDate.toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">{t('checkOut', 'Check-out')}</p>
                  <p className="font-semibold">
                    {checkOutDate.toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">{t('guests', 'Guests')}</p>
                  <p className="font-semibold">{booking.guests} {t('adults', 'adults')}</p>
                  <p className="text-sm text-gray-500">{nights} {t('nights', 'nights')}</p>
                </div>
              </div>
            </div>

            {/* Guest Information */}
            <div>
              <h3 className="font-semibold mb-3">{t('guestInformation', 'Guest Information')}</h3>
              <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{booking.guestName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">{booking.guestEmail}</span>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            {booking.specialRequests && booking.specialRequests.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-5 w-5 text-gray-500" />
                  <h3 className="font-semibold">{t('specialRequests', 'Special Requests')}</h3>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  {booking.specialRequests.map((request: string, index: number) => (
                    <p key={index} className="text-gray-700">{request}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-2xl font-bold">
                <span className="flex items-center gap-2">
                  <DollarSign className="h-6 w-6" />
                  {t('total', 'Total')}
                </span>
                <span className="text-blue-600">
                  {booking.currency} ${booking.totalAmount}
                </span>
              </div>
              <p className="text-sm text-gray-500 text-right mt-1">
                ({nights} {t('nightsAt', 'nights at')} ${(booking.totalAmount / nights).toFixed(2)}/{t('night', 'night')})
              </p>
            </div>

            {/* Status */}
            <div className="flex items-center justify-center gap-2 py-4 bg-green-50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">
                {t('status', 'Status')}: <Badge variant="outline" className="bg-green-100 text-green-800">
                  {booking.status}
                </Badge>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="flex-1"
          >
            {t('printConfirmation', 'Print Confirmation')}
          </Button>
          <Button
            onClick={() => navigate('/book')}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {t('bookAnother', 'Book Another Stay')}
          </Button>
        </div>

        {/* Additional Info */}
        <Alert className="mt-6">
          <AlertDescription className="text-sm">
            <strong>{t('importantInfo', 'Important Information')}:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>{t('checkInTime', 'Check-in time is after 3:00 PM')}</li>
              <li>{t('checkOutTime', 'Check-out time is before 11:00 AM')}</li>
              <li>{t('contactProperty', 'Please contact the property for any changes or cancellations')}</li>
              <li>{t('bringId', 'Please bring a valid ID for check-in')}</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default BookingConfirmation;



