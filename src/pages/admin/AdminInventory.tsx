import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { getInventory, patchInventoryBulk } from '@/api/client';
import { shortDate } from '@/i18n/format';
import { Calendar, Settings, Save, Wifi } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getProperties, type Property } from '@/api/properties';
import websocketService from '@/services/websocket';

interface ChannelBooking {
  channel: string;
  status: string;
  bookingId?: string;
  guestName?: string;
}

interface ChannelRate {
  channel: string;
  rate: number;
  currency: string;
}

interface InventoryDay {
  date: string;
  allotment: number;        // Total rooms (constant across all channels)
  booked: number;           // Total booked across ALL channels
  blocked: number;          // Blocked rooms
  available: number;        // Available: allotment - booked - blocked
  rate: number;             // Average or channel-specific rate
  minStay: number;
  maxStay: number;
  stopSell: boolean;
  channels?: ChannelBooking[];      // Breakdown by channel
  channelBooked?: number;           // Booked on THIS channel only
  channelRates?: ChannelRate[];     // Rates per channel
}

interface RoomInventory {
  roomId: string;
  roomCode: string;
  roomName?: string;
  roomType?: string;
  totalRooms?: number;      // Total physical rooms
  availability: InventoryDay[];
}

// OTA Channel types
type OTAChannel = 'total' | 'airbnb' | 'booking' | 'expedia' | 'agoda' | 'vrbo';

interface Channel {
  _id: string;
  name: string;
  type: string;
  displayName: string;
  isActive: boolean;
}

// WebSocket event data types
interface BookingCreatedData {
  propertyId: string;
  roomId: string;
  dates: string[];
  channel: string;
  guestName: string;
}

interface InventoryUpdatedData {
  propertyId: string;
  roomId: string;
  date: string;
  totalRooms: number;
  availableRooms: number;
  bookedRooms: number;
}

// OTA brand colors mapping
const OTA_COLORS: Record<string, string> = {
  airbnb: '#FF5A5F',
  booking: '#003580',
  expedia: '#FFCB08',
  agoda: '#D7003A',
  vrbo: '#0088CE',
};

export const AdminInventory: React.FC = () => {
  const { t } = useTranslation(['admin', 'common']);
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(true);
  const [inventory, setInventory] = useState<RoomInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedOTA, setSelectedOTA] = useState<OTAChannel>('total');
  const [dateWindow, setDateWindow] = useState(30);
  
  // Bulk edit state
  const [bulkEdit, setBulkEdit] = useState({
    allotment: '',
    minStay: '',
    maxStay: '',
    stopSell: false,
  });
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [isBulkSaving, setIsBulkSaving] = useState(false);

  const fetchPropertiesData = useCallback(async () => {
    setPropertiesLoading(true);
    try {
      const data = await getProperties();
      setProperties(data);
      // Set first property as default
      if (data.length > 0) {
        setSelectedProperty(data[0].id || data[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
      toast({
        title: 'Error',
        description: 'Failed to load properties. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setPropertiesLoading(false);
    }
  }, [toast]);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + dateWindow);

      const params = {
        propertyId: selectedProperty,
        from: new Date().toISOString().split('T')[0],
        to: endDate.toISOString().split('T')[0],
        channel: selectedOTA === 'total' ? undefined : selectedOTA, // Only send channel if not 'total'
      };

      const response = await getInventory(params) as any;
      // Extract data array from API response
      const data = response.data || response;
      setInventory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      toast({
        title: 'Error',
        description: 'Failed to load inventory. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedProperty, selectedOTA, dateWindow, toast]);

  // Fetch properties and channels on mount
  useEffect(() => {
    fetchPropertiesData();
    fetchChannels();
  }, [fetchPropertiesData]);

  // Fetch inventory when property, OTA, or date window changes
  useEffect(() => {
    if (selectedProperty) {
      fetchInventory();
    }
  }, [selectedProperty, fetchInventory]);

  // WebSocket integration for real-time updates
  useEffect(() => {
    // Connect to WebSocket
    websocketService.connect();

    // Join property room if a property is selected
    if (selectedProperty) {
      websocketService.joinProperty(selectedProperty);
    }

    // Listen for booking created events
    const handleBookingCreated = (data: BookingCreatedData) => {
      toast({
        title: `${t('newBooking', 'New Booking')}!`,
        description: `${data.guestName} booked via ${data.channel}`,
        duration: 5000,
      });

      // Refresh inventory data
      if (selectedProperty === data.propertyId) {
        fetchInventory();
      }
    };

    // Listen for inventory updated events
    const handleInventoryUpdated = (data: InventoryUpdatedData) => {
      // Refresh inventory if it's for the current property
      if (selectedProperty === data.propertyId) {
        fetchInventory();
      }
    };

    websocketService.onBookingCreatedGlobal(handleBookingCreated);
    websocketService.onInventoryUpdated(handleInventoryUpdated);

    // Cleanup
    return () => {
      websocketService.off('booking:created:global', handleBookingCreated);
      websocketService.off('inventory:updated', handleInventoryUpdated);
      
      if (selectedProperty) {
        websocketService.leaveProperty(selectedProperty);
      }
    };
  }, [selectedProperty, toast, t, fetchInventory]);

  const fetchChannels = async () => {
    setChannelsLoading(true);
    try {
      // Fetch active channels from backend
      const response = await fetch('http://localhost:3000/api/v1/channels?isActive=true', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch channels');
      }
      
      const result = await response.json();
      const channelData = result.data?.channels || result.data || [];
      setChannels(channelData);
    } catch (error) {
      console.error('Failed to fetch channels:', error);
      // Don't show error toast for channels, just use empty array
      setChannels([]);
    } finally {
      setChannelsLoading(false);
    }
  };

  const handleBulkSave = async () => {
    if (selectedCells.size === 0) {
      toast({
        title: 'No cells selected',
        description: 'Please select cells to edit',
        variant: 'destructive',
      });
      return;
    }

    setIsBulkSaving(true);
    try {
      const payload = {
        cells: Array.from(selectedCells),
        updates: {
          ...(bulkEdit.allotment && { allotment: parseInt(bulkEdit.allotment) }),
          ...(bulkEdit.minStay && { minStay: parseInt(bulkEdit.minStay) }),
          ...(bulkEdit.maxStay && { maxStay: parseInt(bulkEdit.maxStay) }),
          stopSell: bulkEdit.stopSell,
        },
      };

      const result = await patchInventoryBulk(payload) as { success: boolean; updated: number };
      
      if (result.success) {
        toast({
          title: t('admin:toast.saved'),
          description: `Updated ${result.updated} cells`,
        });
        setSelectedCells(new Set());
        setBulkEdit({
          allotment: '',
          minStay: '',
          maxStay: '',
          stopSell: false,
        });
        await fetchInventory(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to save bulk changes:', error);
      toast({
        title: t('common:status.error'),
        description: 'Failed to save changes',
        variant: 'destructive',
      });
    } finally {
      setIsBulkSaving(false);
    }
  };

  const getCellId = (roomId: string, date: string) => `${roomId}-${date}`;

  const toggleCellSelection = (roomId: string, date: string) => {
    const cellId = getCellId(roomId, date);
    const newSelection = new Set(selectedCells);
    
    if (newSelection.has(cellId)) {
      newSelection.delete(cellId);
    } else {
      newSelection.add(cellId);
    }
    
    setSelectedCells(newSelection);
  };

  const getAvailabilityColor = (day: InventoryDay) => {
    const available = day.available ?? (day.allotment - day.booked);
    if (day.stopSell) return 'bg-destructive/20 text-destructive-foreground';
    if (available <= 0) return 'bg-warning/20 text-warning-foreground';
    if (available <= 2) return 'bg-secondary text-secondary-foreground';
    return 'bg-background';
  };

  const dates = inventory[0]?.availability.map(day => day.date) || [];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t('admin:inventory.title')}</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage availability and pricing across all channels</p>
      </div>

      {/* Controls */}
      <Card className="mb-4 sm:mb-6">
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col gap-4">
            {/* Property, OTA Channel and Date Window - Stack on mobile, row on tablet+ */}
            <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
              <div className="flex-1 w-full">
                <Label htmlFor="property" className="text-sm sm:text-base">{t('admin:inventory.property')}</Label>
                <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                  <SelectTrigger className="w-full h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {propertiesLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading properties...
                      </SelectItem>
                    ) : properties.length === 0 ? (
                      <SelectItem value="no-properties" disabled>
                        No properties available
                      </SelectItem>
                    ) : (
                      properties.map((property) => (
                        <SelectItem key={property.id || property._id} value={property.id || property._id}>
                          {property.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-auto sm:min-w-[160px]">
                <Label htmlFor="ota-channel" className="text-sm sm:text-base">OTA Channel</Label>
                <Select value={selectedOTA} onValueChange={(value) => setSelectedOTA(value as OTAChannel)}>
                  <SelectTrigger className="w-full h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Total option - always available */}
                    <SelectItem value="total">
                      <span className="font-medium">Total (All Channels)</span>
                    </SelectItem>
                    
                    {/* Dynamic channels from database */}
                    {channelsLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading channels...
                      </SelectItem>
                    ) : channels.length === 0 ? (
                      <SelectItem value="no-channels" disabled>
                        No channels configured
                      </SelectItem>
                    ) : (
                      channels.map((channel) => (
                        <SelectItem key={channel._id} value={channel.type}>
                          <div className="flex items-center gap-2">
                            {OTA_COLORS[channel.type] && (
                              <div 
                                className="w-2 h-2 rounded-full flex-shrink-0" 
                                style={{ backgroundColor: OTA_COLORS[channel.type] }}
                              ></div>
                            )}
                            <span>{channel.displayName || channel.name}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-auto sm:min-w-[140px]">
                <Label htmlFor="window" className="text-sm sm:text-base">{t('admin:inventory.window')}</Label>
                <Select value={dateWindow.toString()} onValueChange={(value) => setDateWindow(parseInt(value))}>
                  <SelectTrigger className="w-full h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bulk Edit Button - Full width on mobile */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto gap-2 h-11">
                  <Settings className="h-4 w-4" />
                  <span className="hidden xs:inline">{t('admin:inventory.bulk.title')}</span>
                  <span className="xs:hidden">Bulk Edit</span>
                  <span className="ml-1">({selectedCells.size})</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="text-lg sm:text-xl">{t('admin:inventory.bulk.title')}</SheetTitle>
                </SheetHeader>
                
                <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                  <div className="text-sm text-muted-foreground px-1">
                    <span className="font-medium">{selectedCells.size}</span> cells selected
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="bulk-allotment" className="text-sm">{t('admin:inventory.bulk.allotment')}</Label>
                      <Input
                        id="bulk-allotment"
                        type="number"
                        placeholder="Leave empty to skip"
                        className="h-11 mt-1.5"
                        value={bulkEdit.allotment}
                        onChange={(e) => setBulkEdit(prev => ({ ...prev, allotment: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="bulk-min-stay" className="text-sm">{t('admin:inventory.bulk.minStay')}</Label>
                      <Input
                        id="bulk-min-stay"
                        type="number"
                        placeholder="Leave empty to skip"
                        className="h-11 mt-1.5"
                        value={bulkEdit.minStay}
                        onChange={(e) => setBulkEdit(prev => ({ ...prev, minStay: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="bulk-max-stay" className="text-sm">{t('admin:inventory.bulk.maxStay')}</Label>
                      <Input
                        id="bulk-max-stay"
                        type="number"
                        placeholder="Leave empty to skip"
                        className="h-11 mt-1.5"
                        value={bulkEdit.maxStay}
                        onChange={(e) => setBulkEdit(prev => ({ ...prev, maxStay: e.target.value }))}
                      />
                    </div>

                    <div className="flex items-center space-x-3 py-2 px-1">
                      <Switch
                        id="bulk-stop-sell"
                        checked={bulkEdit.stopSell}
                        onCheckedChange={(checked) => setBulkEdit(prev => ({ ...prev, stopSell: checked }))}
                      />
                      <Label htmlFor="bulk-stop-sell" className="text-sm cursor-pointer flex-1">
                        {t('admin:inventory.bulk.stopSell')}
                      </Label>
                    </div>
                  </div>

                  <Button
                    onClick={handleBulkSave}
                    disabled={selectedCells.size === 0 || isBulkSaving}
                    className="w-full gap-2 h-11 text-base"
                  >
                    <Save className="h-4 w-4" />
                    {isBulkSaving ? t('common:status.loading') : t('admin:inventory.bulk.apply')}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Grid */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Calendar className="h-5 w-5" />
                <span>Inventory Grid</span>
              </CardTitle>
              {/* Current Channel Indicator */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Viewing:</span>
                {selectedOTA === 'total' ? (
                  <span className="font-medium text-primary">Total (All Channels)</span>
                ) : (
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    {OTA_COLORS[selectedOTA] && (
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: OTA_COLORS[selectedOTA] }}
                      ></div>
                    )}
                    <span>
                      {channels.find(ch => ch.type === selectedOTA)?.displayName || 
                       (selectedOTA === 'booking' ? 'Booking.com' : selectedOTA.charAt(0).toUpperCase() + selectedOTA.slice(1))}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Channel Relationship Info - Updated for shared inventory model */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                {selectedOTA === 'total' ? (
                  <>
                    <p className="text-xs sm:text-sm font-medium text-blue-900">
                      Shared Inventory Model
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      The same rooms are listed on ALL channels: {' '}
                      {channels.map((ch, idx) => (
                        <span key={ch._id}>
                          <span className="inline-flex items-center gap-1">
                            <span 
                              className="inline-block w-1.5 h-1.5 rounded-full" 
                              style={{ backgroundColor: OTA_COLORS[ch.type] }}
                            ></span>
                            <span className="font-medium">{ch.displayName}</span>
                          </span>
                          {idx < channels.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      <span className="font-semibold">Example:</span> If you have 4 rooms, those SAME 4 rooms are listed on all channels. When 1 books on Airbnb + 1 on Booking.com = 2 available everywhere.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs sm:text-sm font-medium text-blue-900">
                      {selectedOTA.charAt(0).toUpperCase() + selectedOTA.slice(1)} View - Shared Inventory
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Showing availability for <span className="font-semibold">ALL rooms</span>, with bookings from <span className="font-semibold">{selectedOTA.charAt(0).toUpperCase() + selectedOTA.slice(1)}</span> highlighted.
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      The same rooms are also listed on other channels. Total availability is reduced by bookings from ANY channel to prevent overbooking.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          {loading ? (
            <div className="space-y-3 sm:space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 sm:h-14 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              {/* Mobile: Show scrollable hint */}
              <div className="sm:hidden text-xs text-muted-foreground mb-2 px-2 flex items-center gap-1">
                <span>← Swipe to see more dates →</span>
              </div>
              
              <div className="min-w-[800px] sm:min-w-[1000px] lg:min-w-[1200px] px-2 sm:px-0">
                {/* Header with dates */}
                <div className="grid grid-cols-[120px_repeat(auto-fit,minmax(70px,1fr))] sm:grid-cols-[160px_repeat(auto-fit,minmax(80px,1fr))] lg:grid-cols-[200px_repeat(auto-fit,minmax(90px,1fr))] gap-1 mb-2">
                  <div className="font-medium text-xs sm:text-sm p-2 sticky left-0 bg-background z-10">Room</div>
                  {dates.slice(0, 30).map((date) => (
                    <div key={date} className="text-[10px] sm:text-xs p-1.5 sm:p-2 text-center font-medium">
                      {shortDate(date)}
                    </div>
                  ))}
                </div>

                {/* Inventory rows */}
                <div className="space-y-1 sm:space-y-1.5">
                  {inventory.map((room) => (
                    <div key={room.roomId} className="grid grid-cols-[120px_repeat(auto-fit,minmax(70px,1fr))] sm:grid-cols-[160px_repeat(auto-fit,minmax(80px,1fr))] lg:grid-cols-[200px_repeat(auto-fit,minmax(90px,1fr))] gap-1">
                      <div className="p-1.5 sm:p-2 bg-muted rounded-lg flex items-center sticky left-0 z-10">
                        <div className="min-w-0">
                          <div className="font-medium text-xs sm:text-sm truncate">{room.roomCode}</div>
                          <div className="text-[10px] sm:text-xs text-muted-foreground truncate">Room {room.roomId}</div>
                        </div>
                      </div>
                      
                      {room.availability.slice(0, 30).map((day) => {
                        const cellId = getCellId(room.roomId, day.date);
                        const isSelected = selectedCells.has(cellId);
                        
                        return (
                          <div
                            key={day.date}
                            title={`${day.available ?? (day.allotment - day.booked)} available out of ${day.allotment} total rooms | ${day.booked} booked${day.channels && day.channels.length > 0 ? ` (${day.channels.map(c => `${c.channel}: ${c.status}`).join(', ')})` : ''}`}
                            className={`
                              p-1 sm:p-1.5 lg:p-2 rounded-lg border cursor-pointer text-[10px] sm:text-xs text-center transition-all
                              min-h-[44px] sm:min-h-[48px] flex flex-col justify-center
                              active:scale-95 touch-manipulation
                              ${getAvailabilityColor(day)}
                              ${isSelected ? 'ring-2 ring-primary ring-offset-1 sm:ring-offset-2' : 'hover:shadow-md active:shadow-lg'}
                            `}
                            onClick={() => toggleCellSelection(room.roomId, day.date)}
                          >
                            <div className="font-medium leading-tight">
                              {day.available ?? (day.allotment - day.booked)}/{day.allotment}
                            </div>
                            <div className="text-[9px] sm:text-xs opacity-75 leading-tight mt-0.5">
                              ${day.rate}
                            </div>
                            {selectedOTA !== 'total' && day.channelBooked !== undefined && (
                              <div className="text-[9px] sm:text-xs text-primary font-medium leading-tight mt-0.5">
                                {day.channelBooked} here
                              </div>
                            )}
                            {day.stopSell && (
                              <div className="text-[9px] sm:text-xs text-destructive font-medium leading-tight mt-0.5">STOP</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="mt-4 sm:mt-6 flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-background border rounded flex-shrink-0"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-secondary rounded flex-shrink-0"></div>
                    <span>Low availability</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-warning/20 rounded flex-shrink-0"></div>
                    <span>Fully booked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-destructive/20 rounded flex-shrink-0"></div>
                    <span>Stop sell</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminInventory;