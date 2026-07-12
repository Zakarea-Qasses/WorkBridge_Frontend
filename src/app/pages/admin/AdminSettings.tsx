import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, LoaderCircle, RefreshCw, Save } from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import { useLanguage } from '@/app/providers/LanguageProvider';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Switch,
} from '@/app/components/ui';
import { getApiErrorMessage } from '@/app/api/client';
import {
  AdminSettings as AdminSettingsPayload,
  getAdminSettings,
  updateAdminSettings,
} from '@/app/api/pages/admin/settings';

type StatusMessage = { type: 'success' | 'error'; message: string } | null;

const defaultSettings: AdminSettingsPayload = {
  critical_dispute_notifications: true,
  company_verification_notifications: true,
};

export default function AdminSettings() {
  const { language, isEnglish } = useLanguage();
  const [settings, setSettings] = useState<AdminSettingsPayload>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<StatusMessage>(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setStatus(null);
    try {
      setSettings(await getAdminSettings());
    } catch (error) {
      setStatus({
        type: 'error',
        message: getApiErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const saveSettings = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const updated = await updateAdminSettings(settings);
      setSettings(updated);
      setStatus({
        type: 'success',
        message: isEnglish ? 'Admin settings saved successfully.' : 'تم حفظ إعدادات الأدمن بنجاح.',
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: getApiErrorMessage(error),
      });
    } finally {
      setSaving(false);
    }
  };

  const setSetting = (key: keyof AdminSettingsPayload, value: boolean) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <section className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">
              {isEnglish ? 'Admin Settings' : 'إعدادات الأدمن'}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {isEnglish
                ? 'Manage admin notification preferences.'
                : 'إدارة تفضيلات إشعارات الأدمن.'}
            </p>
          </div>
          <Button variant="outline" disabled={loading || saving} onClick={() => void loadSettings()}>
            <RefreshCw className={`me-2 size-4 ${loading ? 'animate-spin' : ''}`} />
            {isEnglish ? 'Refresh' : 'تحديث'}
          </Button>
        </section>

        {status ? (
          <Card
            className={
              status.type === 'success'
                ? 'border-green-200 bg-green-50'
                : 'border-destructive/30 bg-destructive/5'
            }
          >
            <CardContent
              className={
                status.type === 'success'
                  ? 'flex items-center gap-2 pt-6 text-sm text-green-700'
                  : 'flex items-center gap-2 pt-6 text-sm text-destructive'
              }
            >
              {status.type === 'success' ? (
                <CheckCircle2 className="size-4" />
              ) : (
                <AlertCircle className="size-4" />
              )}
              {status.message}
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>{isEnglish ? 'Notification rules' : 'قواعد الإشعارات'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                <div className="h-16 animate-pulse rounded-md bg-muted" />
                <div className="h-16 animate-pulse rounded-md bg-muted" />
              </div>
            ) : (
              <>
                <SettingRow
                  id="critical-dispute-notifications"
                  title={isEnglish ? 'Critical dispute notifications' : 'إشعارات النزاعات المهمة'}
                  description={
                    isEnglish
                      ? 'Notify admins when a high-priority dispute needs attention.'
                      : 'تنبيه الأدمن عند وجود نزاع مهم يحتاج متابعة.'
                  }
                  checked={settings.critical_dispute_notifications}
                  onCheckedChange={(value) => setSetting('critical_dispute_notifications', value)}
                />
                <SettingRow
                  id="company-verification-notifications"
                  title={
                    isEnglish
                      ? 'Company verification notifications'
                      : 'إشعارات توثيق الشركات'
                  }
                  description={
                    isEnglish
                      ? 'Notify admins when companies require verification review.'
                      : 'تنبيه الأدمن عند وجود شركات تحتاج مراجعة توثيق.'
                  }
                  checked={settings.company_verification_notifications}
                  onCheckedChange={(value) =>
                    setSetting('company_verification_notifications', value)
                  }
                />

                <div className="flex justify-end border-t pt-4">
                  <Button disabled={saving} onClick={() => void saveSettings()}>
                    {saving ? (
                      <LoaderCircle className="me-2 size-4 animate-spin" />
                    ) : (
                      <Save className="me-2 size-4" />
                    )}
                    {isEnglish ? 'Save settings' : 'حفظ الإعدادات'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function SettingRow({
  id,
  title,
  description,
  checked,
  onCheckedChange,
}: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <Label htmlFor={id} className="text-base font-semibold">
          {title}
        </Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
