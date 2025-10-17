import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Save, Mail } from 'lucide-react';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import {
  getSystemSettings,
  updateSystemSettings,
  testEmailSettings,
  type SystemSettings
} from '@/api/settings';

export const SystemSettingsPage = () => {
  const { t } = useTranslation('superadmin');
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  const form = useForm<SystemSettings>({
    defaultValues: {
      application: {
        appName: '',
        defaultLanguage: 'en',
        defaultTimezone: 'UTC'
      },
      email: {
        smtpHost: '',
        smtpPort: 587,
        smtpEmail: '',
        smtpPassword: ''
      },
      security: {
        jwtExpirationHours: 24,
        maxLoginAttempts: 5,
        lockDurationMinutes: 30
      }
    }
  });

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const settings = await getSystemSettings();
      form.reset(settings);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : 'Failed to load settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [form, toast, t]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const onSubmit = async (data: SystemSettings) => {
    try {
      setSaving(true);
      await updateSystemSettings(data);
      toast({
        title: t('common.success'),
        description: t('settings.messages.saveSuccess')
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : 'Failed to save settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      setTestingEmail(true);
      const message = await testEmailSettings();
      toast({
        title: t('common.success'),
        description: message
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : 'Failed to send test email',
        variant: 'destructive'
      });
    } finally {
      setTestingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6 flex items-center justify-center">
        <p className="text-blue-600 text-lg">{t('settings.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <h1 className="text-3xl font-bold text-blue-900">{t('settings.title')}</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Application Settings */}
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">
                  {t('settings.application.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="application.appName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.application.appName')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="application.defaultLanguage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.application.defaultLanguage')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="en">English (EN)</SelectItem>
                          <SelectItem value="es">Español (ES)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="application.defaultTimezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.application.defaultTimezone')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="UTC" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Email Settings */}
            <Card className="border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-blue-900">{t('settings.email.title')}</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTestEmail}
                  disabled={testingEmail}
                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {testingEmail
                    ? t('settings.actions.saving')
                    : t('settings.email.testEmail')}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="email.smtpHost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.email.smtpHost')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="smtp.example.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email.smtpPort"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.email.smtpPort')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email.smtpEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.email.smtpEmail')}</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email.smtpPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.email.smtpPassword')}</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">{t('settings.security.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="security.jwtExpirationHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.security.jwtExpiration')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="security.maxLoginAttempts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.security.maxLoginAttempts')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="security.lockDurationMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.security.lockDuration')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={saving}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? t('settings.actions.saving') : t('settings.actions.save')}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default SystemSettingsPage;



