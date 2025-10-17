// API client with mock responses when VITE_API_URL is not set
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
const USE_MOCKS = !import.meta.env.VITE_API_URL;

// Type interfaces for API parameters and payloads
interface PaginationParams {
  page?: number;
  size?: number;
}

interface InventoryParams {
  propertyId: string;
  from: string;
  to: string;
}

interface BulkInventoryUpdate {
  roomId: string;
  date: string;
  updates: {
    allotment?: number;
    rate?: number;
    minStay?: number;
    maxStay?: number;
    stopSell?: boolean;
  };
}

interface BulkInventoryPayload {
  updates: BulkInventoryUpdate[];
}

interface MockReservation {
  id: string;
  property: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  status: string;
  channel: string;
  amounts?: {
    currency: string;
    subtotal: number;
    taxes: number;
    total: number;
  };
  notes?: string;
}

// Create axios instance for authenticated requests
export const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
client.interceptors.request.use(
  (config) => {
    // First try to get token from localStorage (for backward compatibility)
    let token = localStorage.getItem('token');

    // If not found, try to get from zustand store
    if (!token) {
      try {
        const authStore = localStorage.getItem('reservaro-auth');
        if (authStore) {
          const parsed = JSON.parse(authStore);
          token = parsed.state?.accessToken;
        }
      } catch (e) {
        console.error('Error reading auth store:', e);
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Mock data generators
const generateMockKpis = () => ({
  occupancyPct: 78.5,
  revenue: 145_230,
  newBookings: 24,
});

const generateMockReservations = (params: any = {}) => {
  const page = parseInt(params.page || '1');
  const size = parseInt(params.limit || params.size || '10');
  const statusFilter = params.status;
  const total = 156;

  // Generate bookings for this page
  let bookings = Array.from({ length: Math.min(size, total) }, (_, i) => {
    const statuses = ['confirmed', 'checked-in', 'checked-out', 'cancelled'];
    const status = statusFilter || statuses[Math.floor(Math.random() * 4)];

    return {
      _id: `res_${page}_${i + 1}`,
      guestInfo: {
        firstName: `Guest`,
        lastName: `${(page - 1) * size + i + 1}`,
        email: `guest${(page - 1) * size + i + 1}@example.com`,
        phone: `+1 555 ${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`
      },
      property: {
        _id: `prop_${Math.floor(Math.random() * 10) + 1}`,
        name: `Property ${Math.floor(Math.random() * 10) + 1}`
      },
      checkIn: new Date(2025, 0, Math.floor(Math.random() * 28) + 1).toISOString(),
      checkOut: new Date(2025, 0, Math.floor(Math.random() * 28) + 15).toISOString(),
      status,
      channel: ['Airbnb', 'Booking.com', 'Vrbo', 'Direct'][Math.floor(Math.random() * 4)],
      pricing: {
        total: Math.floor(Math.random() * 2000) + 300,
        currency: 'USD'
      },
      guests: {
        adults: Math.floor(Math.random() * 4) + 1,
        children: Math.floor(Math.random() * 3)
      },
      createdAt: new Date(2024, 11, Math.floor(Math.random() * 30) + 1).toISOString(),
      specialRequests: Math.random() > 0.5 ? ['Early check-in requested'] : []
    };
  });

  return {
    success: true,
    data: {
      bookings,
      pagination: {
        page,
        size,
        total,
        totalPages: Math.ceil(total / size)
      }
    }
  };
};

const generateMockReservation = (id: string) => ({
  success: true,
  data: {
    booking: {
      _id: id,
      guestInfo: {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        phone: '+1 555 0123'
      },
      property: {
        _id: 'prop_123',
        name: 'Sunset Villa'
      },
      checkIn: '2025-01-15T16:00:00Z',
      checkOut: '2025-01-22T11:00:00Z',
      status: 'confirmed',
      channel: 'Airbnb',
      pricing: {
        total: 1250,
        currency: 'USD'
      },
      guests: {
        adults: 3,
        children: 1
      },
      createdAt: '2024-12-20T10:30:00Z',
      specialRequests: ['Anniversary celebration', 'Late checkout if possible']
    }
  }
});

const generateMockRooms = (propertyId: string) => [
  { id: 'room_1', code: 'STD-001', name: 'Standard Room 1', propertyId },
  { id: 'room_2', code: 'STD-002', name: 'Standard Room 2', propertyId },
  { id: 'room_3', code: 'DLX-001', name: 'Deluxe Suite 1', propertyId },
];

const generateMockInventory = (params: InventoryParams) => {
  const { propertyId, from, to } = params;
  const startDate = new Date(from);
  const endDate = new Date(to);
  const days = [];
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d).toISOString().split('T')[0]);
  }

  const rooms = generateMockRooms(propertyId);
  
  return rooms.map(room => ({
    roomId: room.id,
    roomCode: room.code,
    availability: days.map(date => ({
      date,
      allotment: Math.floor(Math.random() * 5) + 1,
      booked: Math.floor(Math.random() * 3),
      minStay: Math.floor(Math.random() * 3) + 1,
      maxStay: Math.floor(Math.random() * 7) + 7,
      stopSell: Math.random() > 0.8,
      rate: Math.floor(Math.random() * 200) + 100,
    })),
  }));
};

// Mock delay utility
const mockDelay = (min = 300, max = 800) =>
  new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min));

// API functions
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (USE_MOCKS) {
    await mockDelay();
    
    // Handle different endpoints with mocks
    if (endpoint.includes('/kpis')) {
      return generateMockKpis() as T;
    }
    
    if ((endpoint.includes('/reservations') || endpoint.includes('/bookings')) && !endpoint.includes('/reservations/') && !endpoint.includes('/bookings/')) {
      const url = new URL(endpoint, 'http://localhost');
      const params = Object.fromEntries(url.searchParams.entries());
      return generateMockReservations(params) as T;
    }

    if (endpoint.includes('/reservations/') || endpoint.includes('/bookings/')) {
      const id = endpoint.split('/').pop()!;
      return generateMockReservation(id) as T;
    }
    
    if (endpoint.includes('/rooms')) {
      const propertyId = new URL(endpoint, 'http://localhost').searchParams.get('propertyId') || 'prop_1';
      return generateMockRooms(propertyId) as T;
    }
    
    if (endpoint.includes('/inventory')) {
      const url = new URL(endpoint, 'http://localhost');
      const params = Object.fromEntries(url.searchParams.entries());
      return generateMockInventory(params) as T;
    }
    
    if (endpoint.includes('/inventory/bulk') && options.method === 'PATCH') {
      return { success: true, updated: Math.floor(Math.random() * 20) + 5 } as T;
    }
    
    if (endpoint.includes('/lead') && options.method === 'POST') {
      // 10% chance to simulate error
      if (Math.random() < 0.1) {
        throw new Error('Network error - please try again');
      }
      return { success: true, message: 'Thank you! We will get in touch shortly.' } as T;
    }
    
    if (endpoint.includes('/client/overview')) {
      return {
        nextStay: { 
          id: "R-8421", 
          property: "Ocean View Suite", 
          checkIn: "2025-11-12", 
          checkOut: "2025-11-15", 
          nights: 3, 
          status: "confirmed", 
          currency: "EUR", 
          total: 528.5 
        },
        lastReservation: { 
          id: "R-8102", 
          property: "City Loft", 
          total: 312.0, 
          currency: "EUR" 
        },
        notices: ["Your check-in details will arrive 48h before arrival."]
      } as T;
    }
    
    throw new Error(`Mock not implemented for: ${endpoint}`);
  }
  
  // Real API request
  // Get token from localStorage or zustand store
  let token = localStorage.getItem('token');
  if (!token) {
    try {
      const authStore = localStorage.getItem('reservaro-auth');
      if (authStore) {
        const parsed = JSON.parse(authStore);
        token = parsed.state?.accessToken;
      }
    } catch (e) {
      console.error('Error reading auth store:', e);
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}

// Specific API methods
export const getKpis = () => apiRequest('/dashboard/kpis');

export const listReservations = (params: {
  q?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}) => {
  const query = new URLSearchParams();
  // Map frontend params to backend params
  if (params.q) query.set('guestEmail', params.q);
  if (params.status) query.set('status', params.status);
  if (params.from) query.set('checkIn', params.from);
  if (params.to) query.set('checkOut', params.to);
  if (params.page) query.set('page', String(params.page));
  if (params.size) query.set('limit', String(params.size));
  
  return apiRequest(`/bookings?${query}`);
};

export const getReservation = (id: string) => 
  apiRequest(`/bookings/${id}`);

export const listRooms = (propertyId: string) => 
  apiRequest(`/rooms?propertyId=${propertyId}`);

export const getInventory = (params: {
  propertyId: string;
  from: string;
  to: string;
  channel?: string;
}) => {
  // Filter out undefined values
  const filteredParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, string>);
  
  const query = new URLSearchParams(filteredParams);
  return apiRequest(`/inventory?${query}`);
};

export const patchInventoryBulk = (payload: BulkInventoryPayload) =>
  apiRequest('/inventory/bulk', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

export const submitLeadForm = (data: { email: string; company: string }) =>
  apiRequest('/lead', {
    method: 'POST',
    body: JSON.stringify(data),
  });

// Analytics API functions
export const analyticsApi = {
  getRevenueTrend: async (range = 'last_30_days', propertyId?: string) => {
    const params = new URLSearchParams({ range });
    if (propertyId) params.set('propertyId', propertyId);
    return client.get(`/analytics/trends/revenue?${params}`).then(res => res.data);
  },

  getOccupancyTrend: async (range = 'last_30_days', propertyId?: string) => {
    const params = new URLSearchParams({ range });
    if (propertyId) params.set('propertyId', propertyId);
    return client.get(`/analytics/trends/occupancy?${params}`).then(res => res.data);
  },

  getRevenueBreakdown: async (range = 'last_30_days', propertyId?: string) => {
    const params = new URLSearchParams({ range });
    if (propertyId) params.set('propertyId', propertyId);
    return client.get(`/analytics/revenue?${params}`).then(res => res.data);
  },

  getBookingStatistics: async (range = 'last_30_days', propertyId?: string) => {
    const params = new URLSearchParams({ range });
    if (propertyId) params.set('propertyId', propertyId);
    return client.get(`/analytics/bookings?${params}`).then(res => res.data);
  },

  getDashboardSummary: async (propertyId?: string) => {
    const params = new URLSearchParams();
    if (propertyId) params.set('propertyId', propertyId);
    return client.get(`/analytics/dashboard?${params}`).then(res => res.data);
  },
};

export const clientApi = {
  getOverview: async () => {
    if (!import.meta.env.VITE_API_URL) {
      await new Promise(r => setTimeout(r, 500));
      return {
        nextStay: {
          id: "R-8421",
          property: "Ocean View Suite",
          checkIn: "2025-11-12",
          checkOut: "2025-11-15",
          nights: 3,
          status: "confirmed",
          currency: "EUR",
          total: 528.5
        },
        lastReservation: {
          id: "R-8102",
          property: "City Loft",
          total: 312.0,
          currency: "EUR"
        },
        notices: ["Your check-in details will arrive 48h before arrival."]
      };
    }
    return apiRequest('/client/overview');
  },
  
  listReservations: async (q?: string, status?: string, from?: string, to?: string, page = 1, size = 10) => {
    if (!import.meta.env.VITE_API_URL) {
      await new Promise(r => setTimeout(r, 500));
      const allItems = [
        {
          id: "R-8421", 
          property: "Ocean View Suite", 
          checkIn: "2025-11-12", 
          checkOut: "2025-11-15",
          status: "confirmed", 
          channel: "Airbnb", 
          currency: "EUR", 
          total: 528.5, 
          guests: 2
        },
        {
          id: "R-8102", 
          property: "City Loft", 
          checkIn: "2025-10-03", 
          checkOut: "2025-10-05",
          status: "canceled", 
          channel: "Booking.com", 
          currency: "EUR", 
          total: 0, 
          guests: 1
        },
        {
          id: "R-8035", 
          property: "Mountain Cabin", 
          checkIn: "2025-09-15", 
          checkOut: "2025-09-20",
          status: "confirmed", 
          channel: "Vrbo", 
          currency: "USD", 
          total: 850, 
          guests: 4
        },
        {
          id: "R-7998", 
          property: "Beach House", 
          checkIn: "2025-08-01", 
          checkOut: "2025-08-07",
          status: "pending", 
          channel: "Direct", 
          currency: "EUR", 
          total: 1200, 
          guests: 6
        }
      ];
      
      let filteredItems = allItems;
      
      // Apply filters
      if (q) {
        filteredItems = filteredItems.filter(item => 
          item.property.toLowerCase().includes(q.toLowerCase()) ||
          item.id.toLowerCase().includes(q.toLowerCase())
        );
      }
      
      if (status) {
        filteredItems = filteredItems.filter(item => item.status === status);
      }
      
      if (from) {
        filteredItems = filteredItems.filter(item => item.checkIn >= from);
      }
      
      if (to) {
        filteredItems = filteredItems.filter(item => item.checkOut <= to);
      }
      
      // Pagination
      const startIndex = (page - 1) * size;
      const items = filteredItems.slice(startIndex, startIndex + size);
      
      return { 
        items, 
        page, 
        size, 
        total: filteredItems.length 
      };
    }
    
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (status) params.set('status', status);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    params.set('page', String(page));
    params.set('size', String(size));
    
    return apiRequest(`/client/reservations?${params}`);
  },
  
  getReservation: async (id: string) => {
    if (!import.meta.env.VITE_API_URL) {
      await new Promise(r => setTimeout(r, 400));
      
      // Mock different reservations based on ID
      const mockReservations: Record<string, MockReservation> = {
        "R-8421": {
          id: "R-8421",
          property: "Ocean View Suite",
          checkIn: "2025-11-12",
          checkOut: "2025-11-15",
          nights: 3,
          guests: 2,
          status: "confirmed",
          channel: "Airbnb",
          amounts: {
            currency: "EUR",
            subtotal: 480,
            taxes: 48.5,
            total: 528.5
          },
          notes: "Anniversary celebration"
        },
        "R-8102": {
          id: "R-8102",
          property: "City Loft",
          checkIn: "2025-10-03",
          checkOut: "2025-10-05",
          nights: 2,
          guests: 1,
          status: "canceled",
          channel: "Booking.com",
          amounts: {
            currency: "EUR",
            subtotal: 280,
            taxes: 32,
            total: 0
          }
        }
      };
      
      return mockReservations[id] || {
        id,
        property: "Sample Property",
        checkIn: "2025-11-12",
        checkOut: "2025-11-15",
        nights: 3,
        guests: 2,
        status: "confirmed",
        channel: "Direct",
        amounts: {
          currency: "EUR",
          subtotal: 480,
          taxes: 48,
          total: 528
        }
      };
    }
    
    return apiRequest(`/client/reservations/${id}`);
  }
};