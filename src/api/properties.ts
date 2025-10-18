import { client } from './client';

// Property Types
export interface Property {
  _id: string;
  id?: string; // For compatibility with mock data
  name: string;
  propertyType: 'hotel' | 'apartment' | 'villa' | 'hostel' | 'resort' | 'house' | 'bed_and_breakfast' | 'guesthouse';
  type?: 'hotel' | 'apartment' | 'villa' | 'hostel' | 'resort'; // For backward compatibility with mock data
  status: 'active' | 'inactive' | 'maintenance' | 'suspended';
  description?: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    timezone?: string;
    neighborhood?: string;
    landmark?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  rooms?: Array<{
    _id: string;
    name: string;
    type: string;
    capacity: {
      adults: number;
      children: number;
      infants: number;
    };
    baseRate: number;
    currency: string;
    isActive: boolean;
  }>;
  amenities?: string[];
  photos?: string[];
  policies?: {
    checkInTime?: string;
    checkOutTime?: string;
    cancellationPolicy?: string;
  };
  settings?: {
    autoConfirmBookings?: boolean;
    allowInstantBooking?: boolean;
    requireDeposit?: boolean;
    depositAmount?: number;
  };
  owner?: string | { email: string };
  manager?: string | { email: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface PropertiesResponse {
  success: boolean;
  data: {
    properties: Property[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
  message?: string;
}

export interface PropertyResponse {
  success: boolean;
  data: Property;
}

// API Functions

/**
 * Get all properties
 */
export const getProperties = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
}): Promise<Property[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.type) queryParams.append('type', params.type);

    const url = `/properties${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await client.get<PropertiesResponse>(url);
    
    // Map _id to id and propertyType to type for frontend compatibility
    return response.data.data.properties.map(property => ({
      ...property,
      id: property._id || property.id,
      type: property.propertyType || property.type, // Map propertyType to type for compatibility
    }));
  } catch (error) {
    console.error('Failed to fetch properties:', error);
    throw error;
  }
};

/**
 * Get a single property by ID
 */
export const getProperty = async (id: string): Promise<Property> => {
  try {
    const response = await client.get<PropertyResponse>(`/properties/${id}`);
    const property = response.data.data;
    
    return {
      ...property,
      id: property._id || property.id,
    };
  } catch (error) {
    console.error(`Failed to fetch property ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new property
 */
export const createProperty = async (data: Partial<Property>): Promise<Property> => {
  try {
    console.log('Creating property with data:', data);
    const response = await client.post<PropertyResponse>('/properties', data);
    const property = response.data.data;
    
    return {
      ...property,
      id: property._id || property.id,
    };
  } catch (error: any) {
    console.error('Failed to create property:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

/**
 * Update an existing property
 */
export const updateProperty = async (id: string, data: Partial<Property>): Promise<Property> => {
  try {
    const response = await client.put<PropertyResponse>(`/properties/${id}`, data);
    const property = response.data.data;
    
    return {
      ...property,
      id: property._id || property.id,
    };
  } catch (error) {
    console.error(`Failed to update property ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a property
 */
export const deleteProperty = async (id: string): Promise<void> => {
  try {
    await client.delete(`/properties/${id}`);
  } catch (error) {
    console.error(`Failed to delete property ${id}:`, error);
    throw error;
  }
};

