export type PropertyStatus = 'active' | 'inactive' | 'maintenance' | 'draft' | 'suspended';
export type PropertyType = 'hotel' | 'apartment' | 'villa' | 'hostel' | 'resort' | 'house' | 'bed_and_breakfast' | 'guesthouse';
export type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'reserved';

export interface Amenity {
  id: string;
  name: string;
  icon?: string;
  category: 'basic' | 'comfort' | 'entertainment' | 'safety' | 'accessibility';
}

export interface Room {
  id: string;
  propertyId: string;
  name: string;
  roomNumber: string;
  type: string;
  capacity: number;
  beds: number;
  bathrooms: number;
  size: number; // in square meters
  pricePerNight: number;
  status: RoomStatus;
  amenities: string[]; // amenity IDs
  images: string[];
  description?: string;
  floor?: number;
}

export interface PropertyImage {
  id: string;
  url: string;
  caption?: string;
  isPrimary: boolean;
  order: number;
}

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  status: PropertyStatus;
  description: string;

  // Location
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;

  // Contact
  phone: string;
  email: string;
  website?: string;

  // Details
  totalRooms: number;
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: string;

  // Amenities
  amenities: string[]; // amenity IDs

  // Images
  images: PropertyImage[];

  // Settings
  autoConfirmBookings: boolean;
  allowInstantBooking: boolean;
  requireDeposit: boolean;
  depositAmount?: number;

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface PropertyFilters {
  search?: string;
  type?: PropertyType[];
  status?: PropertyStatus[];
  city?: string;
  minRooms?: number;
  maxRooms?: number;
  amenities?: string[];
}

export interface PropertyFormData {
  name: string;
  type: PropertyType;
  status: PropertyStatus;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
  email: string;
  website?: string;
  totalRooms: number;
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: string;
  amenities: string[];
  autoConfirmBookings: boolean;
  allowInstantBooking: boolean;
  requireDeposit: boolean;
  depositAmount?: number;
}
