import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Bed,
  Users,
  DollarSign,
  Plus,
  Image as ImageIcon,
  Settings,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { MOCK_PROPERTIES } from '@/data/mockProperties';
import { getAmenityById } from '@/data/amenities';
import type { Property, Room, RoomStatus } from '@/types/property';

const RoomStatusBadge: React.FC<{ status: RoomStatus }> = ({ status }) => {
  const variants: Record<RoomStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    available: { variant: 'default', label: 'Available' },
    occupied: { variant: 'secondary', label: 'Occupied' },
    maintenance: { variant: 'outline', label: 'Maintenance' },
    reserved: { variant: 'outline', label: 'Reserved' },
  };

  const config = variants[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const property = MOCK_PROPERTIES.find(p => p.id === id);

  // Mock room data for the property
  const [rooms] = useState<Room[]>([
    {
      id: 'room-1',
      propertyId: id || '',
      name: 'Deluxe Ocean View Suite',
      roomNumber: '101',
      type: 'Suite',
      capacity: 4,
      beds: 2,
      bathrooms: 2,
      size: 45,
      pricePerNight: 250,
      status: 'available',
      amenities: ['wifi', 'tv', 'ac', 'balcony'],
      images: [],
      floor: 1,
    },
    {
      id: 'room-2',
      propertyId: id || '',
      name: 'Standard Double Room',
      roomNumber: '102',
      type: 'Double',
      capacity: 2,
      beds: 1,
      bathrooms: 1,
      size: 25,
      pricePerNight: 150,
      status: 'occupied',
      amenities: ['wifi', 'tv', 'ac'],
      images: [],
      floor: 1,
    },
    {
      id: 'room-3',
      propertyId: id || '',
      name: 'Family Suite',
      roomNumber: '201',
      type: 'Family',
      capacity: 6,
      beds: 3,
      bathrooms: 2,
      size: 60,
      pricePerNight: 350,
      status: 'available',
      amenities: ['wifi', 'tv', 'ac', 'kitchen', 'balcony'],
      images: [],
      floor: 2,
    },
    {
      id: 'room-4',
      propertyId: id || '',
      name: 'Single Room',
      roomNumber: '103',
      type: 'Single',
      capacity: 1,
      beds: 1,
      bathrooms: 1,
      size: 18,
      pricePerNight: 100,
      status: 'maintenance',
      amenities: ['wifi', 'tv', 'ac'],
      images: [],
      floor: 1,
    },
  ]);

  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Property Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The property you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link to="/admin/properties">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Properties
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDeleteProperty = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      toast({
        title: 'Property deleted',
        description: `${property.name} has been permanently deleted.`,
      });
      navigate('/admin/properties');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete property. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const roomStats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'available').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
    avgPrice: rooms.reduce((sum, r) => sum + r.pricePerNight, 0) / rooms.length,
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
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

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{property.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {property.city}, {property.state}
              </div>
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                {property.totalRooms} rooms
              </div>
              <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
                {property.status}
              </Badge>
              <Badge variant="outline">{property.type}</Badge>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to={`/admin/properties/${property.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Property</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete "{property.name}"? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteProperty}>
                    Delete Property
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rooms">Rooms ({rooms.length})</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Property Information */}
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Property Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                    <p className="text-sm">{property.description}</p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Check-in</h3>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{property.checkInTime}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Check-out</h3>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{property.checkOutTime}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Cancellation Policy</h3>
                    <p className="text-sm">{property.cancellationPolicy}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities.map((amenityId) => {
                      const amenity = getAmenityById(amenityId);
                      return amenity ? (
                        <div key={amenityId} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          {amenity.name}
                        </div>
                      ) : null;
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${property.email}`} className="hover:underline">
                      {property.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${property.phone}`} className="hover:underline">
                      {property.phone}
                    </a>
                  </div>
                  {property.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={property.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>{property.address}</p>
                  <p>
                    {property.city}, {property.state} {property.zipCode}
                  </p>
                  <p>{property.country}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Booking Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Auto-confirm</span>
                    {property.autoConfirmBookings ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Instant Booking</span>
                    {property.allowInstantBooking ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Deposit Required</span>
                    {property.requireDeposit ? (
                      <span className="font-medium">${property.depositAmount}</span>
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Rooms Tab */}
        <TabsContent value="rooms" className="space-y-6">
          {/* Room Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Rooms</CardDescription>
                <CardTitle className="text-2xl">{roomStats.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Available</CardDescription>
                <CardTitle className="text-2xl text-green-600">{roomStats.available}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Occupied</CardDescription>
                <CardTitle className="text-2xl text-blue-600">{roomStats.occupied}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Maintenance</CardDescription>
                <CardTitle className="text-2xl text-orange-600">{roomStats.maintenance}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Avg. Price</CardDescription>
                <CardTitle className="text-2xl">${roomStats.avgPrice.toFixed(0)}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Room List */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Rooms</CardTitle>
                  <CardDescription>Manage rooms for this property</CardDescription>
                </div>
                <Dialog open={isRoomDialogOpen} onOpenChange={setIsRoomDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Room
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Room</DialogTitle>
                      <DialogDescription>
                        Create a new room for {property.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="roomName">Room Name</Label>
                        <Input id="roomName" placeholder="Deluxe Suite" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="roomNumber">Room Number</Label>
                        <Input id="roomNumber" placeholder="101" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="roomType">Room Type</Label>
                        <Select>
                          <SelectTrigger id="roomType">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Single</SelectItem>
                            <SelectItem value="double">Double</SelectItem>
                            <SelectItem value="suite">Suite</SelectItem>
                            <SelectItem value="family">Family</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="capacity">Capacity</Label>
                        <Input id="capacity" type="number" placeholder="2" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="beds">Beds</Label>
                        <Input id="beds" type="number" placeholder="1" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bathrooms">Bathrooms</Label>
                        <Input id="bathrooms" type="number" placeholder="1" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="size">Size (m²)</Label>
                        <Input id="size" type="number" placeholder="25" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Price per Night ($)</Label>
                        <Input id="price" type="number" placeholder="150" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsRoomDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => {
                        toast({ title: 'Room created', description: 'New room has been added successfully.' });
                        setIsRoomDialogOpen(false);
                      }}>
                        Create Room
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Capacity</TableHead>
                    <TableHead className="text-right">Size</TableHead>
                    <TableHead className="text-right">Price/Night</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{room.name}</p>
                          <p className="text-sm text-muted-foreground">Room {room.roomNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell>{room.type}</TableCell>
                      <TableCell>
                        <RoomStatusBadge status={room.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          {room.capacity}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{room.size}m²</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          {room.pricePerNight}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Property Images</CardTitle>
                  <CardDescription>Manage images for this property</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Images
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {property.images.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">No images yet</p>
                  <p className="text-muted-foreground mb-4">
                    Upload images to showcase your property
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Images
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {property.images.map((image) => (
                    <div key={image.id} className="relative group">
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                      {image.isPrimary && (
                        <Badge className="absolute top-2 left-2">Primary</Badge>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <Button variant="secondary" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {image.caption && (
                        <p className="text-sm text-muted-foreground mt-2">{image.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Property Settings</CardTitle>
              <CardDescription>Configure property-specific settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Settings panel content goes here. Edit property settings, manage integrations, etc.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertyDetail;
