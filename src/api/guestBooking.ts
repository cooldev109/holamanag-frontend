import axios from 'axios';

// Create a public axios instance without authentication for guest booking
const publicClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface CheckAvailabilityRequest {
  propertyId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
}

export interface CheckAvailabilityResponse {
  success: boolean;
  available: boolean;
  totalRooms: number;
  availableRooms: number;
  pricePerNight: number;
  totalPrice: number;
  nights: number;
  dates: Array<{
    date: string;
    available: number;
    totalRooms: number;
  }>;
  room: {
    id: string;
    name: string;
    type: string;
    description?: string;
  };
}

export interface CreateBookingRequest {
  propertyId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  guests: number;
  specialRequests?: string;
  channel: string;
}

export interface CreateBookingResponse {
  success: boolean;
  booking: {
    id: string;
    confirmationCode: string;
    checkIn: string;
    checkOut: string;
    guestName: string;
    guestEmail: string;
    totalAmount: number;
    currency: string;
    status: string;
    property: {
      id: string;
      name: string;
    };
    room: {
      id: string;
      name: string;
      type: string;
    };
  };
  message: string;
}

export interface PropertyInfo {
  id: string;
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
}

export interface RoomInfo {
  id: string;
  name: string;
  type: string;
  description?: string;
}

export interface GetBookingResponse {
  success: boolean;
  booking: {
    id: string;
    confirmationCode: string;
    checkIn: string;
    checkOut: string;
    guestName: string;
    guestEmail: string;
    guests: number;
    totalAmount: number;
    currency: string;
    status: string;
    property: PropertyInfo;
    room: RoomInfo;
    specialRequests: string[];
  };
}

export interface GetPropertiesResponse {
  success: boolean;
  properties: PropertyInfo[];
}

export interface GetPropertyByIdResponse {
  success: boolean;
  property: PropertyInfo & {
    description?: string;
    amenities?: string[];
    images?: string[];
    rooms?: RoomInfo[];
  };
}

export const guestBookingAPI = {
  /**
   * Get all active properties (public access)
   */
  getProperties: async (): Promise<GetPropertiesResponse> => {
    const response = await publicClient.get('/guest/properties');
    return response.data;
  },

  /**
   * Get property by ID (public access)
   */
  getPropertyById: async (propertyId: string): Promise<GetPropertyByIdResponse> => {
    const response = await publicClient.get(`/guest/properties/${propertyId}`);
    return response.data;
  },

  /**
   * Check availability for a property and room
   */
  checkAvailability: async (data: CheckAvailabilityRequest): Promise<CheckAvailabilityResponse> => {
    const response = await publicClient.post('/guest/check-availability', data);
    return response.data;
  },

  /**
   * Create a guest booking
   */
  createBooking: async (data: CreateBookingRequest): Promise<CreateBookingResponse> => {
    const response = await publicClient.post('/guest/bookings', data);
    return response.data;
  },

  /**
   * Get booking by confirmation code
   */
  getBooking: async (confirmationCode: string): Promise<GetBookingResponse> => {
    const response = await publicClient.get(`/guest/bookings/${confirmationCode}`);
    return response.data;
  }
};

export default guestBookingAPI;

