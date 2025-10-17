import { useEffect, useState, useCallback } from 'react';
import { useTranslation, TFunction } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { client } from '@/api/client';

interface User {
  _id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
  };
  roles: string[];
  isActive: boolean;
  createdAt: string;
}

export const UserManagement = () => {
  const { t, i18n } = useTranslation('superadmin');
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Create form schema with translations
  const createUserSchema = (t: TFunction, isEdit: boolean = false) =>
    z.object({
      email: z
        .string()
        .email(t('users.validation.emailInvalid'))
        .min(1, t('users.validation.emailRequired')),
      password: isEdit 
        ? z.string().optional()
        : z.string().min(8, t('users.validation.passwordMin')),
      firstName: z.string().min(1, t('users.validation.firstNameRequired')),
      lastName: z.string().min(1, t('users.validation.lastNameRequired')),
      role: z.string().min(1, t('users.validation.roleRequired')),
      isActive: z.boolean().default(true)
    });

  const form = useForm<z.infer<ReturnType<typeof createUserSchema>>>({
    resolver: zodResolver(createUserSchema(t, !!editingUser)),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'client',
      isActive: true
    }
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await client.get<{ data: { users: User[] } }>('/users');
      setUsers(response.data.data.users);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : 'Failed to load users',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  // Update form resolver when editingUser changes
  useEffect(() => {
    const newResolver = zodResolver(createUserSchema(t, !!editingUser));
    form.clearErrors();
    // @ts-expect-error - resolver is not exposed in the type but exists
    if (form._options) {
      form._options.resolver = newResolver;
    }
  }, [editingUser, t, form]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = () => {
    setEditingUser(null);
    form.reset();
    setDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    form.reset({
      email: user.email,
      password: '',
      firstName: user.profile.firstName,
      lastName: user.profile.lastName,
      role: user.roles[0],
      isActive: user.isActive
    });
    setDialogOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm(t('users.confirmDelete'))) {
      return;
    }

    try {
      await client.delete(`/users/${userId}`);
      toast({
        title: t('common.success'),
        description: t('users.deleteSuccess')
      });
      fetchUsers();
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : 'Failed to delete user',
        variant: 'destructive'
      });
    }
  };

  const onSubmit = async (data: z.infer<ReturnType<typeof createUserSchema>>) => {
    try {
      if (editingUser) {
        // Build update payload - only include password if it's not empty
        const updatePayload: {
          email: string;
          firstName: string;
          lastName: string;
          roles: string[];
          isActive: boolean;
          password?: string;
        } = {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          roles: [data.role],
          isActive: data.isActive
        };

        // Only include password if it's provided
        if (data.password && data.password.trim()) {
          updatePayload.password = data.password;
        }
        
        await client.put(`/users/${editingUser._id}`, updatePayload);
        toast({
          title: t('common.success'),
          description: t('users.updateSuccess')
        });
      } else {
        const payload = {
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          roles: [data.role],
          isActive: data.isActive
        };
        await client.post('/users', payload);
        toast({
          title: t('common.success'),
          description: t('users.createSuccess')
        });
      }
      setDialogOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error: unknown) {
      console.error('Error saving user:', error);

      let errorMessage = 'Failed to save user';
      let errorDetails = '';

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { errors?: Array<{ field: string; message: string }>; message?: string } } };

        if (axiosError.response?.data?.errors && Array.isArray(axiosError.response.data.errors)) {
          // Multiple validation errors - show each on a new line
          const errors = axiosError.response.data.errors.map((err: { field: string; message: string }) =>
            `• ${err.field}: ${err.message}`
          );
          errorMessage = 'Validation failed:';
          errorDetails = errors.join('\n');
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: t('common.error'),
        description: (
          <div className="space-y-1">
            <p className="font-semibold">{errorMessage}</p>
            {errorDetails && (
              <pre className="text-xs whitespace-pre-wrap">{errorDetails}</pre>
            )}
          </div>
        ),
        variant: 'destructive',
        duration: 8000 // Show for 8 seconds so user can read it
      });
    }
  };

  const formatDate = (dateString: string) => {
    const locale = i18n.language === 'es' ? es : enUS;
    return format(new Date(dateString), 'PPP', { locale });
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.profile.firstName} ${user.profile.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.roles.includes(roleFilter);
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6 flex items-center justify-center">
        <p className="text-blue-600 text-lg">{t('users.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-blue-900">{t('users.title')}</h1>
          <Button
            onClick={handleCreateUser}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('users.actions.createUser')}
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-blue-200">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
                <Input
                  placeholder={t('users.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-blue-200"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-48 border-blue-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('users.filters.allRoles')}</SelectItem>
                  <SelectItem value="admin">{t('users.filters.admin')}</SelectItem>
                  <SelectItem value="supervisor">{t('users.filters.supervisor')}</SelectItem>
                  <SelectItem value="client">{t('users.filters.client')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="border-blue-200">
          <CardContent className="pt-6">
            {filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('users.table.name')}</TableHead>
                      <TableHead>{t('users.table.email')}</TableHead>
                      <TableHead>{t('users.table.role')}</TableHead>
                      <TableHead>{t('users.table.status')}</TableHead>
                      <TableHead>{t('users.table.createdAt')}</TableHead>
                      <TableHead className="text-right">{t('users.table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell className="font-medium">
                          {user.profile.firstName} {user.profile.lastName}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.roles.map((role) => (
                            <Badge
                              key={role}
                              variant="outline"
                              className={`mr-1 ${
                                role === 'admin'
                                  ? 'border-blue-500 text-blue-600'
                                  : role === 'supervisor'
                                  ? 'border-green-500 text-green-600'
                                  : 'border-purple-500 text-purple-600'
                              }`}
                            >
                              {role}
                            </Badge>
                          ))}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.isActive ? 'default' : 'secondary'}
                            className={
                              user.isActive
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-gray-500'
                            }
                          >
                            {user.isActive
                              ? t('users.status.active')
                              : t('users.status.inactive')}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditUser(user)}
                              className="border-blue-500 text-blue-600 hover:bg-blue-50"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteUser(user._id)}
                              className="border-red-500 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-blue-600 text-center py-8">{t('users.noResults')}</p>
            )}
          </CardContent>
        </Card>

        {/* User Form Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-blue-900">
                {editingUser ? t('users.form.editTitle') : t('users.form.createTitle')}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('users.form.email')}</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {!editingUser && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('users.form.password')}</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('users.form.firstName')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('users.form.lastName')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('users.form.role')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">{t('users.filters.admin')}</SelectItem>
                          <SelectItem value="supervisor">
                            {t('users.filters.supervisor')}
                          </SelectItem>
                          <SelectItem value="client">{t('users.filters.client')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>{t('users.form.status')}</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    {t('users.form.cancel')}
                  </Button>
                  <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                    {t('users.form.save')}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default UserManagement;

