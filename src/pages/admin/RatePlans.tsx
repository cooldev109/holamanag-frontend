import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Copy,
  Archive,
  Trash2,
  TrendingUp,
  DollarSign,
  Zap,
  Activity,
  Calendar,
  BarChart3,
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
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

import type { RatePlan, RatePlanStatus, RatePlanType, PricingStrategy } from '@/types/rate';
import { MOCK_RATE_PLANS, MOCK_RATE_ANALYTICS } from '@/data/mockRates';

export default function RatePlans() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RatePlanStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<RatePlanType | 'all'>('all');
  const [strategyFilter, setStrategyFilter] = useState<PricingStrategy | 'all'>('all');

  // Mock data - in production, this would come from an API
  const ratePlans = MOCK_RATE_PLANS;
  const analytics = MOCK_RATE_ANALYTICS;

  // Calculate statistics
  const stats = useMemo(() => {
    const activePlans = ratePlans.filter((plan) => plan.status === 'active');
    const totalRevenue = analytics.reduce((sum, a) => sum + a.revenue, 0);
    const avgRevenue = totalRevenue / analytics.length || 0;
    const automatedPlans = ratePlans.filter((plan) => plan.automationEnabled);

    // Calculate average rate across all active plans
    const avgRate = activePlans.reduce((sum, plan) => sum + plan.baseRate, 0) / activePlans.length || 0;

    // Calculate total bookings from analytics
    const totalBookings = analytics.reduce((sum, a) => sum + a.bookings, 0);

    return {
      activePlans: activePlans.length,
      totalPlans: ratePlans.length,
      averageRate: avgRate,
      totalRevenue: totalRevenue,
      averageRevenue: avgRevenue,
      automatedPlans: automatedPlans.length,
      totalBookings: totalBookings,
    };
  }, [ratePlans, analytics]);

  // Filter rate plans
  const filteredPlans = useMemo(() => {
    return ratePlans.filter((plan) => {
      const matchesSearch =
        plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.type.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
      const matchesType = typeFilter === 'all' || plan.type === typeFilter;
      const matchesStrategy = strategyFilter === 'all' || plan.pricingStrategy === strategyFilter;

      return matchesSearch && matchesStatus && matchesType && matchesStrategy;
    });
  }, [ratePlans, searchQuery, statusFilter, typeFilter, strategyFilter]);

  // Handle actions
  const handleView = (id: string) => {
    navigate(`/admin/rates/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/rates/${id}/edit`);
  };

  const handleDuplicate = (id: string) => {
    // In production, this would create a copy and redirect to edit
  };

  const handleArchive = (id: string) => {
    // In production, this would update the status to 'archived'
  };

  const handleDelete = (id: string) => {
    // In production, this would show a confirmation dialog and delete
  };

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

  // Get type display name
  const getTypeDisplay = (type: RatePlanType): string => {
    const typeMap: Record<RatePlanType, string> = {
      standard: 'Standard',
      seasonal: 'Seasonal',
      promotional: 'Promotional',
      corporate: 'Corporate',
      group: 'Group',
    };
    return typeMap[type];
  };

  // Get strategy display name
  const getStrategyDisplay = (strategy: PricingStrategy): string => {
    const strategyMap: Record<PricingStrategy, string> = {
      fixed: 'Fixed',
      dynamic: 'Dynamic',
      'occupancy-based': 'Occupancy',
      'demand-based': 'Demand',
      'competitor-based': 'Competitor',
    };
    return strategyMap[strategy];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rate Plans</h1>
          <p className="text-muted-foreground">
            Manage pricing strategies and rate automation for your properties
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/rates/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Rate Plan
          </Link>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePlans}</div>
            <p className="text-xs text-muted-foreground">
              of {stats.totalPlans} total plans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.averageRate.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">per night (base rate)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              from {stats.totalBookings} bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automation</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.automatedPlans}</div>
            <p className="text-xs text-muted-foreground">plans with dynamic pricing</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Rate Plans</CardTitle>
          <CardDescription>Search and filter rate plans by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search rate plans..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as RatePlanStatus | 'all')}>
              <SelectTrigger>
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as RatePlanType | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="seasonal">Seasonal</SelectItem>
                <SelectItem value="promotional">Promotional</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
                <SelectItem value="group">Group</SelectItem>
              </SelectContent>
            </Select>

            <Select value={strategyFilter} onValueChange={(value) => setStrategyFilter(value as PricingStrategy | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Strategies</SelectItem>
                <SelectItem value="fixed">Fixed</SelectItem>
                <SelectItem value="dynamic">Dynamic</SelectItem>
                <SelectItem value="occupancy-based">Occupancy-Based</SelectItem>
                <SelectItem value="demand-based">Demand-Based</SelectItem>
                <SelectItem value="competitor-based">Competitor-Based</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rate Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Rate Plans</CardTitle>
          <CardDescription>
            {filteredPlans.length} rate plan{filteredPlans.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPlans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No rate plans found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your filters or create a new rate plan
              </p>
              <Button asChild>
                <Link to="/admin/rates/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Rate Plan
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rate Plan</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Base Rate</TableHead>
                    <TableHead>Strategy</TableHead>
                    <TableHead>Properties</TableHead>
                    <TableHead>Automation</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{plan.name}</span>
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {plan.description}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getTypeDisplay(plan.type)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(plan.status)}>
                          {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">${plan.baseRate}</span>
                          {plan.minimumRate && plan.maximumRate && (
                            <span className="text-xs text-muted-foreground">
                              ${plan.minimumRate} - ${plan.maximumRate}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStrategyDisplay(plan.pricingStrategy)}</TableCell>
                      <TableCell>
                        <span className="text-sm">{plan.propertyIds.length} properties</span>
                      </TableCell>
                      <TableCell>
                        {plan.automationEnabled ? (
                          <Badge className="bg-green-500">
                            <Zap className="mr-1 h-3 w-3" />
                            Enabled
                          </Badge>
                        ) : (
                          <Badge variant="outline">Disabled</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleView(plan.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(plan.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/admin/rates/${plan.id}/rules`)}>
                              <Filter className="mr-2 h-4 w-4" />
                              Configure Rules
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/admin/rates/${plan.id}/automation`)}>
                              <Zap className="mr-2 h-4 w-4" />
                              Automation Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/admin/rates/${plan.id}/analytics`)}>
                              <BarChart3 className="mr-2 h-4 w-4" />
                              Analytics
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate('/admin/rates/calendar')}>
                              <Calendar className="mr-2 h-4 w-4" />
                              View Calendar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(plan.id)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleArchive(plan.id)}>
                              <Archive className="mr-2 h-4 w-4" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(plan.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
