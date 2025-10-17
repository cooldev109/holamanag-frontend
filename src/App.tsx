import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { DashboardSkeleton } from "./components/ui/loading-skeletons";

// Eagerly load critical components (layouts, auth)
import { Layout } from "./layouts/Layout";
import { AdminLayout } from "./layouts/AdminLayout";
import { SuperadminLayout } from "./layouts/SuperadminLayout";
import { SupervisorLayout } from "./layouts/SupervisorLayout";
import { ClientLayout } from "./layouts/ClientLayout";
import { RequireRole } from "./auth/RequireRole";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";

// Lazy load all page components - using default exports
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin pages - using default exports
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminReservations = lazy(() => import("./pages/admin/AdminReservations"));
const AdminInventory = lazy(() => import("./pages/admin/AdminInventory"));
const Properties = lazy(() => import("./pages/admin/Properties"));
const PropertyForm = lazy(() => import("./pages/admin/PropertyForm"));
const PropertyDetail = lazy(() => import("./pages/admin/PropertyDetail"));
const Bookings = lazy(() => import("./pages/admin/Bookings"));
const BookingCalendar = lazy(() => import("./pages/admin/BookingCalendar"));
const BookingDetail = lazy(() => import("./pages/admin/BookingDetail"));
const BookingForm = lazy(() => import("./pages/admin/BookingForm"));
const RatePlans = lazy(() => import("./pages/admin/RatePlans"));
const RatePlanForm = lazy(() => import("./pages/admin/RatePlanForm"));
const RatePlanDetail = lazy(() => import("./pages/admin/RatePlanDetail"));
const RateCalendar = lazy(() => import("./pages/admin/RateCalendar"));
const RateAnalytics = lazy(() => import("./pages/admin/RateAnalytics"));
const RateAutomation = lazy(() => import("./pages/admin/RateAutomation"));
const RateRuleConfig = lazy(() => import("./pages/admin/RateRuleConfig"));
const TeamManagement = lazy(() => import("./pages/admin/TeamManagement"));

// Client pages - using default exports
const ClientDashboard = lazy(() => import("./pages/client/ClientDashboard"));
const ClientReservations = lazy(() => import("./pages/client/ClientReservations"));
const ClientReservationDetail = lazy(() => import("./pages/client/ClientReservationDetail"));

// Superadmin pages - using default exports
const SuperadminDashboard = lazy(() => import("./pages/superadmin/SuperadminDashboard"));
const UserManagement = lazy(() => import("./pages/superadmin/UserManagement"));
const SystemSettingsPage = lazy(() => import("./pages/superadmin/SystemSettings"));

// Supervisor pages - using default exports
const SupervisorDashboard = lazy(() => import("./pages/supervisor/SupervisorDashboard"));
const PropertyOversight = lazy(() => import("./pages/supervisor/PropertyOversight"));
const BookingOversight = lazy(() => import("./pages/supervisor/BookingOversight"));

// Guest pages
const GuestBooking = lazy(() => import("./pages/guest/GuestBooking"));
const BookingConfirmation = lazy(() => import("./pages/guest/BookingConfirmation"));

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<DashboardSkeleton />}>
            <Routes>
          {/* Public Routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/book" element={<GuestBooking />} />
            <Route path="/book/:propertyId" element={<GuestBooking />} />
            <Route path="/booking-confirmation/:confirmationCode" element={<BookingConfirmation />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <RequireRole roles={["admin", "superadmin"]}>
                <AdminLayout />
              </RequireRole>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="reservations" element={<AdminReservations />} />
            <Route path="inventory" element={<AdminInventory />} />
            
            {/* Properties */}
            <Route path="properties" element={<Properties />} />
            <Route path="properties/new" element={<PropertyForm />} />
            <Route path="properties/:id" element={<PropertyDetail />} />
            <Route path="properties/:id/edit" element={<PropertyForm />} />
            
            {/* Bookings */}
            <Route path="bookings" element={<Bookings />} />
            <Route path="bookings/new" element={<BookingForm />} />
            <Route path="bookings/calendar" element={<BookingCalendar />} />
            <Route path="bookings/:id" element={<BookingDetail />} />
            <Route path="bookings/:id/edit" element={<BookingForm />} />
            
            {/* Rates */}
            <Route path="rates" element={<RatePlans />} />
            <Route path="rates/new" element={<RatePlanForm />} />
            <Route path="rates/calendar" element={<RateCalendar />} />
            <Route path="rates/:id" element={<RatePlanDetail />} />
            <Route path="rates/:id/edit" element={<RatePlanForm />} />
            <Route path="rates/:id/rules" element={<RateRuleConfig />} />
            <Route path="rates/:id/automation" element={<RateAutomation />} />
            <Route path="rates/:id/analytics" element={<RateAnalytics />} />
            
            {/* Team Management */}
            <Route path="team" element={<TeamManagement />} />
          </Route>

          {/* Supervisor Routes - Same as Admin except Team Management */}
          <Route
            path="/supervisor"
            element={
              <RequireRole roles={["supervisor"]}>
                <SupervisorLayout />
              </RequireRole>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="reservations" element={<AdminReservations />} />
            <Route path="inventory" element={<AdminInventory />} />

            {/* Properties */}
            <Route path="properties" element={<Properties />} />
            <Route path="properties/:id" element={<PropertyDetail />} />

            {/* Bookings */}
            <Route path="bookings" element={<Bookings />} />
            <Route path="bookings/calendar" element={<BookingCalendar />} />
            <Route path="bookings/:id" element={<BookingDetail />} />

            {/* Note: NO /rates or /team routes for supervisors */}
          </Route>
          {/* Superadmin Routes */}
          <Route
            path="/superadmin"
            element={
              <RequireRole roles={["superadmin"]}>
                <SuperadminLayout />
              </RequireRole>
            }
          >
            <Route index element={<SuperadminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="settings" element={<SystemSettingsPage />} />
          </Route>

          {/* Client Routes */}
          <Route
            path="/client"
            element={
              <RequireRole roles={["client"]}>
                <ClientLayout />
              </RequireRole>
            }
          >
            <Route index element={<ClientDashboard />} />
            <Route path="reservations" element={<ClientReservations />} />
            <Route path="reservations/:id" element={<ClientReservationDetail />} />
          </Route>

          <Route element={<Layout />}>
            <Route path="*" element={<NotFound />} />
          </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
