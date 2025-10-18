import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/auth/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Role } from '@/auth/store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

type LoginData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { t, i18n } = useTranslation(['common', 'admin']);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    try {
      // Call real backend authentication API
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: 'Login failed',
          description: errorData.message || 'Invalid credentials',
          variant: 'destructive',
        });
        return;
      }

      const result = await response.json();
      const { user, tokens } = result.data;

      // Store tokens
      localStorage.setItem('token', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);

      setAuth({
        user: {
          id: user._id || user.id,
          email: user.email,
          roles: user.roles,
          locale: i18n.language as 'en' | 'es' | 'de' | 'pt' | 'nl',
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });

      // Change language if user has a preferred locale
      if (user.locale && user.locale !== i18n.language) {
        i18n.changeLanguage(user.locale);
      }

      toast({
        title: 'Welcome back!',
        description: `Logged in as ${user.email}`,
      });

      // Redirect based on user role
      let redirectPath = from;
      if (from === '/') {
        if (user.roles.includes('superadmin')) {
          redirectPath = '/superadmin';
        } else if (user.roles.includes('admin')) {
          redirectPath = '/admin';
        } else if (user.roles.includes('supervisor')) {
          redirectPath = '/supervisor';
        } else if (user.roles.includes('client')) {
          redirectPath = '/client';
        }
      }

      navigate(redirectPath, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Card className="w-full max-w-md relative z-10 bg-gradient-to-br from-slate-900/95 to-slate-950/95 backdrop-blur-xl border-2 border-amber-500/20 shadow-2xl shadow-amber-500/10">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="flex flex-col items-center gap-4 mb-2">
            <div className="p-4 bg-gradient-to-br from-amber-500/20 to-indigo-500/20 rounded-2xl border border-amber-500/30 shadow-lg shadow-amber-500/20">
              <Building2 className="h-12 w-12 text-amber-400" />
            </div>
            <span className="text-4xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent tracking-tight" style={{ fontFamily: 'serif' }}>
              {t('common:brand')}
            </span>
          </div>
          <CardTitle className="text-2xl text-slate-200 font-semibold">{t('common:nav.login')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className={`bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-amber-500/50 focus:ring-amber-500/20 transition-all ${errors.email ? 'border-red-500' : ''}`}
                placeholder="your.email@example.com"
              />
              {errors.email && (
                <p className="text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300 font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                className={`bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-amber-500/50 focus:ring-amber-500/20 transition-all ${errors.password ? 'border-red-500' : ''}`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-300 border-0"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('common:status.loading') : t('common:nav.login')}
            </Button>
          </form>

          <div className="text-center text-sm text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-amber-400 hover:text-amber-300 hover:underline font-medium transition-colors">
              Create account
            </Link>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-xl border border-slate-700/50">
            <p className="text-sm text-slate-400 mb-3 font-semibold">Demo accounts:</p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-semibold text-amber-400">Admin:</span>
                <span className="font-mono">admin@reservario.com</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-semibold text-indigo-400">Supervisor:</span>
                <span className="font-mono">supervisor1@reservario.com</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-semibold text-emerald-400">Client:</span>
                <span className="font-mono">client@reservario.com</span>
              </div>
              <div className="text-slate-500 text-center pt-2 border-t border-slate-700">Password: Admin@123</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};