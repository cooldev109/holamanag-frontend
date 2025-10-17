import { client } from './client';

export interface DashboardStats {
  users: {
    total: number;
    admins: number;
    supervisors: number;
    clients: number;
  };
  properties: number;
  bookings: {
    thisWeek: number;
  };
  activeUsers: number;
}

export interface RecentUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
  createdAt: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentUsers: RecentUser[];
}

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (): Promise<DashboardData> => {
  const response = await client.get<{ data: DashboardData }>('/dashboard/stats');
  return response.data.data;
};



