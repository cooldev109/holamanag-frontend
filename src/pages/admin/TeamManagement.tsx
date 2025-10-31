import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { TableSkeleton } from '@/components/ui/loading-skeletons';
import { EmptyState } from '@/components/ui/empty-state';
import { Plus, Search, RefreshCw, AlertCircle, Edit2, X, Users } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { client } from '@/api/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface TeamMember {
  _id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
  roles: string[];
  isActive: boolean;
  createdAt: string;
}

interface TeamMembersResponse {
  success?: boolean;
  data?: {
    teamMembers?: TeamMember[];
  };
  teamMembers?: TeamMember[];
}

export const TeamManagement = () => {
  const { t } = useTranslation(['admin', 'common']);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'supervisor',
    isActive: true
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchTeamMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await client.get('/users/team') as TeamMembersResponse;
      const data = response.data?.teamMembers || response.teamMembers || [];
      // Ensure we always have an array
      setTeamMembers(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      console.error('Failed to fetch team members:', err);
      const errorMessage = err instanceof Error ? err.message : t('common:error');
      setError(errorMessage);
      setTeamMembers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.email) {
      errors.email = t('admin:team.validation.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('admin:team.validation.emailInvalid');
    }
    
    if (!editingMember && !formData.password) {
      errors.password = t('admin:team.validation.passwordMin');
    } else if (formData.password && formData.password.length < 8) {
      errors.password = t('admin:team.validation.passwordMin');
    } else if (formData.password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(formData.password)) {
      errors.password = t('admin:team.validation.passwordRequirements');
    }
    
    if (!formData.firstName) {
      errors.firstName = t('admin:team.validation.firstNameRequired');
    }
    
    if (!formData.lastName) {
      errors.lastName = t('admin:team.validation.lastNameRequired');
    }
    
    if (!formData.role) {
      errors.role = t('admin:team.validation.roleRequired');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (editingMember) {
        await client.put(`/users/team/${editingMember._id}`, formData);
        toast({ description: t('admin:team.updateSuccess') });
      } else {
        await client.post('/users/team', formData);
        toast({ description: t('admin:team.createSuccess') });
      }

      setIsDialogOpen(false);
      setEditingMember(null);
      resetForm();
      fetchTeamMembers();
    } catch (err: any) {
      console.error('Error creating/updating team member:', err);

      // Extract detailed error message from backend response
      let errorMessage = t('common:error');

      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        // Backend validation errors
        const errorMessages = err.response.data.errors
          .map((e: any) => `${e.field}: ${e.message}`)
          .join(', ');
        errorMessage = errorMessages;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage
      });
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      email: member.email,
      password: '',
      firstName: member.profile.firstName,
      lastName: member.profile.lastName,
      phone: member.profile.phone || '',
      role: member.roles[0],
      isActive: member.isActive
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const handleDeactivate = async (member: TeamMember) => {
    if (!confirm(t('admin:team.confirmDelete', { name: `${member.profile.firstName} ${member.profile.lastName}` }))) {
      return;
    }
    
    try {
      await client.delete(`/users/team/${member._id}`);
      toast({ description: t('admin:team.deleteSuccess') });
      fetchTeamMembers();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t('common:error');
      toast({
        variant: 'destructive',
        description: errorMessage
      });
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'supervisor',
      isActive: true
    });
    setFormErrors({});
  };

  const handleAddNew = () => {
    setEditingMember(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = 
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.profile.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.profile.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || member.roles[0] === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-11 w-24 bg-muted animate-pulse rounded" />
            <div className="h-11 w-32 bg-muted animate-pulse rounded" />
          </div>
        </div>

        {/* Filters Skeleton */}
        <Card className="p-4 sm:p-6 bg-white">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 h-11 bg-muted animate-pulse rounded" />
            <div className="w-full sm:w-[180px] h-11 bg-muted animate-pulse rounded" />
          </div>
        </Card>

        {/* Table Skeleton - Desktop */}
        <Card className="hidden md:block bg-white overflow-hidden">
          <TableSkeleton rows={5} columns={6} />
        </Card>

        {/* Cards Skeleton - Mobile */}
        <div className="md:hidden space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-4 bg-white">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-32 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="h-6 w-16 bg-muted animate-pulse rounded-full" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                </div>
                <div className="flex gap-2 pt-2">
                  <div className="flex-1 h-11 bg-muted animate-pulse rounded" />
                  <div className="flex-1 h-11 bg-muted animate-pulse rounded" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {t('admin:team.title')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {t('admin:team.subtitle')}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={fetchTeamMembers}
            disabled={loading}
            variant="outline"
            className="flex-1 sm:flex-none"
            style={{ minHeight: '44px' }}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            {t('common:refresh')}
          </Button>
          <Button
            onClick={handleAddNew}
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700"
            style={{ minHeight: '44px' }}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('admin:team.addMember')}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card className="p-4 sm:p-6 bg-white">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={t('admin:team.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              style={{ minHeight: '44px' }}
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[180px]" style={{ minHeight: '44px' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin:team.allRoles')}</SelectItem>
              <SelectItem value="supervisor">{t('admin:team.supervisors')}</SelectItem>
              <SelectItem value="client">{t('admin:team.clients')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table - Desktop */}
      <Card className="hidden md:block bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin:team.table.name')}</TableHead>
              <TableHead>{t('admin:team.table.email')}</TableHead>
              <TableHead>{t('admin:team.table.role')}</TableHead>
              <TableHead>{t('admin:team.table.status')}</TableHead>
              <TableHead>{t('admin:team.table.created')}</TableHead>
              <TableHead className="text-right">{t('admin:team.table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member) => (
              <TableRow key={member._id}>
                <TableCell className="font-medium">
                  {member.profile.firstName} {member.profile.lastName}
                </TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                    {t(`admin:team.role.${member.roles[0]}`)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs",
                    member.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  )}>
                    {member.isActive ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell>{format(new Date(member.createdAt), 'MMM dd, yyyy')}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={() => handleEdit(member)}
                      variant="ghost"
                      size="sm"
                      style={{ minHeight: '36px', minWidth: '36px' }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeactivate(member)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      style={{ minHeight: '36px', minWidth: '36px' }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Cards - Mobile */}
      <div className="md:hidden space-y-4">
        {filteredMembers.map((member) => (
          <Card key={member._id} className="p-4 bg-white">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-base text-gray-900">
                    {member.profile.firstName} {member.profile.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{member.email}</p>
                </div>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs",
                  member.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                )}>
                  {member.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                  {t(`admin:team.role.${member.roles[0]}`)}
                </span>
                <p className="text-xs text-gray-500">
                  {format(new Date(member.createdAt), 'MMM dd, yyyy')}
                </p>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleEdit(member)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  style={{ minHeight: '44px' }}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  {t('common:edit')}
                </Button>
                <Button
                  onClick={() => handleDeactivate(member)}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  style={{ minHeight: '44px' }}
                >
                  <X className="w-4 h-4 mr-2" />
                  {t('common:delete')}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* No Data */}
      {filteredMembers.length === 0 && (
        <Card className="bg-white">
          <EmptyState
            icon={Users}
            title={
              searchQuery || roleFilter !== 'all'
                ? 'No team members found'
                : 'No team members yet'
            }
            description={
              searchQuery || roleFilter !== 'all'
                ? 'Try adjusting your search or filters to find team members.'
                : 'Get started by adding your first team member to collaborate on property management.'
            }
            action={
              !searchQuery && roleFilter === 'all'
                ? {
                    label: 'Add Team Member',
                    onClick: handleAddNew
                  }
                : undefined
            }
          />
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">
              {editingMember ? t('admin:team.editMember') : t('admin:team.addMember')}
            </DialogTitle>
            <DialogDescription>
              {t('admin:team.subtitle')}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('admin:team.form.email')}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                style={{ minHeight: '44px' }}
              />
              {formErrors.email && (
                <p className="text-xs text-red-600">{formErrors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">
                {t('admin:team.form.password')}
                {editingMember && <span className="text-xs text-gray-500 ml-2">({t('admin:team.form.passwordOptional')})</span>}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                style={{ minHeight: '44px' }}
              />
              {formErrors.password && (
                <p className="text-xs text-red-600">{formErrors.password}</p>
              )}
              <p className="text-xs text-gray-500">{t('admin:team.form.passwordRequirements')}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t('admin:team.form.firstName')}</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  style={{ minHeight: '44px' }}
                />
                {formErrors.firstName && (
                  <p className="text-xs text-red-600">{formErrors.firstName}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">{t('admin:team.form.lastName')}</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  style={{ minHeight: '44px' }}
                />
                {formErrors.lastName && (
                  <p className="text-xs text-red-600">{formErrors.lastName}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">{t('admin:team.form.phone')}</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                style={{ minHeight: '44px' }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">{t('admin:team.form.role')}</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({...formData, role: value})}
              >
                <SelectTrigger style={{ minHeight: '44px' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supervisor">{t('admin:team.role.supervisor')}</SelectItem>
                  <SelectItem value="client">{t('admin:team.role.client')}</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.role && (
                <p className="text-xs text-red-600">{formErrors.role}</p>
              )}
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
                style={{ minHeight: '44px' }}
              >
                {t('common:cancel')}
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                style={{ minHeight: '44px' }}
              >
                {t('common:save')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

export default TeamManagement;



