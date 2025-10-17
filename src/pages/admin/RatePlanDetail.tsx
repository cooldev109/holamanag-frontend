import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Archive,
  Copy,
  Trash2,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Zap,
  Settings,
  Filter,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Building,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

import type { RatePlan, RatePlanStatus } from '@/types/rate';
import {
  getRatePlanById,
  getAutomationSettings,
  getRateAnalytics,
  MOCK_RATE_MODIFIERS,
} from '@/data/mockRates';

export default function RatePlanDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [ratePlan, setRatePlan] = useState<RatePlan | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Load rate plan data
  useEffect(() => {
    if (id) {
      const plan = getRatePlanById(id);
      if (plan) {
        setRatePlan(plan);
      } else {
        toast.error('Rate plan not found');
        navigate('/admin/rates');
      }
    }
  }, [id, navigate]);

  if (!ratePlan) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-muted-foreground">Loading rate plan...</p>
        </div>
      </div>
    );
  }

  const automationSettings = getAutomationSettings(ratePlan.id);
  const analytics = getRateAnalytics(ratePlan.id);

  // Get status badge variant
  const getStatusBadge = (status: RatePlanStatus) => {
    const variants: Record<RatePlanStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'secondary',
      draft: 'outline',
      archived: 'destructive',
    };
    return variants[status] || 'default';
  };

  // Handle actions
  const handleEdit = () => {
    navigate(`/admin/rates/${ratePlan.id}/edit`);
  };

  const handleDuplicate = () => {
    toast.success('Rate plan duplicated successfully');
  };

  const handleArchive = () => {
    toast.success('Rate plan archived successfully');
    navigate('/admin/rates');
  };

  const handleDelete = () => {
    toast.success('Rate plan deleted successfully');
    navigate('/admin/rates');
  };

  const handleRuleToggle = (ruleId: string, enabled: boolean) => {
    toast.success(`Rule ${enabled ? 'enabled' : 'disabled'} successfully`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/admin/rates')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{ratePlan.name}</h1>
              <Badge variant={getStatusBadge(ratePlan.status)}>
                {ratePlan.status.charAt(0).toUpperCase() + ratePlan.status.slice(1)}
              </Badge>
            </div>
            <p className="text-muted-foreground">{ratePlan.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Archive Rate Plan?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will archive the rate plan "{ratePlan.name}". It will no longer be available
                  for new bookings but existing bookings will not be affected.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleArchive}>Archive</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Rate Plan?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the rate plan "{ratePlan.name}". This action cannot
                  be undone. All associated rules and settings will be deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600">
                  Delete Permanently
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rules">
            Rules ({ratePlan.rules.length})
          </TabsTrigger>
          {analytics && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Base Rate</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${ratePlan.baseRate}</div>
                <p className="text-xs text-muted-foreground">per night</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Properties</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ratePlan.propertyIds.length}</div>
                <p className="text-xs text-muted-foreground">active properties</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pricing Rules</CardTitle>
                <Filter className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ratePlan.rules.length}</div>
                <p className="text-xs text-muted-foreground">
                  {ratePlan.rules.filter((r) => r.enabled).length} enabled
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Automation</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {ratePlan.automationEnabled ? 'Enabled' : 'Disabled'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {ratePlan.pricingStrategy} pricing
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Basic Info */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <div className="text-sm font-medium text-muted-foreground">Rate Plan Type</div>
                  <div className="text-sm">
                    {ratePlan.type.charAt(0).toUpperCase() + ratePlan.type.slice(1)}
                  </div>
                </div>

                <Separator />

                <div className="grid gap-2">
                  <div className="text-sm font-medium text-muted-foreground">Currency</div>
                  <div className="text-sm">{ratePlan.currency}</div>
                </div>

                <Separator />

                <div className="grid gap-2">
                  <div className="text-sm font-medium text-muted-foreground">Pricing Strategy</div>
                  <div className="text-sm">
                    {ratePlan.pricingStrategy.charAt(0).toUpperCase() +
                      ratePlan.pricingStrategy.slice(1).replace(/-/g, ' ')}
                  </div>
                </div>

                <Separator />

                <div className="grid gap-2">
                  <div className="text-sm font-medium text-muted-foreground">Created</div>
                  <div className="text-sm">
                    {new Date(ratePlan.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>

                <Separator />

                <div className="grid gap-2">
                  <div className="text-sm font-medium text-muted-foreground">Last Updated</div>
                  <div className="text-sm">
                    {new Date(ratePlan.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <div className="text-sm font-medium text-muted-foreground">Base Rate</div>
                  <div className="text-2xl font-bold">${ratePlan.baseRate} / night</div>
                </div>

                {(ratePlan.minimumRate || ratePlan.maximumRate) && (
                  <>
                    <Separator />
                    <div className="grid gap-2">
                      <div className="text-sm font-medium text-muted-foreground">Rate Range</div>
                      <div className="text-sm">
                        ${ratePlan.minimumRate || 'No min'} - ${ratePlan.maximumRate || 'No max'}
                      </div>
                    </div>
                  </>
                )}

                {ratePlan.allowWeekendPricing && (
                  <>
                    <Separator />
                    <div className="grid gap-2">
                      <div className="text-sm font-medium text-muted-foreground">Weekend Rate</div>
                      <div className="text-sm">
                        ${(ratePlan.baseRate * (ratePlan.weekendMultiplier || 1)).toFixed(2)} / night
                        <span className="text-muted-foreground ml-2">
                          ({ratePlan.weekendMultiplier}x multiplier)
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Features</div>
                  <div className="flex flex-wrap gap-2">
                    {ratePlan.allowWeekendPricing && (
                      <Badge variant="outline">Weekend Pricing</Badge>
                    )}
                    {ratePlan.allowSeasonalPricing && (
                      <Badge variant="outline">Seasonal Pricing</Badge>
                    )}
                    {ratePlan.allowDynamicPricing && (
                      <Badge variant="outline">Dynamic Pricing</Badge>
                    )}
                    {ratePlan.automationEnabled && (
                      <Badge variant="outline" className="bg-green-50">
                        <Zap className="mr-1 h-3 w-3" />
                        Automation
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Restrictions */}
          {(ratePlan.minimumStay || ratePlan.maximumStay || ratePlan.advanceBookingDays) && (
            <Card>
              <CardHeader>
                <CardTitle>Booking Restrictions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {ratePlan.minimumStay && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">
                        Minimum Stay
                      </div>
                      <div className="text-2xl font-bold">{ratePlan.minimumStay} nights</div>
                    </div>
                  )}

                  {ratePlan.maximumStay && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">
                        Maximum Stay
                      </div>
                      <div className="text-2xl font-bold">{ratePlan.maximumStay} nights</div>
                    </div>
                  )}

                  {ratePlan.advanceBookingDays && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">
                        Advance Booking
                      </div>
                      <div className="text-2xl font-bold">{ratePlan.advanceBookingDays} days</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Links */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <Link to={`/admin/rates/${ratePlan.id}/rules`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Filter className="h-8 w-8 text-blue-500" />
                    <div>
                      <CardTitle className="text-base">Configure Rules</CardTitle>
                      <CardDescription>Manage pricing rules and modifiers</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Link>
            </Card>

            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <Link to={`/admin/rates/${ratePlan.id}/automation`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Zap className="h-8 w-8 text-green-500" />
                    <div>
                      <CardTitle className="text-base">Automation Settings</CardTitle>
                      <CardDescription>Configure dynamic pricing rules</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Link>
            </Card>

            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <Link to={`/admin/rates/${ratePlan.id}/analytics`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-8 w-8 text-purple-500" />
                    <div>
                      <CardTitle className="text-base">View Analytics</CardTitle>
                      <CardDescription>Performance metrics and trends</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Link>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Rules */}
        <TabsContent value="rules" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pricing Rules</CardTitle>
                  <CardDescription>
                    Manage conditional rules that adjust pricing based on various factors
                  </CardDescription>
                </div>
                <Button asChild>
                  <Link to={`/admin/rates/${ratePlan.id}/rules`}>
                    <Settings className="mr-2 h-4 w-4" />
                    Configure Rules
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {ratePlan.rules.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Filter className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No pricing rules</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add rules to automatically adjust rates based on dates, occupancy, and more
                  </p>
                  <Button asChild>
                    <Link to={`/admin/rates/${ratePlan.id}/rules`}>Add First Rule</Link>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rule Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Modifiers</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ratePlan.rules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">{rule.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {rule.ruleType.charAt(0).toUpperCase() +
                              rule.ruleType.slice(1).replace(/-/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge>{rule.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          {rule.modifiers.map((mod) => (
                            <Badge key={mod.id} variant="secondary" className="mr-1">
                              {mod.type === 'percentage'
                                ? `${mod.value > 0 ? '+' : ''}${mod.value}%`
                                : `${mod.value > 0 ? '+' : ''}$${Math.abs(mod.value)}`}
                            </Badge>
                          ))}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={(checked) => handleRuleToggle(rule.id, checked)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/admin/rates/${ratePlan.id}/rules`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          {analytics ? (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${analytics.averageRate}</div>
                    <div className="flex items-center text-xs text-green-600 mt-1">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      +{analytics.comparisonToPrevious?.averageRate}% vs last period
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${analytics.revenue.toLocaleString()}</div>
                    <div className="flex items-center text-xs text-green-600 mt-1">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      +{analytics.comparisonToPrevious?.revenue}% vs last period
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Bookings</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.bookings}</div>
                    <p className="text-xs text-muted-foreground">total bookings</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Occupancy</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.occupancyRate}%</div>
                    <Progress value={analytics.occupancyRate} className="mt-2" />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Full Analytics Dashboard</CardTitle>
                  <CardDescription>
                    View detailed performance metrics, trends, and comparisons
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild>
                    <Link to={`/admin/rates/${ratePlan.id}/analytics`}>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Open Analytics Dashboard
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No analytics data available</h3>
                <p className="text-sm text-muted-foreground">
                  Analytics will be available once this rate plan has bookings
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab 4: Settings */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rate Plan Settings</CardTitle>
              <CardDescription>Current configuration for this rate plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">Pricing Features</h4>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Weekend Pricing</p>
                      <p className="text-sm text-muted-foreground">
                        {ratePlan.allowWeekendPricing
                          ? `${ratePlan.weekendMultiplier}x multiplier`
                          : 'Disabled'}
                      </p>
                    </div>
                    {ratePlan.allowWeekendPricing ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Seasonal Pricing</p>
                      <p className="text-sm text-muted-foreground">
                        {ratePlan.allowSeasonalPricing ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                    {ratePlan.allowSeasonalPricing ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Dynamic Pricing</p>
                      <p className="text-sm text-muted-foreground">
                        {ratePlan.allowDynamicPricing ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                    {ratePlan.allowDynamicPricing ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Automation</h4>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Automation Status</p>
                      <p className="text-sm text-muted-foreground">
                        {ratePlan.automationEnabled ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    {ratePlan.automationEnabled ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>

                  {automationSettings && (
                    <>
                      <div className="rounded-lg border p-4 space-y-2">
                        <p className="font-medium text-sm">Occupancy-Based</p>
                        <Badge variant={automationSettings.occupancyBased.enabled ? 'default' : 'outline'}>
                          {automationSettings.occupancyBased.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>

                      <div className="rounded-lg border p-4 space-y-2">
                        <p className="font-medium text-sm">Demand-Based</p>
                        <Badge variant={automationSettings.demandBased.enabled ? 'default' : 'outline'}>
                          {automationSettings.demandBased.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>

                      <div className="rounded-lg border p-4 space-y-2">
                        <p className="font-medium text-sm">Time-Based</p>
                        <Badge variant={automationSettings.timeBased.enabled ? 'default' : 'outline'}>
                          {automationSettings.timeBased.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </>
                  )}

                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/admin/rates/${ratePlan.id}/automation`}>
                      <Settings className="mr-2 h-4 w-4" />
                      Configure Automation
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
