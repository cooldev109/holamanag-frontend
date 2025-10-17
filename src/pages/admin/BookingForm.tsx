import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { differenceInDays } from 'date-fns';
import { ArrowLeft, Save, User, Building2, Calendar as CalendarIcon, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { MOCK_BOOKINGS, MOCK_GUESTS } from '@/data/mockBookings';
import { MOCK_PROPERTIES } from '@/data/mockProperties';
import type { GuestType } from '@/types/booking';

const bookingFormSchema = z.object({
  // Guest
  guestId: z.string().optional(),
  newGuestFirstName: z.string().optional(),
  newGuestLastName: z.string().optional(),
  newGuestEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  newGuestPhone: z.string().optional(),
  newGuestType: z.enum(['individual', 'corporate', 'group']).optional(),
  newGuestCompany: z.string().optional(),

  // Property & Room
  propertyId: z.string().min(1, 'Property is required'),
  roomId: z.string().min(1, 'Room is required'),

  // Dates
  checkInDate: z.string().min(1, 'Check-in date is required'),
  checkOutDate: z.string().min(1, 'Check-out date is required'),
  checkInTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Valid time required'),
  checkOutTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Valid time required'),

  // Guests
  adults: z.coerce.number().min(1, 'At least 1 adult required'),
  children: z.coerce.number().min(0),

  // Pricing
  roomRate: z.coerce.number().min(0, 'Room rate must be positive'),
  discount: z.coerce.number().min(0).optional(),

  // Additional
  specialRequests: z.string().optional(),
  notes: z.string().optional(),
  source: z.enum(['website', 'phone', 'email', 'walk-in', 'booking-engine', 'ota']),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

export const BookingForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isNewGuest, setIsNewGuest] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string>('');

  const isEditMode = id !== 'new' && id !== undefined;
  const existingBooking = isEditMode ? MOCK_BOOKINGS.find((b) => b.id === id) : null;

  // Get query params for pre-filling dates
  const prefilledCheckIn = searchParams.get('checkIn') || '';
  const prefilledCheckOut = searchParams.get('checkOut') || '';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: existingBooking
      ? {
          guestId: existingBooking.guestId,
          propertyId: existingBooking.propertyId,
          roomId: existingBooking.roomId,
          checkInDate: existingBooking.checkInDate,
          checkOutDate: existingBooking.checkOutDate,
          checkInTime: existingBooking.checkInTime,
          checkOutTime: existingBooking.checkOutTime,
          adults: existingBooking.adults,
          children: existingBooking.children,
          roomRate: existingBooking.roomRate,
          discount: existingBooking.discount,
          specialRequests: existingBooking.specialRequests,
          notes: existingBooking.notes,
          source: existingBooking.source,
        }
      : {
          checkInDate: prefilledCheckIn,
          checkOutDate: prefilledCheckOut,
          checkInTime: '15:00',
          checkOutTime: '11:00',
          adults: 2,
          children: 0,
          roomRate: 100,
          source: 'phone',
        },
  });

  const watchGuestId = watch('guestId');
  const watchPropertyId = watch('propertyId');
  const watchCheckInDate = watch('checkInDate');
  const watchCheckOutDate = watch('checkOutDate');
  const watchRoomRate = watch('roomRate');
  const watchDiscount = watch('discount') || 0;

  // Calculate nights
  const nights = watchCheckInDate && watchCheckOutDate
    ? Math.max(differenceInDays(new Date(watchCheckOutDate), new Date(watchCheckInDate)), 0)
    : 0;

  // Calculate pricing
  const subtotal = nights * (watchRoomRate || 0);
  const taxRate = 0.12; // 12%
  const taxes = subtotal * taxRate;
  const fees = 25; // Flat fee
  const total = subtotal + taxes + fees - watchDiscount;

  useEffect(() => {
    if (watchPropertyId) {
      setSelectedProperty(watchPropertyId);
    }
  }, [watchPropertyId]);

  const onSubmit = async (data: BookingFormValues) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: isEditMode ? 'Booking updated' : 'Booking created',
        description: isEditMode
          ? 'The booking has been updated successfully.'
          : 'New booking has been created successfully.',
      });

      navigate('/admin/bookings');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'There was an error saving the booking. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const property = MOCK_PROPERTIES.find((p) => p.id === selectedProperty);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/bookings')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bookings
        </Button>
        <h1 className="text-3xl font-bold mb-2">
          {isEditMode ? 'Edit Booking' : 'Create New Booking'}
        </h1>
        <p className="text-muted-foreground">
          {isEditMode
            ? 'Update booking information and details'
            : 'Create a new reservation for your property'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultValue="guest" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="guest">
              <User className="h-4 w-4 mr-2" />
              Guest
            </TabsTrigger>
            <TabsTrigger value="property">
              <Building2 className="h-4 w-4 mr-2" />
              Property
            </TabsTrigger>
            <TabsTrigger value="dates">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Dates
            </TabsTrigger>
            <TabsTrigger value="pricing">
              <DollarSign className="h-4 w-4 mr-2" />
              Pricing
            </TabsTrigger>
          </TabsList>

          {/* Guest Tab */}
          <TabsContent value="guest" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Guest Information</CardTitle>
                <CardDescription>
                  Select an existing guest or create a new one
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={!isNewGuest ? 'default' : 'outline'}
                    onClick={() => setIsNewGuest(false)}
                  >
                    Existing Guest
                  </Button>
                  <Button
                    type="button"
                    variant={isNewGuest ? 'default' : 'outline'}
                    onClick={() => setIsNewGuest(true)}
                  >
                    New Guest
                  </Button>
                </div>

                {!isNewGuest ? (
                  <div className="space-y-2">
                    <Label htmlFor="guestId">Select Guest</Label>
                    <Select
                      value={watchGuestId}
                      onValueChange={(value) => setValue('guestId', value)}
                    >
                      <SelectTrigger id="guestId">
                        <SelectValue placeholder="Choose a guest" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOCK_GUESTS.map((guest) => (
                          <SelectItem key={guest.id} value={guest.id}>
                            {guest.firstName} {guest.lastName} - {guest.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.guestId && (
                      <p className="text-sm text-destructive">{errors.guestId.message}</p>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="newGuestFirstName">First Name *</Label>
                        <Input
                          id="newGuestFirstName"
                          {...register('newGuestFirstName')}
                          placeholder="John"
                        />
                        {errors.newGuestFirstName && (
                          <p className="text-sm text-destructive">
                            {errors.newGuestFirstName.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newGuestLastName">Last Name *</Label>
                        <Input
                          id="newGuestLastName"
                          {...register('newGuestLastName')}
                          placeholder="Doe"
                        />
                        {errors.newGuestLastName && (
                          <p className="text-sm text-destructive">
                            {errors.newGuestLastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="newGuestEmail">Email *</Label>
                        <Input
                          id="newGuestEmail"
                          type="email"
                          {...register('newGuestEmail')}
                          placeholder="john.doe@email.com"
                        />
                        {errors.newGuestEmail && (
                          <p className="text-sm text-destructive">
                            {errors.newGuestEmail.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newGuestPhone">Phone *</Label>
                        <Input
                          id="newGuestPhone"
                          type="tel"
                          {...register('newGuestPhone')}
                          placeholder="+1 555 123 4567"
                        />
                        {errors.newGuestPhone && (
                          <p className="text-sm text-destructive">
                            {errors.newGuestPhone.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="newGuestType">Guest Type</Label>
                        <Select
                          onValueChange={(value) =>
                            setValue('newGuestType', value as GuestType)
                          }
                        >
                          <SelectTrigger id="newGuestType">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="individual">Individual</SelectItem>
                            <SelectItem value="corporate">Corporate</SelectItem>
                            <SelectItem value="group">Group</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newGuestCompany">Company (Optional)</Label>
                        <Input
                          id="newGuestCompany"
                          {...register('newGuestCompany')}
                          placeholder="Company name"
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Property Tab */}
          <TabsContent value="property" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Property & Room Selection</CardTitle>
                <CardDescription>Choose the property and room for this booking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyId">Property *</Label>
                  <Select
                    value={watchPropertyId}
                    onValueChange={(value) => setValue('propertyId', value)}
                  >
                    <SelectTrigger id="propertyId">
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_PROPERTIES.map((prop) => (
                        <SelectItem key={prop.id} value={prop.id}>
                          {prop.name} - {prop.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.propertyId && (
                    <p className="text-sm text-destructive">{errors.propertyId.message}</p>
                  )}
                </div>

                {property && (
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <p className="font-medium">{property.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {property.address}, {property.city}, {property.state}
                    </p>
                    <p className="text-sm">
                      Total Rooms: {property.totalRooms} | Check-in: {property.checkInTime} |
                      Check-out: {property.checkOutTime}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="roomId">Room *</Label>
                  <Select
                    value={watch('roomId')}
                    onValueChange={(value) => setValue('roomId', value)}
                  >
                    <SelectTrigger id="roomId">
                      <SelectValue placeholder="Select room" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="room-1">Deluxe Ocean View Suite (101)</SelectItem>
                      <SelectItem value="room-2">Standard Double Room (102)</SelectItem>
                      <SelectItem value="room-3">Family Suite (201)</SelectItem>
                      <SelectItem value="room-4">Single Room (103)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.roomId && (
                    <p className="text-sm text-destructive">{errors.roomId.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dates Tab */}
          <TabsContent value="dates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Stay Dates & Times</CardTitle>
                <CardDescription>Set check-in and check-out dates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkInDate">Check-in Date *</Label>
                    <Input id="checkInDate" type="date" {...register('checkInDate')} />
                    {errors.checkInDate && (
                      <p className="text-sm text-destructive">{errors.checkInDate.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkOutDate">Check-out Date *</Label>
                    <Input id="checkOutDate" type="date" {...register('checkOutDate')} />
                    {errors.checkOutDate && (
                      <p className="text-sm text-destructive">{errors.checkOutDate.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkInTime">Check-in Time *</Label>
                    <Input id="checkInTime" type="time" {...register('checkInTime')} />
                    {errors.checkInTime && (
                      <p className="text-sm text-destructive">{errors.checkInTime.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkOutTime">Check-out Time *</Label>
                    <Input id="checkOutTime" type="time" {...register('checkOutTime')} />
                    {errors.checkOutTime && (
                      <p className="text-sm text-destructive">{errors.checkOutTime.message}</p>
                    )}
                  </div>
                </div>

                {nights > 0 && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium">
                      Total Stay: {nights} {nights === 1 ? 'night' : 'nights'}
                    </p>
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adults">Adults *</Label>
                    <Input id="adults" type="number" min="1" {...register('adults')} />
                    {errors.adults && (
                      <p className="text-sm text-destructive">{errors.adults.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="children">Children</Label>
                    <Input id="children" type="number" min="0" {...register('children')} />
                    {errors.children && (
                      <p className="text-sm text-destructive">{errors.children.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialRequests">Special Requests</Label>
                  <Textarea
                    id="specialRequests"
                    {...register('specialRequests')}
                    placeholder="Any special requests or preferences..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Internal Notes</Label>
                  <Textarea
                    id="notes"
                    {...register('notes')}
                    placeholder="Internal notes for staff..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Payment</CardTitle>
                <CardDescription>Set rates and calculate total</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomRate">Room Rate (per night) *</Label>
                    <Input
                      id="roomRate"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('roomRate')}
                    />
                    {errors.roomRate && (
                      <p className="text-sm text-destructive">{errors.roomRate.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discount">Discount ($)</Label>
                    <Input
                      id="discount"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('discount')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source">Booking Source</Label>
                  <Select
                    value={watch('source')}
                    onValueChange={(value) =>
                      setValue('source', value as BookingFormValues['source'])
                    }
                  >
                    <SelectTrigger id="source">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="walk-in">Walk-in</SelectItem>
                      <SelectItem value="booking-engine">Booking Engine</SelectItem>
                      <SelectItem value="ota">OTA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-3 p-4 bg-muted rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Room Rate (${watchRoomRate}/night × {nights} nights)
                    </span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxes (12%)</span>
                    <span className="font-medium">${taxes.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fees</span>
                    <span className="font-medium">${fees.toFixed(2)}</span>
                  </div>
                  {watchDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span className="font-medium">-${watchDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/bookings')}
          >
            Cancel
          </Button>
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              'Saving...'
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditMode ? 'Update Booking' : 'Create Booking'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
