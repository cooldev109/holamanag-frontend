import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ArrowLeft,
  Save,
  Loader2,
  Info,
  DollarSign,
  Building,
  Settings as SettingsIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

import type { RatePlanFormData } from '@/types/rate';
import { getRatePlanById } from '@/data/mockRates';

// Validation schema
const ratePlanFormSchema = z.object({
  // Basic Info
  name: z.string().min(3, 'Rate plan name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.enum(['standard', 'seasonal', 'promotional', 'corporate', 'group']),
  status: z.enum(['active', 'inactive', 'draft', 'archived']),

  // Pricing
  baseRate: z.coerce.number().min(1, 'Base rate must be at least $1'),
  currency: z.string().min(3, 'Currency code is required').max(3, 'Currency code must be 3 characters'),
  pricingStrategy: z.enum(['fixed', 'dynamic', 'occupancy-based', 'demand-based', 'competitor-based']),
  minimumRate: z.coerce.number().optional(),
  maximumRate: z.coerce.number().optional(),

  // Properties
  propertyIds: z.array(z.string()).min(1, 'At least one property must be selected'),

  // Pricing Settings
  allowWeekendPricing: z.boolean(),
  weekendMultiplier: z.coerce.number().min(0.1).max(10).optional(),
  allowSeasonalPricing: z.boolean(),
  allowDynamicPricing: z.boolean(),

  // Automation
  automationEnabled: z.boolean(),

  // Restrictions
  minimumStay: z.coerce.number().min(1).optional(),
  maximumStay: z.coerce.number().min(1).optional(),
  advanceBookingDays: z.coerce.number().min(0).optional(),
}).refine((data) => {
  // If minimum and maximum rates are set, minimum must be less than maximum
  if (data.minimumRate && data.maximumRate) {
    return data.minimumRate < data.maximumRate;
  }
  return true;
}, {
  message: 'Minimum rate must be less than maximum rate',
  path: ['minimumRate'],
}).refine((data) => {
  // If minimum and maximum stay are set, minimum must be less than or equal to maximum
  if (data.minimumStay && data.maximumStay) {
    return data.minimumStay <= data.maximumStay;
  }
  return true;
}, {
  message: 'Minimum stay must be less than or equal to maximum stay',
  path: ['minimumStay'],
}).refine((data) => {
  // If weekend pricing is enabled, multiplier must be provided
  if (data.allowWeekendPricing && !data.weekendMultiplier) {
    return false;
  }
  return true;
}, {
  message: 'Weekend multiplier is required when weekend pricing is enabled',
  path: ['weekendMultiplier'],
});

type RatePlanFormValues = z.infer<typeof ratePlanFormSchema>;

// Mock properties for selection
const MOCK_PROPERTIES = [
  { id: 'prop-1', name: 'Seaside Resort & Spa' },
  { id: 'prop-2', name: 'Downtown Business Hotel' },
  { id: 'prop-3', name: 'Mountain View Villa' },
  { id: 'prop-4', name: 'City Center Apartments' },
  { id: 'prop-5', name: 'Beachfront Hostel' },
];

export default function RatePlanForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Form setup
  const form = useForm<RatePlanFormValues>({
    resolver: zodResolver(ratePlanFormSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'standard',
      status: 'draft',
      baseRate: 100,
      currency: 'USD',
      pricingStrategy: 'fixed',
      propertyIds: [],
      allowWeekendPricing: false,
      weekendMultiplier: 1.2,
      allowSeasonalPricing: false,
      allowDynamicPricing: false,
      automationEnabled: false,
      minimumStay: 1,
      maximumStay: undefined,
      advanceBookingDays: undefined,
      minimumRate: undefined,
      maximumRate: undefined,
    },
  });

  // Load existing rate plan data in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const ratePlan = getRatePlanById(id);
      if (ratePlan) {
        form.reset({
          name: ratePlan.name,
          description: ratePlan.description,
          type: ratePlan.type,
          status: ratePlan.status,
          baseRate: ratePlan.baseRate,
          currency: ratePlan.currency,
          pricingStrategy: ratePlan.pricingStrategy,
          propertyIds: ratePlan.propertyIds,
          allowWeekendPricing: ratePlan.allowWeekendPricing,
          weekendMultiplier: ratePlan.weekendMultiplier,
          allowSeasonalPricing: ratePlan.allowSeasonalPricing,
          allowDynamicPricing: ratePlan.allowDynamicPricing,
          automationEnabled: ratePlan.automationEnabled,
          minimumStay: ratePlan.minimumStay,
          maximumStay: ratePlan.maximumStay,
          advanceBookingDays: ratePlan.advanceBookingDays,
          minimumRate: ratePlan.minimumRate,
          maximumRate: ratePlan.maximumRate,
        });
      } else {
        toast.error('Rate plan not found');
        navigate('/admin/rates');
      }
    }
  }, [isEditMode, id, form, navigate]);

  // Watch fields for conditional rendering
  const watchAllowWeekendPricing = form.watch('allowWeekendPricing');
  const watchPricingStrategy = form.watch('pricingStrategy');
  const watchPropertyIds = form.watch('propertyIds');

  // Handle form submission
  const onSubmit = async (data: RatePlanFormValues) => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success(
        isEditMode ? 'Rate plan updated successfully' : 'Rate plan created successfully'
      );

      navigate('/admin/rates');
    } catch (error) {
      console.error('Error saving rate plan:', error);
      toast.error('Failed to save rate plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle property selection
  const handlePropertyToggle = (propertyId: string) => {
    const currentIds = watchPropertyIds;
    const newIds = currentIds.includes(propertyId)
      ? currentIds.filter((id) => id !== propertyId)
      : [...currentIds, propertyId];
    form.setValue('propertyIds', newIds);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/admin/rates')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditMode ? 'Edit Rate Plan' : 'Create Rate Plan'}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode
              ? 'Update rate plan details and pricing strategy'
              : 'Configure a new rate plan with pricing rules and automation'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">
                <Info className="mr-2 h-4 w-4" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="pricing">
                <DollarSign className="mr-2 h-4 w-4" />
                Pricing
              </TabsTrigger>
              <TabsTrigger value="properties">
                <Building className="mr-2 h-4 w-4" />
                Properties
              </TabsTrigger>
              <TabsTrigger value="settings">
                <SettingsIcon className="mr-2 h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Basic Info */}
            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Enter the rate plan name, description, type, and status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rate Plan Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Best Available Rate (BAR)" {...field} />
                        </FormControl>
                        <FormDescription>
                          A clear, descriptive name for this rate plan
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe this rate plan, including any restrictions or special conditions..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Detailed description of the rate plan terms and conditions
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rate Plan Type *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="seasonal">Seasonal</SelectItem>
                              <SelectItem value="promotional">Promotional</SelectItem>
                              <SelectItem value="corporate">Corporate</SelectItem>
                              <SelectItem value="group">Group</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>Category of this rate plan</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>Current status of this rate plan</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2: Pricing */}
            <TabsContent value="pricing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing Configuration</CardTitle>
                  <CardDescription>
                    Set the base rate, pricing strategy, and rate constraints
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="baseRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Base Rate (per night) *</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0" placeholder="100" {...field} />
                          </FormControl>
                          <FormDescription>Starting rate before adjustments</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="USD">USD - US Dollar</SelectItem>
                              <SelectItem value="EUR">EUR - Euro</SelectItem>
                              <SelectItem value="GBP">GBP - British Pound</SelectItem>
                              <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                              <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>Currency for all pricing</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="pricingStrategy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pricing Strategy *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select strategy" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fixed">Fixed - Static rate</SelectItem>
                            <SelectItem value="dynamic">Dynamic - Rule-based adjustments</SelectItem>
                            <SelectItem value="occupancy-based">
                              Occupancy-Based - Adjusts with occupancy levels
                            </SelectItem>
                            <SelectItem value="demand-based">
                              Demand-Based - Responds to booking patterns
                            </SelectItem>
                            <SelectItem value="competitor-based">
                              Competitor-Based - Matches market positioning
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How rates are calculated and adjusted
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Rate Constraints</h4>
                    <p className="text-sm text-muted-foreground">
                      Set minimum and maximum rate limits to prevent extreme pricing
                    </p>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="minimumRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Minimum Rate (Floor)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="Optional"
                                {...field}
                              />
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
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="Optional"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>Highest allowed rate</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 3: Properties */}
            <TabsContent value="properties" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Property Selection</CardTitle>
                  <CardDescription>
                    Select which properties this rate plan applies to
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="propertyIds"
                    render={() => (
                      <FormItem>
                        <FormLabel>Properties *</FormLabel>
                        <div className="space-y-2">
                          {MOCK_PROPERTIES.map((property) => (
                            <div
                              key={property.id}
                              className="flex items-center space-x-3 rounded-md border p-4"
                            >
                              <Checkbox
                                checked={watchPropertyIds.includes(property.id)}
                                onCheckedChange={() => handlePropertyToggle(property.id)}
                              />
                              <div className="flex-1">
                                <p className="font-medium">{property.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Property ID: {property.id}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <FormDescription>
                          Select at least one property where this rate plan will be available
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchPropertyIds.length > 0 && (
                    <div className="rounded-lg bg-muted p-4">
                      <p className="text-sm font-medium">
                        Selected: {watchPropertyIds.length} propert
                        {watchPropertyIds.length === 1 ? 'y' : 'ies'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 4: Settings */}
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Settings</CardTitle>
                  <CardDescription>
                    Configure pricing modifiers, automation, and booking restrictions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Pricing Modifiers */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Pricing Modifiers</h4>

                    <FormField
                      control={form.control}
                      name="allowWeekendPricing"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Weekend Pricing</FormLabel>
                            <FormDescription>
                              Apply different rates on weekends (Friday-Saturday)
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {watchAllowWeekendPricing && (
                      <FormField
                        control={form.control}
                        name="weekendMultiplier"
                        render={({ field }) => (
                          <FormItem className="ml-6">
                            <FormLabel>Weekend Multiplier</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                min="0.1"
                                max="10"
                                placeholder="1.2"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Multiply base rate by this factor on weekends (e.g., 1.2 = 20% increase)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="allowSeasonalPricing"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Seasonal Pricing</FormLabel>
                            <FormDescription>
                              Allow date-range based seasonal rate adjustments
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="allowDynamicPricing"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Dynamic Pricing</FormLabel>
                            <FormDescription>
                              Allow pricing rules to adjust rates automatically
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* Automation */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Automation</h4>

                    <FormField
                      control={form.control}
                      name="automationEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Automation</FormLabel>
                            <FormDescription>
                              Automatically adjust rates based on occupancy, demand, and competition
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {watchPricingStrategy !== 'fixed' && (
                      <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
                        <p className="font-medium">Note:</p>
                        <p>
                          Automation settings can be configured after creating the rate plan in the
                          Automation Settings section.
                        </p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Booking Restrictions */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Booking Restrictions</h4>

                    <div className="grid gap-4 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="minimumStay"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Minimum Stay (nights)</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" placeholder="1" {...field} />
                            </FormControl>
                            <FormDescription>Min required nights</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="maximumStay"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Stay (nights)</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" placeholder="Optional" {...field} />
                            </FormControl>
                            <FormDescription>Max allowed nights</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="advanceBookingDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Advance Booking (days)</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" placeholder="Optional" {...field} />
                            </FormControl>
                            <FormDescription>Min days in advance</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => navigate('/admin/rates')}>
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
                      {isEditMode ? 'Update Rate Plan' : 'Create Rate Plan'}
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
