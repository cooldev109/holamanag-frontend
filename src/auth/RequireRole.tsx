import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import type { Role } from './store';

interface RequireRoleProps {
  roles: Role[];
  children: React.ReactNode;
}

export const RequireRole: React.FC<RequireRoleProps> = ({ roles, children }) => {
  const { user, hasRole } = useAuthStore();
  const { toast } = useToast();
  const { t } = useTranslation('admin');
  const location = useLocation();

  useEffect(() => {
    if (user && !hasRole(roles)) {
      toast({
        title: t('toast.denied'),
        variant: 'destructive',
      });
    }
  }, [user, hasRole, roles, toast, t]);

  // Not logged in - redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but lacks required role - redirect to login with error
  if (!hasRole(roles)) {
    return <Navigate to="/login" replace />;
  }

  // Has required role - render children
  return <>{children}</>;
};