import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle2, Calendar, Users, DollarSign } from 'lucide-react';
import guestBookingAPI, { type CheckAvailabilityResponse } from '@/api/guestBooking';

interface PropertyRoom {
  _id: string;
  name: string;
  baseRate: number;
}

interface GuestProperty {
  _id: string;
  name: string;
  rooms?: PropertyRoom[];
}

const GuestBooking = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { propertyId: urlPropertyId } = useParams();

  // Form state
  const [properties, setProperties] = useState<GuestProperty[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState(urlPropertyId || '');
  const [selectedProperty, setSelectedProperty] = useState<GuestProperty | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guests, setGuests] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');
  const [channel, setChannel] = useState('direct');

  // UI state
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [creatingBooking, setCreatingBooking] = useState(false);
  const [availability, setAvailability] = useState<CheckAvailabilityResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load properties
  useEffect(() => {
    const loadProperties = async () => {
      try {
        const response = await guestBookingAPI.getProperties();
        const data = response.data?.properties || response.data || response;
        setProperties(data as GuestProperty[]);

        if (urlPropertyId) {
          const property = (data as GuestProperty[]).find((p: GuestProperty) => p._id === urlPropertyId);
          if (property) {
            setSelectedPropertyId(property._id);
            setSelectedProperty(property);
          }
        }
      } catch (err) {
        console.error('Error loading properties:', err);
        setError('Failed to load properties');
      } finally {
        setLoadingProperties(false);
      }
    };

    loadProperties();
  }, [urlPropertyId]);

  // Update selected property when changed
  useEffect(() => {
    if (selectedPropertyId) {
      const property = properties.find(p => p._id === selectedPropertyId);
      setSelectedProperty(property);
      setSelectedRoomId('');
      setAvailability(null);
    }
  }, [selectedPropertyId, properties]);

  const handleCheckAvailability = useCallback(async () => {
    if (!selectedPropertyId || !selectedRoomId || !checkIn || !checkOut) {
      setError('Please select property, room, and dates');
      return;
    }

    setCheckingAvailability(true);
    setError(null);

    try {
      const response = await guestBookingAPI.checkAvailability({
        propertyId: selectedPropertyId,
        roomId: selectedRoomId,
        checkIn: checkIn.toISOString().split('T')[0],
        checkOut: checkOut.toISOString().split('T')[0]
      });

      setAvailability(response);
    } catch (err: unknown) {
      console.error('Error checking availability:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to check availability';
      setError(errorMessage);
      setAvailability(null);
    } finally {
      setCheckingAvailability(false);
    }
  }, [selectedPropertyId, selectedRoomId, checkIn, checkOut]);

  // Auto-check availability when dates and room change
  useEffect(() => {
    if (selectedPropertyId && selectedRoomId && checkIn && checkOut) {
      const timer = setTimeout(() => {
        handleCheckAvailability();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [checkIn, checkOut, selectedRoomId, selectedPropertyId, handleCheckAvailability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPropertyId || !selectedRoomId || !checkIn || !checkOut) {
      setError('Please fill all required fields');
      return;
    }

    if (!guestName || !guestEmail) {
      setError('Please provide guest name and email');
      return;
    }

    if (!availability?.available) {
      setError('No availability for selected dates');
      return;
    }

    setCreatingBooking(true);
    setError(null);

    try {
      const response = await guestBookingAPI.createBooking({
        propertyId: selectedPropertyId,
        roomId: selectedRoomId,
        checkIn: checkIn.toISOString().split('T')[0],
        checkOut: checkOut.toISOString().split('T')[0],
        guestName,
        guestEmail,
        guestPhone,
        guests,
        specialRequests,
        channel
      });

      // Navigate to confirmation page
      navigate(`/booking-confirmation/${response.booking.confirmationCode}`);
    } catch (err: unknown) {
      console.error('Error creating booking:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create booking';
      setError(errorMessage);
    } finally {
      setCreatingBooking(false);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t('guestBooking.title', 'Book Your Perfect Stay')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('guestBooking.subtitle', 'Find and book your ideal accommodation')}
          </p>
        </div>

        {/* Main Form Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>{t('guestBooking.bookingDetails', 'Booking Details')}</CardTitle>
            <CardDescription>
              {t('guestBooking.fillForm', 'Please fill in the details below to check availability and book')}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Property Selection */}
              <div className="space-y-2">
                <Label htmlFor="property">
                  {t('guestBooking.property', 'Property')} <span className="text-red-500">*</span>
                </Label>
                {loadingProperties ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading properties...
                  </div>
                ) : (
                  <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                    <SelectTrigger id="property">
                      <SelectValue placeholder={t('guestBooking.selectProperty', 'Select a property')} />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property._id} value={property._id}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Room Selection */}
              {selectedProperty && (
                <div className="space-y-2">
                  <Label htmlFor="room">
                    {t('guestBooking.room', 'Room Type')} <span className="text-red-500">*</span>
                  </Label>
                  <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                    <SelectTrigger id="room">
                      <SelectValue placeholder={t('guestBooking.selectRoom', 'Select a room')} />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProperty.rooms?.map((room: PropertyRoom) => (
                        <SelectItem key={room._id} value={room._id}>
                          {room.name} - ${room.baseRate}/night
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Dates */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    {t('guestBooking.checkIn', 'Check-in')} <span className="text-red-500">*</span>
                  </Label>
                  <DatePicker
                    selected={checkIn}
                    onChange={(date) => setCheckIn(date)}
                    selectsStart
                    startDate={checkIn}
                    endDate={checkOut}
                    minDate={today}
                    dateFormat="yyyy-MM-dd"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholderText={t('guestBooking.selectCheckIn', 'Select check-in date')}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    {t('guestBooking.checkOut', 'Check-out')} <span className="text-red-500">*</span>
                  </Label>
                  <DatePicker
                    selected={checkOut}
                    onChange={(date) => setCheckOut(date)}
                    selectsEnd
                    startDate={checkIn}
                    endDate={checkOut}
                    minDate={checkIn || today}
                    dateFormat="yyyy-MM-dd"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholderText={t('guestBooking.selectCheckOut', 'Select check-out date')}
                  />
                </div>
              </div>

              {/* Number of Guests */}
              <div className="space-y-2">
                <Label htmlFor="guests">
                  {t('guestBooking.guests', 'Number of Guests')}
                </Label>
                <Input
                  id="guests"
                  type="number"
                  min="1"
                  max="20"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                />
              </div>

              {/* Availability Display */}
              {checkingAvailability && (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription>
                    {t('guestBooking.checkingAvailability', 'Checking availability...')}
                  </AlertDescription>
                </Alert>
              )}

              {availability && !checkingAvailability && (
                <Alert className={availability.available ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
                  {availability.available ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <div className="space-y-2">
                          <div className="font-semibold">
                            {availability.availableRooms} / {availability.totalRooms} rooms available
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {availability.nights} nights
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {guests} guests
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              ${availability.totalPrice}
                            </div>
                          </div>
                        </div>
                      </AlertDescription>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <AlertDescription className="text-red-800">
                        {t('guestBooking.noAvailability', 'No rooms available for selected dates')}
                      </AlertDescription>
                    </>
                  )}
                </Alert>
              )}

              {/* Guest Information */}
              <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-semibold">
                  {t('guestBooking.guestInformation', 'Guest Information')}
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="guestName">
                    {t('guestBooking.fullName', 'Full Name')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="guestName"
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder={t('guestBooking.enterName', 'Enter your full name')}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guestEmail">
                    {t('guestBooking.email', 'Email')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="guestEmail"
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder={t('guestBooking.enterEmail', 'Enter your email')}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guestPhone">
                    {t('guestBooking.phone', 'Phone')}
                  </Label>
                  <Input
                    id="guestPhone"
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder={t('guestBooking.enterPhone', 'Enter your phone number')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialRequests">
                    {t('guestBooking.specialRequests', 'Special Requests')} ({t('optional', 'Optional')})
                  </Label>
                  <Textarea
                    id="specialRequests"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder={t('guestBooking.enterRequests', 'Any special requests or preferences?')}
                    rows={3}
                  />
                </div>
              </div>

              {/* Channel Selection (Simulate booking from OTA) */}
              <div className="border-t pt-6 space-y-2">
                <Label htmlFor="channel">
                  {t('guestBooking.bookingChannel', 'Booking Channel')} ({t('simulation', 'Simulation')})
                </Label>
                <Select value={channel} onValueChange={setChannel}>
                  <SelectTrigger id="channel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct">
                      <Badge variant="outline">Direct Booking</Badge>
                    </SelectItem>
                    <SelectItem value="airbnb">
                      <Badge variant="outline" className="bg-pink-50">Airbnb</Badge>
                    </SelectItem>
                    <SelectItem value="booking">
                      <Badge variant="outline" className="bg-blue-50">Booking.com</Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  {t('guestBooking.channelInfo', 'This simulates which platform the booking comes from')}
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCheckAvailability}
                  disabled={!selectedPropertyId || !selectedRoomId || !checkIn || !checkOut || checkingAvailability}
                  className="flex-1"
                >
                  {checkingAvailability ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('checking', 'Checking...')}
                    </>
                  ) : (
                    t('guestBooking.checkAvailability', 'Check Availability')
                  )}
                </Button>

                <Button
                  type="submit"
                  disabled={!availability?.available || creatingBooking}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {creatingBooking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('booking', 'Booking...')}
                    </>
                  ) : (
                    t('guestBooking.bookNow', 'Book Now')
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GuestBooking;

