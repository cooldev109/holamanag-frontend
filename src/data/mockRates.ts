import type { RatePlan, PricingRule, RateModifier, RateAutomationSettings, RateAnalytics } from '@/types/rate';

export const MOCK_RATE_MODIFIERS: RateModifier[] = [
  { id: 'mod-1', name: 'Weekend Surcharge', type: 'percentage', value: 20, applyToBaseRate: true },
  { id: 'mod-2', name: 'Early Bird Discount', type: 'percentage', value: -15, applyToBaseRate: true },
  { id: 'mod-3', name: 'Last Minute Discount', type: 'percentage', value: -25, applyToBaseRate: true },
  { id: 'mod-4', name: 'High Season Premium', type: 'percentage', value: 35, applyToBaseRate: true },
  { id: 'mod-5', name: 'Low Season Discount', type: 'percentage', value: -20, applyToBaseRate: true },
  { id: 'mod-6', name: 'Corporate Rate', type: 'fixed-amount', value: -50, applyToBaseRate: false },
  { id: 'mod-7', name: 'Group Discount', type: 'percentage', value: -10, applyToBaseRate: true },
  { id: 'mod-8', name: 'Holiday Premium', type: 'percentage', value: 50, applyToBaseRate: true },
];

export const MOCK_PRICING_RULES: PricingRule[] = [
  {
    id: 'rule-1',
    ratePlanId: 'rate-1',
    name: 'Summer Peak Season',
    ruleType: 'date-range',
    enabled: true,
    priority: 9,
    dateRange: {
      start: '2025-06-15',
      end: '2025-08-31',
    },
    modifiers: [MOCK_RATE_MODIFIERS[3]], // High season premium
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-01T10:00:00Z',
  },
  {
    id: 'rule-2',
    ratePlanId: 'rate-1',
    name: 'Weekend Premium',
    ruleType: 'day-of-week',
    enabled: true,
    priority: 7,
    daysOfWeek: [5, 6], // Friday, Saturday
    modifiers: [MOCK_RATE_MODIFIERS[0]], // Weekend surcharge
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-01T10:00:00Z',
  },
  {
    id: 'rule-3',
    ratePlanId: 'rate-1',
    name: 'Early Booking Incentive',
    ruleType: 'advance-booking',
    enabled: true,
    priority: 5,
    advanceBookingDays: {
      min: 30,
    },
    modifiers: [MOCK_RATE_MODIFIERS[1]], // Early bird discount
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-01T10:00:00Z',
  },
  {
    id: 'rule-4',
    ratePlanId: 'rate-1',
    name: 'Last Minute Deal',
    ruleType: 'advance-booking',
    enabled: true,
    priority: 6,
    advanceBookingDays: {
      max: 3,
    },
    modifiers: [MOCK_RATE_MODIFIERS[2]], // Last minute discount
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-01T10:00:00Z',
  },
  {
    id: 'rule-5',
    ratePlanId: 'rate-2',
    name: 'Corporate Discount',
    ruleType: 'date-range',
    enabled: true,
    priority: 8,
    dateRange: {
      start: '2025-01-01',
      end: '2025-12-31',
    },
    modifiers: [MOCK_RATE_MODIFIERS[5]], // Corporate rate
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-01T10:00:00Z',
  },
  {
    id: 'rule-6',
    ratePlanId: 'rate-3',
    name: 'Holiday Special',
    ruleType: 'date-range',
    enabled: true,
    priority: 10,
    dateRange: {
      start: '2025-12-20',
      end: '2026-01-05',
    },
    modifiers: [MOCK_RATE_MODIFIERS[7]], // Holiday premium
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-01T10:00:00Z',
  },
];

export const MOCK_RATE_PLANS: RatePlan[] = [
  {
    id: 'rate-1',
    name: 'Best Available Rate (BAR)',
    description: 'Our standard flexible rate with no restrictions. Includes breakfast and free cancellation up to 24 hours before arrival.',
    type: 'standard',
    status: 'active',
    propertyIds: ['prop-1', 'prop-2'],
    baseRate: 150,
    currency: 'USD',
    pricingStrategy: 'dynamic',
    rules: [MOCK_PRICING_RULES[0], MOCK_PRICING_RULES[1], MOCK_PRICING_RULES[2], MOCK_PRICING_RULES[3]],
    allowWeekendPricing: true,
    weekendMultiplier: 1.2,
    allowSeasonalPricing: true,
    allowDynamicPricing: true,
    automationEnabled: true,
    minimumRate: 100,
    maximumRate: 300,
    minimumStay: 1,
    advanceBookingDays: 90,
    createdAt: '2024-12-01T09:00:00Z',
    updatedAt: '2025-01-15T14:00:00Z',
    createdBy: 'admin@demo.io',
  },
  {
    id: 'rate-2',
    name: 'Corporate Rate',
    description: 'Special negotiated rate for corporate clients with flexible cancellation and complimentary services.',
    type: 'corporate',
    status: 'active',
    propertyIds: ['prop-1', 'prop-2', 'prop-3'],
    baseRate: 120,
    currency: 'USD',
    pricingStrategy: 'fixed',
    rules: [MOCK_PRICING_RULES[4]],
    allowWeekendPricing: false,
    allowSeasonalPricing: false,
    allowDynamicPricing: false,
    automationEnabled: false,
    minimumStay: 1,
    maximumStay: 14,
    createdAt: '2024-11-15T10:00:00Z',
    updatedAt: '2025-01-10T12:00:00Z',
    createdBy: 'admin@demo.io',
  },
  {
    id: 'rate-3',
    name: 'Holiday Special',
    description: 'Premium rate for peak holiday season with exclusive perks and extended checkout.',
    type: 'seasonal',
    status: 'active',
    propertyIds: ['prop-1'],
    baseRate: 250,
    currency: 'USD',
    pricingStrategy: 'fixed',
    rules: [MOCK_PRICING_RULES[5]],
    allowWeekendPricing: false,
    allowSeasonalPricing: true,
    allowDynamicPricing: false,
    automationEnabled: false,
    minimumRate: 200,
    maximumRate: 400,
    minimumStay: 2,
    maximumStay: 7,
    createdAt: '2024-10-01T08:00:00Z',
    updatedAt: '2025-01-05T16:00:00Z',
    createdBy: 'admin@demo.io',
  },
  {
    id: 'rate-4',
    name: 'Early Bird Saver',
    description: 'Book 30+ days in advance and save 15%. Non-refundable.',
    type: 'promotional',
    status: 'active',
    propertyIds: ['prop-1', 'prop-2', 'prop-3'],
    baseRate: 127.50, // 15% off standard $150
    currency: 'USD',
    pricingStrategy: 'fixed',
    rules: [],
    allowWeekendPricing: false,
    allowSeasonalPricing: false,
    allowDynamicPricing: false,
    automationEnabled: false,
    minimumStay: 2,
    advanceBookingDays: 30,
    createdAt: '2025-01-01T11:00:00Z',
    updatedAt: '2025-01-01T11:00:00Z',
    createdBy: 'admin@demo.io',
  },
  {
    id: 'rate-5',
    name: 'Weekend Getaway',
    description: 'Special weekend package with late checkout and complimentary breakfast.',
    type: 'promotional',
    status: 'inactive',
    propertyIds: ['prop-1'],
    baseRate: 180,
    currency: 'USD',
    pricingStrategy: 'fixed',
    rules: [],
    allowWeekendPricing: true,
    weekendMultiplier: 1.0, // Already weekend rate
    allowSeasonalPricing: false,
    allowDynamicPricing: false,
    automationEnabled: false,
    minimumStay: 2,
    maximumStay: 3,
    createdAt: '2024-09-15T10:00:00Z',
    updatedAt: '2024-12-20T15:00:00Z',
    createdBy: 'admin@demo.io',
  },
  {
    id: 'rate-6',
    name: 'Group Rate',
    description: 'Special discounted rate for groups of 10+ rooms. Includes meeting space and catering discount.',
    type: 'group',
    status: 'draft',
    propertyIds: ['prop-1', 'prop-2'],
    baseRate: 135,
    currency: 'USD',
    pricingStrategy: 'fixed',
    rules: [],
    allowWeekendPricing: false,
    allowSeasonalPricing: false,
    allowDynamicPricing: false,
    automationEnabled: false,
    minimumStay: 2,
    advanceBookingDays: 60,
    createdAt: '2025-01-20T09:00:00Z',
    updatedAt: '2025-01-20T09:00:00Z',
    createdBy: 'admin@demo.io',
  },
];

export const MOCK_AUTOMATION_SETTINGS: RateAutomationSettings[] = [
  {
    id: 'auto-1',
    ratePlanId: 'rate-1',
    enabled: true,
    occupancyBased: {
      enabled: true,
      rules: [
        { occupancyThreshold: 90, adjustment: 20 }, // 20% increase above 90%
        { occupancyThreshold: 70, adjustment: 10 }, // 10% increase above 70%
        { occupancyThreshold: 30, adjustment: -10 }, // 10% decrease below 30%
      ],
    },
    demandBased: {
      enabled: true,
      highDemandMultiplier: 1.25,
      lowDemandMultiplier: 0.9,
      lookAheadDays: 14,
    },
    competitorBased: {
      enabled: false,
      targetPosition: 'below',
      adjustmentPercentage: 5,
      competitors: [],
    },
    timeBased: {
      enabled: true,
      earlyBookingDiscount: {
        enabled: true,
        daysInAdvance: 30,
        discountPercentage: 15,
      },
      lastMinuteDiscount: {
        enabled: true,
        daysBeforeArrival: 3,
        discountPercentage: 20,
      },
    },
    constraints: {
      minimumRate: 100,
      maximumRate: 300,
      maximumAdjustmentPerDay: 10,
      updateFrequency: 'daily',
    },
    lastUpdated: '2025-01-15T14:00:00Z',
  },
  {
    id: 'auto-2',
    ratePlanId: 'rate-2',
    enabled: false,
    occupancyBased: {
      enabled: false,
      rules: [],
    },
    demandBased: {
      enabled: false,
      highDemandMultiplier: 1.0,
      lowDemandMultiplier: 1.0,
      lookAheadDays: 7,
    },
    competitorBased: {
      enabled: false,
      targetPosition: 'match',
      adjustmentPercentage: 0,
      competitors: [],
    },
    timeBased: {
      enabled: false,
      earlyBookingDiscount: {
        enabled: false,
        daysInAdvance: 14,
        discountPercentage: 10,
      },
      lastMinuteDiscount: {
        enabled: false,
        daysBeforeArrival: 2,
        discountPercentage: 15,
      },
    },
    constraints: {
      minimumRate: 120,
      maximumRate: 120,
      maximumAdjustmentPerDay: 0,
      updateFrequency: 'daily',
    },
    lastUpdated: '2025-01-10T12:00:00Z',
  },
];

export const MOCK_RATE_ANALYTICS: RateAnalytics[] = [
  {
    ratePlanId: 'rate-1',
    period: {
      start: '2025-01-01',
      end: '2025-01-31',
    },
    averageRate: 165.50,
    minimumRate: 120,
    maximumRate: 240,
    revenue: 45540,
    bookings: 275,
    occupancyRate: 78,
    rateDistribution: [
      { range: '$100-$150', count: 85, percentage: 31 },
      { range: '$150-$200', count: 145, percentage: 53 },
      { range: '$200-$250', count: 45, percentage: 16 },
    ],
    trends: [
      { date: '2025-01-01', averageRate: 180, occupancy: 85, revenue: 1800 },
      { date: '2025-01-08', averageRate: 155, occupancy: 70, revenue: 1395 },
      { date: '2025-01-15', averageRate: 170, occupancy: 82, revenue: 1650 },
      { date: '2025-01-22', averageRate: 160, occupancy: 75, revenue: 1480 },
      { date: '2025-01-29', averageRate: 165, occupancy: 76, revenue: 1520 },
    ],
    comparisonToPrevious: {
      revenue: 12.5, // 12.5% increase
      averageRate: 8.2, // 8.2% increase
      occupancy: 3.5, // 3.5% increase
    },
  },
  {
    ratePlanId: 'rate-2',
    period: {
      start: '2025-01-01',
      end: '2025-01-31',
    },
    averageRate: 120,
    minimumRate: 120,
    maximumRate: 120,
    revenue: 18000,
    bookings: 150,
    occupancyRate: 45,
    rateDistribution: [
      { range: '$120', count: 150, percentage: 100 },
    ],
    trends: [
      { date: '2025-01-01', averageRate: 120, occupancy: 40, revenue: 600 },
      { date: '2025-01-08', averageRate: 120, occupancy: 48, revenue: 720 },
      { date: '2025-01-15', averageRate: 120, occupancy: 45, revenue: 675 },
      { date: '2025-01-22', averageRate: 120, occupancy: 42, revenue: 630 },
      { date: '2025-01-29', averageRate: 120, occupancy: 50, revenue: 750 },
    ],
    comparisonToPrevious: {
      revenue: -5.2, // 5.2% decrease
      averageRate: 0, // No change (fixed rate)
      occupancy: -2.1, // 2.1% decrease
    },
  },
];

// Helper functions
export const getRatePlanById = (id: string): RatePlan | undefined => {
  return MOCK_RATE_PLANS.find(plan => plan.id === id);
};

export const getRatePlansByProperty = (propertyId: string): RatePlan[] => {
  return MOCK_RATE_PLANS.filter(plan => plan.propertyIds.includes(propertyId));
};

export const getRatePlansByStatus = (status: RatePlan['status']): RatePlan[] => {
  return MOCK_RATE_PLANS.filter(plan => plan.status === status);
};

export const getAutomationSettings = (ratePlanId: string): RateAutomationSettings | undefined => {
  return MOCK_AUTOMATION_SETTINGS.find(settings => settings.ratePlanId === ratePlanId);
};

export const getRateAnalytics = (ratePlanId: string): RateAnalytics | undefined => {
  return MOCK_RATE_ANALYTICS.find(analytics => analytics.ratePlanId === ratePlanId);
};
