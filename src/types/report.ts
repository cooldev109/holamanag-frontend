// Report and Analytics Type Definitions

export type ReportType =
  | 'occupancy'
  | 'revenue'
  | 'channel-performance'
  | 'rate-analysis'
  | 'booking-trends'
  | 'guest-demographics'
  | 'property-performance'
  | 'custom';

export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
export type ReportFormat = 'pdf' | 'excel' | 'csv' | 'json';
export type ComparisonPeriod = 'previous-period' | 'previous-year' | 'budget' | 'forecast';
export type TrendDirection = 'up' | 'down' | 'stable';

// Main Report Interface
export interface Report {
  id: string;
  name: string;
  type: ReportType;
  description: string;
  period: ReportPeriod;
  dateRange: {
    start: string;
    end: string;
  };
  createdAt: string;
  createdBy: string;
  lastRun?: string;
  scheduleEnabled?: boolean;
  scheduleFrequency?: 'daily' | 'weekly' | 'monthly';
  recipients?: string[];
  filters?: ReportFilters;
}

export interface ReportFilters {
  propertyIds?: string[];
  roomTypeIds?: string[];
  channelIds?: string[];
  ratePlanIds?: string[];
  guestTypes?: string[];
  bookingStatuses?: string[];
}

// KPI Metrics
export interface KPI {
  id: string;
  name: string;
  value: number;
  unit: string; // e.g., '%', '$', 'nights'
  change: number; // Percentage change
  changeDirection: TrendDirection;
  comparisonPeriod: ComparisonPeriod;
  target?: number;
  isTargetMet?: boolean;
  icon?: string;
  color?: string;
}

// Occupancy Analytics
export interface OccupancyMetrics {
  period: {
    start: string;
    end: string;
  };
  totalRooms: number;
  roomNightsSold: number;
  roomNightsAvailable: number;
  occupancyRate: number; // Percentage
  averageLengthOfStay: number; // nights
  revPAR: number; // Revenue Per Available Room
  adr: number; // Average Daily Rate

  // Breakdown
  byProperty: PropertyOccupancy[];
  byRoomType: RoomTypeOccupancy[];
  byDayOfWeek: DayOccupancy[];
  byMonth?: MonthOccupancy[];

  // Comparison
  comparison?: {
    period: ComparisonPeriod;
    occupancyRateChange: number;
    revPARChange: number;
    adrChange: number;
  };
}

export interface PropertyOccupancy {
  propertyId: string;
  propertyName: string;
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  adr: number;
  revPAR: number;
  revenue: number;
}

export interface RoomTypeOccupancy {
  roomTypeId: string;
  roomTypeName: string;
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  adr: number;
  revenue: number;
}

export interface DayOccupancy {
  dayOfWeek: number; // 0-6
  dayName: string;
  occupancyRate: number;
  adr: number;
  revPAR: number;
}

export interface MonthOccupancy {
  month: string; // 'YYYY-MM'
  monthName: string;
  occupancyRate: number;
  adr: number;
  revPAR: number;
  revenue: number;
}

// Revenue Analytics
export interface RevenueMetrics {
  period: {
    start: string;
    end: string;
  };
  totalRevenue: number;
  roomRevenue: number;
  additionalRevenue: number; // F&B, services, etc.
  averageDailyRevenue: number;
  revenuePerBooking: number;

  // Breakdown
  byProperty: PropertyRevenue[];
  byChannel: ChannelRevenue[];
  byRatePlan: RatePlanRevenue[];
  byMonth?: MonthRevenue[];

  // Forecast
  forecastRevenue?: number;
  budgetRevenue?: number;

  // Comparison
  comparison?: {
    period: ComparisonPeriod;
    revenueChange: number;
    roomRevenueChange: number;
  };
}

export interface PropertyRevenue {
  propertyId: string;
  propertyName: string;
  revenue: number;
  roomRevenue: number;
  additionalRevenue: number;
  revenueGrowth: number; // Percentage
}

export interface ChannelRevenue {
  channelId: string;
  channelName: string;
  bookings: number;
  revenue: number;
  averageBookingValue: number;
  commissionRate: number;
  commissionPaid: number;
  netRevenue: number;
  revenueShare: number; // Percentage of total
}

export interface RatePlanRevenue {
  ratePlanId: string;
  ratePlanName: string;
  bookings: number;
  revenue: number;
  averageRate: number;
  revenueShare: number; // Percentage
}

export interface MonthRevenue {
  month: string; // 'YYYY-MM'
  monthName: string;
  revenue: number;
  roomRevenue: number;
  growth: number; // Percentage vs previous month
}

// Channel Performance
export interface ChannelPerformance {
  period: {
    start: string;
    end: string;
  };
  channels: ChannelMetrics[];
  totalBookings: number;
  totalRevenue: number;
  averageCommissionRate: number;
  bestPerformingChannel: string;
  worstPerformingChannel: string;
}

export interface ChannelMetrics {
  channelId: string;
  channelName: string;
  channelType: 'direct' | 'ota' | 'gds' | 'corporate' | 'agent';

  // Booking metrics
  bookings: number;
  bookingGrowth: number; // Percentage
  cancellations: number;
  cancellationRate: number; // Percentage
  noShows: number;
  noShowRate: number; // Percentage

  // Revenue metrics
  revenue: number;
  revenueGrowth: number; // Percentage
  averageBookingValue: number;

  // Cost metrics
  commissionRate: number;
  commissionPaid: number;
  acquisitionCost: number; // Cost per booking

  // Performance metrics
  conversionRate: number; // Percentage
  averageLeadTime: number; // Days
  averageLengthOfStay: number; // Nights

  // Profitability
  netRevenue: number;
  profitMargin: number; // Percentage
  roi: number; // Return on investment
}

// Booking Trends
export interface BookingTrends {
  period: {
    start: string;
    end: string;
  };
  totalBookings: number;
  trend: TrendDirection;

  // Time-based trends
  byDay: DayTrend[];
  byWeek?: WeekTrend[];
  byMonth?: MonthTrend[];

  // Booking window
  averageLeadTime: number;
  leadTimeDistribution: LeadTimeDistribution[];

  // Booking patterns
  peakBookingHour: number;
  peakBookingDay: string;
  mostPopularRoomType: string;
  mostPopularRatePlan: string;
}

export interface DayTrend {
  date: string;
  bookings: number;
  revenue: number;
  trend: TrendDirection;
}

export interface WeekTrend {
  weekStart: string;
  weekEnd: string;
  bookings: number;
  revenue: number;
  trend: TrendDirection;
}

export interface MonthTrend {
  month: string;
  monthName: string;
  bookings: number;
  revenue: number;
  growth: number; // Percentage
}

export interface LeadTimeDistribution {
  range: string; // e.g., "0-7 days", "8-14 days"
  bookings: number;
  percentage: number;
}

// Guest Demographics
export interface GuestDemographics {
  period: {
    start: string;
    end: string;
  };
  totalGuests: number;

  // Demographics
  byCountry: CountryDemographic[];
  byAgeGroup: AgeGroupDemographic[];
  byGuestType: GuestTypeDemographic[];

  // Behavior
  repeatGuestRate: number; // Percentage
  averageStaysPerGuest: number;
  averageSpendPerGuest: number;

  // Top segments
  topNationality: string;
  topAgeGroup: string;
  topGuestType: string;
}

export interface CountryDemographic {
  countryCode: string;
  countryName: string;
  guests: number;
  percentage: number;
  revenue: number;
  averageSpend: number;
}

export interface AgeGroupDemographic {
  ageGroup: string; // e.g., "18-24", "25-34"
  guests: number;
  percentage: number;
  revenue: number;
  averageSpend: number;
}

export interface GuestTypeDemographic {
  guestType: string; // e.g., "business", "leisure", "group"
  guests: number;
  percentage: number;
  revenue: number;
  averageSpend: number;
  averageLengthOfStay: number;
}

// Custom Report Builder
export interface CustomReport {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  lastModified: string;

  // Configuration
  metrics: ReportMetric[];
  dimensions: ReportDimension[];
  filters: ReportFilters;
  groupBy?: string[];
  orderBy?: OrderBy[];

  // Visualization
  chartType?: 'line' | 'bar' | 'pie' | 'table' | 'heatmap';
  showComparison?: boolean;
  comparisonPeriod?: ComparisonPeriod;

  // Schedule
  scheduleEnabled?: boolean;
  scheduleFrequency?: 'daily' | 'weekly' | 'monthly';
  scheduleTime?: string;
  recipients?: string[];
}

export interface ReportMetric {
  id: string;
  name: string;
  field: string;
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max';
  format?: 'currency' | 'percentage' | 'number' | 'decimal';
}

export interface ReportDimension {
  id: string;
  name: string;
  field: string;
  dataType: 'string' | 'date' | 'number' | 'boolean';
}

export interface OrderBy {
  field: string;
  direction: 'asc' | 'desc';
}

// Dashboard
export interface DashboardWidget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'map';
  title: string;
  size: 'small' | 'medium' | 'large' | 'full';
  position: {
    row: number;
    col: number;
  };
  dataSource: string;
  refreshInterval?: number; // seconds
  config?: Record<string, unknown>;
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  widgets: DashboardWidget[];
  createdBy: string;
  createdAt: string;
  lastModified: string;
}

// Time series data
export interface TimeSeriesData {
  timestamp: string;
  value: number;
  label?: string;
}

// Export options
export interface ExportOptions {
  format: ReportFormat;
  includeCharts: boolean;
  includeRawData: boolean;
  fileName?: string;
  email?: string;
}
