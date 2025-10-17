import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Calendar,
  LogOut,
  Menu,
  X,
  User,
  ChevronDown
} from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useAuthStore } from '@/auth/store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export const ClientLayout = () => {
  const { t } = useTranslation('client');
  const { t: tCommon } = useTranslation('common');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const menuItems = [
    { path: '/client', icon: LayoutDashboard, label: t('nav.dashboard'), exact: true },
    { path: '/client/reservations', icon: Calendar, label: t('nav.reservations') }
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900">
      {/* Sidebar - Desktop & Mobile */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-72",
          "transform transition-all duration-500 ease-out",
          "bg-gradient-to-b from-slate-950/95 via-emerald-950/95 to-slate-950/95",
          "backdrop-blur-xl border-r border-amber-500/20",
          "shadow-2xl shadow-amber-500/10",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo & Close Button */}
        <div className="flex items-center justify-between h-20 px-6 sm:px-8 border-b border-amber-500/10">
          <Link
            to="/client"
            className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent tracking-tight"
            style={{ minHeight: '44px', fontFamily: 'serif' }}
          >
            Reservario
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-amber-200 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg p-2 transition-all duration-300"
            style={{ minHeight: '44px', minWidth: '44px' }}
            aria-label={tCommon('close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Guest Badge */}
        <div className="px-6 sm:px-8 mb-6 mt-6">
          <div className="bg-gradient-to-r from-amber-500/20 via-amber-400/20 to-amber-500/20 rounded-xl p-4 border border-amber-500/30 shadow-lg shadow-amber-500/10">
            <span className="text-sm text-amber-100 font-semibold tracking-wide uppercase">
              {t('guest')}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-5 sm:px-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-4 px-5 py-4 rounded-xl",
                  "text-sm sm:text-base font-medium transition-all duration-300",
                  "group relative overflow-hidden",
                  active
                    ? "bg-gradient-to-r from-amber-500/30 to-amber-600/30 text-amber-100 shadow-lg shadow-amber-500/20 border border-amber-500/40"
                    : "text-slate-300 hover:text-amber-200 hover:bg-slate-800/50 hover:border-amber-500/20 border border-transparent"
                )}
                style={{ minHeight: '44px' }}
              >
                {active && (
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-transparent animate-pulse" />
                )}
                <Icon className={cn(
                  "w-5 h-5 flex-shrink-0 relative z-10 transition-transform duration-300",
                  active ? "text-amber-300 scale-110" : "text-slate-400 group-hover:text-amber-400 group-hover:scale-105"
                )} />
                <span className="truncate relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-5 sm:p-6 border-t border-amber-500/20 bg-gradient-to-t from-slate-950/80 to-transparent">
          <div className="flex items-center gap-4 bg-slate-900/50 rounded-xl p-4 border border-amber-500/10">
            <Avatar className="h-12 w-12 flex-shrink-0 border-2 border-amber-500/30 shadow-lg shadow-amber-500/20">
              <AvatarFallback className="bg-gradient-to-br from-amber-500 to-amber-700 text-white text-sm font-bold">
                {user?.email ? getInitials(user.email) : 'CL'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-100 truncate">
                {user?.profile?.firstName} {user?.profile?.lastName}
              </p>
              <p className="text-xs text-slate-400 truncate uppercase tracking-wide">
                {t('guest')}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-slate-900/50 backdrop-blur-xl border-b border-amber-500/20 shadow-2xl shadow-amber-500/5 h-20 flex items-center justify-between px-6 sm:px-8 lg:px-12">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-amber-200 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg p-2 transition-all duration-300"
            style={{ minHeight: '44px', minWidth: '44px' }}
            aria-label={tCommon('menu')}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Page Title - Hidden on mobile, shown on desktop */}
          <h1 className="hidden lg:block text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent tracking-tight" style={{ fontFamily: 'serif' }}>
            {t('dashboard.title')}
          </h1>

          {/* Right side actions */}
          <div className="flex items-center gap-2 sm:gap-4 ml-auto lg:ml-0">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-2 sm:px-3"
                  style={{ minHeight: '44px' }}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                      {user?.email ? getInitials(user.email) : 'CL'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm font-medium">
                    {user?.profile?.firstName || user?.email}
                  </span>
                  <ChevronDown className="hidden sm:inline w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 sm:w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium truncate">
                      {user?.profile?.firstName} {user?.profile?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    to="/profile"
                    className="cursor-pointer"
                    style={{ minHeight: '44px' }}
                  >
                    <User className="w-4 h-4 mr-2" />
                    {tCommon('profile')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 cursor-pointer"
                  style={{ minHeight: '44px' }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {tCommon('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-12 bg-gradient-to-br from-slate-950/50 via-emerald-950/30 to-slate-950/50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;
