import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Save,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

import type { PricingRule, RuleType } from '@/types/rate';
import { getRatePlanById, MOCK_RATE_MODIFIERS } from '@/data/mockRates';

// Validation schema for rule form
const ruleFormSchema = z.object({
  name: z.string().min(3, 'Rule name must be at least 3 characters'),
  ruleType: z.enum(['date-range', 'day-of-week', 'occupancy-level', 'advance-booking', 'minimum-stay', 'maximum-stay']),
  enabled: z.boolean(),
  priority: z.coerce.number().min(1).max(10),

  // Date range
  dateStart: z.string().optional(),
  dateEnd: z.string().optional(),

  // Days of week
  daysOfWeek: z.array(z.number()).optional(),

  // Occupancy
  occupancyMin: z.coerce.number().min(0).max(100).optional(),
  occupancyMax: z.coerce.number().min(0).max(100).optional(),

  // Advance booking
  advanceMin: z.coerce.number().min(0).optional(),
  advanceMax: z.coerce.number().min(0).optional(),

  // Stay length
  stayLength: z.coerce.number().min(1).optional(),

  // Modifiers
  selectedModifiers: z.array(z.string()).min(1, 'At least one modifier must be selected'),
});

type RuleFormValues = z.infer<typeof ruleFormSchema>;

export default function RateRuleConfig() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  const [rules, setRules] = useState<PricingRule[]>([]);

  const ratePlan = id ? getRatePlanById(id) : null;

  // Load rules
  useEffect(() => {
    if (ratePlan) {
      setRules(ratePlan.rules);
    }
  }, [ratePlan]);

  // Form setup
  const form = useForm<RuleFormValues>({
    resolver: zodResolver(ruleFormSchema),
    defaultValues: {
      name: '',
      ruleType: 'date-range',
      enabled: true,
      priority: 5,
      selectedModifiers: [],
      daysOfWeek: [],
    },
  });

  // Watch rule type to show/hide conditional fields
  const watchRuleType = form.watch('ruleType');

  // Handle add new rule
  const handleAddRule = () => {
    setEditingRule(null);
    form.reset({
      name: '',
      ruleType: 'date-range',
      enabled: true,
      priority: 5,
      selectedModifiers: [],
      daysOfWeek: [],
    });
    setDialogOpen(true);
  };

  // Handle edit rule
  const handleEditRule = (rule: PricingRule) => {
    setEditingRule(rule);

    // Pre-fill form
    form.reset({
      name: rule.name,
      ruleType: rule.ruleType,
      enabled: rule.enabled,
      priority: rule.priority,
      dateStart: rule.dateRange?.start,
      dateEnd: rule.dateRange?.end,
      daysOfWeek: rule.daysOfWeek || [],
      occupancyMin: rule.occupancyRange?.min,
      occupancyMax: rule.occupancyRange?.max,
      advanceMin: rule.advanceBookingDays?.min,
      advanceMax: rule.advanceBookingDays?.max,
      stayLength: rule.minimumStay || rule.maximumStay,
      selectedModifiers: rule.modifiers.map((m) => m.id),
    });

    setDialogOpen(true);
  };

  // Handle save rule
  const onSubmit = (data: RuleFormValues) => {
    if (editingRule) {
      toast.success('Rule updated successfully');
    } else {
      toast.success('Rule created successfully');
    }

    setDialogOpen(false);
    form.reset();
  };

  // Handle delete rule
  const handleDeleteRule = (ruleId: string) => {
    setRules(rules.filter((r) => r.id !== ruleId));
    toast.success('Rule deleted successfully');
  };

  // Handle toggle rule
  const handleToggleRule = (ruleId: string, enabled: boolean) => {
    toast.success(`Rule ${enabled ? 'enabled' : 'disabled'}`);
  };

  // Handle priority change
  const handlePriorityChange = (ruleId: string, direction: 'up' | 'down') => {
    toast.success('Rule priority updated');
  };

  // Get rule type display name
  const getRuleTypeDisplay = (type: RuleType): string => {
    const typeMap: Record<RuleType, string> = {
      'date-range': 'Date Range',
      'day-of-week': 'Day of Week',
      'occupancy-level': 'Occupancy Level',
      'advance-booking': 'Advance Booking',
      'minimum-stay': 'Minimum Stay',
      'maximum-stay': 'Maximum Stay',
    };
    return typeMap[type];
  };

  // Toggle day of week
  const toggleDayOfWeek = (day: number) => {
    const currentDays = form.getValues('daysOfWeek') || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];
    form.setValue('daysOfWeek', newDays);
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

  const watchSelectedModifiers = form.watch('selectedModifiers') || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(`/admin/rates/${id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pricing Rules</h1>
            <p className="text-muted-foreground">{ratePlan.name}</p>
          </div>
        </div>
        <Button onClick={handleAddRule}>
          <Plus className="mr-2 h-4 w-4" />
          Add Rule
        </Button>
      </div>

      {/* Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Pricing Rules</CardTitle>
          <CardDescription>
            Rules are applied in priority order (higher numbers first). Enable/disable rules to
            control pricing behavior.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-4">No pricing rules configured</p>
              <Button onClick={handleAddRule}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Rule
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Rule Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Modifiers</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules
                  .sort((a, b) => b.priority - a.priority)
                  .map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => handlePriorityChange(rule.id, 'up')}
                          >
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => handlePriorityChange(rule.id, 'down')}
                          >
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{rule.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getRuleTypeDisplay(rule.ruleType)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge>{rule.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {rule.modifiers.map((mod) => (
                            <Badge key={mod.id} variant="secondary">
                              {mod.type === 'percentage'
                                ? `${mod.value > 0 ? '+' : ''}${mod.value}%`
                                : `${mod.value > 0 ? '+' : ''}$${Math.abs(mod.value)}`}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditRule(rule)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteRule(rule.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Rule Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Edit Pricing Rule' : 'Add Pricing Rule'}</DialogTitle>
            <DialogDescription>
              Configure conditions and modifiers for this pricing rule
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Basic Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rule Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Summer Peak Season" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ruleType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rule Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="date-range">Date Range</SelectItem>
                          <SelectItem value="day-of-week">Day of Week</SelectItem>
                          <SelectItem value="occupancy-level">Occupancy Level</SelectItem>
                          <SelectItem value="advance-booking">Advance Booking</SelectItem>
                          <SelectItem value="minimum-stay">Minimum Stay</SelectItem>
                          <SelectItem value="maximum-stay">Maximum Stay</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority (1-10) *</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="10" {...field} />
                      </FormControl>
                      <FormDescription>Higher numbers = higher priority</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Enabled</FormLabel>
                        <FormDescription>Rule is active</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Conditional Fields */}
              {watchRuleType === 'date-range' && (
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="dateStart"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateEnd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {watchRuleType === 'day-of-week' && (
                <FormItem>
                  <FormLabel>Days of Week</FormLabel>
                  <div className="flex gap-2 flex-wrap">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant={
                          (form.watch('daysOfWeek') || []).includes(index) ? 'default' : 'outline'
                        }
                        size="sm"
                        onClick={() => toggleDayOfWeek(index)}
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                  <FormDescription>Select the days when this rule applies</FormDescription>
                  <FormMessage />
                </FormItem>
              )}

              {watchRuleType === 'occupancy-level' && (
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="occupancyMin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Occupancy (%)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="100" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="occupancyMax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Occupancy (%)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="100" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {watchRuleType === 'advance-booking' && (
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="advanceMin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Days in Advance</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="advanceMax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Days in Advance</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {(watchRuleType === 'minimum-stay' || watchRuleType === 'maximum-stay') && (
                <FormField
                  control={form.control}
                  name="stayLength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Nights</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormDescription>
                        {watchRuleType === 'minimum-stay' ? 'Minimum' : 'Maximum'} length of stay
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Modifiers */}
              <FormField
                control={form.control}
                name="selectedModifiers"
                render={() => (
                  <FormItem>
                    <FormLabel>Rate Modifiers *</FormLabel>
                    <FormDescription>
                      Select the modifiers to apply when this rule matches
                    </FormDescription>
                    <div className="space-y-2 mt-2">
                      {MOCK_RATE_MODIFIERS.map((modifier) => (
                        <div
                          key={modifier.id}
                          className="flex items-center space-x-3 rounded-md border p-3"
                        >
                          <Checkbox
                            checked={watchSelectedModifiers.includes(modifier.id)}
                            onCheckedChange={(checked) => {
                              const current = watchSelectedModifiers;
                              const newValue = checked
                                ? [...current, modifier.id]
                                : current.filter((id) => id !== modifier.id);
                              form.setValue('selectedModifiers', newValue);
                            }}
                          />
                          <div className="flex-1">
                            <p className="font-medium">{modifier.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {modifier.type === 'percentage'
                                ? `${modifier.value > 0 ? '+' : ''}${modifier.value}%`
                                : `${modifier.value > 0 ? '+' : ''}$${Math.abs(modifier.value)}`}
                              {modifier.applyToBaseRate ? ' on base rate' : ''}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  {editingRule ? 'Update Rule' : 'Create Rule'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
