import { useEffect, useState } from 'react';
import DashboardLayout from '@/app/components/layout';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Switch } from '@/app/components/ui';

const ADMIN_SETTINGS_KEY = 'workbridge-admin-settings';

export default function AdminSettings() {
  const { language, isEnglish } = useLanguage();
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [verificationAlerts, setVerificationAlerts] = useState(true);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const raw = window.localStorage.getItem(ADMIN_SETTINGS_KEY);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as {
        criticalAlerts?: boolean;
        verificationAlerts?: boolean;
      };

      setCriticalAlerts(parsed.criticalAlerts ?? true);
      setVerificationAlerts(parsed.verificationAlerts ?? true);
    } catch {
      setCriticalAlerts(true);
      setVerificationAlerts(true);
    }
  }, []);

  const handleSaveSettings = () => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(
      ADMIN_SETTINGS_KEY,
      JSON.stringify({
        criticalAlerts,
        verificationAlerts,
      }),
    );
    setFeedback(
      isEnglish ? 'Admin settings were saved successfully.' : 'تم حفظ إعدادات الأدمن بنجاح.',
    );
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <section>
          <h2 className="text-3xl font-bold">
            {isEnglish ? 'Admin settings' : 'إعدادات الإدارة'}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {isEnglish
              ? 'Operational and notification preferences for the admin team.'
              : 'إعدادات تنبيهية وتشغيلية خاصة بفريق الأدمن.'}
          </p>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>{isEnglish ? 'Administrative alerts' : 'ضبط الإشعارات الإدارية'}</CardTitle>
            <CardDescription>
              {isEnglish
                ? 'Core alert settings for reviews and escalations inside the platform.'
                : 'خيارات أساسية للإنذارات والمراجعات داخل المنصة.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-border p-4">
              <div>
                <p className="font-medium">
                  {isEnglish ? 'Critical dispute alerts' : 'تنبيهات النزاعات الحرجة'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isEnglish
                    ? 'Send an immediate alert when any high-priority dispute appears.'
                    : 'إرسال إشعار فوري عند أي نزاع عالي الأولوية.'}
                </p>
              </div>
              <div dir="ltr" className="shrink-0">
                <Switch checked={criticalAlerts} onCheckedChange={setCriticalAlerts} />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-2xl border border-border p-4">
              <div>
                <p className="font-medium">
                  {isEnglish ? 'Verification request alerts' : 'تنبيهات طلبات التوثيق'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isEnglish
                    ? 'Notify the admin team when a new company verification request arrives.'
                    : 'إشعار عند وصول أي طلب شركة جديد.'}
                </p>
              </div>
              <div dir="ltr" className="shrink-0">
                <Switch checked={verificationAlerts} onCheckedChange={setVerificationAlerts} />
              </div>
            </div>

            {feedback ? <p className="text-sm text-green-600">{feedback}</p> : null}

            <Button onClick={handleSaveSettings}>
              {isEnglish ? 'Save settings' : 'حفظ الإعدادات'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
