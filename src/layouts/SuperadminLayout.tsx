import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  Settings,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  Building2,
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

export const SuperadminLayout = () => {
  const { t } = useTranslation('superadmin');
  const { t: tCommon } = useTranslation('common');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const menuItems = [
    { path: '/superadmin', icon: LayoutDashboard, label: t('nav.dashboard') },
    { path: '/superadmin/users', icon: Users, label: t('nav.users') },
    { path: '/superadmin/settings', icon: Settings, label: t('nav.settings') }
  ];

  const isActive = (path: string) => {
    if (path === '/superadmin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-blue-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 bg-blue-900 text-white transition-transform duration-300 lg:translate-x-0 lg:static`}
      >
        {/* Logo/Title */}
        <div className="flex items-center justify-between p-4 border-b border-blue-800">
          <h2 className="text-xl font-bold">{t('nav.superadmin')}</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-blue-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-800 text-white'
                  : 'text-blue-100 hover:bg-blue-800/50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}

          {/* Divider */}
          <div className="border-t border-blue-800 my-4" />

          {/* Back to Admin */}
          <Link
            to="/admin"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-blue-800/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('nav.backToAdmin')}</span>
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-blue-800/50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>{t('nav.logout')}</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Custom Superadmin Navbar */}
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Brand */}
              <Link
                to="/superadmin"
                className="flex items-center gap-2 font-heading text-xl font-bold text-primary hover:text-primary-hover transition-colors"
              >
                <Building2 className="h-6 w-6" />
                {tCommon('brand')}
              </Link>

              {/* Navigation - Superadmin Links (Desktop) */}
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  to="/superadmin"
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    location.pathname === '/superadmin'
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {t('nav.dashboard')}
                </Link>
                <Link
                  to="/superadmin/users"
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    location.pathname.startsWith('/superadmin/users')
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <Users className="h-4 w-4" />
                  {t('nav.users')}
                </Link>
                <Link
                  to="/superadmin/settings"
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    location.pathname.startsWith('/superadmin/settings')
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <Settings className="h-4 w-4" />
                  {t('nav.settings')}
                </Link>
              </nav>

              {/* Right side */}
              <div className="flex items-center gap-3">
                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>

                <LanguageSwitcher />

                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="gap-2 relative hover:bg-accent"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {getInitials(user.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="hidden sm:flex flex-col items-start">
                          <span className="text-sm font-medium">{user.email}</span>
                          <span className="text-xs text-muted-foreground">Super Admin</span>
                        </div>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.email}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            Super Admin
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="cursor-pointer flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer flex items-center">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          <span>{t('nav.backToAdmin')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>{t('nav.logout')}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
              <div className="md:hidden border-t py-4">
                <nav className="flex flex-col space-y-2">
                  <Link
                    to="/superadmin"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
                      location.pathname === '/superadmin'
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    <span className="font-medium">{t('nav.dashboard')}</span>
                  </Link>
                  <Link
                    to="/superadmin/users"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
                      location.pathname.startsWith('/superadmin/users')
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    <Users className="h-5 w-5" />
                    <span className="font-medium">{t('nav.users')}</span>
                  </Link>
                  <Link
                    to="/superadmin/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
                      location.pathname.startsWith('/superadmin/settings')
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    <Settings className="h-5 w-5" />
                    <span className="font-medium">{t('nav.settings')}</span>
                  </Link>
                </nav>
              </div>
            )}
          </div>
        </header>

        {/* Mobile Menu Button */}
        <div className="lg:hidden fixed top-4 left-4 z-40">
          <Button
            onClick={() => setSidebarOpen(true)}
            variant="outline"
            size="icon"
            className="bg-white"
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

