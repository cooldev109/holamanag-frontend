import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as BigCalendar, dateFnsLocalizer, View, Event as CalendarEvent } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { ArrowLeft, Plus, Calendar as CalendarIcon, List } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MOCK_BOOKINGS } from '@/data/mockBookings';
import type { Booking, BookingStatus } from '@/types/booking';

// Setup the localizer for react-big-calendar
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface BookingEvent extends CalendarEvent {
  resource: Booking;
}

const getStatusColor = (status: BookingStatus): string => {
  const colors: Record<BookingStatus, string> = {
    pending: 'border-amber-500 bg-amber-50 text-amber-900',
    confirmed: 'border-green-500 bg-green-50 text-green-900',
    'checked-in': 'border-blue-500 bg-blue-50 text-blue-900',
    'checked-out': 'border-gray-500 bg-gray-50 text-gray-900',
    cancelled: 'border-red-500 bg-red-50 text-red-900',
    'no-show': 'border-red-700 bg-red-100 text-red-900',
  };
  return colors[status];
};

export const BookingCalendar: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<View>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Convert bookings to calendar events
  const events: BookingEvent[] = useMemo(() => {
    return MOCK_BOOKINGS.map((booking) => ({
      id: booking.id,
      title: `${booking.guest.firstName} ${booking.guest.lastName} - ${booking.roomNumber}`,
      start: new Date(booking.checkInDate),
      end: addDays(new Date(booking.checkOutDate), 1), // Add 1 day to include checkout day
      resource: booking,
      allDay: false,
    }));
  }, []);

  // Handle event selection
  const handleSelectEvent = useCallback(
    (event: BookingEvent) => {
      navigate(`/admin/bookings/${event.resource.id}`);
    },
    [navigate]
  );

  // Handle slot selection (for creating new bookings)
  const handleSelectSlot = useCallback(
    (slotInfo: { start: Date; end: Date }) => {
      const checkIn = format(slotInfo.start, 'yyyy-MM-dd');
      const checkOut = format(slotInfo.end, 'yyyy-MM-dd');
      navigate(`/admin/bookings/new?checkIn=${checkIn}&checkOut=${checkOut}`);
    },
    [navigate]
  );

  // Handle event drag and drop
  const handleEventDrop = useCallback(
    (args: { event: BookingEvent; start: Date; end: Date }) => {
      toast({
        title: 'Booking Updated',
        description: `Booking moved to ${format(args.start, 'MMM dd, yyyy')}`,
      });
      // In production, this would call an API to update the booking
    },
    [toast]
  );

  // Handle event resize
  const handleEventResize = useCallback(
    (args: { event: BookingEvent; start: Date; end: Date }) => {
      toast({
        title: 'Booking Updated',
        description: `Booking dates updated`,
      });
      // In production, this would call an API to update the booking
    },
    [toast]
  );

  // Custom event style
  const eventStyleGetter = (event: BookingEvent) => {
    const statusColor = getStatusColor(event.resource.status);
    return {
      className: `${statusColor} border-l-4 rounded-md px-2 py-1`,
    };
  };

  // Custom event component
  const EventComponent = ({ event }: { event: BookingEvent }) => {
    const booking = event.resource;
    return (
      <div className="text-xs">
        <div className="font-semibold truncate">{event.title}</div>
        <div className="text-[10px] opacity-75">
          {booking.propertyName} | ${booking.total}
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <Badge
            variant={booking.paymentStatus === 'paid' ? 'default' : 'destructive'}
            className="text-[8px] px-1 py-0"
          >
            {booking.paymentStatus}
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/bookings')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Button>
          </div>
          <h1 className="text-3xl font-bold mb-2">Booking Calendar</h1>
          <p className="text-muted-foreground">
            View and manage bookings in calendar format
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/admin/bookings')}>
            <List className="h-4 w-4 mr-2" />
            List View
          </Button>
          <Button asChild size="lg">
            <a href={`/admin/bookings/new?checkIn=${format(currentDate, 'yyyy-MM-dd')}`}>
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </a>
          </Button>
        </div>
      </div>

      {/* Legend */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium">Status Legend:</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border-2 border-amber-500 bg-amber-50"></div>
              <span className="text-xs">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border-2 border-green-500 bg-green-50"></div>
              <span className="text-xs">Confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border-2 border-blue-500 bg-blue-50"></div>
              <span className="text-xs">Checked In</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border-2 border-gray-500 bg-gray-50"></div>
              <span className="text-xs">Checked Out</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border-2 border-red-500 bg-red-50"></div>
              <span className="text-xs">Cancelled/No-show</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardContent className="p-4">
          <div style={{ height: '700px' }}>
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              view={currentView}
              onView={setCurrentView}
              date={currentDate}
              onNavigate={setCurrentDate}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              onEventDrop={handleEventDrop}
              onEventResize={handleEventResize}
              selectable
              resizable
              draggableAccessor={() => true}
              eventPropGetter={eventStyleGetter}
              components={{
                event: EventComponent,
              }}
              views={['month', 'week', 'day', 'agenda']}
              step={60}
              showMultiDayTimes
              popup
              tooltipAccessor={(event) => {
                const booking = (event as BookingEvent).resource;
                return `${booking.guest.firstName} ${booking.guest.lastName}\n${booking.propertyName}\n${booking.roomName} (${booking.roomNumber})\nStatus: ${booking.status}\nPayment: ${booking.paymentStatus}`;
              }}
              messages={{
                next: 'Next',
                previous: 'Previous',
                today: 'Today',
                month: 'Month',
                week: 'Week',
                day: 'Day',
                agenda: 'Agenda',
                date: 'Date',
                time: 'Time',
                event: 'Booking',
                noEventsInRange: 'No bookings in this date range',
                showMore: (total) => `+${total} more`,
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="mt-6">
        <CardContent className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium mb-1">📅 Create Booking</p>
              <p className="text-muted-foreground">
                Click and drag on the calendar to select dates for a new booking
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">🖱️ Move Booking</p>
              <p className="text-muted-foreground">
                Drag and drop bookings to reschedule check-in dates
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">👁️ View Details</p>
              <p className="text-muted-foreground">
                Click on any booking to view complete details and manage
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingCalendar;
