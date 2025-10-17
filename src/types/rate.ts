export type RatePlanStatus = 'active' | 'inactive' | 'draft' | 'archived';
export type RatePlanType = 'standard' | 'seasonal' | 'promotional' | 'corporate' | 'group';
export type PricingStrategy = 'fixed' | 'dynamic' | 'occupancy-based' | 'demand-based' | 'competitor-based';
export type RuleType = 'date-range' | 'day-of-week' | 'occupancy-level' | 'advance-booking' | 'minimum-stay' | 'maximum-stay';
export type ModifierType = 'percentage' | 'fixed-amount' | 'override';

export interface RateModifier {
  id: string;
  name: string;
  type: ModifierType;
  value: number; // Percentage (0-100) or fixed amount
  description?: string;
  applyToBaseRate: boolean;
}

export interface PricingRule {
  id: string;
  ratePlanId: string;
  name: string;
  ruleType: RuleType;
  enabled: boolean;
  priority: number; // 1-10, higher = applied first

  // Conditions
  dateRange?: {
    start: string; // ISO date
    end: string; // ISO date
  };
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
  occupancyRange?: {
    min: number; // 0-100 percentage
    max: number; // 0-100 percentage
  };
  advanceBookingDays?: {
    min?: number;
    max?: number;
  };
  minimumStay?: number; // nights
  maximumStay?: number; // nights

  // Modifiers applied when rule matches
  modifiers: RateModifier[];

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface RateCalendarEntry {
  date: string; // ISO date
  baseRate: number;
  finalRate: number;
  modifiers: RateModifier[];
  appliedRules: string[]; // Rule IDs
  occupancy: number; // 0-100 percentage
  availableRooms: number;
  bookedRooms: number;
}

export interface RatePlan {
  id: string;

  // Basic Info
  name: string;
  description: string;
  type: RatePlanType;
  status: RatePlanStatus;

  // Associated Properties
  propertyIds: string[]; // Can apply to multiple properties
  roomTypeIds?: string[]; // Optional: specific room types

  // Pricing
  baseRate: number; // Per night
  currency: string;
  pricingStrategy: PricingStrategy;

  // Rules
  rules: PricingRule[];

  // Settings
  allowWeekendPricing: boolean;
  weekendMultiplier?: number; // e.g., 1.2 = 20% increase
  allowSeasonalPricing: boolean;
  allowDynamicPricing: boolean;

  // Automation
  automationEnabled: boolean;
  minimumRate?: number; // Floor rate
  maximumRate?: number; // Ceiling rate

  // Availability
  minimumStay?: number;
  maximumStay?: number;
  advanceBookingDays?: number;

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface RateAnalytics {
  ratePlanId: string;
  period: {
    start: string;
    end: string;
  };

  // Performance Metrics
  averageRate: number;
  minimumRate: number;
  maximumRate: number;
  revenue: number;
  bookings: number;
  occupancyRate: number; // 0-100 percentage

  // Rate Distribution
  rateDistribution: {
    range: string; // e.g., "$100-$150"
    count: number;
    percentage: number;
  }[];

  // Trend Data
  trends: {
    date: string;
    averageRate: number;
    occupancy: number;
    revenue: number;
  }[];

  // Comparison
  comparisonToPrevious?: {
    revenue: number; // Percentage change
    averageRate: number; // Percentage change
    occupancy: number; // Percentage change
  };
}

export interface RateAutomationSettings {
  id: string;
  ratePlanId: string;

  // Enable/Disable
  enabled: boolean;

  // Occupancy-Based Pricing
  occupancyBased: {
    enabled: boolean;
    rules: {
      occupancyThreshold: number; // 0-100 percentage
      adjustment: number; // Percentage increase/decrease
    }[];
  };

  // Demand-Based Pricing
  demandBased: {
    enabled: boolean;
    highDemandMultiplier: number; // e.g., 1.3 = 30% increase
    lowDemandMultiplier: number; // e.g., 0.9 = 10% decrease
    lookAheadDays: number; // How many days to analyze
  };

  // Competitor-Based Pricing
  competitorBased: {
    enabled: boolean;
    targetPosition: 'below' | 'match' | 'above';
    adjustmentPercentage: number; // How much below/above
    competitors: string[]; // Competitor IDs
  };

  // Time-Based Adjustments
  timeBased: {
    enabled: boolean;
    earlyBookingDiscount: {
      enabled: boolean;
      daysInAdvance: number;
      discountPercentage: number;
    };
    lastMinuteDiscount: {
      enabled: boolean;
      daysBeforeArrival: number;
      discountPercentage: number;
    };
  };

  // Constraints
  constraints: {
    minimumRate: number;
    maximumRate: number;
    maximumAdjustmentPerDay: number; // Percentage
    updateFrequency: 'hourly' | 'daily' | 'weekly';
  };

  // Metadata
  lastUpdated: string;
}

export interface RatePlanFormData {
  name: string;
  description: string;
  type: RatePlanType;
  status: RatePlanStatus;
  propertyIds: string[];
  baseRate: number;
  currency: string;
  pricingStrategy: PricingStrategy;
  allowWeekendPricing: boolean;
  weekendMultiplier?: number;
  allowSeasonalPricing: boolean;
  allowDynamicPricing: boolean;
  automationEnabled: boolean;
  minimumRate?: number;
  maximumRate?: number;
  minimumStay?: number;
  maximumStay?: number;
  advanceBookingDays?: number;
}

export interface RateFilters {
  search?: string;
  status?: RatePlanStatus[];
  type?: RatePlanType[];
  propertyId?: string;
  pricingStrategy?: PricingStrategy[];
  dateRange?: {
    start: string;
    end: string;
  };
}
