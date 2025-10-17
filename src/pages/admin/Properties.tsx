import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Building2, MapPin, Bed, Edit, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TableSkeleton, StatsCardsSkeleton } from '@/components/ui/loading-skeletons';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/hooks/use-toast';
import { getProperties, type Property } from '@/api/properties';
import type { PropertyStatus, PropertyType } from '@/types/property';

const PropertyStatusBadge: React.FC<{ status: PropertyStatus }> = ({ status }) => {
  const variants: Record<PropertyStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    active: { variant: 'default', label: 'Active' },
    inactive: { variant: 'secondary', label: 'Inactive' },
    maintenance: { variant: 'outline', label: 'Maintenance' },
    draft: { variant: 'secondary', label: 'Draft' },
    suspended: { variant: 'destructive', label: 'Suspended' },
  };

  const config = variants[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const PropertyTypeBadge: React.FC<{ type: PropertyType }> = ({ type }) => {
  const labels: Record<PropertyType, string> = {
    hotel: 'Hotel',
    apartment: 'Apartment',
    villa: 'Villa',
    hostel: 'Hostel',
    resort: 'Resort',
    house: 'House',
    bed_and_breakfast: 'B&B',
    guesthouse: 'Guesthouse',
  };

  return <Badge variant="outline">{labels[type]}</Badge>;
};

export const Properties: React.FC = () => {
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<PropertyType | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Fetch properties from API
  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProperties();
      setProperties(data);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
      toast({
        title: 'Error',
        description: 'Failed to load properties. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Filter and search properties
  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const addressString = typeof property.address === 'object' 
        ? `${property.address.city} ${property.address.state} ${property.address.country}`
        : property.address;
      
      const matchesSearch =
        property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        addressString.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
      const matchesType = typeFilter === 'all' || property.type === typeFilter || property.propertyType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [properties, searchQuery, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    return {
      total: properties.length,
      active: properties.filter(p => p.status === 'active').length,
      draft: properties.filter(p => p.status === 'suspended' || p.status === 'inactive').length,
      maintenance: properties.filter(p => p.status === 'maintenance').length,
      totalRooms: properties.reduce((sum, p) => sum + (p.rooms?.length || 0), 0),
    };
  }, [properties]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Property Management</h1>
          <p className="text-muted-foreground">
            Manage your properties, rooms, and amenities
          </p>
        </div>
        <Button asChild size="lg">
          <Link to="/admin/properties/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <StatsCardsSkeleton count={5} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Properties</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active</CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats.active}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Draft</CardDescription>
              <CardTitle className="text-3xl text-amber-600">{stats.draft}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Maintenance</CardDescription>
              <CardTitle className="text-3xl text-orange-600">{stats.maintenance}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Rooms</CardDescription>
              <CardTitle className="text-3xl">{stats.totalRooms}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      <div className="mb-8" />

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, city, or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as PropertyStatus | 'all')}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select
              value={typeFilter}
              onValueChange={(value) => setTypeFilter(value as PropertyType | 'all')}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="hotel">Hotel</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="hostel">Hostel</SelectItem>
                <SelectItem value="resort">Resort</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Properties Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <TableSkeleton rows={5} columns={6} />
            </div>
          ) : filteredProperties.length === 0 ? (
            <EmptyState
              icon={Building2}
              title={
                searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'No properties found'
                  : 'No properties yet'
              }
              description={
                searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your search or filters to find what you\'re looking for.'
                  : 'Get started by adding your first property to the system.'
              }
              action={
                !searchQuery && statusFilter === 'all' && typeFilter === 'all'
                  ? {
                      label: 'Add Property',
                      href: '/admin/properties/new'
                    }
                  : undefined
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Rooms</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{property.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {property.contact?.email || (typeof property.owner === 'object' && property.owner?.email) || ''}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <PropertyTypeBadge type={property.type || property.propertyType} />
                    </TableCell>
                    <TableCell>
                      <PropertyStatusBadge status={property.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {typeof property.address === 'object' 
                          ? `${property.address.city}, ${property.address.state}` 
                          : property.address}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 text-sm">
                        <Bed className="h-3 w-3 text-muted-foreground" />
                        {property.rooms?.length || 0}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <Link to={`/admin/properties/${property.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <Link to={`/admin/properties/${property.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
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

      {/* Results Count */}
      {filteredProperties.length > 0 && (
        <p className="text-sm text-muted-foreground mt-4">
          Showing {filteredProperties.length} of {properties.length} properties
        </p>
      )}
    </div>
  );
};

export default Properties;
