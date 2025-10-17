import { client } from './client';

export interface SystemSettings {
  application: {
    appName: string;
    defaultLanguage: 'en' | 'es';
    defaultTimezone: string;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpEmail: string;
    smtpPassword: string;
  };
  security: {
    jwtExpirationHours: number;
    maxLoginAttempts: number;
    lockDurationMinutes: number;
  };
}

/**
 * Get system settings
 */
export const getSystemSettings = async (): Promise<SystemSettings> => {
  const response = await client.get<{ data: { settings: SystemSettings } }>('/settings');
  return response.data.data.settings;
};

/**
 * Update system settings
 */
export const updateSystemSettings = async (
  settings: Partial<SystemSettings>
): Promise<SystemSettings> => {
  const response = await client.put<{ data: { settings: SystemSettings } }>(
    '/settings',
    settings
  );
  return response.data.data.settings;
};

/**
 * Test email settings
 */
export const testEmailSettings = async (): Promise<string> => {
  const response = await client.post<{ message: string }>('/settings/test-email');
  return response.data.message;
};



