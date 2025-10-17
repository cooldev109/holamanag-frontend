import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, Search, RefreshCw, AlertCircle, Building2, MapPin } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { client } from '@/api/client';

interface PropertyRoom {
  _id: string;
  name: string;
}

interface PropertiesResponse {
  success?: boolean;
  data?: {
    properties?: Property[];
  };
  properties?: Property[];
}

interface Property {
  _id: string;
  name: string;
  type: string;
  status: string;
  address: {
    city: string;
    state: string;
    country: string;
  };
  rooms?: PropertyRoom[];
}

export const PropertyOversight = () => {
  const { t } = useTranslation(['supervisor', 'common']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await client.get('/properties') as PropertiesResponse;
      const data = response.data?.properties || response.data || [];
      setProperties(data as Property[]);
    } catch (err: unknown) {
      console.error('Failed to fetch properties:', err);
      const errorMessage = err instanceof Error ? err.message : t('common:error');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const filteredProperties = properties.filter(prop =>
    prop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prop.address.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: properties.length,
    active: properties.filter(p => p.status === 'active').length,
    inactive: properties.filter(p => p.status !== 'active').length,
    totalRooms: properties.reduce((sum, p) => sum + (p.rooms?.length || 0), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-blue-600 text-sm sm:text-base">{t('common:loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {t('supervisor:properties.title')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {t('supervisor:properties.subtitle')}
          </p>
        </div>
        
        <Button
          onClick={fetchProperties}
          disabled={loading}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          style={{ minHeight: '44px' }}
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
          {t('common:refresh')}
        </Button>
      </div>

      {/* View-Only Notice */}
      <Alert className="border-blue-200 bg-blue-50">
        <Eye className="h-4 w-4 text-blue-600 flex-shrink-0" />
        <AlertDescription className="text-blue-800 text-sm sm:text-base">
          {t('supervisor:properties.viewOnly')}
        </AlertDescription>
      </Alert>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4 bg-white">
          <p className="text-xs sm:text-sm text-gray-600">{t('supervisor:properties.totalProperties')}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </Card>
        <Card className="p-3 sm:p-4 bg-white">
          <p className="text-xs sm:text-sm text-gray-600">{t('supervisor:properties.activeProperties')}</p>
          <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
        </Card>
        <Card className="p-3 sm:p-4 bg-white">
          <p className="text-xs sm:text-sm text-gray-600">{t('supervisor:properties.inactiveProperties')}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-400 mt-1">{stats.inactive}</p>
        </Card>
        <Card className="p-3 sm:p-4 bg-white">
          <p className="text-xs sm:text-sm text-gray-600">{t('supervisor:properties.totalRooms')}</p>
          <p className="text-xl sm:text-2xl font-bold text-blue-600 mt-1">{stats.totalRooms}</p>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4 sm:p-6 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={t('supervisor:properties.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            style={{ minHeight: '44px' }}
          />
        </div>
      </Card>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredProperties.map((property) => (
          <Card key={property._id} className="p-4 sm:p-6 hover:shadow-lg transition-shadow bg-white">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-1 truncate">
                  {property.name}
                </h3>
                <span className={cn(
                  "inline-block px-2 py-1 rounded-full text-xs font-medium",
                  property.status === 'active'
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                )}>
                  {property.status}
                </span>
              </div>
              <Building2 className="w-8 h-8 text-blue-600 flex-shrink-0" />
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-gray-600 text-xs sm:text-sm">
                  {property.address.city}, {property.address.state}, {property.address.country}
                </p>
              </div>
              
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  {property.rooms?.length || 0} rooms | {property.type}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* No Data */}
      {filteredProperties.length === 0 && (
        <Card className="p-8 sm:p-12 bg-white">
          <p className="text-center text-gray-500 text-sm sm:text-base">
            {t('supervisor:properties.noData')}
          </p>
        </Card>
      )}
    </div>
  );
};

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

export default PropertyOversight;



