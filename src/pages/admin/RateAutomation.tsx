import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ArrowLeft,
  Save,
  Zap,
  TrendingUp,
  Users,
  Clock,
  Target,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

import type { RateAutomationSettings } from '@/types/rate';
import { getRatePlanById, getAutomationSettings } from '@/data/mockRates';

// Validation schema
const automationFormSchema = z.object({
  enabled: z.boolean(),

  // Occupancy-based
  occupancyEnabled: z.boolean(),
  occupancyRules: z.array(
    z.object({
      threshold: z.coerce.number().min(0).max(100),
      adjustment: z.coerce.number().min(-100).max(200),
    })
  ),

  // Demand-based
  demandEnabled: z.boolean(),
  highDemandMultiplier: z.coerce.number().min(0.5).max(3),
  lowDemandMultiplier: z.coerce.number().min(0.5).max(1.5),
  lookAheadDays: z.coerce.number().min(1).max(90),

  // Competitor-based
  competitorEnabled: z.boolean(),
  targetPosition: z.enum(['below', 'match', 'above']),
  adjustmentPercentage: z.coerce.number().min(0).max(50),

  // Time-based
  timeBasedEnabled: z.boolean(),
  earlyBookingEnabled: z.boolean(),
  earlyBookingDays: z.coerce.number().min(1).max(365),
  earlyBookingDiscount: z.coerce.number().min(0).max(100),
  lastMinuteEnabled: z.boolean(),
  lastMinuteDays: z.coerce.number().min(0).max(30),
  lastMinuteDiscount: z.coerce.number().min(0).max(100),

  // Constraints
  minimumRate: z.coerce.number().min(1),
  maximumRate: z.coerce.number().min(1),
  maximumAdjustmentPerDay: z.coerce.number().min(1).max(100),
  updateFrequency: z.enum(['hourly', 'daily', 'weekly']),
}).refine((data) => data.minimumRate < data.maximumRate, {
  message: 'Minimum rate must be less than maximum rate',
  path: ['minimumRate'],
});

type AutomationFormValues = z.infer<typeof automationFormSchema>;

export default function RateAutomation() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [occupancyRules, setOccupancyRules] = useState<
    { threshold: number; adjustment: number }[]
  >([]);

  const ratePlan = id ? getRatePlanById(id) : null;
  const currentSettings = id ? getAutomationSettings(id) : null;

  // Form setup
  const form = useForm<AutomationFormValues>({
    resolver: zodResolver(automationFormSchema),
    defaultValues: {
      enabled: false,
      occupancyEnabled: false,
      occupancyRules: [],
      demandEnabled: false,
      highDemandMultiplier: 1.25,
      lowDemandMultiplier: 0.9,
      lookAheadDays: 14,
      competitorEnabled: false,
      targetPosition: 'match',
      adjustmentPercentage: 5,
      timeBasedEnabled: false,
      earlyBookingEnabled: false,
      earlyBookingDays: 30,
      earlyBookingDiscount: 15,
      lastMinuteEnabled: false,
      lastMinuteDays: 3,
      lastMinuteDiscount: 20,
      minimumRate: 100,
      maximumRate: 300,
      maximumAdjustmentPerDay: 10,
      updateFrequency: 'daily',
    },
  });

  // Load existing settings
  useEffect(() => {
    if (currentSettings) {
      form.reset({
        enabled: currentSettings.enabled,
        occupancyEnabled: currentSettings.occupancyBased.enabled,
        occupancyRules: currentSettings.occupancyBased.rules.map((r) => ({
          threshold: r.occupancyThreshold,
          adjustment: r.adjustment,
        })),
        demandEnabled: currentSettings.demandBased.enabled,
        highDemandMultiplier: currentSettings.demandBased.highDemandMultiplier,
        lowDemandMultiplier: currentSettings.demandBased.lowDemandMultiplier,
        lookAheadDays: currentSettings.demandBased.lookAheadDays,
        competitorEnabled: currentSettings.competitorBased.enabled,
        targetPosition: currentSettings.competitorBased.targetPosition,
        adjustmentPercentage: currentSettings.competitorBased.adjustmentPercentage,
        timeBasedEnabled: currentSettings.timeBased.enabled,
        earlyBookingEnabled: currentSettings.timeBased.earlyBookingDiscount.enabled,
        earlyBookingDays: currentSettings.timeBased.earlyBookingDiscount.daysInAdvance,
        earlyBookingDiscount: currentSettings.timeBased.earlyBookingDiscount.discountPercentage,
        lastMinuteEnabled: currentSettings.timeBased.lastMinuteDiscount.enabled,
        lastMinuteDays: currentSettings.timeBased.lastMinuteDiscount.daysBeforeArrival,
        lastMinuteDiscount: currentSettings.timeBased.lastMinuteDiscount.discountPercentage,
        minimumRate: currentSettings.constraints.minimumRate,
        maximumRate: currentSettings.constraints.maximumRate,
        maximumAdjustmentPerDay: currentSettings.constraints.maximumAdjustmentPerDay,
        updateFrequency: currentSettings.constraints.updateFrequency,
      });

      setOccupancyRules(
        currentSettings.occupancyBased.rules.map((r) => ({
          threshold: r.occupancyThreshold,
          adjustment: r.adjustment,
        }))
      );
    }
  }, [currentSettings, form]);

  // Watch fields
  const watchEnabled = form.watch('enabled');
  const watchOccupancyEnabled = form.watch('occupancyEnabled');
  const watchDemandEnabled = form.watch('demandEnabled');
  const watchCompetitorEnabled = form.watch('competitorEnabled');
  const watchTimeBasedEnabled = form.watch('timeBasedEnabled');
  const watchEarlyBookingEnabled = form.watch('earlyBookingEnabled');
  const watchLastMinuteEnabled = form.watch('lastMinuteEnabled');

  // Handle form submission
  const onSubmit = async (data: AutomationFormValues) => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success('Automation settings saved successfully');

      navigate(`/admin/rates/${id}`);
    } catch (error) {
      console.error('Error saving automation settings:', error);
      toast.error('Failed to save automation settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Add occupancy rule
  const addOccupancyRule = () => {
    setOccupancyRules([...occupancyRules, { threshold: 50, adjustment: 10 }]);
  };

  // Remove occupancy rule
  const removeOccupancyRule = (index: number) => {
    const newRules = occupancyRules.filter((_, i) => i !== index);
    setOccupancyRules(newRules);
    form.setValue('occupancyRules', newRules);
  };

  if (!ratePlan) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-muted-foreground">Rate plan not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(`/admin/rates/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Automation Settings</h1>
          <p className="text-muted-foreground">{ratePlan.name}</p>
        </div>
      </div>

      {/* Alert */}
      {!ratePlan.automationEnabled && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900">Automation is disabled for this rate plan</p>
                <p className="text-sm text-amber-700 mt-1">
                  Enable automation in the rate plan settings to activate these rules.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Master Toggle */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Automation Status</CardTitle>
                  <CardDescription>
                    Enable or disable all automated pricing adjustments
                  </CardDescription>
                </div>
                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-green-500"
                          />
                          <Badge variant={field.value ? 'default' : 'secondary'} className="text-sm">
                            {field.value ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardHeader>
          </Card>

          {/* Occupancy-Based Pricing */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-500" />
                  <div>
                    <CardTitle>Occupancy-Based Pricing</CardTitle>
                    <CardDescription>
                      Adjust rates based on current occupancy levels
                    </CardDescription>
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="occupancyEnabled"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!watchEnabled}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardHeader>
            {watchOccupancyEnabled && watchEnabled && (
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Define occupancy thresholds and corresponding rate adjustments
                </p>

                <div className="space-y-3">
                  {occupancyRules.map((rule, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                      <div className="flex-1 grid gap-3 md:grid-cols-2">
                        <div>
                          <Label htmlFor={`threshold-${index}`}>Occupancy Threshold (%)</Label>
                          <Input
                            id={`threshold-${index}`}
                            type="number"
                            min="0"
                            max="100"
                            value={rule.threshold}
                            onChange={(e) => {
                              const newRules = [...occupancyRules];
                              newRules[index].threshold = parseInt(e.target.value);
                              setOccupancyRules(newRules);
                              form.setValue('occupancyRules', newRules);
                            }}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`adjustment-${index}`}>Adjustment (%)</Label>
                          <Input
                            id={`adjustment-${index}`}
                            type="number"
                            min="-100"
                            max="200"
                            value={rule.adjustment}
                            onChange={(e) => {
                              const newRules = [...occupancyRules];
                              newRules[index].adjustment = parseInt(e.target.value);
                              setOccupancyRules(newRules);
                              form.setValue('occupancyRules', newRules);
                            }}
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOccupancyRule(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button type="button" variant="outline" onClick={addOccupancyRule}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Occupancy Rule
                </Button>
              </CardContent>
            )}
          </Card>

          {/* Demand-Based Pricing */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <div>
                    <CardTitle>Demand-Based Pricing</CardTitle>
                    <CardDescription>
                      Adjust rates based on booking patterns and demand forecasts
                    </CardDescription>
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="demandEnabled"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!watchEnabled}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardHeader>
            {watchDemandEnabled && watchEnabled && (
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="highDemandMultiplier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>High Demand Multiplier</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" min="0.5" max="3" {...field} />
                        </FormControl>
                        <FormDescription>e.g., 1.25 = 25% increase</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lowDemandMultiplier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Low Demand Multiplier</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" min="0.5" max="1.5" {...field} />
                        </FormControl>
                        <FormDescription>e.g., 0.9 = 10% decrease</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lookAheadDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Look Ahead Days</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" max="90" {...field} />
                        </FormControl>
                        <FormDescription>Days to analyze demand</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Competitor-Based Pricing */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-purple-500" />
                  <div>
                    <CardTitle>Competitor-Based Pricing</CardTitle>
                    <CardDescription>
                      Position your rates relative to competitors
                    </CardDescription>
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="competitorEnabled"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!watchEnabled}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardHeader>
            {watchCompetitorEnabled && watchEnabled && (
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="targetPosition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Position</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="below">Below Competitors</SelectItem>
                            <SelectItem value="match">Match Competitors</SelectItem>
                            <SelectItem value="above">Above Competitors</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>How to position rates</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="adjustmentPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adjustment Percentage</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="50" {...field} />
                        </FormControl>
                        <FormDescription>% above/below competitors</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm text-muted-foreground">
                    Competitor tracking requires integration with market data providers. Contact
                    support to enable this feature.
                  </p>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Time-Based Adjustments */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <div>
                    <CardTitle>Time-Based Adjustments</CardTitle>
                    <CardDescription>
                      Offer discounts for early or last-minute bookings
                    </CardDescription>
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="timeBasedEnabled"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!watchEnabled}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardHeader>
            {watchTimeBasedEnabled && watchEnabled && (
              <CardContent className="space-y-6">
                {/* Early Booking */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Early Booking Discount</h4>
                    <FormField
                      control={form.control}
                      name="earlyBookingEnabled"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {watchEarlyBookingEnabled && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="earlyBookingDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Days in Advance</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" max="365" {...field} />
                            </FormControl>
                            <FormDescription>Minimum days before arrival</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="earlyBookingDiscount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount Percentage</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" max="100" {...field} />
                            </FormControl>
                            <FormDescription>Discount to apply</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>

                <Separator />

                {/* Last Minute */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Last Minute Discount</h4>
                    <FormField
                      control={form.control}
                      name="lastMinuteEnabled"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {watchLastMinuteEnabled && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="lastMinuteDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Days Before Arrival</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" max="30" {...field} />
                            </FormControl>
                            <FormDescription>Maximum days before arrival</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastMinuteDiscount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount Percentage</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" max="100" {...field} />
                            </FormControl>
                            <FormDescription>Discount to apply</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Constraints */}
          <Card>
            <CardHeader>
              <CardTitle>Automation Constraints</CardTitle>
              <CardDescription>
                Set boundaries to prevent extreme pricing changes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="minimumRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Rate (Floor)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormDescription>Lowest allowed rate</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maximumRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Rate (Ceiling)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormDescription>Highest allowed rate</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maximumAdjustmentPerDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Adjustment Per Day (%)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="100" {...field} />
                      </FormControl>
                      <FormDescription>Max daily rate change</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="updateFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Update Frequency</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>How often to update rates</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/admin/rates/${id}`)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Automation Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
