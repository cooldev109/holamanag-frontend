import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Calendar as CalendarIcon,
  User,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Download,
} from 'lucide-react';
import { format } from 'date-fns';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MOCK_BOOKINGS } from '@/data/mockBookings';
import type { Booking, BookingStatus, PaymentStatus } from '@/types/booking';

const BookingStatusBadge: React.FC<{ status: BookingStatus }> = ({ status }) => {
  const variants: Record<
    BookingStatus,
    { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; className?: string }
  > = {
    pending: { variant: 'outline', label: 'Pending', className: 'border-amber-500 text-amber-700' },
    confirmed: { variant: 'default', label: 'Confirmed', className: 'bg-green-600' },
    'checked-in': { variant: 'default', label: 'Checked In', className: 'bg-blue-600' },
    'checked-out': { variant: 'secondary', label: 'Checked Out' },
    cancelled: { variant: 'destructive', label: 'Cancelled' },
    'no-show': { variant: 'outline', label: 'No Show', className: 'border-red-500 text-red-700' },
  };

  const config = variants[status];
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
};

const PaymentStatusBadge: React.FC<{ status: PaymentStatus }> = ({ status }) => {
  const variants: Record<
    PaymentStatus,
    { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; className?: string }
  > = {
    unpaid: { variant: 'outline', label: 'Unpaid', className: 'border-red-500 text-red-700' },
    partial: { variant: 'outline', label: 'Partial', className: 'border-amber-500 text-amber-700' },
    paid: { variant: 'default', label: 'Paid', className: 'bg-green-600' },
    refunded: { variant: 'secondary', label: 'Refunded' },
  };

  const config = variants[status];
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
};

export const Bookings: React.FC = () => {
  const [bookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all'>('all');
  const [activeTab, setActiveTab] = useState<string>('all');

  // Filter bookings based on search and filters
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch =
        booking.guest.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.guest.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.confirmationCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.propertyName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
      const matchesPayment = paymentFilter === 'all' || booking.paymentStatus === paymentFilter;

      // Tab filtering
      let matchesTab = true;
      if (activeTab === 'upcoming') {
        matchesTab = booking.status === 'confirmed' || booking.status === 'pending';
      } else if (activeTab === 'current') {
        matchesTab = booking.status === 'checked-in';
      } else if (activeTab === 'past') {
        matchesTab = booking.status === 'checked-out';
      }

      return matchesSearch && matchesStatus && matchesPayment && matchesTab;
    });
  }, [bookings, searchQuery, statusFilter, paymentFilter, activeTab]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) => b.status === 'pending').length;
    const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
    const checkedIn = bookings.filter((b) => b.status === 'checked-in').length;
    const checkedOut = bookings.filter((b) => b.status === 'checked-out').length;
    const cancelled = bookings.filter((b) => b.status === 'cancelled').length;
    const noShow = bookings.filter((b) => b.status === 'no-show').length;

    const revenue = bookings
      .filter((b) => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + b.total, 0);

    const averageRate =
      bookings.length > 0
        ? bookings.reduce((sum, b) => sum + b.roomRate, 0) / bookings.length
        : 0;

    return {
      total,
      pending,
      confirmed,
      checkedIn,
      checkedOut,
      cancelled,
      noShow,
      revenue,
      averageRate,
    };
  }, [bookings]);

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'MMM dd, yyyy');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Booking Management</h1>
          <p className="text-muted-foreground">
            Manage reservations, track check-ins, and communicate with guests
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/bookings/calendar">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Calendar View
            </Link>
          </Button>
          <Button asChild size="lg">
            <Link to="/admin/bookings/new">
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Bookings</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Confirmed:</span>
                <span className="font-medium">{stats.confirmed}</span>
              </div>
              <div className="flex justify-between">
                <span>Pending:</span>
                <span className="font-medium">{stats.pending}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Currently Checked In</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.checkedIn}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Checked Out:</span>
                <span className="font-medium">{stats.checkedOut}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              ${stats.revenue.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Avg. Rate:</span>
                <span className="font-medium">${stats.averageRate.toFixed(0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Issues</CardDescription>
            <CardTitle className="text-3xl text-red-600">
              {stats.cancelled + stats.noShow}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Cancelled:</span>
                <span className="font-medium">{stats.cancelled}</span>
              </div>
              <div className="flex justify-between">
                <span>No Show:</span>
                <span className="font-medium">{stats.noShow}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Bookings</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="current">Current</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
      </Tabs>

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
                  placeholder="Search by guest, confirmation code, room..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as BookingStatus | 'all')}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="checked-in">Checked In</SelectItem>
                <SelectItem value="checked-out">Checked Out</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no-show">No Show</SelectItem>
              </SelectContent>
            </Select>

            {/* Payment Filter */}
            <Select
              value={paymentFilter}
              onValueChange={(value) => setPaymentFilter(value as PaymentStatus | 'all')}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Payments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardContent className="p-0">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No bookings found</p>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all' || paymentFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first booking'}
              </p>
              {!searchQuery && statusFilter === 'all' && paymentFilter === 'all' && (
                <Button asChild>
                  <Link to="/admin/bookings/new">
                    <Plus className="h-4 w-4 mr-2" />
                    New Booking
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Confirmation</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Property/Room</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{booking.confirmationCode}</span>
                        <span className="text-xs text-muted-foreground">
                          {booking.nights} {booking.nights === 1 ? 'night' : 'nights'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {booking.guest.firstName} {booking.guest.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{booking.guest.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{booking.propertyName}</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.roomName} ({booking.roomNumber})
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{formatDate(booking.checkInDate)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{booking.checkInTime}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{formatDate(booking.checkOutDate)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {booking.checkOutTime}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <BookingStatusBadge status={booking.status} />
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={booking.paymentStatus} />
                      {booking.amountDue > 0 && (
                        <p className="text-xs text-red-600 mt-1">Due: ${booking.amountDue}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{booking.total.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-end gap-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {booking.adults}A {booking.children > 0 && `${booking.children}C`}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {booking.unreadMessages > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="relative"
                            asChild
                          >
                            <Link to={`/admin/bookings/${booking.id}`}>
                              <MessageSquare className="h-4 w-4" />
                              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                                {booking.unreadMessages}
                              </span>
                            </Link>
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/admin/bookings/${booking.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/admin/bookings/${booking.id}/edit`}>
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
      {filteredBookings.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </p>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      )}
    </div>
  );
};

export default Bookings;
