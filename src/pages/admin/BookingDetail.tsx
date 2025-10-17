import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Building2,
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  MessageSquare,
  Send,
  Download,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  XCircle,
  Ban,
  UserCheck,
  LogOut as LogOutIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { MOCK_BOOKINGS } from '@/data/mockBookings';
import type { Booking, BookingStatus } from '@/types/booking';

const BookingStatusBadge: React.FC<{ status: BookingStatus }> = ({ status }) => {
  const variants: Record<
    BookingStatus,
    { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }
  > = {
    pending: { variant: 'outline', label: 'Pending' },
    confirmed: { variant: 'default', label: 'Confirmed' },
    'checked-in': { variant: 'default', label: 'Checked In' },
    'checked-out': { variant: 'secondary', label: 'Checked Out' },
    cancelled: { variant: 'destructive', label: 'Cancelled' },
    'no-show': { variant: 'destructive', label: 'No Show' },
  };

  const config = variants[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const BookingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const booking = MOCK_BOOKINGS.find((b) => b.id === id);
  const [newMessage, setNewMessage] = useState('');
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus>('confirmed');

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Booking Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The booking you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link to="/admin/bookings">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Bookings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    toast({
      title: 'Message sent',
      description: 'Your message has been sent to the guest.',
    });
    setNewMessage('');
  };

  const handleStatusChange = () => {
    toast({
      title: 'Status updated',
      description: `Booking status changed to ${selectedStatus}.`,
    });
    setStatusDialogOpen(false);
  };

  const handleCheckIn = () => {
    toast({
      title: 'Guest checked in',
      description: `${booking.guest.firstName} ${booking.guest.lastName} has been checked in.`,
    });
  };

  const handleCheckOut = () => {
    toast({
      title: 'Guest checked out',
      description: `${booking.guest.firstName} ${booking.guest.lastName} has been checked out.`,
    });
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'MMM dd, yyyy');
  };

  const formatDateTime = (dateStr: string) => {
    return format(new Date(dateStr), 'MMM dd, yyyy HH:mm');
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/bookings')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bookings
        </Button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">Booking #{booking.confirmationCode}</h1>
              <BookingStatusBadge status={booking.status} />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {booking.guest.firstName} {booking.guest.lastName}
              </div>
              <div className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {booking.propertyName}
              </div>
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {booking.status === 'confirmed' && (
              <Button onClick={handleCheckIn}>
                <UserCheck className="h-4 w-4 mr-2" />
                Check In
              </Button>
            )}
            {booking.status === 'checked-in' && (
              <Button onClick={handleCheckOut}>
                <LogOutIcon className="h-4 w-4 mr-2" />
                Check Out
              </Button>
            )}
            <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Change Status</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Booking Status</DialogTitle>
                  <DialogDescription>
                    Change the status of this booking
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Select
                    value={selectedStatus}
                    onValueChange={(value) => setSelectedStatus(value as BookingStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="checked-in">Checked In</SelectItem>
                      <SelectItem value="checked-out">Checked Out</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="no-show">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleStatusChange}>Update Status</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" asChild>
              <Link to={`/admin/bookings/${booking.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="guest">Guest Info</TabsTrigger>
              <TabsTrigger value="messages" className="relative">
                Messages
                {booking.unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {booking.unreadMessages}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Check-in</p>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span className="font-medium">{formatDate(booking.checkInDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{booking.checkInTime}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Check-out</p>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span className="font-medium">{formatDate(booking.checkOutDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{booking.checkOutTime}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Duration</p>
                      <p className="font-medium">
                        {booking.nights} {booking.nights === 1 ? 'night' : 'nights'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Guests</p>
                      <p className="font-medium">
                        {booking.adults} Adult{booking.adults > 1 ? 's' : ''}
                        {booking.children > 0 &&
                          `, ${booking.children} Child${booking.children > 1 ? 'ren' : ''}`}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Room</p>
                    <p className="font-medium">
                      {booking.roomName} ({booking.roomNumber})
                    </p>
                    <p className="text-sm text-muted-foreground">{booking.propertyName}</p>
                  </div>

                  {booking.specialRequests && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Special Requests</p>
                        <p className="text-sm">{booking.specialRequests}</p>
                      </div>
                    </>
                  )}

                  {booking.notes && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Internal Notes</p>
                        <p className="text-sm">{booking.notes}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Room Rate (${booking.roomRate}/night)</span>
                    <span className="font-medium">${booking.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxes</span>
                    <span className="font-medium">${booking.taxes.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fees</span>
                    <span className="font-medium">${booking.fees.toFixed(2)}</span>
                  </div>
                  {booking.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span className="font-medium">-${booking.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${booking.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Amount Paid</span>
                    <span className="font-medium">${booking.amountPaid.toFixed(2)}</span>
                  </div>
                  {booking.amountDue > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Amount Due</span>
                      <span className="font-bold">${booking.amountDue.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Payment Status</span>
                    <Badge
                      variant={
                        booking.paymentStatus === 'paid'
                          ? 'default'
                          : booking.paymentStatus === 'unpaid'
                          ? 'destructive'
                          : 'outline'
                      }
                    >
                      {booking.paymentStatus}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Guest Info Tab */}
            <TabsContent value="guest">
              <Card>
                <CardHeader>
                  <CardTitle>Guest Information</CardTitle>
                  <CardDescription>Contact and booking history</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                        {getInitials(booking.guest.firstName, booking.guest.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">
                        {booking.guest.firstName} {booking.guest.lastName}
                      </h3>
                      <Badge variant="outline">{booking.guest.type}</Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${booking.guest.email}`} className="hover:underline">
                        {booking.guest.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${booking.guest.phone}`} className="hover:underline">
                        {booking.guest.phone}
                      </a>
                    </div>
                    {booking.guest.country && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.guest.country}</span>
                      </div>
                    )}
                    {booking.guest.company && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.guest.company}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Bookings</p>
                      <p className="text-2xl font-bold">{booking.guest.totalBookings}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                      <p className="text-2xl font-bold">${booking.guest.totalSpent}</p>
                    </div>
                  </div>

                  {booking.guest.notes && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Notes</p>
                        <p className="text-sm">{booking.guest.notes}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages">
              <Card>
                <CardHeader>
                  <CardTitle>Guest Communication</CardTitle>
                  <CardDescription>Chat history with the guest</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                    {booking.messages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No messages yet</p>
                      </div>
                    ) : (
                      booking.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${
                            message.senderType === 'guest' ? '' : 'flex-row-reverse'
                          }`}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {message.senderType === 'guest'
                                ? getInitials(booking.guest.firstName, booking.guest.lastName)
                                : 'ST'}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={`flex-1 rounded-lg p-3 ${
                              message.senderType === 'guest'
                                ? 'bg-muted'
                                : 'bg-primary text-primary-foreground'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{message.senderName}</span>
                              <span className="text-xs opacity-70">
                                {formatDateTime(message.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm">{message.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <Separator className="my-4" />

                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={3}
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Confirmation
              </Button>
              <Button className="w-full" variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Email Guest
              </Button>
              <Button className="w-full" variant="outline">
                <Phone className="h-4 w-4 mr-2" />
                Call Guest
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Booking Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Source</p>
                <Badge variant="outline">{booking.source}</Badge>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Created</p>
                <p>{formatDateTime(booking.createdAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Last Updated</p>
                <p>{formatDateTime(booking.updatedAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Created By</p>
                <p>{booking.createdBy}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
