import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, DollarSign, Info } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isWeekend,
} from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import type { RatePlan, RateCalendarEntry } from '@/types/rate';
import { MOCK_RATE_PLANS } from '@/data/mockRates';

// Rate modifier interface
interface RateModifier {
  type: string;
  value: number;
  description?: string;
}

// Generate mock calendar data for a date range
function generateMockCalendarData(
  ratePlan: RatePlan,
  startDate: Date,
  endDate: Date
): RateCalendarEntry[] {
  const entries: RateCalendarEntry[] = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    let finalRate = ratePlan.baseRate;
    const appliedRules: string[] = [];
    const modifiers: RateModifier[] = [];

    // Apply weekend pricing
    if (isWeekend(currentDate) && ratePlan.allowWeekendPricing && ratePlan.weekendMultiplier) {
      finalRate *= ratePlan.weekendMultiplier;
      appliedRules.push('weekend');
    }

    // Apply seasonal rules (simplified)
    const month = currentDate.getMonth();
    if (month >= 5 && month <= 7 && ratePlan.allowSeasonalPricing) {
      // Summer peak
      finalRate *= 1.35;
      appliedRules.push('summer-peak');
    }

    // Random occupancy for visualization
    const occupancy = Math.floor(Math.random() * 100);
    const totalRooms = 50;
    const bookedRooms = Math.floor((occupancy / 100) * totalRooms);

    entries.push({
      date: format(currentDate, 'yyyy-MM-dd'),
      baseRate: ratePlan.baseRate,
      finalRate: Math.round(finalRate),
      modifiers,
      appliedRules,
      occupancy,
      availableRooms: totalRooms - bookedRooms,
      bookedRooms,
    });

    currentDate = addDays(currentDate, 1);
  }

  return entries;
}

export default function RateCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRatePlan, setSelectedRatePlan] = useState<string>(MOCK_RATE_PLANS[0].id);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editRate, setEditRate] = useState<string>('');

  const ratePlan = MOCK_RATE_PLANS.find((p) => p.id === selectedRatePlan) || MOCK_RATE_PLANS[0];

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days: Date[] = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  }, [currentDate]);

  // Generate rate data for the visible month
  const rateData = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    return generateMockCalendarData(ratePlan, monthStart, monthEnd);
  }, [currentDate, ratePlan]);

  // Get rate for a specific date
  const getRateForDate = (date: Date): RateCalendarEntry | undefined => {
    return rateData.find((entry) => isSameDay(new Date(entry.date), date));
  };

  // Get color based on rate level
  const getRateColor = (rate: number): string => {
    const base = ratePlan.baseRate;
    const diff = ((rate - base) / base) * 100;

    if (diff > 30) return 'bg-red-100 text-red-900 border-red-200';
    if (diff > 15) return 'bg-orange-100 text-orange-900 border-orange-200';
    if (diff > 0) return 'bg-yellow-100 text-yellow-900 border-yellow-200';
    if (diff === 0) return 'bg-blue-100 text-blue-900 border-blue-200';
    if (diff > -15) return 'bg-green-100 text-green-900 border-green-200';
    return 'bg-emerald-100 text-emerald-900 border-emerald-200';
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    if (!isSameMonth(date, currentDate)) return;

    const rateEntry = getRateForDate(date);
    if (rateEntry) {
      setSelectedDate(date);
      setEditRate(rateEntry.finalRate.toString());
      setEditDialogOpen(true);
    }
  };

  // Handle rate update
  const handleSaveRate = () => {
    if (selectedDate) {
      toast.success('Rate updated successfully');
      setEditDialogOpen(false);
    }
  };

  // Navigate months
  const previousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const today = () => setCurrentDate(new Date());

  // Calculate stats
  const stats = useMemo(() => {
    const rates = rateData.map((d) => d.finalRate);
    const avgRate = rates.reduce((sum, r) => sum + r, 0) / rates.length;
    const minRate = Math.min(...rates);
    const maxRate = Math.max(...rates);
    const avgOccupancy = rateData.reduce((sum, d) => sum + d.occupancy, 0) / rateData.length;

    return {
      avgRate: Math.round(avgRate),
      minRate,
      maxRate,
      avgOccupancy: Math.round(avgOccupancy),
    };
  }, [rateData]);

  const selectedDateEntry = selectedDate ? getRateForDate(selectedDate) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rate Calendar</h1>
          <p className="text-muted-foreground">
            View and manage daily rates across your properties
          </p>
        </div>
        <Button onClick={today}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          Today
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.avgRate}</div>
            <p className="text-xs text-muted-foreground">this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Range</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.minRate} - ${stats.maxRate}
            </div>
            <p className="text-xs text-muted-foreground">min to max</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Base Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${ratePlan.baseRate}</div>
            <p className="text-xs text-muted-foreground">{ratePlan.name}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Occupancy</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgOccupancy}%</div>
            <p className="text-xs text-muted-foreground">this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-2xl font-semibold">{format(currentDate, 'MMMM yyyy')}</h2>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Label htmlFor="rate-plan-select" className="text-sm font-medium">
                Rate Plan:
              </Label>
              <Select value={selectedRatePlan} onValueChange={setSelectedRatePlan}>
                <SelectTrigger id="rate-plan-select" className="w-[280px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_RATE_PLANS.filter((p) => p.status === 'active').map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} (${plan.baseRate}/night)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center font-medium text-sm text-muted-foreground p-2">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map((day, index) => {
              const rateEntry = getRateForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={index}
                  className={`
                    min-h-[100px] p-2 border rounded-lg cursor-pointer transition-all hover:shadow-md
                    ${!isCurrentMonth ? 'opacity-40' : ''}
                    ${isToday ? 'ring-2 ring-blue-500' : ''}
                    ${rateEntry ? getRateColor(rateEntry.finalRate) : 'bg-gray-50'}
                  `}
                  onClick={() => handleDateClick(day)}
                >
                  <div className="flex flex-col h-full">
                    <div className="text-sm font-medium mb-1">{format(day, 'd')}</div>

                    {rateEntry && isCurrentMonth && (
                      <>
                        <div className="flex-1">
                          <div className="text-lg font-bold">${rateEntry.finalRate}</div>
                          {rateEntry.finalRate !== rateEntry.baseRate && (
                            <div className="text-xs line-through opacity-60">
                              ${rateEntry.baseRate}
                            </div>
                          )}
                        </div>

                        <div className="mt-auto">
                          <div className="text-xs opacity-75">{rateEntry.occupancy}% occ</div>
                          {rateEntry.appliedRules.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {rateEntry.appliedRules.slice(0, 2).map((rule, i) => (
                                <div
                                  key={i}
                                  className="w-2 h-2 rounded-full bg-current opacity-50"
                                  title={rule}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Rate Level:</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-emerald-100 border border-emerald-200" />
                <span className="text-xs">15%+ below base</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-100 border border-green-200" />
                <span className="text-xs">Below base</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-100 border border-blue-200" />
                <span className="text-xs">Base rate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-200" />
                <span className="text-xs">Above base</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-orange-100 border border-orange-200" />
                <span className="text-xs">15%+ above base</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-100 border border-red-200" />
                <span className="text-xs">30%+ above base</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Rate Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit Rate - {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
            </DialogTitle>
            <DialogDescription>
              Update the rate for this specific date. This will override any automated pricing rules.
            </DialogDescription>
          </DialogHeader>

          {selectedDateEntry && (
            <div className="space-y-4">
              <div className="grid gap-4 rounded-lg border p-4 bg-muted">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Base Rate</p>
                    <p className="text-lg font-semibold">${selectedDateEntry.baseRate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Rate</p>
                    <p className="text-lg font-semibold">${selectedDateEntry.finalRate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Occupancy</p>
                    <p className="text-lg font-semibold">{selectedDateEntry.occupancy}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Available Rooms</p>
                    <p className="text-lg font-semibold">{selectedDateEntry.availableRooms}</p>
                  </div>
                </div>

                {selectedDateEntry.appliedRules.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Applied Rules</p>
                    <div className="flex gap-2 flex-wrap">
                      {selectedDateEntry.appliedRules.map((rule, i) => (
                        <Badge key={i} variant="secondary">
                          {rule}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-rate">New Rate</Label>
                <Input
                  id="edit-rate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editRate}
                  onChange={(e) => setEditRate(e.target.value)}
                  placeholder="Enter new rate"
                />
                <p className="text-sm text-muted-foreground">
                  Enter the new rate for this date. Leave empty to use automated pricing.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRate}>Save Rate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
