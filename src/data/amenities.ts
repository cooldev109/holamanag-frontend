import type { Amenity } from '@/types/property';

export const AMENITIES: Amenity[] = [
  // Basic Amenities
  { id: 'wifi', name: 'WiFi', icon: 'Wifi', category: 'basic' },
  { id: 'parking', name: 'Free Parking', icon: 'Car', category: 'basic' },
  { id: 'ac', name: 'Air Conditioning', icon: 'Wind', category: 'basic' },
  { id: 'heating', name: 'Heating', icon: 'Thermometer', category: 'basic' },
  { id: 'kitchen', name: 'Kitchen', icon: 'UtensilsCrossed', category: 'basic' },
  { id: 'washer', name: 'Washer', icon: 'WashingMachine', category: 'basic' },
  { id: 'dryer', name: 'Dryer', icon: 'Wind', category: 'basic' },

  // Comfort Amenities
  { id: 'pool', name: 'Swimming Pool', icon: 'Waves', category: 'comfort' },
  { id: 'gym', name: 'Fitness Center', icon: 'Dumbbell', category: 'comfort' },
  { id: 'spa', name: 'Spa', icon: 'Sparkles', category: 'comfort' },
  { id: 'sauna', name: 'Sauna', icon: 'Flame', category: 'comfort' },
  { id: 'hot-tub', name: 'Hot Tub', icon: 'Bath', category: 'comfort' },
  { id: 'balcony', name: 'Balcony', icon: 'Home', category: 'comfort' },
  { id: 'garden', name: 'Garden', icon: 'Trees', category: 'comfort' },

  // Entertainment Amenities
  { id: 'tv', name: 'TV', icon: 'Tv', category: 'entertainment' },
  { id: 'cable', name: 'Cable TV', icon: 'Cable', category: 'entertainment' },
  { id: 'netflix', name: 'Streaming Services', icon: 'MonitorPlay', category: 'entertainment' },
  { id: 'game-room', name: 'Game Room', icon: 'Gamepad2', category: 'entertainment' },
  { id: 'bbq', name: 'BBQ Grill', icon: 'Flame', category: 'entertainment' },

  // Safety Amenities
  { id: 'smoke-alarm', name: 'Smoke Alarm', icon: 'AlertTriangle', category: 'safety' },
  { id: 'fire-extinguisher', name: 'Fire Extinguisher', icon: 'Flame', category: 'safety' },
  { id: 'first-aid', name: 'First Aid Kit', icon: 'Plus', category: 'safety' },
  { id: 'security', name: '24/7 Security', icon: 'Shield', category: 'safety' },
  { id: 'cctv', name: 'CCTV', icon: 'Camera', category: 'safety' },
  { id: 'safe', name: 'Safe', icon: 'Lock', category: 'safety' },

  // Accessibility Amenities
  { id: 'wheelchair', name: 'Wheelchair Accessible', icon: 'Accessibility', category: 'accessibility' },
  { id: 'elevator', name: 'Elevator', icon: 'ArrowUpDown', category: 'accessibility' },
  { id: 'ground-floor', name: 'Ground Floor Access', icon: 'Home', category: 'accessibility' },
];

export const getAmenityById = (id: string): Amenity | undefined => {
  return AMENITIES.find(amenity => amenity.id === id);
};

export const getAmenitiesByCategory = (category: Amenity['category']): Amenity[] => {
  return AMENITIES.filter(amenity => amenity.category === category);
};
