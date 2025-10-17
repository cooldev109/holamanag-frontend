export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'checked-in'
  | 'checked-out'
  | 'cancelled'
  | 'no-show';

export type PaymentStatus =
  | 'unpaid'
  | 'partial'
  | 'paid'
  | 'refunded';

export type GuestType = 'individual' | 'corporate' | 'group';

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type: GuestType;
  company?: string;
  address?: string;
  city?: string;
  country?: string;
  identityDocument?: string;
  notes?: string;
  createdAt: string;
  totalBookings: number;
  totalSpent: number;
}

export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  senderName: string;
  senderType: 'guest' | 'staff' | 'system';
  message: string;
  timestamp: string;
  read: boolean;
  attachments?: string[];
}

export interface Booking {
  id: string;

  // Guest Information
  guest: Guest;
  guestId: string;

  // Property & Room
  propertyId: string;
  propertyName: string;
  roomId: string;
  roomName: string;
  roomNumber: string;

  // Dates
  checkInDate: string; // ISO date string
  checkOutDate: string; // ISO date string
  checkInTime: string; // HH:MM
  checkOutTime: string; // HH:MM
  nights: number;

  // Guests
  adults: number;
  children: number;

  // Status
  status: BookingStatus;
  paymentStatus: PaymentStatus;

  // Pricing
  roomRate: number; // per night
  subtotal: number;
  taxes: number;
  fees: number;
  discount: number;
  total: number;
  amountPaid: number;
  amountDue: number;

  // Special Requests
  specialRequests?: string;
  notes?: string;

  // Communication
  messages: Message[];
  unreadMessages: number;

  // Metadata
  source: 'website' | 'phone' | 'email' | 'walk-in' | 'booking-engine' | 'ota';
  confirmationCode: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;

  // Cancellation
  cancellationDate?: string;
  cancellationReason?: string;
  cancellationFee?: number;
}

export interface BookingFormData {
  // Guest Selection/Creation
  guestId?: string;
  newGuest?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    type: GuestType;
    company?: string;
  };

  // Property & Room
  propertyId: string;
  roomId: string;

  // Dates
  checkInDate: string;
  checkOutDate: string;
  checkInTime: string;
  checkOutTime: string;

  // Guests
  adults: number;
  children: number;

  // Pricing
  roomRate: number;
  discount?: number;

  // Additional
  specialRequests?: string;
  notes?: string;
  source: Booking['source'];
}

export interface BookingFilters {
  search?: string; // guest name, confirmation code, room
  status?: BookingStatus[];
  paymentStatus?: PaymentStatus[];
  propertyId?: string;
  roomId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  source?: Booking['source'][];
  minAmount?: number;
  maxAmount?: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Booking;
  allDay?: boolean;
}

export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  checkedIn: number;
  checkedOut: number;
  cancelled: number;
  noShow: number;
  revenue: number;
  averageRate: number;
  occupancyRate: number;
}
