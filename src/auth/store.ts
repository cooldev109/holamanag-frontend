import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'superadmin' | 'admin' | 'supervisor' | 'client';

export interface User {
  email: string;
  roles: Role[];
  locale?: 'en' | 'es' | 'de' | 'pt' | 'nl';
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
}

interface AuthActions {
  setAuth: (payload: { user: User; accessToken: string; refreshToken?: string }) => void;
  logout: () => void;
  hasRole: (roleOrArray: Role | Role[]) => boolean;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (payload) => {
        set({
          user: payload.user,
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken || null,
        });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
        });
      },

      hasRole: (roleOrArray) => {
        const { user } = get();
        if (!user) return false;

        const roles = Array.isArray(roleOrArray) ? roleOrArray : [roleOrArray];
        return roles.some(role => user.roles.includes(role));
      },
    }),
    {
      name: 'reservaro-auth',
      // Persist user and tokens for convenience
      // In production, consider using httpOnly cookies for better security
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken
      }),
    }
  )
);