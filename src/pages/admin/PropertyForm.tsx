import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Building2, MapPin, Phone, Mail, Settings, Image as ImageIcon, Save } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { AMENITIES, getAmenitiesByCategory } from '@/data/amenities';
import { MOCK_PROPERTIES } from '@/data/mockProperties';
import type { PropertyFormData, PropertyType, PropertyStatus } from '@/types/property';
import { createProperty, updateProperty, getProperty } from '@/api/properties';
import { useAuthStore } from '@/auth/store';

const propertyFormSchema = z.object({
  name: z.string().min(3, 'Property name must be at least 3 characters'),
  type: z.enum(['hotel', 'apartment', 'villa', 'hostel', 'resort']),
  status: z.enum(['active', 'inactive', 'maintenance', 'draft']),
  description: z.string().min(20, 'Description must be at least 20 characters'),

  // Location
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().min(2, 'Country is required'),
  zipCode: z.string().min(3, 'Zip code is required'),

  // Contact
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Valid email is required'),
  website: z.string().url('Valid URL is required').optional().or(z.literal('')),

  // Details
  totalRooms: z.coerce.number().min(1, 'At least 1 room is required'),
  checkInTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Valid time required (HH:MM)'),
  checkOutTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Valid time required (HH:MM)'),
  cancellationPolicy: z.string().min(10, 'Cancellation policy is required'),

  // Settings
  autoConfirmBookings: z.boolean().default(false),
  allowInstantBooking: z.boolean().default(false),
  requireDeposit: z.boolean().default(false),
  depositAmount: z.coerce.number().min(0).optional(),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

export const PropertyForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [existingProperty, setExistingProperty] = useState<any>(null);

  const isEditMode = id !== 'new' && id !== undefined;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: existingProperty ? {
      name: existingProperty.name,
      type: existingProperty.type,
      status: existingProperty.status,
      description: existingProperty.description,
      address: existingProperty.address,
      city: existingProperty.city,
      state: existingProperty.state,
      country: existingProperty.country,
      zipCode: existingProperty.zipCode,
      phone: existingProperty.phone,
      email: existingProperty.email,
      website: existingProperty.website || '',
      totalRooms: existingProperty.totalRooms,
      checkInTime: existingProperty.checkInTime,
      checkOutTime: existingProperty.checkOutTime,
      cancellationPolicy: existingProperty.cancellationPolicy,
      autoConfirmBookings: existingProperty.autoConfirmBookings,
      allowInstantBooking: existingProperty.allowInstantBooking,
      requireDeposit: existingProperty.requireDeposit,
      depositAmount: existingProperty.depositAmount,
    } : {
      type: 'hotel',
      status: 'draft',
      autoConfirmBookings: false,
      allowInstantBooking: false,
      requireDeposit: false,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      country: 'USA',
    }
  });

  React.useEffect(() => {
    if (existingProperty) {
      setSelectedAmenities(existingProperty.amenities || []);
    }
  }, [existingProperty]);

  // Load existing property data
  React.useEffect(() => {
    if (isEditMode && id) {
      setLoading(true);
      getProperty(id)
        .then((property) => {
          setExistingProperty(property);
          // Set form values
          setValue('name', property.name);
          setValue('type', property.type || property.propertyType as PropertyType);
          setValue('status', property.status as PropertyStatus);
          setValue('description', property.description || '');
          setValue('address', property.address?.street || '');
          setValue('city', property.address?.city || '');
          setValue('state', property.address?.state || '');
          setValue('country', property.address?.country || '');
          setValue('zipCode', property.address?.postalCode || '');
          setValue('phone', property.contact?.phone || '');
          setValue('email', property.contact?.email || '');
          setValue('website', property.contact?.website || '');
          setValue('totalRooms', property.rooms?.length || 1);
          setValue('checkInTime', property.policies?.checkInTime || '15:00');
          setValue('checkOutTime', property.policies?.checkOutTime || '11:00');
          setValue('cancellationPolicy', property.policies?.cancellationPolicy || '');
          setValue('autoConfirmBookings', property.settings?.autoConfirmBookings || false);
          setValue('allowInstantBooking', property.settings?.allowInstantBooking || false);
          setValue('requireDeposit', property.settings?.requireDeposit || false);
          setValue('depositAmount', property.settings?.depositAmount || 0);
          setSelectedAmenities(property.amenities || []);
        })
        .catch((error) => {
          console.error('Failed to load property:', error);
          toast({
            title: 'Error',
            description: 'Failed to load property. Please try again.',
            variant: 'destructive',
          });
          navigate('/admin/properties');
        })
        .finally(() => setLoading(false));
    }
  }, [isEditMode, id, navigate, toast, setValue]);

  const selectedType = watch('type');
  const selectedStatus = watch('status');
  const requireDeposit = watch('requireDeposit');

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const onSubmit = async (data: PropertyFormValues) => {
    try {
      // Ensure user is authenticated
      if (!user?.id) {
        toast({
          title: 'Error',
          description: 'You must be logged in to create a property.',
          variant: 'destructive',
        });
        return;
      }

      // Transform form data to match API schema
      const propertyData = {
        name: data.name,
        propertyType: data.type,
        status: data.status === 'draft' ? 'active' : data.status,
        description: data.description,
        address: {
          street: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          postalCode: data.zipCode,
          coordinates: {
            latitude: 0, // You can add a geocoding service later
            longitude: 0,
          },
        },
        contactInfo: {
          phone: data.phone.startsWith('+') || /^[1-9]/.test(data.phone) ? data.phone : `+${data.phone}`,
          email: data.email,
          website: data.website || undefined,
        },
        amenities: selectedAmenities,
        photos: [],
        policies: {
          checkInTime: data.checkInTime,
          checkOutTime: data.checkOutTime,
          cancellationPolicy: data.cancellationPolicy,
          houseRules: [],
        },
        settings: {
          currency: 'USD',
          timezone: 'UTC',
          language: 'en',
          autoConfirmBookings: data.autoConfirmBookings,
          requireGuestVerification: true,
        },
        // Set owner and manager to current user
        owner: user.id,
        manager: user.id,
        // Add a default room if creating new property
        rooms: isEditMode ? existingProperty?.rooms : [
          {
            name: 'Standard Room',
            type: 'single',
            capacity: {
              adults: 2,
              children: 1,
              infants: 0,
            },
            baseRate: 100,
            currency: 'USD',
            isActive: true,
            amenities: [],
            photos: [],
          },
        ],
      };

      if (isEditMode && id) {
        await updateProperty(id, propertyData);
        toast({
          title: 'Success',
          description: `${data.name} has been updated successfully.`,
        });
      } else {
        await createProperty(propertyData);
        toast({
          title: 'Success',
          description: `${data.name} has been created successfully.`,
        });
      }

      navigate('/admin/properties');
    } catch (error: any) {
      console.error('Failed to save property:', error);
      console.error('Error details:', error.response?.data);
      
      // Extract validation errors if available
      let errorMessage = error.response?.data?.message || 'There was an error saving the property. Please try again.';
      
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const validationErrors = error.response.data.errors
          .map((err: any) => `${err.field}: ${err.message}`)
          .join(', ');
        errorMessage = `Validation errors: ${validationErrors}`;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/properties')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Properties
        </Button>
        <h1 className="text-3xl font-bold mb-2">
          {isEditMode ? 'Edit Property' : 'Add New Property'}
        </h1>
        <p className="text-muted-foreground">
          {isEditMode ? 'Update property information and settings' : 'Create a new property listing'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">
              <Building2 className="h-4 w-4 mr-2" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="location">
              <MapPin className="h-4 w-4 mr-2" />
              Location
            </TabsTrigger>
            <TabsTrigger value="amenities">
              <Settings className="h-4 w-4 mr-2" />
              Amenities
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Essential details about your property
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Property Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Property Name *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Sunset Beach Resort"
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Property Type */}
                  <div className="space-y-2">
                    <Label htmlFor="type">Property Type *</Label>
                    <Select
                      value={selectedType}
                      onValueChange={(value) => setValue('type', value as PropertyType)}
                    >
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hotel">Hotel</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="hostel">Hostel</SelectItem>
                        <SelectItem value="resort">Resort</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && (
                      <p className="text-sm text-destructive">{errors.type.message}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={selectedStatus}
                      onValueChange={(value) => setValue('status', value as PropertyStatus)}
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && (
                      <p className="text-sm text-destructive">{errors.status.message}</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Describe your property..."
                    rows={4}
                    className={errors.description ? 'border-destructive' : ''}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>

                <Separator />

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Contact Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        placeholder="info@property.com"
                        className={errors.email ? 'border-destructive' : ''}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        {...register('phone')}
                        placeholder="+1 234 567 8900"
                        className={errors.phone ? 'border-destructive' : ''}
                      />
                      {errors.phone && (
                        <p className="text-sm text-destructive">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website (Optional)</Label>
                    <Input
                      id="website"
                      type="url"
                      {...register('website')}
                      placeholder="https://property.com"
                      className={errors.website ? 'border-destructive' : ''}
                    />
                    {errors.website && (
                      <p className="text-sm text-destructive">{errors.website.message}</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Room & Time Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Property Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="totalRooms">Total Rooms *</Label>
                      <Input
                        id="totalRooms"
                        type="number"
                        {...register('totalRooms')}
                        placeholder="50"
                        className={errors.totalRooms ? 'border-destructive' : ''}
                      />
                      {errors.totalRooms && (
                        <p className="text-sm text-destructive">{errors.totalRooms.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="checkInTime">Check-in Time *</Label>
                      <Input
                        id="checkInTime"
                        type="time"
                        {...register('checkInTime')}
                        className={errors.checkInTime ? 'border-destructive' : ''}
                      />
                      {errors.checkInTime && (
                        <p className="text-sm text-destructive">{errors.checkInTime.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="checkOutTime">Check-out Time *</Label>
                      <Input
                        id="checkOutTime"
                        type="time"
                        {...register('checkOutTime')}
                        className={errors.checkOutTime ? 'border-destructive' : ''}
                      />
                      {errors.checkOutTime && (
                        <p className="text-sm text-destructive">{errors.checkOutTime.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cancellationPolicy">Cancellation Policy *</Label>
                    <Textarea
                      id="cancellationPolicy"
                      {...register('cancellationPolicy')}
                      placeholder="Free cancellation up to 24 hours before check-in..."
                      rows={3}
                      className={errors.cancellationPolicy ? 'border-destructive' : ''}
                    />
                    {errors.cancellationPolicy && (
                      <p className="text-sm text-destructive">{errors.cancellationPolicy.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location Tab */}
          <TabsContent value="location" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Location Details</CardTitle>
                <CardDescription>
                  Where is your property located?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    {...register('address')}
                    placeholder="123 Main Street"
                    className={errors.address ? 'border-destructive' : ''}
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      {...register('city')}
                      placeholder="Miami"
                      className={errors.city ? 'border-destructive' : ''}
                    />
                    {errors.city && (
                      <p className="text-sm text-destructive">{errors.city.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province *</Label>
                    <Input
                      id="state"
                      {...register('state')}
                      placeholder="Florida"
                      className={errors.state ? 'border-destructive' : ''}
                    />
                    {errors.state && (
                      <p className="text-sm text-destructive">{errors.state.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      {...register('country')}
                      placeholder="USA"
                      className={errors.country ? 'border-destructive' : ''}
                    />
                    {errors.country && (
                      <p className="text-sm text-destructive">{errors.country.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip/Postal Code *</Label>
                    <Input
                      id="zipCode"
                      {...register('zipCode')}
                      placeholder="33139"
                      className={errors.zipCode ? 'border-destructive' : ''}
                    />
                    {errors.zipCode && (
                      <p className="text-sm text-destructive">{errors.zipCode.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Amenities Tab */}
          <TabsContent value="amenities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Amenities</CardTitle>
                <CardDescription>
                  Select all amenities available at your property
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Amenities */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Basic Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {getAmenitiesByCategory('basic').map((amenity) => (
                      <div key={amenity.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity.id}
                          checked={selectedAmenities.includes(amenity.id)}
                          onCheckedChange={() => toggleAmenity(amenity.id)}
                        />
                        <Label
                          htmlFor={amenity.id}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {amenity.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Comfort Amenities */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Comfort & Leisure</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {getAmenitiesByCategory('comfort').map((amenity) => (
                      <div key={amenity.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity.id}
                          checked={selectedAmenities.includes(amenity.id)}
                          onCheckedChange={() => toggleAmenity(amenity.id)}
                        />
                        <Label
                          htmlFor={amenity.id}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {amenity.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Entertainment Amenities */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Entertainment</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {getAmenitiesByCategory('entertainment').map((amenity) => (
                      <div key={amenity.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity.id}
                          checked={selectedAmenities.includes(amenity.id)}
                          onCheckedChange={() => toggleAmenity(amenity.id)}
                        />
                        <Label
                          htmlFor={amenity.id}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {amenity.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Safety Amenities */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Safety & Security</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {getAmenitiesByCategory('safety').map((amenity) => (
                      <div key={amenity.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity.id}
                          checked={selectedAmenities.includes(amenity.id)}
                          onCheckedChange={() => toggleAmenity(amenity.id)}
                        />
                        <Label
                          htmlFor={amenity.id}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {amenity.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Accessibility Amenities */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Accessibility</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {getAmenitiesByCategory('accessibility').map((amenity) => (
                      <div key={amenity.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity.id}
                          checked={selectedAmenities.includes(amenity.id)}
                          onCheckedChange={() => toggleAmenity(amenity.id)}
                        />
                        <Label
                          htmlFor={amenity.id}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {amenity.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Settings</CardTitle>
                <CardDescription>
                  Configure how bookings are handled for this property
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoConfirmBookings">Auto-confirm Bookings</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically confirm new bookings without manual review
                      </p>
                    </div>
                    <Checkbox
                      id="autoConfirmBookings"
                      {...register('autoConfirmBookings')}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="allowInstantBooking">Allow Instant Booking</Label>
                      <p className="text-sm text-muted-foreground">
                        Let guests book immediately without waiting for approval
                      </p>
                    </div>
                    <Checkbox
                      id="allowInstantBooking"
                      {...register('allowInstantBooking')}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="requireDeposit">Require Deposit</Label>
                        <p className="text-sm text-muted-foreground">
                          Require a deposit when booking
                        </p>
                      </div>
                      <Checkbox
                        id="requireDeposit"
                        {...register('requireDeposit')}
                      />
                    </div>

                    {requireDeposit && (
                      <div className="space-y-2 ml-0 md:ml-8">
                        <Label htmlFor="depositAmount">Deposit Amount ($)</Label>
                        <Input
                          id="depositAmount"
                          type="number"
                          {...register('depositAmount')}
                          placeholder="100"
                          className={errors.depositAmount ? 'border-destructive' : ''}
                        />
                        {errors.depositAmount && (
                          <p className="text-sm text-destructive">{errors.depositAmount.message}</p>
                        )}
                      </div>
                    )}
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
            onClick={() => navigate('/admin/properties')}
          >
            Cancel
          </Button>
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              'Saving...'
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditMode ? 'Update Property' : 'Create Property'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;
