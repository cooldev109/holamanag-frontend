import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/auth/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Building, Phone, Globe, Key, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  company: z.string().optional(),
  phone: z.string().optional(),
  locale: z.enum(['en', 'es', 'de', 'pt', 'nl']),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileData = z.infer<typeof profileSchema>;
type PasswordData = z.infer<typeof passwordSchema>;

export const Profile: React.FC = () => {
  const { t, i18n } = useTranslation(['common']);
  const { user, setAuth } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  // Redirect if not logged in
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: user?.email || '',
      locale: user?.locale || 'en',
      firstName: '',
      lastName: '',
      company: '',
      phone: '',
    }
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<PasswordData>({
    resolver: zodResolver(passwordSchema),
  });

  const selectedLocale = watch('locale');

  const onProfileSubmit = async (data: ProfileData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // Update user in auth store
      if (user) {
        setAuth({
          user: {
            ...user,
            locale: data.locale,
          },
          accessToken: 'mock_access_token',
          refreshToken: 'mock_refresh_token',
        });

        // Update language
        i18n.changeLanguage(data.locale);
      }

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });

      setIsEditing(false);
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'There was an error updating your profile.',
        variant: 'destructive',
      });
    }
  };

  const onPasswordSubmit = async (data: PasswordData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      toast({
        title: 'Password changed',
        description: 'Your password has been changed successfully.',
      });

      resetPassword();
    } catch (error) {
      toast({
        title: 'Password change failed',
        description: 'There was an error changing your password.',
        variant: 'destructive',
      });
    }
  };

  const getInitials = () => {
    if (!user) return 'U';
    return user.email.substring(0, 2).toUpperCase();
  };

  const getRoleLabel = () => {
    if (!user) return '';
    if (user.roles.includes('superadmin')) return 'Super Admin';
    if (user.roles.includes('admin')) return 'Admin';
    if (user.roles.includes('supervisor')) return 'Supervisor';
    if (user.roles.includes('client')) return 'Client';
    return '';
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar - User Info Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold mb-1">{user.email}</h3>
                <Badge variant="secondary" className="mb-4">
                  <Shield className="h-3 w-3 mr-1" />
                  {getRoleLabel()}
                </Badge>
                <div className="w-full space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <span>{user.locale?.toUpperCase() || 'EN'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="security">
                <Key className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* First Name */}
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          {...register('firstName')}
                          disabled={!isEditing}
                          className={errors.firstName ? 'border-destructive' : ''}
                          placeholder="John"
                        />
                        {errors.firstName && (
                          <p className="text-sm text-destructive">{errors.firstName.message}</p>
                        )}
                      </div>

                      {/* Last Name */}
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          {...register('lastName')}
                          disabled={!isEditing}
                          className={errors.lastName ? 'border-destructive' : ''}
                          placeholder="Doe"
                        />
                        {errors.lastName && (
                          <p className="text-sm text-destructive">{errors.lastName.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        disabled={true}
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed. Contact support if you need to update it.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Company */}
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          {...register('company')}
                          disabled={!isEditing}
                          placeholder="Your Company"
                        />
                      </div>

                      {/* Phone */}
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          {...register('phone')}
                          disabled={!isEditing}
                          placeholder="+1 234 567 8900"
                        />
                      </div>
                    </div>

                    {/* Language Preference */}
                    <div className="space-y-2">
                      <Label htmlFor="locale">Preferred Language</Label>
                      <Select
                        value={selectedLocale}
                        onValueChange={(value) => setValue('locale', value as 'en' | 'es' | 'de' | 'pt' | 'nl')}
                        disabled={!isEditing}
                      >
                        <SelectTrigger id="locale">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="de">Deutsch</SelectItem>
                          <SelectItem value="pt">Português</SelectItem>
                          <SelectItem value="nl">Nederlands</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="flex justify-end gap-2">
                      {isEditing ? (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </>
                      ) : (
                        <Button type="button" onClick={() => setIsEditing(true)}>
                          Edit Profile
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                    {/* Current Password */}
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        {...registerPassword('currentPassword')}
                        className={passwordErrors.currentPassword ? 'border-destructive' : ''}
                        placeholder="••••••••"
                      />
                      {passwordErrors.currentPassword && (
                        <p className="text-sm text-destructive">
                          {passwordErrors.currentPassword.message}
                        </p>
                      )}
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        {...registerPassword('newPassword')}
                        className={passwordErrors.newPassword ? 'border-destructive' : ''}
                        placeholder="••••••••"
                      />
                      {passwordErrors.newPassword && (
                        <p className="text-sm text-destructive">
                          {passwordErrors.newPassword.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Must be at least 8 characters with uppercase, lowercase, number, and special character
                      </p>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        {...registerPassword('confirmPassword')}
                        className={passwordErrors.confirmPassword ? 'border-destructive' : ''}
                        placeholder="••••••••"
                      />
                      {passwordErrors.confirmPassword && (
                        <p className="text-sm text-destructive">
                          {passwordErrors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <Separator />

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isPasswordSubmitting}>
                        {isPasswordSubmitting ? 'Changing Password...' : 'Change Password'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
